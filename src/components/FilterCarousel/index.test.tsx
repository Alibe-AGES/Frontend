import { fireEvent, render } from '@testing-library/react-native';
import { FilterCarousel } from './index';

const tags = [
  { id: 'a', label: 'Tag A' },
  { id: 'b', label: 'Tag B' },
];

describe('<FilterCarousel />', () => {
  test('toggles tags and opens filters', async () => {
    const onToggleTag = jest.fn();
    const onOpenFilters = jest.fn();
    const { getByLabelText } = await Promise.resolve(
      render(
        <FilterCarousel
          tags={tags}
          selectedTagIds={['a']}
          onToggleTag={onToggleTag}
          onOpenFilters={onOpenFilters}
        />
      )
    );

    await fireEvent.press(getByLabelText('Tag B'));
    await Promise.resolve();
    await fireEvent.press(getByLabelText('Abrir filtros'));
    await Promise.resolve();

    expect(onToggleTag).toHaveBeenCalledWith('b');
    expect(onOpenFilters).toHaveBeenCalled();
    expect(getByLabelText('Tag A')).toBeSelected();
  });

  test('moves selected tags to the start of the carousel', async () => {
    const { getAllByRole } = await Promise.resolve(
      render(
        <FilterCarousel
          tags={tags}
          selectedTagIds={['b']}
          onToggleTag={jest.fn()}
          onOpenFilters={jest.fn()}
        />
      )
    );

    const labels = getAllByRole('button').map((button) => String(button.props.accessibilityLabel));
    expect(labels).toEqual(['Abrir filtros', 'Tag B', 'Tag A']);
  });
});
