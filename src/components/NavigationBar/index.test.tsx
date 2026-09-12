import { fireEvent, render } from '@testing-library/react-native';

import { NavigationBar } from './index';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('<NavigationBar />', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test.each([
    ['alibe-navigation-bar-create', { pathname: '/group/[id]/create-event', params: { id: 'g1' } }],
    [
      'alibe-navigation-bar-matches',
      { pathname: '/group/[id]/experiences/new', params: { id: 'g1' } },
    ],
    ['alibe-navigation-bar-search', { pathname: '/group/[id]/experiences', params: { id: 'g1' } }],
    ['alibe-navigation-bar-memories', { pathname: '/group/[id]/memories', params: { id: 'g1' } }],
  ])('%s navigates to its group screen', async (testId, href) => {
    const { getByTestId } = await render(<NavigationBar groupId="g1" />);

    await fireEvent.press(getByTestId(testId));

    expect(mockPush).toHaveBeenCalledWith(href);
  });

  test('groups button navigates to the groups screen', async () => {
    const { getByTestId } = await render(<NavigationBar groupId="g1" />);

    await fireEvent.press(getByTestId('alibe-navigation-bar-groups'));

    expect(mockPush).toHaveBeenCalledWith('/groups');
  });

  test('is not pressable when disabled', async () => {
    const { getByTestId } = await render(
      <NavigationBar
        groupId="g1"
        disabled
      />
    );

    await fireEvent.press(getByTestId('alibe-navigation-bar-create'));

    expect(mockPush).not.toHaveBeenCalled();
    expect(getByTestId('alibe-navigation-bar-create').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('exposes accessible labels for every action', async () => {
    const { getByLabelText } = await render(<NavigationBar groupId="g1" />);

    expect(getByLabelText('Criar encontro')).toBeTruthy();
    expect(getByLabelText('Match de rolês')).toBeTruthy();
    expect(getByLabelText('Experiências')).toBeTruthy();
    expect(getByLabelText('Memórias')).toBeTruthy();
    expect(getByLabelText('Meus grupos')).toBeTruthy();
  });
});
