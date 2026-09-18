import { render } from '@testing-library/react-native';
import { Avatar } from './index';

describe('<Avatar />', () => {
  test('shows a placeholder icon when there is no photo', async () => {
    const { getByTestId } = await render(<Avatar accessibilityLabel="Foto do grupo" />);

    expect(getByTestId('alibe-avatar-placeholder')).toBeTruthy();
  });

  test('shows the photo when a uri is provided', async () => {
    const { getByTestId } = await render(
      <Avatar
        photoUri="https://cdn.alibe.com/group-1.jpg"
        accessibilityLabel="Foto do grupo"
      />
    );

    const photo = getByTestId('alibe-avatar-photo');
    expect(photo.props.style).toEqual(expect.objectContaining({ width: 144, height: 144 }));
  });

  test('namespaces its testIDs under a custom prefix', async () => {
    const { getByTestId } = await render(
      <Avatar
        accessibilityLabel="Foto do grupo"
        testID="group-card-avatar"
      />
    );

    expect(getByTestId('group-card-avatar-placeholder')).toBeTruthy();
  });
});
