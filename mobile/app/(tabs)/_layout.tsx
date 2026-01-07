import { Redirect, Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, LayoutChangeEvent, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useState, useEffect } from 'react';

// === КАСТОМНЫЙ ТАБ-БАР ===
function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [layout, setLayout] = useState({ width: 0, height: 0 });

  const translateX = useSharedValue(0);

  // Вычитаем 10 (paddingHorizontal * 2), чтобы капля ходила внутри отступов
  const tabWidth = (layout.width - 10) / state.routes.length;

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withSpring(state.index * tabWidth, {
        damping: 15,
        stiffness: 120,
        mass: 0.8,
      });
    }
  }, [state.index, tabWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: tabWidth,
    };
  });

  const onLayout = (e: LayoutChangeEvent) => {
    setLayout(e.nativeEvent.layout);
  };

  return (
    <View style={[styles.tabBarContainer, { bottom: insets.bottom + 10 }]} onLayout={onLayout}>
      <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,255,255,0.6)' }]} />

      {layout.width > 0 && <Animated.View style={[styles.slidingIndicator, animatedStyle]} />}

      <View style={styles.tabsRow}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const color = isFocused ? '#3B82F6' : '#9CA3AF';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              {options.tabBarIcon?.({ focused: isFocused, color, size: 24 })}

              {/* === НАЗВАНИЯ ТАБОВ === */}
              <Text style={{ color, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                {options.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// === ОСНОВНОЙ КОМПОНЕНТ ===
const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href={'/(auth)/sign-in'} />;

  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={23} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Корзина',
          tabBarIcon: ({ color }) => <Ionicons name="bag-handle" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Избранное',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;

// === СТИЛИ ===
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 65,
    borderRadius: 35,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  tabsRow: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  slidingIndicator: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 5,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
