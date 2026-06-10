import React from 'react';
import { View, FlatListProps, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';

interface CollapsingHeaderFlatListProps<T> extends Omit<FlatListProps<T>, 'ListHeaderComponent'> {
  title: string;
  subtitle?: string;
  listHeaderComponent?: React.ReactElement | null;
}

const HEADER_MAX_HEIGHT = 120;
const HEADER_MIN_HEIGHT = 0;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const AnimatedFlatList = Animated.FlatList as any;

export function CollapsingHeaderFlatList<T>({
  title,
  subtitle,
  listHeaderComponent,
  ...flatListProps
}: CollapsingHeaderFlatListProps<T>) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE / 2],
      [1, 0],
      Extrapolate.CLAMP
    );

    return {
      height,
      opacity,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [1, 0.7],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ scale }],
    };
  });

  const headerComponent = () => (
    <>
      <Animated.View
        style={[headerAnimatedStyle]}
        className="items-center justify-center overflow-hidden"
      >
        <Animated.View style={titleAnimatedStyle} className="items-center">
          <Text className="text-3xl font-bold text-primary">{title}</Text>
          {subtitle && (
            <Text className="text-muted-foreground">{subtitle}</Text>
          )}
        </Animated.View>
      </Animated.View>
      {listHeaderComponent}
    </>
  );

  return (
    <AnimatedFlatList
      {...flatListProps}
      ListHeaderComponent={headerComponent}
      onScroll={scrollHandler}
      scrollEventThrottle={16}
    />
  );
}
