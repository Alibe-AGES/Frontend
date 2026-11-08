import { fireEvent, render } from '@testing-library/react-native';
import { PhotoPicker } from './index';
import { PhotoPickerProps, PhotoPickerStrategy, UsePhotoPickerHook } from './PhotoPicker.types';

// 1. Mock do Tema
jest.mock('@/theme', () => ({
  theme: {
    colors: {
      coral: '#FF7F50',
      ink: '#000000',
    },
  },
}));

// 2. Mock do Avatar tipado rigorosamente
interface MockAvatarProps {
  photoUri?: string | null;
  fallbackIconName?: string;
  imageClassName?: string;
  testID?: string;
}

jest.mock('../Avatar', () => {
  // Utiliza requireActual com casting de tipo para evitar importações ilegais e 'any'
  const RN = jest.requireActual<typeof import('react-native')>('react-native');

  return {
    Avatar: ({
      photoUri,
      fallbackIconName,
      imageClassName,
      testID = 'avatar',
    }: MockAvatarProps) => {
      const avatarTestID = `${testID}-${photoUri ? 'photo' : 'placeholder'}`;

      return (
        <RN.View testID={avatarTestID}>
          <RN.Text testID={`${avatarTestID}-uri`}>{photoUri ?? 'null'}</RN.Text>
          <RN.Text testID={`${avatarTestID}-icon`}>{fallbackIconName ?? 'none'}</RN.Text>
          <RN.Text testID={`${avatarTestID}-image-class`}>{imageClassName ?? 'none'}</RN.Text>
        </RN.View>
      );
    },
  };
});

// 3. Mock do hook default
const mockDefaultPickImage = jest.fn();
jest.mock('./controllers/useDefaultPhotoPickerController', () => ({
  useDefaultPhotoPickerController: () => ({
    photoUri: null,
    isLoading: false,
    pickImage: mockDefaultPickImage,
  }),
}));

describe('<PhotoPicker />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockController = (overrides?: Partial<PhotoPickerStrategy>): UsePhotoPickerHook => {
    return () => ({
      photoUri: null,
      isLoading: false,
      pickImage: jest.fn(),
      ...overrides,
    });
  };

  const defaultProps: PhotoPickerProps = {
    useController: createMockController(),
  };

  test('renders with the default label and group placeholder', async () => {
    const { getByText, getByTestId } = await Promise.resolve(
      render(<PhotoPicker {...defaultProps} />)
    );

    expect(getByText('Adicionar foto (opcional)')).toBeTruthy();
    expect(getByTestId('alibe-photo-picker-placeholder-icon')).toHaveTextContent('people-outline');
  });

  test('uses a black label by default and accepts a custom label color', async () => {
    const label = 'Adicionar foto (opcional)';
    const { getByText, rerender } = await Promise.resolve(
      render(<PhotoPicker {...defaultProps} />)
    );

    expect(getByText(label).props.className).toContain('text-black');

    rerender(
      <PhotoPicker
        {...defaultProps}
        labelClassName="text-wine"
      />
    );
    await Promise.resolve();

    expect(getByText(label).props.className).toContain('text-wine');
    expect(getByText(label).props.className).not.toContain('text-black');
  });

  test('renders with a custom label', async () => {
    const customLabel = 'Mudar foto de perfil';
    const { getByText } = await Promise.resolve(
      render(
        <PhotoPicker
          {...defaultProps}
          label={customLabel}
        />
      )
    );

    expect(getByText(customLabel)).toBeTruthy();
  });

  test('uses the camera placeholder icon when specified', async () => {
    const { getByTestId } = await Promise.resolve(
      render(
        <PhotoPicker
          {...defaultProps}
          placeholder="camera"
        />
      )
    );

    expect(getByTestId('alibe-photo-picker-placeholder-icon')).toHaveTextContent('camera-outline');
  });

  test('calls pickImage when pressed', async () => {
    const mockPickImage = jest.fn();
    const mockController = createMockController({ pickImage: mockPickImage });

    const { getByTestId } = await Promise.resolve(
      render(<PhotoPicker useController={mockController} />)
    );

    // Aplicando void para ignorar a floating promise
    fireEvent.press(getByTestId('alibe-photo-picker'));

    expect(mockPickImage).toHaveBeenCalledTimes(1);
  });

  test('does not call pickImage when disabled via props', async () => {
    const mockPickImage = jest.fn();
    const mockController = createMockController({ pickImage: mockPickImage });

    const { getByTestId } = await Promise.resolve(
      render(
        <PhotoPicker
          useController={mockController}
          disabled
        />
      )
    );

    // Aplicando void para ignorar a floating promise
    fireEvent.press(getByTestId('alibe-photo-picker'));

    expect(mockPickImage).not.toHaveBeenCalled();
  });

  test('shows loading indicator and prevents interaction when isLoading is true', async () => {
    const mockPickImage = jest.fn();
    const mockController = createMockController({
      isLoading: true,
      pickImage: mockPickImage,
    });

    const { getByTestId, queryByTestId } = await Promise.resolve(
      render(<PhotoPicker useController={mockController} />)
    );

    expect(getByTestId('alibe-photo-picker-loading')).toBeTruthy();
    expect(queryByTestId('alibe-photo-picker-photo')).toBeNull();

    // Aplicando void para ignorar a floating promise
    fireEvent.press(getByTestId('alibe-photo-picker'));

    expect(mockPickImage).not.toHaveBeenCalled();
  });

  test('makes the photo fill the circle so its diameter never changes', async () => {
    const useController: UsePhotoPickerHook = () => ({
      photoUri: 'file://photo.jpg',
      isLoading: false,
      pickImage: jest.fn(),
    });

    const { getByTestId } = await Promise.resolve(
      render(<PhotoPicker useController={useController} />)
    );

    expect(getByTestId('alibe-photo-picker-photo-image-class')).toHaveTextContent(
      'h-full w-full rounded-full'
    );
  });

  test('passes the current photoUri to the Avatar', async () => {
    const testUri = 'https://example.com/photo.jpg';
    const mockController = createMockController({ photoUri: testUri });

    const { getByTestId } = await Promise.resolve(
      render(<PhotoPicker useController={mockController} />)
    );

    expect(getByTestId('alibe-photo-picker-photo-uri')).toHaveTextContent(testUri);
  });

  test('falls back to useDefaultPhotoPickerController if no useController prop is provided', async () => {
    const { getByTestId } = await Promise.resolve(render(<PhotoPicker />));

    // Aplicando void para ignorar a floating promise
    fireEvent.press(getByTestId('alibe-photo-picker'));

    expect(mockDefaultPickImage).toHaveBeenCalledTimes(1);
  });
});
