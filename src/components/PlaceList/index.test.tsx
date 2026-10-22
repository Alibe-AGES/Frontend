import { fireEvent, render } from '@testing-library/react-native';
import { Place, PlaceList } from './index';

const places: Place[] = Array.from({ length: 5 }, (_, index) => ({
  id: `place-${String(index)}`,
  name: `Local ${String(index)}`,
  address: `Rua ${String(index)}`,
  category: index % 2 === 0 ? 'restaurant' : 'class',
}));

describe('<PlaceList />', () => {
  test('renders only the first page of places', async () => {
    const { getByText, queryByText } = await render(
      <PlaceList
        places={places}
        pageSize={2}
      />
    );

    expect(getByText('Local 0')).toBeTruthy();
    expect(getByText('Local 1')).toBeTruthy();
    expect(queryByText('Local 2')).toBeNull();
  });

  test('loads the next page when the end is reached', async () => {
    const { getByTestId, getByText } = await render(
      <PlaceList
        places={places}
        pageSize={2}
      />
    );

    await fireEvent(getByTestId('alibe-place-list'), 'endReached');

    expect(getByText('Local 2')).toBeTruthy();
    expect(getByText('Local 3')).toBeTruthy();
  });

  test('applies the filter', async () => {
    const { getByText, queryByText } = await render(
      <PlaceList
        places={places}
        filter={(place) => place.category === 'class'}
      />
    );

    expect(getByText('Local 1')).toBeTruthy();
    expect(queryByText('Local 0')).toBeNull();
  });

  test('calls onPlacePress with the place id', async () => {
    const onPlacePress = jest.fn();
    const { getByLabelText } = await render(
      <PlaceList
        places={places}
        onPlacePress={onPlacePress}
      />
    );

    await fireEvent.press(getByLabelText('Abrir Local 1'));

    expect(onPlacePress).toHaveBeenCalledWith('place-1');
  });

  test('shows empty, loading and error states', async () => {
    const onRetry = jest.fn();
    const empty = await render(<PlaceList places={[]} />);
    expect(empty.getByText('Nenhum local encontrado.')).toBeTruthy();

    const loading = await render(
      <PlaceList
        places={[]}
        isLoading
      />
    );
    expect(loading.getByTestId('alibe-place-list-loading')).toBeTruthy();

    const failed = await render(
      <PlaceList
        places={[]}
        error="Falhou"
        onRetry={onRetry}
      />
    );
    await fireEvent.press(failed.getByLabelText('Tentar novamente'));
    expect(onRetry).toHaveBeenCalled();
  });
});
