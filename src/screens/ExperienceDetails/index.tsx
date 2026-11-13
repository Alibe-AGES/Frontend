import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { ErrorCard } from '@/components/ErrorCard';
import { ScreenFrame } from '@/components/ScreenFrame';
import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { getPlaceDetails, getStoredLocationDetails, type PlaceDetails } from '@/server/places';
import { theme } from '@/theme';

const IMAGE_FADE_MS = 200;

interface ExperienceDetailsScreenProps {
  groupId: string;
  placeId: string;
  isStoredLocation?: boolean;
}

function displayPrice(details: PlaceDetails): string {
  if (!details.priceRange) return '--';
  const { start, end, currencyCode } = details.priceRange;
  if (start === null && end === null) return '--';

  const format = (amount: number | null) =>
    amount === null
      ? '--'
      : new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: currencyCode,
          maximumFractionDigits: 0,
        }).format(amount);

  return `${format(start)} - ${format(end)}`;
}

export function ExperienceDetailsScreen({
  groupId,
  placeId,
  isStoredLocation = false,
}: ExperienceDetailsScreenProps) {
  const router = useRouter();
  const [details, setDetails] = useState<PlaceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const imageSource = useAuthenticatedImageSource(details?.imageUrl);
  const rating = details?.rating;

  const handleSuggestLocation = () => {
    if (!details) return;
    const locationParams: { locationId?: string; externalId?: string } = {};
    if (isStoredLocation) {
      locationParams.locationId = placeId;
    } else if (details.externalId) {
      locationParams.externalId = details.externalId;
    }

    router.push({
      pathname: '/group/[id]/create-event',
      params: {
        id: groupId,
        tab: 'suggestion',
        ...locationParams,
        ...(details.phoneNumber ? { phoneNumber: details.phoneNumber } : {}),
        ...(details.website ? { website: details.website } : {}),
        ...(details.openingHours.length > 0
          ? { openingHours: details.openingHours.join('\n') }
          : {}),
        ...(details.priceRange?.start != null
          ? { priceStart: String(details.priceRange.start) }
          : {}),
        ...(details.priceRange?.end != null ? { priceEnd: String(details.priceRange.end) } : {}),
        ...(details.imageUrl ? { imageUrl: details.imageUrl } : {}),
        address: details.address ?? '',
        name: details.name,
      },
    });
  };

  useEffect(() => {
    let isActive = true;

    const loadDetails = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const result = isStoredLocation
          ? await getStoredLocationDetails(placeId)
          : await getPlaceDetails(placeId);
        if (isActive) setDetails(result);
      } catch {
        if (isActive) setError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadDetails();
    return () => {
      isActive = false;
    };
  }, [attempt, isStoredLocation, placeId]);

  const backButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Voltar para experiências"
      onPress={() => {
        router.back();
      }}
      className="absolute left-5 top-12 h-11 w-11 items-center justify-center rounded-full bg-canvas"
      testID="experience-details-back"
    >
      <Ionicons
        name="arrow-back"
        size={22}
        color={theme.colors.ink}
      />
    </Pressable>
  );

  if (isLoading) {
    return (
      <ScreenFrame
        padding="none"
        scrollable={false}
        testID="experience-details-screen"
      >
        <View
          className="flex-1 items-center justify-center"
          testID="experience-details-loading"
        >
          <ActivityIndicator color={theme.colors.ink} />
        </View>
      </ScreenFrame>
    );
  }

  if (error || !details) {
    return (
      <ScreenFrame
        padding="none"
        scrollable={false}
        testID="experience-details-screen"
      >
        <View className="flex-1 justify-center px-6">
          <ErrorCard
            message="Não foi possível carregar as informações deste local."
            onRetry={() => {
              setAttempt((current) => current + 1);
            }}
            testID="experience-details-error"
          />
        </View>
        {backButton}
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame
      padding="none"
      testID="experience-details-screen"
    >
      <View className="relative h-72 w-full overflow-hidden bg-canvas">
        {details.imageUrl ? (
          <Image
            source={imageSource}
            transition={IMAGE_FADE_MS}
            accessible
            accessibilityLabel={`Foto de ${details.name}`}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
            testID="experience-details-image"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Ionicons
              name="location-outline"
              size={64}
              color={theme.colors.ink}
            />
          </View>
        )}
        {backButton}
      </View>

      <View className="mx-5 -mt-5 mb-10 rounded-3xl bg-surface px-5 pb-6 pt-6">
        <View className="bg-surface">
          <Text
            className="mb-5 text-center font-poppins-medium text-3xl text-wine"
            testID="experience-details-name"
          >
            {details.name}
          </Text>

          {rating !== null && rating !== undefined ? (
            <View
              className="mb-5 flex-row items-center gap-1"
              testID="experience-details-rating"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(rating) ? 'star' : 'star-outline'}
                  size={18}
                  color={theme.colors.coral}
                />
              ))}
              <Text className="ml-1 font-poppins text-sm text-ink-soft">{rating.toFixed(1)}</Text>
            </View>
          ) : null}

          <Text className="font-poppins-semibold text-sm text-ink">Endereço</Text>
          <Text className="mb-5 font-poppins text-sm text-ink-soft">{details.address ?? '--'}</Text>

          <View className="mb-4 flex-row gap-4">
            <View className="flex-1">
              <Text className="font-poppins-semibold text-sm text-wine">Faixa de preço</Text>
              <Text className="font-poppins text-sm text-ink-soft">{displayPrice(details)}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-poppins-semibold text-sm text-wine">Telefone</Text>
              <Text className="font-poppins text-sm text-ink-soft">
                {details.phoneNumber ?? '(00) 00000-0000'}
              </Text>
            </View>
          </View>

          <Text className="font-poppins-semibold text-sm text-wine">Horários</Text>
          <Text className="mb-4 font-poppins text-sm text-ink-soft">
            {details.openingHours.length ? details.openingHours.join('\n') : '--'}
          </Text>

          <Text className="font-poppins-semibold text-sm text-wine">Site</Text>
          <Text
            className="font-poppins text-sm text-ink-soft"
            testID="experience-details-website"
          >
            {details.website ?? ''}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleSuggestLocation}
            className="mt-6 items-center rounded-full bg-coral px-6 py-3"
            testID="experience-suggest-location"
          >
            <Text className="font-poppins-semibold text-white">Sugerir este local</Text>
          </Pressable>
        </View>
      </View>
    </ScreenFrame>
  );
}
