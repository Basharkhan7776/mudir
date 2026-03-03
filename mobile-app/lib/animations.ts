import {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  LinearTransition,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  ZoomIn,
  ZoomOut,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

/**
 * Shared animation constants for consistent timing and behavior
 * Using Apple's animation principles: smooth, fluid, and responsive
 */
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 350,
  slow: 600,
};

// Apple-like spring configuration: smooth with minimal bounce
export const SPRING_CONFIG = {
  damping: 30,
  stiffness: 200,
  mass: 0.5,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 2,
};

// Gentle spring for subtle animations
export const GENTLE_SPRING_CONFIG = {
  damping: 35,
  stiffness: 150,
  mass: 0.6,
  overshootClamping: true,
};

export const TIMING_CONFIG = {
  duration: ANIMATION_DURATION.normal,
};

/**
 * Page transition animations
 */
export const PAGE_TRANSITIONS = {
  // Fade transitions
  fadeIn: FadeIn.duration(ANIMATION_DURATION.normal),
  fadeOut: FadeOut.duration(ANIMATION_DURATION.normal),

  // Slide from right (default for forward navigation)
  slideInRight: SlideInRight.duration(ANIMATION_DURATION.normal),
  slideOutLeft: SlideOutLeft.duration(ANIMATION_DURATION.normal),

  // Slide from left (for back navigation)
  slideInLeft: SlideInLeft.duration(ANIMATION_DURATION.normal),
  slideOutRight: SlideOutRight.duration(ANIMATION_DURATION.normal),

  // Zoom (for modal-like transitions)
  zoomIn: ZoomIn.duration(ANIMATION_DURATION.normal),
  zoomOut: ZoomOut.duration(ANIMATION_DURATION.normal),
};

/**
 * Card/List item entrance animations
 */
export const ENTRANCE_ANIMATIONS = {
  fadeInUp: FadeInUp.duration(ANIMATION_DURATION.normal).damping(30),
  fadeInDown: FadeInDown.duration(ANIMATION_DURATION.normal).damping(30),
  fadeInLeft: FadeInLeft.duration(ANIMATION_DURATION.normal).damping(30),
  fadeInRight: FadeInRight.duration(ANIMATION_DURATION.normal).damping(30),
};

/**
 * Exit animations
 */
export const EXIT_ANIMATIONS = {
  fadeOutUp: FadeOutUp.duration(ANIMATION_DURATION.fast),
  fadeOutDown: FadeOutDown.duration(ANIMATION_DURATION.fast),
  fadeOut: FadeOut.duration(ANIMATION_DURATION.fast),
};

/**
 * Layout transition for reordering/resizing
 */
export const LAYOUT_TRANSITION = LinearTransition.duration(ANIMATION_DURATION.normal);

/**
 * Stagger delay calculator for list items
 * @param index - Index of the item in the list
 * @param delayMs - Delay between each item in milliseconds
 */
export function getStaggerDelay(index: number, delayMs: number = 50): number {
  return index * delayMs;
}

/**
 * Create a staggered entrance animation for list items
 * @param index - Index of the item
 * @param AnimationClass - Animation class to use (e.g., FadeInUp, FadeInDown)
 */
export function createStaggeredAnimation(
  index: number,
  AnimationClass: any = null
) {
  const baseAnimation = AnimationClass
    ? AnimationClass.duration(ANIMATION_DURATION.normal).damping(30)
    : ENTRANCE_ANIMATIONS.fadeInUp;
  return baseAnimation.delay(getStaggerDelay(index));
}

/**
 * Animated value helpers
 */
export const animatedValue = {
  spring: (toValue: number, config = SPRING_CONFIG) => withSpring(toValue, config),
  timing: (toValue: number, config = TIMING_CONFIG) => withTiming(toValue, config),
};

/**
 * Press animation scale values (Apple-style subtle feedback)
 */
export const PRESS_SCALE = {
  default: 0.96,
  subtle: 0.98,
  card: 0.97,
  button: 0.94,
};

/**
 * Easing curves similar to Apple's animations
 */
export const EASING = {
  // Standard iOS easing curve
  ios: {
    duration: ANIMATION_DURATION.normal,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
  },
  // Emphasized easing for important transitions
  emphasized: {
    duration: ANIMATION_DURATION.slow,
    easing: 'cubic-bezier(0.2, 0.0, 0.0, 1.0)',
  },
};
