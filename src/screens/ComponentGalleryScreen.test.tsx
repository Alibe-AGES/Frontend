import { render } from '@testing-library/react-native';

import { ComponentGalleryScreen } from './ComponentGalleryScreen';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

describe('<ComponentGalleryScreen />', () => {
  test('renders the available button states', async () => {
    const { getByText } = await render(<ComponentGalleryScreen />);

    expect(getByText('Primary button')).toBeTruthy();
    expect(getByText('Secondary button')).toBeTruthy();
    expect(getByText('Disabled button')).toBeTruthy();
  });

  test('renders the available BackButton states', async () => {
    const { getAllByLabelText, getByLabelText } = await render(<ComponentGalleryScreen />);

    expect(getAllByLabelText('Voltar')).toHaveLength(2);
    expect(getByLabelText('Cancelar')).toBeTruthy();
  });
});
