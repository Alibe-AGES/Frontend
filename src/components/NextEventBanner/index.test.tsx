import { render } from '@testing-library/react-native';
import { formatNextEventDate } from './formatters';
import { NextEventBanner } from './index';

describe('NextEventBanner', () => {
  test('renders the next event date and name', async () => {
    const timeslot = new Date(2026, 4, 22, 16, 0).toISOString();
    const { getByText } = await render(<NextEventBanner event={{ name: 'Cinema', timeslot }} />);

    expect(getByText('• Sexta-feira, 22 de maio, às 16h')).toBeTruthy();
    expect(getByText('• Cinema')).toBeTruthy();
  });

  test('renders the empty state when there is no next event', async () => {
    const { getByTestId, getByText } = await render(<NextEventBanner event={null} />);

    expect(getByTestId('alibe-next-event-banner-empty')).toBeTruthy();
    expect(getByText('Nenhum encontro marcado ainda.')).toBeTruthy();
  });

  test('includes minutes when the event is not on the hour', () => {
    expect(formatNextEventDate(new Date(2026, 4, 22, 16, 30).toISOString())).toBe(
      'Sexta-feira, 22 de maio, às 16h30'
    );
  });

  test('returns null for an invalid timeslot', () => {
    expect(formatNextEventDate('invalid')).toBeNull();
  });
});
