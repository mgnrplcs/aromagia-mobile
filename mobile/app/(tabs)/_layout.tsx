import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, LayoutChangeEvent, Text } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import MaskedView from '@react-native-masked-view/masked-view';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import useCart from '@/hooks/useCart'; // <--- ИМПОРТИРУЕМ ХУК КОРЗИНЫ

// Главный компонент
export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href={'/(auth)/sign-in'} />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Главная',
            tabBarIcon: ({ size, color }) => <Ionicons name="home" size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Корзина',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="bag-handle" size={size + 3} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="wishlist"
          options={{
            title: 'Избранное',
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="heart" size={size + 3} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Профиль',
            tabBarIcon: ({ size, color }) => <Ionicons name="person" size={size} color={color} />,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

// Компонент таб-бара
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  // Достаем количество товаров для бейджика
  const { cartItemCount } = useCart();

  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const scaleX = useSharedValue(1);

  const tabWidth = layout.width > 0 ? Math.floor((layout.width - 11) / state.routes.length) : 0;

  const navigateToTab = (index: number) => {
    const route = state.routes[index];
    const isFocused = state.index === index;
    if (!isFocused) {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    }
  };

  useEffect(() => {
    if (tabWidth > 0 && !isDragging.value) {
      translateX.value = withSpring(state.index * tabWidth, {
        damping: 15,
        stiffness: 120,
        mass: 0.8,
      });
      scaleX.value = withSpring(1);
    }
  }, [state.index, tabWidth]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      let targetX = contextX.value + event.translationX;
      const maxTranslate = (state.routes.length - 1) * tabWidth;
      const velocity = Math.abs(event.velocityX);

      let newScale = 1;

      if (targetX < 0) {
        targetX = targetX / 4;
        newScale = interpolate(targetX, [-50, 0], [0.9, 1], Extrapolation.CLAMP);
      } else if (targetX > maxTranslate) {
        const overDrag = targetX - maxTranslate;
        targetX = maxTranslate + overDrag / 4;
        newScale = interpolate(overDrag, [0, 50], [1, 0.9], Extrapolation.CLAMP);
      } else {
        newScale = interpolate(velocity, [0, 2500], [1, 1.4], Extrapolation.CLAMP);
      }

      translateX.value = targetX;
      scaleX.value = withSpring(newScale, { damping: 12, stiffness: 200 });
    })
    .onEnd(() => {
      const estimatedIndex = Math.round(translateX.value / tabWidth);
      const clampedIndex = Math.min(Math.max(estimatedIndex, 0), state.routes.length - 1);

      translateX.value = withSpring(clampedIndex * tabWidth, {
        damping: 15,
        stiffness: 150,
        mass: 0.8,
      });
      scaleX.value = withSpring(1, { damping: 15, stiffness: 150 });
      runOnJS(navigateToTab)(clampedIndex);
    })
    .onFinalize(() => {
      isDragging.value = false;
      scaleX.value = withSpring(1);
    });

  const animatedStyle = useAnimatedStyle(() => {
    let scaleY = 1;
    if (scaleX.value < 1) {
      scaleY = Math.min(1.15, 1 / scaleX.value);
    } else {
      scaleY = Math.max(0.85, 1 / scaleX.value);
    }
    return {
      transform: [{ translateX: translateX.value }, { scaleX: scaleX.value }, { scaleY: scaleY }],
      width: tabWidth,
    };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    setLayout(e.nativeEvent.layout);
  };

  // Компонент бейджика
  const renderBadge = (route: string) => {
    if (route === 'cart' && cartItemCount > 0) {
      return (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{cartItemCount > 99 ? '99+' : cartItemCount}</Text>
        </View>
      );
    }
    return null;
  };

  // Функция для отрисовки иконок
  const renderIcons = (active: boolean) => (
    <View style={[styles.tabsRow, { paddingHorizontal: 5 }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const color = active ? '#3B82F6' : '#9CA3AF';

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigateToTab(index)}
            style={[styles.tabItem, tabWidth > 0 ? { width: tabWidth } : { flex: 1 }]}
            activeOpacity={1}
          >
            <View>
              {options.tabBarIcon({ size: 24, color })}
              {/* Рендерим бейдж и на активном, и на неактивном слое, чтобы при анимации он не исчезал */}
              {renderBadge(route.name)}
            </View>
            <Text style={{ color, fontSize: 12, fontWeight: '600', letterSpacing: 0.2 }}>
              {options.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (layout.width === 0) {
    return (
      <View
        style={[styles.tabBarContainer, { bottom: insets.bottom + 10, opacity: 0 }]}
        onLayout={onLayout}
      />
    );
  }

  return (
    <View style={[styles.tabBarContainer, { bottom: insets.bottom + 10 }]} onLayout={onLayout}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.8)' }]} />
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={{ width: '100%', height: '100%' }}>
          {/* Слой 1: Серые иконки */}
          <View style={StyleSheet.absoluteFill}>{renderIcons(false)}</View>

          {/* Слой 2: Стеклянная капля */}
          <Animated.View style={[styles.slidingIndicatorContainer, animatedStyle]}>
            <View style={styles.glassPill}>
              <View
                style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.5)' }]}
              />
            </View>
          </Animated.View>

          {/* Слой 3: Маска (Синие иконки) */}
          <MaskedView
            style={[StyleSheet.absoluteFill, { zIndex: 2 }]}
            maskElement={
              <Animated.View
                style={[
                  styles.slidingIndicatorContainer,
                  animatedStyle,
                  {
                    backgroundColor: 'black',
                    elevation: 0,
                    shadowOpacity: 0,
                    borderWidth: 0,
                  },
                ]}
              />
            }
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}>
              {renderIcons(true)}
            </View>
          </MaskedView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 28,
    right: 28,
    height: 65,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tabsRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
    width: '100%',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  slidingIndicatorContainer: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 5,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 1,
  },
  glassPill: {
    flex: 1,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  // Стили для бейджика
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#f87171',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
