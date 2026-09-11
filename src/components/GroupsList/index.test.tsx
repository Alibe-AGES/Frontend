import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { GroupsList } from './index';

describe('<GroupsList />', () => {
  test('shows every available group', async () => {
    const { getByText } = await render(<GroupsList />);

    await waitFor(() => {
      expect(getByText('Hermanas')).toBeTruthy();
      expect(getByText('Pela cidade')).toBeTruthy();
      expect(getByText('Galera 2012')).toBeTruthy();
    });
  });

  test('opens a group when its card is pressed', async () => {
    const onGroupPress = jest.fn();
    const { getByTestId } = await render(<GroupsList onGroupPress={onGroupPress} />);

    await waitFor(() => {
      expect(getByTestId('alibe-groups-list-item-1')).toBeTruthy();
    });

    await fireEvent.press(getByTestId('alibe-groups-list-item-1'));

    expect(onGroupPress).toHaveBeenCalledWith('1');
  });
});
