import { fireEvent, render } from '@testing-library/react-native';

import { SearchBar } from './index';

describe('<SearchBar />', () => {
  test('renders the default placeholder', async () => {
    const { getByPlaceholderText } = await Promise.resolve(
      render(
        <SearchBar
          value=""
          onChangeText={jest.fn()}
        />
      )
    );

    expect(getByPlaceholderText('Pesquisar...')).toBeTruthy();
  });

  test('renders a custom placeholder', async () => {
    const { getByPlaceholderText } = await Promise.resolve(
      render(
        <SearchBar
          value=""
          onChangeText={jest.fn()}
          placeholder="Buscar experiências..."
        />
      )
    );

    expect(getByPlaceholderText('Buscar experiências...')).toBeTruthy();
  });

  test('shows the value it receives', async () => {
    const { getByDisplayValue } = await Promise.resolve(
      render(
        <SearchBar
          value="Bloom Café"
          onChangeText={jest.fn()}
        />
      )
    );

    expect(getByDisplayValue('Bloom Café')).toBeTruthy();
  });

  test('reports every keystroke in real time', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await Promise.resolve(
      render(
        <SearchBar
          value=""
          onChangeText={onChangeText}
        />
      )
    );

    fireEvent.changeText(getByTestId('alibe-search-bar'), 'Rest');
    await Promise.resolve();

    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('Rest');
  });

  test('accepts a custom testID for the input and its wrapper', async () => {
    const { getByTestId } = await Promise.resolve(
      render(
        <SearchBar
          value=""
          onChangeText={jest.fn()}
          testID="experiences-search-bar"
        />
      )
    );

    expect(getByTestId('experiences-search-bar')).toBeTruthy();
    expect(getByTestId('experiences-search-bar-field')).toBeTruthy();
  });

  test('hides the clear button while the field is empty', async () => {
    const { queryByTestId } = await Promise.resolve(
      render(
        <SearchBar
          value=""
          onChangeText={jest.fn()}
        />
      )
    );

    expect(queryByTestId('alibe-search-bar-clear')).toBeNull();
  });

  test('clears the field when the clear button is pressed', async () => {
    const onChangeText = jest.fn();
    const { getByLabelText } = await Promise.resolve(
      render(
        <SearchBar
          value="Bloom"
          onChangeText={onChangeText}
        />
      )
    );

    fireEvent.press(getByLabelText('Limpar pesquisa'));

    expect(onChangeText).toHaveBeenCalledWith('');
  });
});
