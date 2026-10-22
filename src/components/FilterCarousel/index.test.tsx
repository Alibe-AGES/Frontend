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
    const { getByLabelText } = await render(
      <FilterCarousel
        tags={tags}
        selectedTagIds={['a']}
        onToggleTag={onToggleTag}
        onOpenFilters={onOpenFilters}
      />
    );

    await fireEvent.press(getByLabelText('Tag B'));
    await fireEvent.press(getByLabelText('Abrir filtros'));

    expect(onToggleTag).toHaveBeenCalledWith('b');
    expect(onOpenFilters).toHaveBeenCalled();
    expect(getByLabelText('Tag A')).toBeSelected();
  });
});
