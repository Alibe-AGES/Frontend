import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { PhotoPicker } from './index';

interface PermissionResult {
  granted: boolean;
}
interface PickerResult {
  canceled: boolean;
  assets?: { uri: string }[];
}

const mockRequestPermissions = jest.fn();
const mockLaunchImageLibrary = jest.fn();

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: (): Promise<PermissionResult> =>
    mockRequestPermissions() as Promise<PermissionResult>,
  launchImageLibraryAsync: (): Promise<PickerResult> =>
    mockLaunchImageLibrary() as Promise<PickerResult>,
}));

const originalFetch = global.fetch;

describe('<PhotoPicker />', () => {
  beforeEach(() => {
    mockRequestPermissions.mockResolvedValue({ granted: true });
    mockLaunchImageLibrary.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://photo.jpg' }],
    });
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  test('shows the explanatory text "Adicionar foto (opcional)" by default', async () => {
    const { getByText } = await render(<PhotoPicker />);

    expect(getByText('Adicionar foto (opcional)')).toBeTruthy();
  });

  test('shows a default placeholder drawing when there is no photo yet', async () => {
    const { getByTestId } = await render(<PhotoPicker />);

    expect(getByTestId('alibe-photo-picker-placeholder')).toBeTruthy();
  });

  test('contains a button that opens the gallery when pressed', async () => {
    const { getByTestId } = await render(<PhotoPicker />);

    await fireEvent.press(getByTestId('alibe-photo-picker'));

    await waitFor(() => {
      expect(mockLaunchImageLibrary).toHaveBeenCalledTimes(1);
    });
  });

  test('sends the selected photo to the backend, shows it and shows a success message after a positive response', async () => {
    const onUploadSuccess = jest.fn();
    const { getByTestId } = await render(
      <PhotoPicker
        uploadUrl="https://api.alibe.com/photos"
        onUploadSuccess={onUploadSuccess}
      />
    );

    await fireEvent.press(getByTestId('alibe-photo-picker'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.alibe.com/photos',
        expect.objectContaining({ method: 'POST' })
      );
    });

    await waitFor(() => {
      expect(onUploadSuccess).toHaveBeenCalledWith('file://photo.jpg');
      expect(getByTestId('alibe-photo-picker-photo')).toBeTruthy();
      expect(getByTestId('alibe-photo-picker-success')).toBeTruthy();
    });
  });

  test('hides the success message automatically after the configured duration', async () => {
    jest.useFakeTimers();
    const { getByTestId, queryByTestId } = await render(
      <PhotoPicker uploadUrl="https://api.alibe.com/photos" />
    );

    await fireEvent.press(getByTestId('alibe-photo-picker'));

    await waitFor(() => {
      expect(getByTestId('alibe-photo-picker-success')).toBeTruthy();
    });

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(queryByTestId('alibe-photo-picker-success')).toBeNull();
    });

    jest.useRealTimers();
  });

  test('does not show a success message when there is no uploadUrl (local-only selection)', async () => {
    const { getByTestId, queryByTestId } = await render(<PhotoPicker />);

    await fireEvent.press(getByTestId('alibe-photo-picker'));

    await waitFor(() => {
      expect(getByTestId('alibe-photo-picker-photo')).toBeTruthy();
    });

    expect(queryByTestId('alibe-photo-picker-success')).toBeNull();
  });

  test('shows an error message when the backend upload fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    const onUploadError = jest.fn();
    const { getByTestId } = await render(
      <PhotoPicker
        uploadUrl="https://api.alibe.com/photos"
        onUploadError={onUploadError}
      />
    );

    await fireEvent.press(getByTestId('alibe-photo-picker'));

    await waitFor(() => {
      expect(getByTestId('alibe-photo-picker-error')).toBeTruthy();
      expect(onUploadError).toHaveBeenCalledTimes(1);
    });
  });

  test('does not open the gallery when the user denies permission', async () => {
    mockRequestPermissions.mockResolvedValue({ granted: false });
    const { getByTestId } = await render(<PhotoPicker />);

    await fireEvent.press(getByTestId('alibe-photo-picker'));

    await waitFor(() => {
      expect(getByTestId('alibe-photo-picker-error')).toBeTruthy();
    });
    expect(mockLaunchImageLibrary).not.toHaveBeenCalled();
  });

  test('accepts a custom controller, so it can be reused with a different behavior in other screens', async () => {
    const pickImage = jest.fn();
    const useCustomController = () => ({
      photoUri: null,
      isLoading: false,
      pickImage,
    });

    const { getByTestId } = await render(<PhotoPicker useController={useCustomController} />);

    await fireEvent.press(getByTestId('alibe-photo-picker'));

    expect(pickImage).toHaveBeenCalledTimes(1);
    expect(mockLaunchImageLibrary).not.toHaveBeenCalled();
  });

  test('shows the photo returned by a custom controller', async () => {
    const useCustomController = () => ({
      photoUri: 'https://cdn.alibe.com/user-42.jpg',
      isLoading: false,
      pickImage: jest.fn(),
    });

    const { getByTestId } = await render(<PhotoPicker useController={useCustomController} />);

    expect(getByTestId('alibe-photo-picker-photo')).toBeTruthy();
  });

  test('is not pressable while a controller reports isLoading', async () => {
    const pickImage = jest.fn();
    const useLoadingController = () => ({
      photoUri: null,
      isLoading: true,
      pickImage,
    });

    const { getByTestId } = await render(<PhotoPicker useController={useLoadingController} />);

    await fireEvent.press(getByTestId('alibe-photo-picker'));

    expect(pickImage).not.toHaveBeenCalled();
    expect(getByTestId('alibe-photo-picker').props.accessibilityState).toEqual({ disabled: true });
  });

  test('is not pressable when explicitly disabled', async () => {
    const { getByTestId } = await render(<PhotoPicker disabled />);

    await fireEvent.press(getByTestId('alibe-photo-picker'));

    expect(mockLaunchImageLibrary).not.toHaveBeenCalled();
    expect(getByTestId('alibe-photo-picker').props.accessibilityState).toEqual({ disabled: true });
  });

  test('exposes an accessible label matching the visible text', async () => {
    const { getByLabelText } = await render(<PhotoPicker />);

    const button = getByLabelText('Adicionar foto (opcional)');
    expect(button.props.accessibilityRole).toBe('button');
  });
});
