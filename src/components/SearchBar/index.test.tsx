import { fireEvent, render } from '@testing-library/react-native';

import { SearchBar } from './index';

describe('<SearchBar />', () => {
  test('renders the default placeholder', async () => {
    const { getByPlaceholderText } = await render(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
      />
    );

    expect(getByPlaceholderText('Pesquisar...')).toBeTruthy();
  });

  test('renders a custom placeholder', async () => {
    const { getByPlaceholderText } = await render(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
        placeholder="Buscar experiências..."
      />
    );

    expect(getByPlaceholderText('Buscar experiências...')).toBeTruthy();
  });

  test('shows the value it receives', async () => {
    const { getByDisplayValue } = await render(
      <SearchBar
        value="Bloom Café"
        onChangeText={jest.fn()}
      />
    );

    expect(getByDisplayValue('Bloom Café')).toBeTruthy();
  });

  test('reports every keystroke in real time', async () => {
    const onChangeText = jest.fn();
    const { getByTestId } = await render(
      <SearchBar
        value=""
        onChangeText={onChangeText}
      />
    );

    await fireEvent.changeText(getByTestId('alibe-search-bar'), 'Rest');

    expect(onChangeText).toHaveBeenCalledTimes(1);
    expect(onChangeText).toHaveBeenCalledWith('Rest');
  });

  test('accepts a custom testID for the input and its wrapper', async () => {
    const { getByTestId } = await render(
      <SearchBar
        value=""
        onChangeText={jest.fn()}
        testID="experiences-search-bar"
      />
    );

    expect(getByTestId('experiences-search-bar')).toBeTruthy();
    expect(getByTestId('experiences-search-bar-field')).toBeTruthy();
  });
});
