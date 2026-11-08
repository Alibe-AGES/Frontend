import { fireEvent, render } from '@testing-library/react-native';
import { processColor, Text } from 'react-native';

import { theme } from '@/theme';

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

  test('renders the overlay outside the scrollable content', async () => {
    const { getByTestId, getByText } = await render(
      <ScreenFrame
        overlay={<Text>Sobreposição</Text>}
        testID="frame"
      >
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );

    expect(getByText('Sobreposição')).toBeTruthy();
    expect(getByTestId('frame')).not.toContainElement(getByText('Sobreposição'));
  });

  test('hides the top fade at rest and reveals it as the content scrolls', async () => {
    const { getByTestId } = await render(
      <ScreenFrame
        topFade
        testID="frame"
      >
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );
    const getFadeStyle = () => flattenStyle(getByTestId('screen-frame-top-fade').props.style);

    expect(getFadeStyle().opacity).toBe(0);
    expect(getFadeStyle().pointerEvents).toBe('none');

    await fireEvent.scroll(getByTestId('frame'), {
      nativeEvent: {
        contentOffset: { x: 0, y: 48 },
        contentSize: { width: 400, height: 1000 },
        layoutMeasurement: { width: 400, height: 500 },
      },
    });

    expect(getFadeStyle().opacity).toBe(1);
  });

  test('shows the top fade at rest when set to always, even without scrolling', async () => {
    const { getByTestId } = await render(
      <ScreenFrame
        topFade="always"
        scrollable={false}
      >
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );

    expect(flattenStyle(getByTestId('screen-frame-top-fade').props.style).opacity).toBe(1);
  });

  test('hides the top fade again when the content returns to the top', async () => {
    const { getByTestId } = await render(
      <ScreenFrame
        topFade
        testID="frame"
      >
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );
    const scrollTo = async (y: number) => {
      await fireEvent.scroll(getByTestId('frame'), {
        nativeEvent: {
          contentOffset: { x: 0, y },
          contentSize: { width: 400, height: 1000 },
          layoutMeasurement: { width: 400, height: 500 },
        },
      });
    };

    await scrollTo(48);
    await scrollTo(0);

    expect(flattenStyle(getByTestId('screen-frame-top-fade').props.style).opacity).toBe(0);
  });

  test.each(['canvas', 'surface'] as const)('fades into the %s background', async (background) => {
    const { container } = await render(
      <ScreenFrame
        background={background}
        topFade="always"
      >
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );

    // Test Renderer only keeps host elements: the native gradient lists [offset, color, ...],
    // with each stop's opacity folded into the color's alpha, so compare the RGB part.
    const toRgb = (color: unknown) => (Number(color) >>> 0) & 0xffffff;
    const [gradient] = container.queryAll((node) => node.type === 'RNSVGLinearGradient');
    const stopColors = (gradient.props.gradient as number[]).filter((_, index) => index % 2 === 1);

    expect(stopColors.length).toBeGreaterThan(0);
    expect(new Set(stopColors.map(toRgb))).toEqual(
      new Set([toRgb(processColor(theme.colors[background]))])
    );
  });

  test('renders no top fade unless requested on a scrollable frame', async () => {
    const { queryByTestId, rerender } = await render(
      <ScreenFrame>
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );

    expect(queryByTestId('screen-frame-top-fade')).toBeNull();

    await rerender(
      <ScreenFrame
        topFade
        scrollable={false}
      >
        <Text>Conteúdo</Text>
      </ScreenFrame>
    );

    expect(queryByTestId('screen-frame-top-fade')).toBeNull();
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
