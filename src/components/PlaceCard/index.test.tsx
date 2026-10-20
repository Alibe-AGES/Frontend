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

  /* TODO: Restore favorite tests when backend favorite integration is ready.
  test('is not marked as favorite by default', async () => {
    const { getByLabelText } = await render(
      <PlaceCard
        name="Bloom Café"
        address="Endereço"
      />
    );

    expect(getByLabelText('Favoritar Bloom Café').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false })
    );
  });

  test('is marked as favorite when isFavorite is true', async () => {
    const { getByLabelText, queryByLabelText } = await render(
      <PlaceCard
        name="Bloom Café"
        address="Endereço"
        isFavorite
      />
    );

    expect(getByLabelText('Desfavoritar Bloom Café').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true })
    );
    expect(queryByLabelText('Favoritar Bloom Café')).toBeNull();
  });

  test('calls onToggleFavorite without opening the card when the star is pressed', async () => {
    const onClickCard = jest.fn();
    const onToggleFavorite = jest.fn();
    const { getByLabelText } = await render(
      <PlaceCard
        name="Bloom Café"
        address="Endereço"
        onClickCard={onClickCard}
        onToggleFavorite={onToggleFavorite}
      />
    );

    await fireEvent.press(getByLabelText('Favoritar Bloom Café'));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onClickCard).not.toHaveBeenCalled();
  });
  */

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
