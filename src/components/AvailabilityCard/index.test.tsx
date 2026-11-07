import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { AvailabilityCard } from './index';

describe('<AvailabilityCard />', () => {
  test('does not render a close button', async () => {
    const { queryByTestId, queryByLabelText } = await Promise.resolve(render(<AvailabilityCard />));

    expect(queryByTestId('alibe-availability-card-close')).toBeNull();
    expect(queryByLabelText('Fechar')).toBeNull();
  });

  test('renders the title and label', async () => {
    const { getByText } = await Promise.resolve(render(<AvailabilityCard />));

    expect(getByText('Você estará \ndisponível neste dia?')).toBeTruthy();
    expect(getByText('Disponibilidade')).toBeTruthy();
  });

  test('starts with a single interval and no remove button', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(render(<AvailabilityCard />));

    expect(getByTestId('alibe-availability-card-interval-0')).toBeTruthy();
    expect(queryByTestId('alibe-availability-card-remove-0')).toBeNull();
  });

  test('adds a new interval with a remove button, while the first stays without one', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(render(<AvailabilityCard />));

    fireEvent.press(getByTestId('alibe-availability-card-add-interval'));
    await Promise.resolve();

    expect(queryByTestId('alibe-availability-card-remove-0')).toBeNull();
    expect(getByTestId('alibe-availability-card-remove-1')).toBeTruthy();
  });

  test('does not render an "Intervalo" title anywhere', async () => {
    const { queryByText } = await Promise.resolve(render(<AvailabilityCard />));

    expect(queryByText(/Intervalo/)).toBeNull();
  });

  test('removes an additional interval, keeping the first one intact', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(render(<AvailabilityCard />));

    fireEvent.press(getByTestId('alibe-availability-card-add-interval'));
    await Promise.resolve();
    fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '0800');
    await Promise.resolve();
    fireEvent.press(getByTestId('alibe-availability-card-remove-1'));
    await Promise.resolve();

    expect(queryByTestId('alibe-availability-card-interval-1')).toBeNull();
    expect(getByTestId('alibe-availability-card-start-0')).toHaveDisplayValue('08:00');
  });

  test('removes the middle interval out of three, keeping the others', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(render(<AvailabilityCard />));

    fireEvent.press(getByTestId('alibe-availability-card-add-interval'));
    await Promise.resolve();
    fireEvent.press(getByTestId('alibe-availability-card-add-interval'));
    await Promise.resolve();
    fireEvent.changeText(getByTestId('alibe-availability-card-start-1'), '1200');
    await Promise.resolve();
    fireEvent.changeText(getByTestId('alibe-availability-card-start-2'), '1800');
    await Promise.resolve();

    fireEvent.press(getByTestId('alibe-availability-card-remove-1'));
    await Promise.resolve();

    expect(queryByTestId('alibe-availability-card-interval-2')).toBeNull();
    expect(getByTestId('alibe-availability-card-start-1')).toHaveDisplayValue('18:00');
  });

  test('never removes the last remaining interval', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(render(<AvailabilityCard />));

    expect(queryByTestId('alibe-availability-card-remove-0')).toBeNull();
    expect(getByTestId('alibe-availability-card-interval-0')).toBeTruthy();
  });

  test('signals an error when the end time is before the start time', async () => {
    const { getByTestId } = await Promise.resolve(render(<AvailabilityCard />));

    fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '1000');
    await Promise.resolve();
    fireEvent.changeText(getByTestId('alibe-availability-card-end-0'), '0900');
    await Promise.resolve();

    await waitFor(() => {
      expect(getByTestId('alibe-availability-card-end-0-error')).toHaveTextContent(
        'O horário de fim deve ser depois do início.'
      );
    });
  });

  test('flags an interval that overlaps one the user already registered', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(
      render(<AvailabilityCard registeredIntervals={[['14:00', '22:00']]} />)
    );

    fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '2000');
    fireEvent.changeText(getByTestId('alibe-availability-card-end-0'), '2300');
    await Promise.resolve();

    await waitFor(() => {
      expect(getByTestId('alibe-availability-card-end-0-error')).toHaveTextContent(
        'Este horário coincide com um já registrado.'
      );
    });

    // Starting exactly when the saved slot ends is a separate slot.
    fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '2200');
    await Promise.resolve();

    await waitFor(() => {
      expect(queryByTestId('alibe-availability-card-end-0-error')).toBeNull();
    });
  });

  test('flags the later of two intervals that overlap in the form', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(render(<AvailabilityCard />));

    fireEvent.press(getByTestId('alibe-availability-card-add-interval'));
    await Promise.resolve();
    fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '1400');
    fireEvent.changeText(getByTestId('alibe-availability-card-end-0'), '2200');
    fireEvent.changeText(getByTestId('alibe-availability-card-start-1'), '2000');
    fireEvent.changeText(getByTestId('alibe-availability-card-end-1'), '2200');
    await Promise.resolve();

    await waitFor(() => {
      expect(getByTestId('alibe-availability-card-end-1-error')).toHaveTextContent(
        'Este horário coincide com outro intervalo.'
      );
    });
    expect(queryByTestId('alibe-availability-card-end-0-error')).toBeNull();
    // Both times of the conflicting interval turn red, but the message shows only once.
    expect(getByTestId('alibe-availability-card-start-1-field')).toHaveProp(
      'className',
      expect.stringContaining('border-coral')
    );
    expect(queryByTestId('alibe-availability-card-start-1-error')).toBeNull();

    fireEvent.changeText(getByTestId('alibe-availability-card-end-0'), '1800');
    await Promise.resolve();

    await waitFor(() => {
      expect(queryByTestId('alibe-availability-card-end-1-error')).toBeNull();
    });
  });

  test('rejects an interval that starts and ends at the same time', async () => {
    const { getByTestId } = await Promise.resolve(render(<AvailabilityCard />));

    fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '1000');
    fireEvent.changeText(getByTestId('alibe-availability-card-end-0'), '1000');
    await Promise.resolve();

    await waitFor(() => {
      expect(getByTestId('alibe-availability-card-end-0-error')).toHaveTextContent(
        'O horário de fim deve ser depois do início.'
      );
    });
  });

  test('flags a typed interval once the registered intervals arrive', async () => {
    const onIntervalsChange = jest.fn();
    const { getByTestId, rerender } = await Promise.resolve(
      render(<AvailabilityCard onIntervalsChange={onIntervalsChange} />)
    );

    fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '2015');
    fireEvent.changeText(getByTestId('alibe-availability-card-end-0'), '2045');
    await Promise.resolve();

    rerender(
      <AvailabilityCard
        onIntervalsChange={onIntervalsChange}
        registeredIntervals={[['20:00', '21:00']]}
      />
    );

    await waitFor(() => {
      expect(onIntervalsChange).toHaveBeenLastCalledWith([
        expect.objectContaining({ error: 'Este horário coincide com um já registrado.' }),
      ]);
    });
  });

  test('shows the all-day checkbox only when its handler is provided', async () => {
    const { queryByTestId, rerender } = await Promise.resolve(render(<AvailabilityCard />));

    expect(queryByTestId('alibe-availability-card-all-day')).toBeNull();

    rerender(<AvailabilityCard onAllDayChange={jest.fn()} />);
    expect(queryByTestId('alibe-availability-card-all-day')).toBeTruthy();
  });

  test('toggles all day and hides the intervals while it is checked', async () => {
    const onAllDayChange = jest.fn();
    const { getByTestId, queryByTestId, rerender } = await Promise.resolve(
      render(<AvailabilityCard onAllDayChange={onAllDayChange} />)
    );

    fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '0900');
    await Promise.resolve();
    fireEvent.press(getByTestId('alibe-availability-card-all-day'));
    expect(onAllDayChange).toHaveBeenCalledWith(true);

    rerender(
      <AvailabilityCard
        allDay
        onAllDayChange={onAllDayChange}
      />
    );
    expect(getByTestId('alibe-availability-card-all-day')).toBeChecked();
    expect(queryByTestId('alibe-availability-card-start-0')).toBeNull();
    expect(queryByTestId('alibe-availability-card-add-interval')).toBeNull();

    rerender(<AvailabilityCard onAllDayChange={onAllDayChange} />);
    expect(getByTestId('alibe-availability-card-start-0')).toHaveDisplayValue('09:00');
  });

  test('does not toggle all day while it is disabled', async () => {
    const onAllDayChange = jest.fn();
    const { getByTestId } = await Promise.resolve(
      render(
        <AvailabilityCard
          allDay
          allDayDisabled
          onAllDayChange={onAllDayChange}
        />
      )
    );

    fireEvent.press(getByTestId('alibe-availability-card-all-day'));

    expect(getByTestId('alibe-availability-card-all-day')).toBeDisabled();
    expect(onAllDayChange).not.toHaveBeenCalled();
  });

  test('calls onIntervalsChange whenever the intervals change', async () => {
    const onIntervalsChange = jest.fn();
    const { getByTestId } = await Promise.resolve(
      render(<AvailabilityCard onIntervalsChange={onIntervalsChange} />)
    );

    fireEvent.changeText(getByTestId('alibe-availability-card-start-0'), '0900');
    await Promise.resolve();

    await waitFor(() => {
      expect(onIntervalsChange).toHaveBeenLastCalledWith([
        expect.objectContaining({ startTime: '09:00' }),
      ]);
    });
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

    const { getByDisplayValue, getByTestId } = await Promise.resolve(
      render(<AvailabilityCard useController={useCustomController} />)
    );

    expect(getByDisplayValue('08:00')).toBeTruthy();
    expect(getByDisplayValue('12:00')).toBeTruthy();

    fireEvent.press(getByTestId('alibe-availability-card-add-interval'));
    await Promise.resolve();
    expect(addInterval).toHaveBeenCalledTimes(1);
  });
});
