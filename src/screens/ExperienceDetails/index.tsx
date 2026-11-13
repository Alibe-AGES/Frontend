import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import { ErrorCard } from '@/components/ErrorCard';
import { ScreenFrame } from '@/components/ScreenFrame';
import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { createProposal } from '@/server/events';
import { getPlaceDetails, getStoredLocationDetails, type PlaceDetails } from '@/server/places';
import { theme } from '@/theme';
import { buildPlaceProposalInput } from '@/utils/proposals';

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
  const [isSuggesting, setIsSuggesting] = useState(false);
  const imageSource = useAuthenticatedImageSource(details?.imageUrl);
  const rating = details?.rating;

  const handleSuggestLocation = async () => {
    if (!details || isSuggesting) return;

    setIsSuggesting(true);
    try {
      const proposal = await createProposal(
        groupId,
        buildPlaceProposalInput(details, placeId, isStoredLocation)
      );

      if (proposal.matched) {
        router.replace({
          pathname: '/group/[id]/match',
          params: {
            id: groupId,
            matchedSuggestionId: proposal.id,
            locationId: proposal.location.id,
            name: proposal.name ?? proposal.location.name ?? '',
            address: proposal.location.address ?? proposal.location.description ?? '',
            ...(proposal.location.imageUrl ? { imageUrl: proposal.location.imageUrl } : {}),
          },
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Sugestão enviada!',
        text2: `${details.name} foi sugerido para o grupo.`,
      });
      router.dismissTo({ pathname: '/group/[id]/experiences', params: { id: groupId } });
    } catch (suggestError) {
      console.error('Erro ao sugerir local', suggestError);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível sugerir este local. Tente novamente.',
      });
      setIsSuggesting(false);
    }
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
            accessibilityState={{ disabled: isSuggesting, busy: isSuggesting }}
            disabled={isSuggesting}
            onPress={() => void handleSuggestLocation()}
            className={`mt-6 items-center rounded-full bg-coral px-6 py-3 ${
              isSuggesting ? 'opacity-60' : ''
            }`}
            testID="experience-suggest-location"
          >
            {isSuggesting ? (
              <ActivityIndicator
                color={theme.colors.white}
                testID="experience-suggest-location-loading"
              />
            ) : (
              <Text className="font-poppins-semibold text-white">Sugerir este local</Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScreenFrame>
  );
}
