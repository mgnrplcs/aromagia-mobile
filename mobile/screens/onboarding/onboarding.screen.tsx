import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const handleGetStarted = () => {
    // Навигация к экрану входа
    router.replace("/screens/login");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/onboarding/onboarding_v0.5.png")}
        style={styles.backgroundImage}
      />

      <LinearGradient 
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      />

      <View style={styles.contentContainer}> 
        <Text style={styles.title}>Добро пожаловать {'\n'} в Аромагию ⋆.𐙚 ̊</Text>
        <Text style={styles.subtitle}>Поможем найти ваш идеальный аромат</Text>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <LinearGradient 
            colors={['#4c669f', '#3b5998', '#192f6a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}            
            style={styles.buttonGradient}>
          <Text style={styles.buttonText}>Начать</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width,
    height,
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 0,
    height: height * 0.6,
  },
  contentContainer:{
    flex:1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal:20, 
  },
  title:{
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 25,
    textAlign: 'center',
    opacity: 0.8,
  },
  button: {
    width: '100%',
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})