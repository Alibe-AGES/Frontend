/// <reference types="nativewind/types" />

declare module '@/global.css' {
  const content: string;
  export default content;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  import type { ImageSourcePropType } from 'react-native';

  const content: ImageSourcePropType;
  export default content;
}
