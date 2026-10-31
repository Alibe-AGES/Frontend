import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ScreenFrame } from './index';

const FOOTER_HEIGHT = 100;
const FOOTER_SPACING = 32;

const flattenStyle = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean)) as Record<string, unknown>;

describe('<ScreenFrame />', () => {
  test('renders its children inside a scroll view by default', async () => {
    const { getByTestId, getByText } = await render(
      <ScreenFrame testID="frame">
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );

    expect(getByText('Conteúdo')).toBeTruthy();
    expect(getByTestId('frame').props.keyboardShouldPersistTaps).toBe('handled');
  });

  test('renders the header outside the scrollable content', async () => {
    const { getByTestId, getByText } = await render(
      <ScreenFrame
        header={<Text>Cabeçalho</Text>}
        testID="frame"
      >
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );

    expect(getByText('Cabeçalho')).toBeTruthy();
    expect(getByTestId('frame')).not.toContainElement(getByText('Cabeçalho'));
    expect(getByTestId('frame')).toContainElement(getByText('Conteúdo'));
  });

  test('reserves the measured footer height below the scrollable content', async () => {
    const { getByTestId, getByText } = await render(
      <ScreenFrame
        footer={<Text>Rodapé</Text>}
        testID="frame"
      >
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );
    const getPaddingBottom = () =>
      flattenStyle(getByTestId('frame').props.contentContainerStyle).paddingBottom;

    expect(getByText('Rodapé')).toBeTruthy();
    expect(getPaddingBottom()).toBe(FOOTER_SPACING);

    await fireEvent(getByTestId('screen-frame-footer'), 'layout', {
      nativeEvent: { layout: { height: FOOTER_HEIGHT } },
    });

    expect(getPaddingBottom()).toBe(FOOTER_HEIGHT + FOOTER_SPACING);
  });

  test('renders a static content area when scrolling is disabled', async () => {
    const { getByTestId } = await render(
      <ScreenFrame
        scrollable={false}
        footer={<Text>Rodapé</Text>}
        testID="frame"
      >
        <Text>Lista</Text>
      </ScreenFrame>
    );

    expect(getByTestId('frame').props.contentContainerStyle).toBeUndefined();

    await fireEvent(getByTestId('screen-frame-footer'), 'layout', {
      nativeEvent: { layout: { height: FOOTER_HEIGHT } },
    });

    expect(flattenStyle(getByTestId('frame').props.style).paddingBottom).toBe(FOOTER_HEIGHT);
  });

  test('does not reserve footer space when there is no footer', async () => {
    const { getByTestId, queryByTestId } = await render(
      <ScreenFrame testID="frame">
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );

    expect(queryByTestId('screen-frame-footer')).toBeNull();
    expect(flattenStyle(getByTestId('frame').props.contentContainerStyle).paddingBottom).toBe(0);
  });
});
