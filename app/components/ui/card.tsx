import { Text, TextClassContext } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Platform, View, type ViewProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

function Card({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  const CardComponent = Platform.OS === 'web' ? View : AnimatedView;
  const animationProps = Platform.OS !== 'web' ? { entering: FadeIn.duration(350) } : {};

  return (
    <TextClassContext.Provider value="text-card-foreground">
      <CardComponent
        className={cn(
          'bg-card border-border flex flex-col gap-6 rounded-xl border py-6 shadow-sm shadow-black/5',
          Platform.select({ web: 'animate-scale-in' }),
          className
        )}
        {...animationProps}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function CardHeader({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className={cn('flex flex-col gap-1.5 px-6', className)} {...props} />;
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) {
  return (
    <Text
      role="heading"
      aria-level={3}
      className={cn('font-semibold leading-none', className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) {
  return <Text className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

function CardContent({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className={cn('px-6', className)} {...props} />;
}

function CardFooter({ className, ...props }: ViewProps & React.RefAttributes<View>) {
  return <View className={cn('flex flex-row items-center px-6', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
