import { render } from '@testing-library/react-native';
import HomeScreen, { CustomText } from '@/app/index';

describe('<HomeScreen/>', () => {
    test('Text renders correctly on HomeScreen', async () => {
        const { getByText } = await render (<HomeScreen />);
    });

    test('CustomText renders correctly', async () => {
        const tree = (await render(<CustomText>Some text</CustomText>)).toJSON();
        expect(tree).toMatchSnapshot();
    });
});
