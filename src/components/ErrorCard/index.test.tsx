import { fireEvent, render } from '@testing-library/react-native';

import { ErrorCard } from './index';

describe('<ErrorCard />', () => {
  test('shows the message and retries on press', () => {
    const onRetry = jest.fn();
    const { getByLabelText, getByText } = render(
      <ErrorCard
        message="Algo deu errado."
        onRetry={onRetry}
      />
    );

    expect(getByText('Algo deu errado.')).toBeTruthy();

    fireEvent.press(getByLabelText('Tentar novamente'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('hides the retry button when there is nothing to retry', () => {
    const { queryByLabelText } = render(<ErrorCard message="Algo deu errado." />);

    expect(queryByLabelText('Tentar novamente')).toBeNull();
  });
});
