import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { MemoryCard } from './index';

jest.mock('expo-image', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return { Image: RN.Image };
});

const IMAGE_URI = 'https://cdn.alibe.com/memory.jpg';

describe('<MemoryCard />', () => {
  test('shows the event name and address', () => {
    const { getByText } = render(
      <MemoryCard
        date={new Date(2026, 4, 8)}
        name="Restaurante Giozakaya"
        address="Av. Teixeira Mendes 1151"
        imageUri={IMAGE_URI}
      />
    );

    expect(getByText('Restaurante Giozakaya')).toBeTruthy();
    expect(getByText('Av. Teixeira Mendes 1151')).toBeTruthy();
  });

  test('formats the date as weekday, day and month in Portuguese', () => {
    const { getByText } = render(
      <MemoryCard
        date={new Date(2026, 4, 8)}
        name="Evento"
        address="Endereço"
        imageUri={IMAGE_URI}
      />
    );

    expect(getByText('Sexta, 8 de maio')).toBeTruthy();
  });

  test('formats dates with accented weekday and month names', () => {
    const { getByText } = render(
      <MemoryCard
        date={new Date(2026, 2, 17)}
        name="Evento"
        address="Endereço"
        imageUri={IMAGE_URI}
      />
    );

    expect(getByText('Terça, 17 de março')).toBeTruthy();
  });

  test('loads the photo from the given uri', () => {
    const { getByLabelText } = render(
      <MemoryCard
        date={new Date(2026, 4, 8)}
        name="Restaurante Giozakaya"
        address="Endereço"
        imageUri={IMAGE_URI}
      />
    );

    expect(getByLabelText('Foto de Restaurante Giozakaya').props.source).toEqual({
      uri: IMAGE_URI,
      headers: undefined,
    });
    expect(StyleSheet.flatten(getByLabelText('Foto de Restaurante Giozakaya').props.style)).toEqual(
      expect.objectContaining({ height: '100%', width: '100%' })
    );
  });

  test('forwards imageHeaders to the photo request', () => {
    const headers = { Authorization: 'Bearer token' };
    const { getByLabelText } = render(
      <MemoryCard
        date={new Date(2026, 4, 8)}
        name="Evento"
        address="Endereço"
        imageUri={IMAGE_URI}
        imageHeaders={headers}
      />
    );

    expect(getByLabelText('Foto de Evento').props.source).toEqual({
      uri: IMAGE_URI,
      headers,
    });
  });

  test('waits to mount the image while the authenticated source is pending', () => {
    const { queryByLabelText, getByTestId, rerender, getByLabelText } = render(
      <MemoryCard
        date={new Date(2026, 4, 8)}
        name="Evento"
        address="Endereço"
        imageUri={IMAGE_URI}
        imageSource={null}
        testID="pending-memory"
      />
    );

    expect(getByTestId('pending-memory-image-frame')).toBeTruthy();
    expect(queryByLabelText('Foto de Evento')).toBeNull();
    expect(StyleSheet.flatten(getByTestId('pending-memory-image-frame').props.style)).toEqual(
      expect.objectContaining({ aspectRatio: 3 / 4 })
    );

    rerender(
      <MemoryCard
        date={new Date(2026, 4, 8)}
        name="Evento"
        address="Endereço"
        imageUri={IMAGE_URI}
        imageSource={{ uri: IMAGE_URI, headers: { Cookie: 'session-token' } }}
        testID="pending-memory"
      />
    );

    expect(getByLabelText('Foto de Evento').props.source).toEqual({
      uri: IMAGE_URI,
      headers: { Cookie: 'session-token' },
    });
  });

  test('truncates name and address to two lines', () => {
    const { getByTestId } = render(
      <MemoryCard
        date={new Date(2026, 4, 8)}
        name="Um nome de evento bem comprido para testar o corte de texto"
        address="Um endereço bem comprido para testar o corte de texto"
        imageUri={IMAGE_URI}
      />
    );

    expect(getByTestId('memory-card-name').props.numberOfLines).toBe(2);
    expect(getByTestId('memory-card-address').props.numberOfLines).toBe(2);
  });

  test('uses a custom testID as prefix for its parts', () => {
    const { getByTestId } = render(
      <MemoryCard
        date={new Date(2026, 4, 8)}
        name="Evento"
        address="Endereço"
        imageUri={IMAGE_URI}
        testID="day-memory"
      />
    );

    expect(getByTestId('day-memory')).toBeTruthy();
    expect(getByTestId('day-memory-date')).toBeTruthy();
  });
});
