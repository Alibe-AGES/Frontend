import { render } from '@testing-library/react-native';

import { ComponentGalleryScreen } from './ComponentGalleryScreen';

describe('<ComponentGalleryScreen />', () => {
  test('renders the available button states', async () => {
    const { getByText } = await render(<ComponentGalleryScreen />);

    expect(getByText('Primary button')).toBeTruthy();
    expect(getByText('Secondary button')).toBeTruthy();
    expect(getByText('Disabled button')).toBeTruthy();
  });
  test('renders the invite link states', async () => {
    const { getByTestId, getAllByText } = await render(<ComponentGalleryScreen />);

    expect(getByTestId('gallery-invite-link-url')).toHaveTextContent(
      'https://alibe.app/invite/dddddddd-dddd-4ddd-8ddd-dddddddddddd'
    );
    expect(getByTestId('gallery-invite-link-loading-url')).toHaveTextContent(
      'Gerando link de convite...'
    );
    expect(getAllByText('Copiar').length).toBeGreaterThan(0);
  });
});
