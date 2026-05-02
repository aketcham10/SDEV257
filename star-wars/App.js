import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform, TextInput, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import Planets from './components/Planets';
import Films from './components/Films';
import Spaceships from './components/Spaceships';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [planetsData, setPlanetsData] = useState([]);
  const [filmsData, setFilmsData] = useState([]);
  const [shipsData, setShipsData] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const fetchAllPages = async (baseUrl) => {
    let page = 1;
    let allItems = [];
    const seenIds = new Set();

    while (true) {
      const response = await fetch(`${baseUrl}?page=${page}`);
      const data = await response.json();
      const results = data.results || data.result || [];
      if (!results.length) {
        break;
      }

      const newItems = results.filter((item) => !seenIds.has(item.uid));
      if (!newItems.length) {
        break;
      }

      newItems.forEach((item) => seenIds.add(item.uid));
      allItems = allItems.concat(newItems);

      const total = data.total_records || allItems.length;
      if (allItems.length >= total) {
        break;
      }

      page += 1;
      if (page > 20) {
        break;
      }
    }

    return allItems;
  };

  const fetchAllData = async () => {
    try {
      setDataError(null);
      setDataLoading(true);

      const [planets, filmsResponse, ships] = await Promise.all([
        fetchAllPages('https://www.swapi.tech/api/planets'),
        fetch('https://www.swapi.tech/api/films'),
        fetchAllPages('https://www.swapi.tech/api/starships'),
      ]);

      const filmsJson = await filmsResponse.json();
      const films = filmsJson.result || [];

      setPlanetsData(planets);
      setFilmsData(films);
      setShipsData(ships);
    } catch (err) {
      setDataError('Unable to load Star Wars data.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    const query = inputText.trim();
    if (!query || dataLoading) {
      return;
    }

    const lowerQuery = query.toLowerCase();
    const scoredResults = [
      ...planetsData.map((item) => ({
        id: `planet-${item.uid}`,
        type: 'Planet',
        title: item.name,
        subtitle: 'Planet',
      })),
      ...filmsData.map((item) => ({
        id: `film-${item.uid}`,
        type: 'Film',
        title: item.properties?.title || 'Untitled film',
        subtitle: `Episode ${item.properties?.episode_id || 'Unknown'}`,
        openingCrawl: item.properties?.opening_crawl,
      })),
      ...shipsData.map((item) => ({
        id: `starship-${item.uid}`,
        type: 'Spaceship',
        title: item.name,
        subtitle: item.model ? `Model: ${item.model}` : 'Spaceship',
      })),
    ].map((item) => {
      const title = item.title.toLowerCase();
      const subtitle = (item.subtitle || '').toLowerCase();
      const openingCrawl = (item.openingCrawl || '').toLowerCase();
      let score = 0;

      if (title === lowerQuery || subtitle === lowerQuery) {
        score = 4;
      } else if (title.startsWith(lowerQuery) || subtitle.startsWith(lowerQuery)) {
        score = 3;
      } else if (title.includes(lowerQuery) || subtitle.includes(lowerQuery)) {
        score = 2;
      } else if (openingCrawl.includes(lowerQuery)) {
        score = 1;
      }

      return { ...item, score };
    }).filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

    setSearchResults(scoredResults);
    setSearchQuery(query);
    setCurrentScreen('search');
    setInputText('');
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    fetchAllData();
  }, []);

  const renderSearchResult = ({ item }) => (
    <View style={styles.resultCard}>
      <Text style={styles.resultType}>{item.type}</Text>
      <Text style={styles.resultTitle}>{item.title}</Text>
      {item.subtitle ? <Text style={styles.resultSubtitle}>{item.subtitle}</Text> : null}
    </View>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'planets':
        return <Planets onBack={() => setCurrentScreen('home')} />;
      case 'films':
        return <Films onBack={() => setCurrentScreen('home')} />;
      case 'spaceships':
        return <Spaceships onBack={() => setCurrentScreen('home')} />;
      case 'search':
        return (
          <View style={styles.mainContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Search Star Wars..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                placeholderTextColor="#999"
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSearchSubmit}
              >
                <Text style={styles.submitButtonText}>Search</Text>
              </TouchableOpacity>
            </View>
            {!isConnected && (
              <View style={styles.offlineContainer}>
                <Text style={styles.offlineText}>You are currently offline. Some features may not be available.</Text>
              </View>
            )}
            <View style={styles.searchHeader}>
              <TouchableOpacity style={styles.backButtonSmall} onPress={() => setCurrentScreen('home')}>
                <Text style={styles.backText}>← Home</Text>
              </TouchableOpacity>
              <Text style={styles.searchTitle}>Search results for "{searchQuery}"</Text>
            </View>
            <View style={styles.searchResultsContainer}>
              {dataLoading ? (
                <Text style={styles.loadingText}>Loading Star Wars data...</Text>
              ) : dataError ? (
                <Text style={styles.error}>{dataError}</Text>
              ) : searchResults.length === 0 ? (
                <Text style={styles.noResults}>No results found for "{searchQuery}".</Text>
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSearchResult}
                  contentContainerStyle={styles.resultsList}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </View>
        );
      default:
        return (
          <View style={styles.mainContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Search Star Wars..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                placeholderTextColor="#999"
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSearchSubmit}
              >
                <Text style={styles.submitButtonText}>Search</Text>
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
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: '#eef6fb',
  },
  backButtonSmall: {
    marginBottom: 10,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  searchResultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: '#f4f8fb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultType: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0a7ea4',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a7ea4',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 6,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  noResults: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
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
