import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    TextInput,
    Animated,
    PanResponder,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReturnModalProps {
    visible: boolean;
    onClose: () => void;
    orderId: string | null;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function ReturnModal({ visible, onClose, orderId }: ReturnModalProps) {
    const insets = useSafeAreaInsets();
    const [reason, setReason] = useState('');

    // --- АНИМАЦИЯ ---
    const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    const closeModalAnimated = () => {
        Keyboard.dismiss();
        Animated.parallel([
            Animated.timing(panY, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onClose();
            setReason(''); // Сброс поля при закрытии
        });
    };

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(panY, {
                    toValue: 0,
                    useNativeDriver: true,
                    bounciness: 4,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            panY.setValue(SCREEN_HEIGHT);
        }
    }, [visible]);

    // --- ЖЕСТЫ ---
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 0; // Только движение вниз
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) panY.setValue(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 150 || gestureState.vy > 0.5) {
                    closeModalAnimated();
                } else {
                    Animated.spring(panY, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={visible}
            onRequestClose={closeModalAnimated}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1 justify-end"
            >
                <Animated.View
                    className="absolute top-0 bottom-0 left-0 right-0 bg-black/60"
                    style={{ opacity }}
                >
                    <TouchableOpacity className="flex-1" activeOpacity={1} onPress={closeModalAnimated} />
                </Animated.View>

                <Animated.View
                    className="bg-white w-full rounded-t-[32px] overflow-hidden"
                    style={{
                        maxHeight: '85%',
                        minHeight: '50%',
                        paddingBottom: insets.bottom,
                        transform: [{ translateY: panY }],
                    }}
                >
                    {/* Хедер шторки */}
                    <View {...panResponder.panHandlers} className="bg-white pb-2 w-full z-10 pt-4">
                        <View className="items-center">
                            <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
                        </View>

                        <View className="px-6 mt-4 flex-row items-center justify-between">
                            <View>
                                <Text className="text-black text-2xl font-raleway-bold tracking-tight">
                                    Возврат
                                </Text>
                                <Text className="text-gray-400 font-inter-medium text-xs mt-1">
                                    Заказ №{orderId?.slice(-6).toUpperCase()}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={closeModalAnimated}
                                className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center active:bg-gray-100"
                            >
                                <Ionicons name="close" size={22} color="#374151" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        className="flex-1 px-6 pt-2"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    >
                        {/* Пример контента модалки */}
                        <Text className="text-gray-500 font-inter-medium text-[15px] mb-4 leading-6">
                            Опишите причину возврата товара. Наш менеджер рассмотрит заявку в течение 24 часов.
                        </Text>

                        <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 h-40 mb-6">
                            <TextInput
                                className="flex-1 font-inter-medium text-black text-[15px] p-0"
                                placeholder="Причина возврата..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                textAlignVertical="top"
                                value={reason}
                                onChangeText={setReason}
                            />
                        </View>

                        {/* Кнопка отправки (пример) */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className="w-full bg-black py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-gray-200"
                            onPress={() => {
                                // Здесь логика отправки
                                closeModalAnimated();
                            }}
                        >
                            <Text className="text-white font-inter-bold text-[16px]">Отправить заявку</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}