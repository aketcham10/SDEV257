import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Platform, Modal, Animated } from 'react-native';
import Banner from './Banner';

const Films = ({ onBack }) => {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filmDetails, setFilmDetails] = useState({});
  const [expandedFilms, setExpandedFilms] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});
  const [detailsError, setDetailsError] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const touchStartX = useRef(0);
  const animatedValues = useRef({});

  const initializeAnimatedValues = (items) => {
    items.forEach((item) => {
      if (!animatedValues.current[item.uid]) {
        animatedValues.current[item.uid] = new Animated.Value(0);
      }
    });
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  useEffect(() => {
    if (films.length > 0) {
      initializeAnimatedValues(films);
      const animations = films.map((film) =>
        Animated.timing(animatedValues.current[film.uid], {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      );

      Animated.stagger(100, animations).start();
    }
  }, [films]);

  const handleSwipe = (title) => {
    setSelectedTitle(title);
    setModalVisible(true);
  };

  const fetchFilms = async () => {
    try {
      const response = await fetch('https://www.swapi.tech/api/films');
      const data = await response.json();
      const items = data.result || [];
      initializeAnimatedValues(items);
      setFilms(items);
    } catch (err) {
      setError('Failed to load films');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilmDetails = async (item) => {
    const uid = item.uid;
    setExpandedFilms((prev) => ({ ...prev, [uid]: true }));
    if (filmDetails[uid] || detailsLoading[uid]) {
      return;
    }

    setDetailsLoading((prev) => ({ ...prev, [uid]: true }));
    try {
      const url = item.url || `https://www.swapi.tech/api/films/${uid}`;
      const response = await fetch(url);
      const data = await response.json();
      const properties = data.result?.properties || {};
      setFilmDetails((prev) => ({ ...prev, [uid]: properties }));
    } catch (err) {
      setDetailsError((prev) => ({ ...prev, [uid]: 'Failed to load film details' }));
    } finally {
      setDetailsLoading((prev) => ({ ...prev, [uid]: false }));
    }
  };

  const toggleFilmDetails = (item) => {
    const uid = item.uid;
    const isExpanded = expandedFilms[uid];
    if (isExpanded) {
      setExpandedFilms((prev) => ({ ...prev, [uid]: false }));
      return;
    }
    fetchFilmDetails(item);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.nativeEvent.pageX;
  };

  const handleTouchEnd = (e, title) => {
    const touchEndX = e.nativeEvent.pageX;
    const distance = Math.abs(touchEndX - touchStartX.current);
    if (distance > 50) {
      handleSwipe(title);
    }
  };

  const renderFilm = ({ item }) => {
    const isExpanded = expandedFilms[item.uid];
    const details = filmDetails[item.uid];
    const loadingDetailsForFilm = detailsLoading[item.uid];
    const errorDetails = detailsError[item.uid];
    const title = item.properties?.title || item.name || 'Unknown film';

    const animatedStyle = {
      opacity: animatedValues.current[item.uid] || new Animated.Value(0),
    };

    return (
      <Animated.View
        style={[styles.item, animatedStyle]}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEnd(e, title)}
      >
        <Text style={styles.itemTitle}>{title}</Text>
        <TouchableOpacity style={styles.showMoreButton} onPress={() => toggleFilmDetails(item)}>
          <Text style={styles.showMoreText}>{isExpanded ? 'Hide details' : 'Show more'}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.extraDetails}>
            {loadingDetailsForFilm ? (
              <ActivityIndicator size="small" color="#0a7ea4" />
            ) : errorDetails ? (
              <Text style={styles.error}>{errorDetails}</Text>
            ) : details ? (
              <>
                <Text style={styles.detail}>Director: {details.director || 'Unknown'}</Text>
                <Text style={styles.detail}>Producer: {details.producer || 'Unknown'}</Text>
                <Text style={styles.detail}>Release Date: {details.release_date || 'Unknown'}</Text>
                <Text style={styles.detail}>Opening Crawl:</Text>
                <Text style={styles.detail}>{details.opening_crawl ? details.opening_crawl.trim() : 'Unknown'}</Text>
              </>
            ) : null}
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Banner />
      <View style={styles.content}>
        <Text style={styles.title}>Films</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0a7ea4" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <FlatList
            data={films}
            keyExtractor={(item) => item.uid}
            renderItem={renderFilm}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{selectedTitle}</Text>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    backgroundColor: '#0a7ea4',
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  item: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  showMoreButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 6,
  },
  showMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  extraDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d0d0d0',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Films;