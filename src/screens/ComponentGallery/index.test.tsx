import { fireEvent, render } from '@testing-library/react-native';

import { ComponentGalleryScreen } from '.';

describe('<ComponentGalleryScreen />', () => {
  test('renders the available button states', async () => {
    const { getByText } = await render(<ComponentGalleryScreen />);

    expect(getByText('Primary button')).toBeTruthy();
    expect(getByText('Secondary button')).toBeTruthy();
    expect(getByText('Disabled button')).toBeTruthy();
  });
});

describe('<ComponentGalleryScreen /> event card', () => {
  test('renders an editable EventCard in create mode', async () => {
    const { getByTestId } = await render(<ComponentGalleryScreen />);

    await fireEvent.changeText(getByTestId('gallery-event-card-create-name-input'), 'Bloom Café');

    expect(getByTestId('gallery-event-card-create-name-input').props.value).toBe('Bloom Café');
  });

  test('enables the confirm button only after the draft is complete', async () => {
    const { getByTestId } = await render(<ComponentGalleryScreen />);
    const confirm = () => getByTestId('gallery-event-card-create-confirm');

    expect(confirm().props.className).toContain('bg-ink-soft');

    await fireEvent.changeText(getByTestId('gallery-event-card-create-name-input'), 'Bloom Café');
    await fireEvent.changeText(getByTestId('gallery-event-card-create-address-input'), 'Av. X');
    await fireEvent.changeText(getByTestId('gallery-event-card-create-date-input'), '1805');
    await fireEvent.changeText(getByTestId('gallery-event-card-create-time-input'), '1000');

    expect(confirm().props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: false })
    );
    expect(confirm().props.className).toContain('bg-ink active:bg-ink-soft');
  });
});
