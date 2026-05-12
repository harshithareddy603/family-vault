import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native'
import React, { useEffect, useState } from "react";
import { ProgressBar } from 'react-native-paper';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export const SplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate a loading bar animation
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 1) {
          clearInterval(timer);
          return 1;
        }
        const diff = Math.random() * 0.2;
        return Math.min(oldProgress + diff, 0.9); // Cap at 90% until actually loaded
      });
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <View style={styles.logoContainer}>
          <Feather name="file-text" size={80} color="#fff" />
          <View style={styles.cloudIcon}>
            <MaterialCommunityIcons name="cloud" size={40} color="#fff" />
          </View>
        </View>
        
        <Text style={styles.title}>Smart Docs</Text>
        
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={progress} 
            color="#FFFFFF" 
            style={styles.progressBar}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Doc Base</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#5b45ff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  cloudIcon: {
    position: 'absolute',
    bottom: -8,
    left: -8,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  footer: {
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1,
  },
});
