import { render, within } from '@testing-library/react-native';
import { ComponentGalleryScreen } from '.';

describe('<ComponentGalleryScreen />', () => {
  test('renders the simple button without unrelated gallery controls', async () => {
    const { getByRole, queryByTestId } = await Promise.resolve(render(<ComponentGalleryScreen />));

    expect(getByRole('button', { name: 'Simple button' })).toBeTruthy();
    expect(queryByTestId('gallery-event-card-create')).toBeNull();
    expect(queryByTestId('gallery-filter-sheet')).toBeNull();
    expect(queryByTestId('gallery-place-list')).toBeNull();
  });

  test('shows calendar event cards with complete and partial information', async () => {
    const { getByTestId } = await Promise.resolve(render(<ComponentGalleryScreen />));

    const complete = within(getByTestId('gallery-event-card-complete'));
    expect(complete.getByText('Bloom Café')).toBeTruthy();
    expect(complete.getByText('Av. Carlos Gomes, 600')).toBeTruthy();
    expect(complete.getByText('10:00')).toBeTruthy();
    expect(complete.getByText('R$ 20 - 100')).toBeTruthy();
    expect(complete.getByText('(51) 99999-0000')).toBeTruthy();
    expect(complete.getByText('www.bloomcafe.com')).toBeTruthy();

    const partial = within(getByTestId('gallery-event-card-partial'));
    expect(partial.getByText('Passeio no parque')).toBeTruthy();
    expect(partial.getByText('Parque Farroupilha')).toBeTruthy();
    expect(partial.getByText('14:30')).toBeTruthy();
    expect(partial.getByText('(00) 00000-0000')).toBeTruthy();
    expect(partial.getAllByText('--')).toHaveLength(3);
  });
});
