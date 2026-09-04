import { render } from '@testing-library/react-native';

import { ComponentGalleryScreen } from './ComponentGalleryScreen';

describe('<ComponentGalleryScreen />', () => {
  test('renders the available button states', async () => {
    const { getByText } = await render(<ComponentGalleryScreen />);

    expect(getByText('Primary button')).toBeTruthy();
    expect(getByText('Secondary button')).toBeTruthy();
    expect(getByText('Disabled button')).toBeTruthy();
  });

  test('renders the create group button states', async () => {
    const { getAllByLabelText, getByText } = await render(<ComponentGalleryScreen />);

    expect(getAllByLabelText('Criar novo grupo')).toHaveLength(2);
    expect(getByText('Default')).toBeTruthy();
    expect(getByText('Disabled')).toBeTruthy();
  });
});
