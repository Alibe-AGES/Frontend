import { fireEvent, render } from '@testing-library/react-native';
import { GROUP_COLOR_PALETTE } from '@/utils/groupColors';
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

  test('truncates the name to a single line so it never overflows the pill', async () => {
    const { getByTestId } = await render(
      <GroupCard
        id="1"
        name="Um nome de grupo bem comprido para testar o corte de texto"
        color="bg-lime"
      />
    );

    expect(getByTestId('alibe-group-card-name').props.numberOfLines).toBe(1);
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

  test('shows the info icon', async () => {
    const { getByTestId } = await render(
      <GroupCard
        id="1"
        name="Hermanas"
        color="bg-lime"
      />
    );

    expect(getByTestId('alibe-group-card-info-icon')).toBeTruthy();
  });

  test('applies the given background color to the card', async () => {
    const { getByTestId } = await render(
      <GroupCard
        id="1"
        name="Hermanas"
        color="bg-coral"
      />
    );

    expect(getByTestId('alibe-group-card').props.className).toContain('bg-coral');
  });

  test.each(GROUP_COLOR_PALETTE.filter((color) => color !== 'bg-coral'))(
    'uses ink text on the light %s background, like the secondary button',
    async (color) => {
      const { getByTestId } = await render(
        <GroupCard
          id="1"
          name="Hermanas"
          color={color}
        />
      );

      expect(getByTestId('alibe-group-card-name').props.className).toContain('text-ink');
    }
  );

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

  test('does not throw when tapped without an onPress handler', async () => {
    const { getByTestId } = await render(
      <GroupCard
        id="1"
        name="Hermanas"
        color="bg-lime"
      />
    );

    expect(() => fireEvent.press(getByTestId('alibe-group-card'))).not.toThrow();
  });

  test('is exposed as an accessible button', async () => {
    const { getByTestId } = await render(
      <GroupCard
        id="1"
        name="Hermanas"
        color="bg-lime"
      />
    );

    expect(getByTestId('alibe-group-card').props.accessibilityRole).toBe('button');
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

  test('namespaces every inner testID under a custom prefix', async () => {
    const { getByTestId } = await render(
      <GroupCard
        id="1"
        name="Hermanas"
        color="bg-lime"
        testID="groups-list-item-1"
      />
    );

    expect(getByTestId('groups-list-item-1')).toBeTruthy();
    expect(getByTestId('groups-list-item-1-name')).toBeTruthy();
    expect(getByTestId('groups-list-item-1-info-icon')).toBeTruthy();
    expect(getByTestId('groups-list-item-1-avatar-placeholder')).toBeTruthy();
  });
});
