import { fireEvent, render } from '@testing-library/react-native';
import { type AvailabilityParticipant, AvailableParticipants } from './AvailableParticipants';

function participant(
  id: string,
  overrides: Partial<AvailabilityParticipant> = {}
): AvailabilityParticipant {
  return {
    id,
    name: `Pessoa ${id}`,
    photoUri: null,
    isCurrentUser: false,
    availableAllDay: false,
    intervals: [],
    ...overrides,
  };
}

describe('<AvailableParticipants />', () => {
  test('shows at most five participants per row', async () => {
    const participants = ['1', '2', '3', '4', '5', '6', '7'].map((id) => participant(id));
    const { getByTestId } = await Promise.resolve(
      render(<AvailableParticipants participants={participants} />)
    );

    const rows = getByTestId('availability-screen-participants').children;
    expect(rows).toHaveLength(2);
  });

  test('opens a tooltip with the registered intervals when a participant is pressed', async () => {
    const participants = [
      participant('1', {
        name: 'Ana Beatriz',
        intervals: [
          ['09:00', '12:00'],
          ['14:00', '20:00'],
        ],
      }),
      participant('2'),
    ];
    const { getByTestId, getByText, queryByTestId } = await Promise.resolve(
      render(<AvailableParticipants participants={participants} />)
    );

    expect(queryByTestId('availability-participant-1-tooltip')).toBeNull();

    fireEvent.press(getByTestId('availability-participant-1'));

    expect(getByTestId('availability-participant-1-tooltip')).toBeTruthy();
    expect(getByText('Ana Beatriz')).toBeTruthy();
    expect(getByText('09:00 – 12:00')).toBeTruthy();
    expect(getByText('14:00 – 20:00')).toBeTruthy();
    expect(getByTestId('availability-participant-1')).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ expanded: true })
    );
  });

  test('closes the tooltip when the same participant is pressed again', async () => {
    const { getByTestId, queryByTestId } = await Promise.resolve(
      render(<AvailableParticipants participants={[participant('1')]} />)
    );

    fireEvent.press(getByTestId('availability-participant-1'));
    fireEvent.press(getByTestId('availability-participant-1'));

    expect(queryByTestId('availability-participant-1-tooltip')).toBeNull();
  });

  test('keeps the avatar and only recolors its ring when toggling the selection', async () => {
    const { getByTestId } = await Promise.resolve(
      render(<AvailableParticipants participants={[participant('1')]} />)
    );
    const ring = () => getByTestId('availability-participant-1-ring');

    expect(ring()).toHaveStyle({ borderColor: 'transparent' });

    fireEvent.press(getByTestId('availability-participant-1'));
    expect(ring()).not.toHaveStyle({ borderColor: 'transparent' });

    fireEvent.press(getByTestId('availability-participant-1'));
    expect(ring()).toHaveStyle({ borderColor: 'transparent' });
    expect(getByTestId('availability-participant-1-avatar-placeholder')).toBeTruthy();
  });

  test('switches the tooltip to another participant', async () => {
    const participants = [
      participant('1', { intervals: [['09:00', '12:00']] }),
      participant('2', { availableAllDay: true }),
    ];
    const { getByTestId, getByText, queryByTestId } = await Promise.resolve(
      render(<AvailableParticipants participants={participants} />)
    );

    fireEvent.press(getByTestId('availability-participant-1'));
    expect(getByText('09:00 – 12:00')).toBeTruthy();

    fireEvent.press(getByTestId('availability-participant-2'));
    expect(queryByTestId('availability-participant-1-tooltip')).toBeNull();
    expect(getByText('Dia todo')).toBeTruthy();
  });

  test('labels the current user as "Eu" and titles their tooltip "Seus horários"', async () => {
    const participants = [
      participant('1'),
      participant('2', { isCurrentUser: true, intervals: [['08:00', '10:00']] }),
    ];
    const { getByTestId, getByText } = await Promise.resolve(
      render(<AvailableParticipants participants={participants} />)
    );

    expect(getByText('Eu')).toBeTruthy();

    fireEvent.press(getByTestId('availability-participant-2'));
    expect(getByText('Seus horários')).toBeTruthy();
    expect(getByText('08:00 – 10:00')).toBeTruthy();
  });
});
