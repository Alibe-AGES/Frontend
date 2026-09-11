import { fireEvent, render } from '@testing-library/react-native';
import { GroupCard } from './index';

describe('<GroupCard />', () => {
  test('shows the group name', async () => {
    const { getByText } = await render(
      <GroupCard
        id="1"
        name="Hermanas"
        color="bg-lime"
      />
    );

    expect(getByText('Hermanas')).toBeTruthy();
  });

  test('shows a placeholder avatar when there is no photo', async () => {
    const { getByTestId } = await render(
      <GroupCard
        id="1"
        name="Hermanas"
        color="bg-lime"
      />
    );

    expect(getByTestId('alibe-group-card-avatar-placeholder')).toBeTruthy();
  });

  test('shows the group photo when provided (reusing the shared Avatar component)', async () => {
    const { getByTestId } = await render(
      <GroupCard
        id="1"
        name="Hermanas"
        color="bg-lime"
        photoUri="https://cdn.alibe.com/hermanas.jpg"
      />
    );

    expect(getByTestId('alibe-group-card-avatar-photo')).toBeTruthy();
  });

  test('calls onPress with the group id when tapped, so the screen can open it', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <GroupCard
        id="group-42"
        name="Hermanas"
        color="bg-lime"
        onPress={onPress}
      />
    );

    await fireEvent.press(getByTestId('alibe-group-card'));

    expect(onPress).toHaveBeenCalledWith('group-42');
  });

  test('uses ink text on light backgrounds, like the secondary button', async () => {
    const { getByTestId } = await render(
      <GroupCard
        id="1"
        name="Hermanas"
        color="bg-lime"
      />
    );

    expect(getByTestId('alibe-group-card-name').props.className).toContain('text-ink');
  });

  test('uses white text on the coral background, like the primary button', async () => {
    const { getByTestId } = await render(
      <GroupCard
        id="1"
        name="Galera 2012"
        color="bg-coral"
      />
    );

    expect(getByTestId('alibe-group-card-name').props.className).toContain('text-white');
  });

  test('exposes an accessible label with the group name', async () => {
    const { getByLabelText } = await render(
      <GroupCard
        id="1"
        name="Pela cidade"
        color="bg-pink"
      />
    );

    expect(getByLabelText('Abrir grupo Pela cidade')).toBeTruthy();
  });
});
