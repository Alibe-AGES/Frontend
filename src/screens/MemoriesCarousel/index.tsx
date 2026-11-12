import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type FlatListProps,
} from 'react-native';
import tw from 'twrnc';

import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { MemoryCard } from '@/components/MemoryCard';
import { NavigationBar } from '@/components/NavigationBar';
import { ScreenFrame } from '@/components/ScreenFrame';
import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { theme } from '@/theme';
import { parseMemoryDate, type CarouselMemory } from '@/utils/memories';

export interface MemoriesCarouselScreenProps {
  groupId: string;
  memories: CarouselMemory[];
  initialIndex: number;
  isLoading: boolean;
  errorMessage: string | null;
  onAddMemory: () => void;
  onRetry: () => void;
}

// react-native no longer exports `ViewToken`, so the type comes from the list props.
type ViewableItemsChange = Parameters<
  NonNullable<FlatListProps<CarouselMemory>['onViewableItemsChanged']>
>[0];

// Share of the screen taken by one card; the rest lets neighbours peek in.
const ITEM_WIDTH_RATIO = 0.7;
// Wide enough that the neighbours show a sliver on each side, like the design.
const ITEM_GAP = Number(tw`gap-10`.gap);
const ARROW_SIZE = 28;

interface CarouselItemProps {
  memory: CarouselMemory;
  width: number;
}

function CarouselItem({ memory, width }: Readonly<CarouselItemProps>) {
  const source = useAuthenticatedImageSource(memory.imageUrl);

  return (
    <View style={{ width }}>
      <MemoryCard
        date={parseMemoryDate(memory.date)}
        name={memory.name}
        address={memory.address}
        imageUri={memory.imageUrl}
        imageSource={source}
        testID={`memories-carousel-card-${memory.id}`}
      />
    </View>
  );
}

interface ArrowProps {
  direction: 'previous' | 'next';
  // Horizontal center of the gap the arrow sits in.
  centerX: number;
  onPress: () => void;
}

function Arrow({ direction, centerX, onPress }: Readonly<ArrowProps>) {
  const isPrevious = direction === 'previous';

  return (
    // Plain style object: NativeWind drops positions given through a style function.
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={isPrevious ? 'Memória anterior' : 'Próxima memória'}
      hitSlop={12}
      onPress={onPress}
      style={{
        position: 'absolute',
        top: '50%',
        left: centerX - ARROW_SIZE / 2,
        marginTop: -ARROW_SIZE / 2,
      }}
      testID={`memories-carousel-${direction}`}
    >
      {({ pressed }) => (
        <Ionicons
          name={isPrevious ? 'chevron-back' : 'chevron-forward'}
          size={ARROW_SIZE}
          color={theme.colors.wine}
          style={{ opacity: pressed ? 0.6 : 1 }}
        />
      )}
    </Pressable>
  );
}

export function MemoriesCarouselScreen({
  groupId,
  memories,
  initialIndex,
  isLoading,
  errorMessage,
  onAddMemory,
  onRetry,
}: Readonly<MemoriesCarouselScreenProps>) {
  const { width: screenWidth } = useWindowDimensions();
  const listRef = useRef<FlatList<CarouselMemory>>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const itemWidth = Math.round(screenWidth * ITEM_WIDTH_RATIO);
  const step = itemWidth + ITEM_GAP;
  const sidePadding = (screenWidth - itemWidth) / 2;
  const lastIndex = memories.length - 1;

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goTo = (index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  // Tracks the card nearest to the center, so swipes keep the arrows in sync.
  const handleViewableItemsChanged = useRef(({ viewableItems }: ViewableItemsChange) => {
    const centered = viewableItems.find((item) => item.isViewable);
    if (typeof centered?.index === 'number') {
      setCurrentIndex(centered.index);
    }
  }).current;

  const isEmpty = !isLoading && !errorMessage && memories.length === 0;
  const showCarousel = !isLoading && !errorMessage && memories.length > 0;

  const header = (
    <View className="gap-6 px-6 pb-3 pt-16">
      <View className="flex-row items-center justify-between">
        <BackButton
          fallbackHref={{ pathname: '/group/[id]/memories/gallery', params: { id: groupId } }}
          accessibilityLabel="Voltar para a galeria"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adicionar memória"
          hitSlop={12}
          onPress={onAddMemory}
          className="h-7 w-7 items-center justify-center rounded-full bg-ink"
          style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
          testID="memories-carousel-add"
        >
          <Ionicons
            name="add"
            size={18}
            color={theme.colors.white}
          />
        </Pressable>
      </View>

      <Text className="text-center font-poppins text-3xl text-wine">Suas memórias</Text>
    </View>
  );

  return (
    <ScreenFrame
      scrollable={false}
      padding="none"
      header={header}
      footer={<NavigationBar groupId={groupId} />}
      testID="memories-carousel-screen"
    >
      {isLoading ? (
        <View
          className="items-center gap-3 py-10"
          testID="memories-carousel-loading"
        >
          <ActivityIndicator color={theme.colors.ink} />
          <Text className="font-poppins text-sm text-ink">Carregando memórias…</Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View
          className="items-center gap-4 px-6 py-10"
          testID="memories-carousel-error"
        >
          <Text className="text-center font-poppins text-base text-wine">{errorMessage}</Text>
          <Button
            title="Tentar de novo"
            variant="secondary"
            onPress={onRetry}
            testID="memories-carousel-retry"
          />
        </View>
      ) : null}

      {isEmpty ? (
        <View
          className="items-center px-6 py-10"
          testID="memories-carousel-empty"
        >
          <Text className="text-center font-poppins text-base text-wine">
            Nenhuma memória encontrada para este período.
          </Text>
        </View>
      ) : null}

      {showCarousel ? (
        <View
          className="flex-1 justify-center"
          testID="memories-carousel-list"
        >
          <FlatList
            ref={listRef}
            data={memories}
            horizontal
            keyExtractor={(memory) => memory.id}
            renderItem={({ item }) => (
              <CarouselItem
                memory={item}
                width={itemWidth}
              />
            )}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({ length: step, offset: step * index, index })}
            snapToInterval={step}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              // Vertical room so the cards' shadow is not clipped by the list.
              tw`py-6`,
              { paddingHorizontal: sidePadding, gap: ITEM_GAP },
            ]}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            style={tw`flex-grow-0`}
          />

          {currentIndex > 0 ? (
            <Arrow
              direction="previous"
              centerX={sidePadding - ITEM_GAP / 2}
              onPress={() => {
                goTo(currentIndex - 1);
              }}
            />
          ) : null}
          {currentIndex < lastIndex ? (
            <Arrow
              direction="next"
              centerX={sidePadding + itemWidth + ITEM_GAP / 2}
              onPress={() => {
                goTo(currentIndex + 1);
              }}
            />
          ) : null}
        </View>
      ) : null}
    </ScreenFrame>
  );
}
