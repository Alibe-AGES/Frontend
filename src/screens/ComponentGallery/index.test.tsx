import { render } from '@testing-library/react-native';
import { ComponentGalleryScreen } from '.';

describe('<ComponentGalleryScreen />', () => {
  test('renders only a simple button', async () => {
    const { getByRole, queryByTestId } = await render(<ComponentGalleryScreen />);

    expect(getByRole('button', { name: 'Simple button' })).toBeTruthy();
    expect(queryByTestId('gallery-event-card-create')).toBeNull();
    expect(queryByTestId('gallery-filter-sheet')).toBeNull();
    expect(queryByTestId('gallery-place-list')).toBeNull();
  });
});
