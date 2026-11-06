import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Place, PlaceList } from './index';

const places: Place[] = Array.from({ length: 5 }, (_, index) => ({
  id: `place-${String(index)}`,
  name: `Local ${String(index)}`,
  address: `Rua ${String(index)}`,
  category: index % 2 === 0 ? 'restaurant' : 'class',
}));

describe('<PlaceList />', () => {
  test('renders only the first page of places', async () => {
    const { getByText, queryByText } = await Promise.resolve(
      render(
        <PlaceList
          places={places}
          pageSize={2}
        />
      )
    );

    expect(getByText('Local 0')).toBeTruthy();
    expect(getByText('Local 1')).toBeTruthy();
    expect(queryByText('Local 2')).toBeNull();
  });

  test('loads the next page when the end is reached', async () => {
    const { getByTestId, getByText } = await Promise.resolve(
      render(
        <PlaceList
          places={places}
          pageSize={2}
        />
      )
    );

    fireEvent(getByTestId('alibe-place-list'), 'endReached');
    await Promise.resolve();

    expect(getByText('Local 2')).toBeTruthy();
    expect(getByText('Local 3')).toBeTruthy();
  });

  test('applies the filter', async () => {
    const { getByText, queryByText } = await Promise.resolve(
      render(
        <PlaceList
          places={places}
          filter={(place) => place.category === 'class'}
        />
      )
    );

    expect(getByText('Local 1')).toBeTruthy();
    expect(queryByText('Local 0')).toBeNull();
  });

  test('calls onPlacePress with the place id', async () => {
    const onPlacePress = jest.fn();
    const { getByLabelText } = await Promise.resolve(
      render(
        <PlaceList
          places={places}
          onPlacePress={onPlacePress}
        />
      )
    );

    fireEvent.press(getByLabelText('Abrir Local 1'));
    await Promise.resolve();

    expect(onPlacePress).toHaveBeenCalledWith('place-1');
  });

  test('shows empty, loading and error states', async () => {
    const onRetry = jest.fn();
    const empty = await Promise.resolve(render(<PlaceList places={[]} />));
    expect(empty.getByText('Nenhum local encontrado.')).toBeTruthy();

    const loading = await Promise.resolve(
      render(
        <PlaceList
          places={[]}
          isLoading
        />
      )
    );
    expect(loading.getByTestId('alibe-place-list-loading')).toBeTruthy();

    const failed = await Promise.resolve(
      render(
        <PlaceList
          places={[]}
          error="Falhou"
          onRetry={onRetry}
        />
      )
    );
    fireEvent.press(failed.getByLabelText('Tentar novamente'));
    await Promise.resolve();
    expect(onRetry).toHaveBeenCalled();
  });

  test('keeps the footer with places and with the empty state', async () => {
    const footer = <Text>Rodapé</Text>;
    const { getByText, rerender } = await Promise.resolve(
      render(
        <PlaceList
          places={places}
          footer={footer}
        />
      )
    );
    expect(getByText('Rodapé')).toBeTruthy();

    rerender(
      <PlaceList
        places={[]}
        footer={footer}
      />
    );
    await Promise.resolve();
    expect(getByText('Rodapé')).toBeTruthy();
    expect(getByText('Nenhum local encontrado.')).toBeTruthy();
  });

  test('keeps the header visible with places, empty and loading states', async () => {
    const header = <Text>Cabeçalho</Text>;
    const { getByText, rerender } = await Promise.resolve(
      render(
        <PlaceList
          places={places}
          header={header}
        />
      )
    );
    expect(getByText('Cabeçalho')).toBeTruthy();

    rerender(
      <PlaceList
        places={places}
        filter={() => false}
        header={header}
      />
    );
    await Promise.resolve();
    expect(getByText('Cabeçalho')).toBeTruthy();
    expect(getByText('Nenhum local encontrado.')).toBeTruthy();

    rerender(
      <PlaceList
        places={places}
        isLoading
        header={header}
      />
    );
    await Promise.resolve();
    expect(getByText('Cabeçalho')).toBeTruthy();
  });

  test('pads an odd last row so a lone card keeps its column width', async () => {
    const { getByTestId } = await Promise.resolve(
      render(
        <PlaceList
          places={places.slice(0, 3)}
          pageSize={3}
        />
      )
    );

    expect(getByTestId('alibe-place-list').props.data).toHaveLength(4);
  });
});
