import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import wordsFile from './assets/words.json';

const inlineWords = [
  { en: 'hello', tr: 'merhaba' },
  { en: 'yes', tr: 'evet' },
  { en: 'no', tr: 'hayır' },
  { en: 'please', tr: 'lütfen' },
  { en: 'thank you', tr: 'teşekkür ederim' },
  { en: 'sorry', tr: 'özür dilerim' },
  { en: 'good', tr: 'iyi' },
  { en: 'bad', tr: 'kötü' },
  { en: 'morning', tr: 'sabah' },
  { en: 'night', tr: 'gece' },
  { en: 'water', tr: 'su' },
  { en: 'food', tr: 'yemek' },
  { en: 'friend', tr: 'arkadaş' },
  { en: 'family', tr: 'aile' },
  { en: 'love', tr: 'sevgi' },
  { en: 'house', tr: 'ev' },
  { en: 'car', tr: 'araba' },
  { en: 'book', tr: 'kitap' },
  { en: 'school', tr: 'okul' },
  { en: 'work', tr: 'iş' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const { width } = useWindowDimensions();
  const SWIPE_THRESHOLD = 90; // px similar to web app

  const [words, setWords] = useState(() => {
    // use words from file if valid, else inline fallback
    if (Array.isArray(wordsFile) && wordsFile.length) return shuffle(wordsFile);
    return shuffle(inlineWords);
  });
  const [index, setIndex] = useState(0);

  // Animated values
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = translateX.interpolate({
    inputRange: [-300, 0, 300],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });
  const opacity = translateX.interpolate({
    inputRange: [-240, 0, 240],
    outputRange: [0.25, 1, 0.25],
    extrapolate: 'clamp',
  });
  const popIn = useRef(new Animated.Value(0)).current; // for entry animation

  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const currentWord = useMemo(() => {
    if (!words.length) return { en: '', tr: '' };
    return words[index % words.length];
  }, [words, index]);

  const animatePopIn = () => {
    popIn.setValue(0);
    Animated.timing(popIn, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: undefined,
    }).start();
  };

  useEffect(() => {
    animatePopIn();
  }, [index]);

  const resetCard = () => {
    Animated.timing(translateX, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const nextWord = () => {
    setIndex((i) => (i + 1) % words.length);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3,
      onPanResponderGrant: (_, gesture) => {
        setIsDragging(true);
        startXRef.current = gesture.x0;
      },
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        setIsDragging(false);
        const dx = gesture.dx;
        if (Math.abs(dx) > SWIPE_THRESHOLD) {
          const toX = dx > 0 ? width : -width;
          Animated.timing(translateX, {
            toValue: toX,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            nextWord();
          });
        } else {
          resetCard();
        }
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        resetCard();
      },
    })
  ).current;

  const handlePress = () => {
    // advance only if not dragging and card hasn't moved significantly
    translateX.stopAnimation((value) => {
      if (!isDragging && Math.abs(value) < 5) {
        nextWord();
      }
    });
  };

  const scale = popIn.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          <Pressable onPress={handlePress} style={{ flex: 1 }}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.card,
                {
                  transform: [
                    { translateX },
                    { rotate },
                    { scale },
                  ],
                  opacity,
                },
              ]}
            >
              <Text style={styles.wordEn}>{currentWord.en}</Text>
              <Text style={styles.wordTr}>{currentWord.tr}</Text>
              <Text style={styles.hint}>Swipe left/right or tap to advance</Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f172a', // slate-900
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: '92%',
    maxWidth: 420,
    height: '62%',
    maxHeight: 480,
    minHeight: 340,
  },
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordEn: {
    color: '#e5e7eb', // gray-200
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  wordTr: {
    marginTop: 14,
    color: '#60a5fa', // blue-400
    fontSize: 20,
  },
  hint: {
    marginTop: 16,
    color: '#9ca3af', // gray-400
    fontSize: 14,
    textAlign: 'center',
  },
});
