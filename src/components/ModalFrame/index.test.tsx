import { fireEvent, render } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { ModalFrame } from './index';

describe('<ModalFrame />', () => {
  test('renders a centered dialog panel with title inside a keyboard-avoiding scroll', async () => {
    const { getByTestId, getByText } = await render(
      <ModalFrame
        visible
        onRequestClose={jest.fn()}
        title="Editar Perfil"
        testID="dialog"
      >
        <Text>Conteúdo</Text>
      </ModalFrame>
    );

    expect(getByTestId('dialog-keyboard-container').props.behavior).toBe('padding');
    expect(getByTestId('dialog-scroll').props.keyboardShouldPersistTaps).toBe('handled');
    expect(getByTestId('dialog-scroll').props.contentContainerStyle).toMatchObject({
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
    });
    expect(getByTestId('dialog-panel')).toContainElement(getByText('Editar Perfil'));
    expect(getByTestId('dialog-panel')).toContainElement(getByText('Conteúdo'));
  });

  test('does not close from the backdrop unless enabled', async () => {
    const onRequestClose = jest.fn();
    const { getByTestId } = await render(
      <ModalFrame
        visible
        onRequestClose={onRequestClose}
        testID="dialog"
      >
        <Text>Conteúdo</Text>
      </ModalFrame>
    );

    await fireEvent.press(getByTestId('dialog-backdrop'));

    expect(onRequestClose).not.toHaveBeenCalled();
  });

  test('renders a bottom sheet that closes from the backdrop', async () => {
    const onRequestClose = jest.fn();
    const { getByLabelText, getByTestId, queryByTestId } = await render(
      <ModalFrame
        visible
        onRequestClose={onRequestClose}
        placement="bottom"
        closeOnBackdropPress
        backdropLabel="Fechar filtros"
        testID="sheet"
      >
        <View testID="sheet-surface" />
      </ModalFrame>
    );

    expect(queryByTestId('sheet-scroll')).toBeNull();
    expect(getByTestId('sheet-keyboard-container')).toContainElement(getByTestId('sheet-surface'));

    await fireEvent.press(getByLabelText('Fechar filtros'));

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  test('renders nothing while hidden', async () => {
    const { queryByText } = await render(
      <ModalFrame
        visible={false}
        onRequestClose={jest.fn()}
      >
        <Text>Conteúdo</Text>
      </ModalFrame>
    );

    expect(queryByText('Conteúdo')).toBeNull();
  });
});
