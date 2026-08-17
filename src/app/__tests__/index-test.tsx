import HomeScreen, { CustomText } from '@/app/index';
import { render } from '@testing-library/react-native';

describe('<HomeScreen/>', () => {
  test('Text renders correctly on HomeScreen', async () => {
    await render(<HomeScreen />);
  });

  test('CustomText renders correctly', async () => {
    const tree = (await render(<CustomText>Some text</CustomText>)).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
