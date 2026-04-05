import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useState } from 'react';
import Box from './components/Box';
import Planets from './components/Planets';
import Films from './components/Films';
import Spaceships from './components/Spaceships';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'planets':
        return <Planets onBack={() => setCurrentScreen('home')} />;
      case 'films':
        return <Films onBack={() => setCurrentScreen('home')} />;
      case 'spaceships':
        return <Spaceships onBack={() => setCurrentScreen('home')} />;
      default:
        return (
          <ScrollView style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Star Wars</Text>
            </View>
            
            <TouchableOpacity style={styles.section} onPress={() => setCurrentScreen('planets')}>
              <Text style={styles.sectionTitle}>Planets</Text>
              <Text style={styles.sectionSubtitle}>Explore planets in the Star Wars universe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.section} onPress={() => setCurrentScreen('films')}>
              <Text style={styles.sectionTitle}>Films</Text>
              <Text style={styles.sectionSubtitle}>Discover films in the Star Wars saga</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.section} onPress={() => setCurrentScreen('spaceships')}>
              <Text style={styles.sectionTitle}>Spaceships</Text>
              <Text style={styles.sectionSubtitle}>Learn about spaceships in Star Wars</Text>
            </TouchableOpacity>
            
            <StatusBar style="auto" />
          </ScrollView>
        );
    }
  };

  return renderScreen();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    backgroundColor: '#0a7ea4',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    padding: 20,
    margin: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
  },
});
