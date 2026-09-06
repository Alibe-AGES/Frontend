import { Href, useRouter } from 'expo-router';

import { BackStrategy } from '@/components/BackButton/BackButton.types';

export interface UseDefaultBackControllerParams {
  fallbackHref?: Href;
}

export const useDefaultBackController = (params?: UseDefaultBackControllerParams): BackStrategy => {
  const router = useRouter();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (params?.fallbackHref) {
      router.replace(params.fallbackHref);
    }
  };

  return {
    handleBack,
    isLoading: false,
  };
};
