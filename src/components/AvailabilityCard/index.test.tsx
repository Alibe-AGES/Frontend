import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AvailabilityCard } from './index';

const mockBack = jest.fn(() => undefined);
const mockCanGoBack = jest.fn(() => true);

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    canGoBack: () => mockCanGoBack(),
  }),
}));

describe('<AvailabilityCard />', () => {
  beforeEach(() => {
    mockCanGoBack.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the title and label', async () => {
    const { getByText } = await render(<AvailabilityCard />);

    expect(getByText('Você estará \ndisponível neste dia?')).toBeTruthy();
    expect(getByText('Disponibilidade')).toBeTruthy();
  });

  test('starts with a single interval and no remove button', async () => {
    const { getByTestId, queryByTestId } = await render(<AvailabilityCard />);

    expect(getByTestId('alibe-availability-card-interval-0')).toBeTruthy();
    expect(queryByTestId('alibe-availability-card-remove-0')).toBeNull();
  });

  test('adds a new interval with a remove button, while the first stays without one', async () => {
    const { getByTestId, queryByTestId } = await render(<AvailabilityCard />);

    await fireEvent.press(getByTestId('alibe-availability-card-add-interval'));

    expect(queryByTestId('alibe-availability-card-remove-0')).toBeNull();
    expect(getByTestId('alibe-availability-card-remove-1')).toBeTruthy();
  });

  test('does not render an "Intervalo" title anywhere', async () => {
    const { queryByText } = await render(<AvailabilityCard />);

    expect(queryByText(/Intervalo/)).toBeNull();
  });

  test('removes an additional interval, keeping the first one intact', async () => {
    const { getByTestId, queryByTestId } = await render(<AvailabilityCard />);

    await fireEvent.press(getByTestId('alibe-availability-card-add-interval'));
    await fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '0800');
    await fireEvent.press(getByTestId('alibe-availability-card-remove-1'));

    expect(queryByTestId('alibe-availability-card-interval-1')).toBeNull();
    expect(getByTestId('alibe-availability-card-start-0')).toHaveDisplayValue('08:00');
  });

  test('removes the middle interval out of three, keeping the others', async () => {
    const { getByTestId, queryByTestId } = await render(<AvailabilityCard />);

    await fireEvent.press(getByTestId('alibe-availability-card-add-interval'));
    await fireEvent.press(getByTestId('alibe-availability-card-add-interval'));
    await fireEvent.changeText(getByTestId('alibe-availability-card-start-1'), '1200');
    await fireEvent.changeText(getByTestId('alibe-availability-card-start-2'), '1800');

    await fireEvent.press(getByTestId('alibe-availability-card-remove-1'));

    expect(queryByTestId('alibe-availability-card-interval-2')).toBeNull();
    expect(getByTestId('alibe-availability-card-start-1')).toHaveDisplayValue('18:00');
  });

  test('never removes the last remaining interval', async () => {
    const { getByTestId, queryByTestId } = await render(<AvailabilityCard />);

    expect(queryByTestId('alibe-availability-card-remove-0')).toBeNull();
    expect(getByTestId('alibe-availability-card-interval-0')).toBeTruthy();
  });

  test('signals an error when the end time is before the start time', async () => {
    const { getByTestId } = await render(<AvailabilityCard />);

    await fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '1000');
    await fireEvent.changeText(getByTestId('alibe-availability-card-end-0'), '0900');

    await waitFor(() => {
      expect(getByTestId('alibe-availability-card-end-0-error')).toHaveTextContent(
        'O horário de fim deve ser depois do início.'
      );
    });
  });

  test('calls onIntervalsChange whenever the intervals change', async () => {
    const onIntervalsChange = jest.fn();
    const { getByTestId } = await render(
      <AvailabilityCard onIntervalsChange={onIntervalsChange} />
    );

    await fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '0900');

    await waitFor(() => {
      expect(onIntervalsChange).toHaveBeenLastCalledWith([
        expect.objectContaining({ startTime: '09:00' }),
      ]);
    });
  });

  test('navigates back without saving when the close button is pressed', async () => {
    const { getByTestId } = await render(<AvailabilityCard />);

    await fireEvent.press(getByTestId('alibe-availability-card-close'));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('accepts a custom controller, so the intervals can be provided from elsewhere', async () => {
    const addInterval = jest.fn();
    const useCustomController = () => ({
      intervals: [{ id: 'x', startTime: '08:00', endTime: '12:00', error: null }],
      addInterval,
      removeInterval: jest.fn(),
      updateStartTime: jest.fn(),
      updateEndTime: jest.fn(),
    });

    const { getByDisplayValue, getByTestId } = await render(
      <AvailabilityCard useController={useCustomController} />
    );

    expect(getByDisplayValue('08:00')).toBeTruthy();
    expect(getByDisplayValue('12:00')).toBeTruthy();

    await fireEvent.press(getByTestId('alibe-availability-card-add-interval'));
    expect(addInterval).toHaveBeenCalledTimes(1);
  });

  test('accepts a custom close controller', async () => {
    const handleBack = jest.fn();
    const useCustomCloseController = () => ({ handleBack });

    const { getByTestId } = await render(
      <AvailabilityCard useCloseController={useCustomCloseController} />
    );

    await fireEvent.press(getByTestId('alibe-availability-card-close'));

    expect(handleBack).toHaveBeenCalledTimes(1);
    expect(mockBack).not.toHaveBeenCalled();
  });
});
