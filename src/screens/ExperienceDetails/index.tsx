import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { getPlaceDetails, getStoredLocationDetails, type PlaceDetails } from '@/server/places';
import { theme } from '@/theme';

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
  const imageSource = useAuthenticatedImageSource(details?.imageUrl);
  const rating = details?.rating;

  const handleSuggestLocation = () => {
    if (!details) return;
    router.push({
      pathname: '/group/[id]/create-event',
      params: {
        id: groupId,
        tab: 'suggestion',
        ...(isStoredLocation
          ? { locationId: placeId }
          : details.externalId
            ? { externalId: details.externalId }
            : {}),
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
  }, [isStoredLocation, placeId]);

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        contentContainerClassName="pb-10"
        testID="experience-details-screen"
      >
        <View className="relative h-72 w-full overflow-hidden bg-surface">
          {imageSource ? (
            <Image
              source={imageSource}
              accessible
              accessibilityLabel={details ? `Foto de ${details.name}` : 'Foto do local'}
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
        </View>

        <View className="mx-5 -mt-5 rounded-3xl bg-surface px-5 pb-6 pt-6">
          {isLoading ? (
            <View
              className="items-center py-12"
              testID="experience-details-loading"
            >
              <ActivityIndicator color={theme.colors.ink} />
            </View>
          ) : null}

          {!isLoading && (error || !details) ? (
            <View className="items-center gap-4 py-10">
              <Text className="text-center font-poppins text-base text-ink-soft">
                Não foi possível carregar as informações deste local.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  router.back();
                }}
                className="rounded-full bg-coral px-6 py-3"
                testID="experience-details-error-back"
              >
                <Text className="font-poppins-semibold text-white">Voltar</Text>
              </Pressable>
            </View>
          ) : null}

          {!isLoading && !error && details ? (
            <>
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
                  <Text className="ml-1 font-poppins text-sm text-ink-soft">
                    {rating.toFixed(1)}
                  </Text>
                </View>
              ) : null}

              <Text className="font-poppins-semibold text-sm text-ink">Endereço</Text>
              <Text className="mb-5 font-poppins text-sm text-ink-soft">
                {details.address ?? '--'}
              </Text>

              <View className="mb-4 flex-row gap-4">
                <View className="flex-1">
                  <Text className="font-poppins-semibold text-sm text-wine">Faixa de preço</Text>
                  <Text className="font-poppins text-sm text-ink-soft">
                    {displayPrice(details)}
                  </Text>
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
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
