import { render } from '@testing-library/react-native';
import { CreateGroupScreen } from './CreateGroupScreen';

describe('<CreateGroupScreen />', () => {
  test('renders the main title', async () => {
  const { getByText } = await render(<CreateGroupScreen />);

  expect(getByText(/Vamos\s+começar\?/)).toBeTruthy();
});

  test('renders the subtitle', async () => {
    const { getByText } = await render(<CreateGroupScreen />);

    expect(getByText('Seu próximo encontro nasce aqui.')).toBeTruthy();
  });

  test('renders the optional photo section', async () => {
    const { getByText } = await render(<CreateGroupScreen />);

    expect(getByText('Adicionar foto (opcional)')).toBeTruthy();
  });

  test('renders the group name input', async () => {
    const { getByPlaceholderText } = await render(<CreateGroupScreen />);

    expect(getByPlaceholderText('Nome do grupo')).toBeTruthy();
  });

  test('renders the continue button', async () => {
    const { getByText } = await render(<CreateGroupScreen />);

    expect(getByText('Continuar')).toBeTruthy();
  });
});