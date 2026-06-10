import { cn } from '@/lib/utils';
import { Platform, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const AnimatedView = Animated.createAnimatedComponent(View);

function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  const shimmerTranslateX = useSharedValue(-1);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      shimmerTranslateX.value = withRepeat(
        withTiming(1, {
          duration: 2000,
          easing: Easing.ease,
        }),
        -1,
        false
      );
    }
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerTranslateX.value * 200 }],
    };
  });

  if (Platform.OS === 'web') {
    return (
      <View className={cn('bg-accent rounded-md overflow-hidden relative', className)} {...props}>
        <View className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </View>
    );
  }

  return (
    <View className={cn('bg-accent rounded-md overflow-hidden', className)} {...props}>
      <AnimatedView
        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={shimmerStyle}
      />
    </View>
  );
}

export { Skeleton };
