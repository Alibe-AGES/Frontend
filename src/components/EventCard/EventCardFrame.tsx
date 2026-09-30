import { FC, ReactNode } from 'react';
import { View } from 'react-native';

interface EventCardFrameProps {
  image: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  testID: string;
}

// The photo overlaps the top of the green panel; the footer overlaps its bottom edge.
export const EventCardFrame: FC<EventCardFrameProps> = ({ image, children, footer, testID }) => (
  <View
    className="relative w-full"
    testID={testID}
  >
    <View
      className={`mt-28 w-full gap-3 rounded-[2.5rem] bg-lime-soft px-6 pt-24 ${
        footer ? 'pb-12' : 'pb-6'
      }`}
    >
      {children}
    </View>

    {footer ? <View className="-mt-6 px-8">{footer}</View> : null}

    <View className="absolute inset-x-8 top-0 h-48 overflow-hidden rounded-3xl shadow-lg">
      {image}
    </View>
  </View>
);
