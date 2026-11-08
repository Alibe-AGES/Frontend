import { fireEvent, render } from '@testing-library/react-native';
import { useState } from 'react';

import type {
  PhotoPickerStrategy,
  UsePhotoPickerHook,
} from '@/components/PhotoPicker/PhotoPicker.types';
import { NewMemoryCard } from './index';
import type { NewMemoryCardProps } from './NewMemoryCard.types';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockDefaultController = jest.fn();
jest.mock('@/components/PhotoPicker/controllers/useDefaultPhotoPickerController', () => ({
  useDefaultPhotoPickerController: (params: unknown) => {
    mockDefaultController(params);
    return { photoUri: null, isLoading: false, pickImage: jest.fn() };
  },
}));

const EVENTS = [
  { label: 'Jantar de sexta', value: 'dinner' },
  { label: 'Churrasco', value: 'barbecue' },
];

function createController(overrides?: Partial<PhotoPickerStrategy>): UsePhotoPickerHook {
  return () => ({ photoUri: null, isLoading: false, pickImage: jest.fn(), ...overrides });
}

function ControlledCard(props: Partial<NewMemoryCardProps>) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  return (
    <NewMemoryCard
      events={EVENTS}
      selectedEventId={selectedEventId}
      onSelectEvent={setSelectedEventId}
      usePhotoController={createController()}
      {...props}
    />
  );
}

describe('<NewMemoryCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('blocks the event dropdown while the events are loading', async () => {
    const { getByTestId, getByText } = await Promise.resolve(
      render(<ControlledCard isLoadingEvents />)
    );

    expect(getByText('Carregando eventos...')).toBeTruthy();
    expect(getByTestId('new-memory-card-event')).toBeDisabled();
  });

  test('shows the title, the empty photo prompt and the event placeholder', async () => {
    const { getByText, queryByTestId } = await Promise.resolve(render(<ControlledCard />));

    expect(getByText('Selecione o evento e a imagem')).toBeTruthy();
    expect(getByText('Adicione uma imagem do evento.')).toBeTruthy();
    expect(getByText('Selecionar evento')).toBeTruthy();
    expect(queryByTestId('new-memory-card-photo-image')).toBeNull();
  });

  test('opens the photo picker when the photo area is pressed', async () => {
    const pickImage = jest.fn();
    const { getByRole } = await Promise.resolve(
      render(<ControlledCard usePhotoController={createController({ pickImage })} />)
    );

    await fireEvent.press(getByRole('button', { name: 'Adicionar imagem do evento' }));

    expect(pickImage).toHaveBeenCalledTimes(1);
  });

  test('shows the picked photo and lets the user swap it', async () => {
    const { getByRole, getByTestId, queryByText } = await Promise.resolve(
      render(
        <ControlledCard usePhotoController={createController({ photoUri: 'file:///memory.jpg' })} />
      )
    );

    expect(getByTestId('new-memory-card-photo-image')).toBeTruthy();
    expect(queryByText('Adicione uma imagem do evento.')).toBeNull();
    expect(getByRole('button', { name: 'Trocar imagem do evento' })).toBeTruthy();
  });

  test('blocks the photo area while the photo is loading', async () => {
    const pickImage = jest.fn();
    const { getByTestId } = await Promise.resolve(
      render(
        <ControlledCard usePhotoController={createController({ isLoading: true, pickImage })} />
      )
    );

    expect(getByTestId('new-memory-card-photo-loading')).toBeTruthy();
    expect(getByTestId('new-memory-card-photo')).toBeDisabled();

    await fireEvent.press(getByTestId('new-memory-card-photo'));

    expect(pickImage).not.toHaveBeenCalled();
  });

  test('forwards the picked photo through onPhotoSelected', async () => {
    const onPhotoSelected = jest.fn();
    const usePhotoController = jest.fn(createController());

    await Promise.resolve(
      render(
        <ControlledCard
          onPhotoSelected={onPhotoSelected}
          usePhotoController={usePhotoController}
        />
      )
    );

    expect(usePhotoController).toHaveBeenCalledWith({ onUploadSuccess: onPhotoSelected });
  });

  test('selects an event from the dropdown', async () => {
    const onSelectEvent = jest.fn();
    const { getByTestId, getByText } = await Promise.resolve(
      render(
        <NewMemoryCard
          events={EVENTS}
          selectedEventId={null}
          onSelectEvent={onSelectEvent}
          usePhotoController={createController()}
        />
      )
    );

    await fireEvent.press(getByTestId('new-memory-card-event'));
    await fireEvent.press(getByText('Churrasco'));

    expect(onSelectEvent).toHaveBeenCalledWith('barbecue');
  });

  test('shows the selected event in place of the placeholder', async () => {
    const { getByTestId, getByText, queryByText } = await Promise.resolve(
      render(<ControlledCard />)
    );

    await fireEvent.press(getByTestId('new-memory-card-event'));
    await fireEvent.press(getByText('Jantar de sexta'));

    expect(getByText('Jantar de sexta')).toBeTruthy();
    expect(queryByText('Selecionar evento')).toBeNull();
  });

  test('tells the user when there are no events to pick', async () => {
    const { getByTestId, getByText } = await Promise.resolve(
      render(<ControlledCard events={[]} />)
    );

    await fireEvent.press(getByTestId('new-memory-card-event'));

    expect(getByText('Nenhum evento disponível')).toBeTruthy();
  });

  test('calls onClose from the close button', async () => {
    const onClose = jest.fn();
    const { getByRole } = await Promise.resolve(render(<ControlledCard onClose={onClose} />));

    await fireEvent.press(getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('hides the close button without onClose', async () => {
    const { queryByTestId } = await Promise.resolve(render(<ControlledCard />));

    expect(queryByTestId('new-memory-card-close')).toBeNull();
  });

  test('crops the photo to the card frame by default', async () => {
    await Promise.resolve(
      render(
        <NewMemoryCard
          events={EVENTS}
          selectedEventId={null}
          onSelectEvent={jest.fn()}
        />
      )
    );

    expect(mockDefaultController).toHaveBeenCalledWith(expect.objectContaining({ aspect: [4, 5] }));
  });
});
