import { fireEvent, render } from '@testing-library/react-native';
import { BackButton } from './index';

describe('<BackButton />', () => {
  test('renders the back arrow and responds to presses', async () => {
    const onPress = jest.fn();

    const { getByText } = await render(<BackButton onPress={onPress} />);

    await fireEvent.press(getByText('←'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('renders the back arrow', async () => {
    const onPress = jest.fn();

    const { getByText } = await render(<BackButton onPress={onPress} />);

    expect(getByText('←')).toBeTruthy();
  });

  test('has button accessibility role', async () => {
    const onPress = jest.fn();

    const { getByRole } = await render(<BackButton onPress={onPress} />);

    expect(getByRole('button')).toBeTruthy();
  });
});