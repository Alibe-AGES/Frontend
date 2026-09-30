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
});
