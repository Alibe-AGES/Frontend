import { fireEvent, render } from '@testing-library/react-native';
import { PlaceCard } from './index';

describe('<PlaceCard />', () => {
  test('shows the place name and address', async () => {
    const { getByText } = await render(
      <PlaceCard
        name="Bloom Café"
        address="Av. Carlos Gomes, 600"
      />
    );

    expect(getByText('Bloom Café')).toBeTruthy();
    expect(getByText('Av. Carlos Gomes, 600')).toBeTruthy();
  });

  test('shows the photo when imageUri is provided', async () => {
    const { getByLabelText } = await render(
      <PlaceCard
        name="Bloom Café"
        address="Endereço"
        imageUri="https://cdn.alibe.com/bloom.jpg"
      />
    );

    expect(getByLabelText('Foto de Bloom Café').props.source).toEqual({
      uri: 'https://cdn.alibe.com/bloom.jpg',
    });
  });

  test('shows only the colored block when there is no image', async () => {
    const { queryByLabelText } = await render(
      <PlaceCard
        name="Bloom Café"
        address="Endereço"
        color="lime"
      />
    );

    expect(queryByLabelText('Foto de Bloom Café')).toBeNull();
  });

  test('calls onClickCard with the place name when the card is pressed', async () => {
    const onClickCard = jest.fn();
    const { getByLabelText } = await render(
      <PlaceCard
        name="Bloom Café"
        address="Endereço"
        onClickCard={onClickCard}
      />
    );

    await fireEvent.press(getByLabelText('Abrir Bloom Café'));

    expect(onClickCard).toHaveBeenCalledTimes(1);
    expect(onClickCard).toHaveBeenCalledWith('Bloom Café');
  });

  test('truncates name and address to two lines', async () => {
    const { getByTestId } = await render(
      <PlaceCard
        name="Um nome de lugar bem comprido para testar o corte de texto"
        address="Um endereço bem comprido para testar o corte de texto"
      />
    );

    expect(getByTestId('place-card-name').props.numberOfLines).toBe(2);
    expect(getByTestId('place-card-address').props.numberOfLines).toBe(2);
  });
});
