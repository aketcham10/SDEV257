import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, TextInput, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import Box from './components/Box';
import Planets from './components/Planets';
import Films from './components/Films';
import Spaceships from './components/Spaceships';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [inputText, setInputText] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return unsubscribe;
  }, []);

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
          <View style={styles.mainContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter text..."
                value={inputText}
                onChangeText={setInputText}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  if (inputText.trim()) {
                    setSubmittedText(inputText);
                    setModalVisible(true);
                    setInputText('');
                  }
                }}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
            {!isConnected && (
              <View style={styles.offlineContainer}>
                <Text style={styles.offlineText}>You are currently offline. Some features may not be available.</Text>
              </View>
            )}
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
            
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Submitted Text</Text>
                  <Text style={styles.modalText}>{submittedText}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        );
    }
  };

  return renderScreen();
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#0a7ea4',
    gap: 8,
  },
  textInput: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#0a7ea4',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 20,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#0a7ea4',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  offlineContainer: {
    backgroundColor: '#ffcc00',
    padding: 10,
    alignItems: 'center',
  },
  offlineText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
