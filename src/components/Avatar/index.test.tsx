import { render } from '@testing-library/react-native';
import type { ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import { Avatar } from './index';

interface MockIoniconsProps {
  name: string;
  testID?: string;
  size?: number;
  color?: string;
}

jest.mock('@expo/vector-icons', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Ionicons: ({ name, testID }: MockIoniconsProps) => <RN.Text testID={testID}>{name}</RN.Text>,
  };
});

interface MockExpoImageProps {
  source: unknown;
  testID?: string;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

jest.mock('expo-image', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Image: ({ source, testID, style, accessibilityLabel }: MockExpoImageProps) => (
      <RN.Image
        source={source as ImageSourcePropType}
        testID={testID}
        style={style}
        accessibilityLabel={accessibilityLabel}
      />
    ),
  };
});

jest.mock('@/theme', () => ({
  theme: {
    colors: {
      coral: '#FF7F50',
    },
  },
}));

describe('<Avatar />', () => {
  test('shows a placeholder icon when there is no photo', async () => {
    const { getByTestId } = await render(<Avatar accessibilityLabel="Foto do grupo" />);

    expect(getByTestId('alibe-avatar-placeholder')).toBeTruthy();
  });

  test('shows the photo when a uri is provided', async () => {
    const { getByTestId } = await render(
      <Avatar
        photoUri="https://cdn.alibe.com/group-1.jpg"
        accessibilityLabel="Foto do grupo"
      />
    );

    const photo = getByTestId('alibe-avatar-photo');

    expect(photo.props.style).toEqual(expect.objectContaining({ width: 144, height: 144 }));
  });

  test('namespaces its testIDs under a custom prefix', async () => {
    const { getByTestId } = await render(
      <Avatar
        accessibilityLabel="Foto do grupo"
        testID="group-card-avatar"
      />
    );

    expect(getByTestId('group-card-avatar-placeholder')).toBeTruthy();
  });
});
