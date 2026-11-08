import { fireEvent, render } from '@testing-library/react-native';

import type { UsePhotoPickerHook } from '@/components/PhotoPicker/PhotoPicker.types';
import type { NewMemoryScreenProps } from '.';
import { NewMemoryScreen } from '.';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@/components/NavigationBar', () => ({
  NavigationBar: () => null,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  }),
}));

jest.mock('@/components/PhotoPicker/controllers/useDefaultPhotoPickerController', () => ({
  useDefaultPhotoPickerController: () => ({
    photoUri: null,
    isLoading: false,
    pickImage: jest.fn(),
  }),
}));

const EVENTS = [
  { label: 'Jantar de sexta', value: 'dinner' },
  { label: 'Churrasco', value: 'barbecue' },
];

function createPhotoController(): UsePhotoPickerHook {
  return () => ({ photoUri: null, isLoading: false, pickImage: jest.fn() });
}

async function renderScreen(overrides?: Partial<NewMemoryScreenProps>) {
  const props: NewMemoryScreenProps = {
    groupId: 'group-1',
    events: EVENTS,
    selectedEventId: null,
    hasPhoto: false,
    isLoadingEvents: false,
    isSubmitting: false,
    error: null,
    onSelectEvent: jest.fn(),
    onPhotoSelected: jest.fn(),
    onRetry: jest.fn(),
    onClose: jest.fn(),
    onCreate: jest.fn(),
    usePhotoController: createPhotoController(),
    ...overrides,
  };

  return { ...(await Promise.resolve(render(<NewMemoryScreen {...props} />))), props };
}

describe('<NewMemoryScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows the title, the memory card and the create button', async () => {
    const { getByText, getByTestId } = await renderScreen();

    expect(getByText('Nova memória')).toBeTruthy();
    expect(getByTestId('new-memory-card')).toBeTruthy();
    expect(getByText('Criar memória')).toBeTruthy();
  });

  test('keeps the create button disabled until an event and a photo are chosen', async () => {
    const { getByTestId } = await renderScreen();

    expect(getByTestId('new-memory-submit')).toBeDisabled();
  });

  test('keeps the create button disabled when only the event is chosen', async () => {
    const { getByTestId } = await renderScreen({ selectedEventId: 'dinner' });

    expect(getByTestId('new-memory-submit')).toBeDisabled();
  });

  test('enables the create button and reports the press', async () => {
    const { getByTestId, props } = await renderScreen({
      selectedEventId: 'dinner',
      hasPhoto: true,
    });
    const submit = getByTestId('new-memory-submit');

    expect(submit).toBeEnabled();

    await fireEvent.press(submit);

    expect(props.onCreate).toHaveBeenCalledTimes(1);
  });

  test('closes the flow from the card close button', async () => {
    const { getByTestId, props } = await renderScreen();

    await fireEvent.press(getByTestId('new-memory-card-close'));

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  test('selects an event from the dropdown', async () => {
    const { getByTestId, getByText, props } = await renderScreen();

    await fireEvent.press(getByTestId('new-memory-card-event'));
    await fireEvent.press(getByText('Churrasco'));

    expect(props.onSelectEvent).toHaveBeenCalledWith('barbecue');
  });

  test('shows the error and retries when the events fail to load', async () => {
    const { getByTestId, getByText, props } = await renderScreen({
      error: 'Não foi possível carregar os eventos.',
    });

    expect(getByText('Não foi possível carregar os eventos.')).toBeTruthy();

    await fireEvent.press(getByTestId('new-memory-retry'));

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  test('shows the spinner on the create button while submitting', async () => {
    const { getByTestId } = await renderScreen({
      selectedEventId: 'dinner',
      hasPhoto: true,
      isSubmitting: true,
    });

    expect(getByTestId('new-memory-submit-loading')).toBeTruthy();
    expect(getByTestId('new-memory-submit')).toBeDisabled();
  });

  test('blocks the create button while the events are loading', async () => {
    const { getByTestId } = await renderScreen({
      selectedEventId: 'dinner',
      hasPhoto: true,
      isLoadingEvents: true,
    });

    expect(getByTestId('new-memory-submit')).toBeDisabled();
  });
});
