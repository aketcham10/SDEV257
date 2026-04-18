import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Platform, Modal } from 'react-native';
const Planets = ({ onBack }) => {
  const [planets, setPlanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planetDetails, setPlanetDetails] = useState({});
  const [expandedPlanets, setExpandedPlanets] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});
  const [detailsError, setDetailsError] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const touchStartX = useRef(0);

  useEffect(() => {
    fetchPlanets();
  }, []);

  const handleSwipe = (title) => {
    setSelectedTitle(title);
    setModalVisible(true);
  };

  const fetchPlanets = async () => {
    try {
      const response = await fetch('https://www.swapi.tech/api/planets');
      const data = await response.json();
      setPlanets(data.results || []);
    } catch (err) {
      setError('Failed to load planets');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanetDetails = async (item) => {
    const uid = item.uid;
    setExpandedPlanets((prev) => ({ ...prev, [uid]: true }));
    if (planetDetails[uid] || detailsLoading[uid]) {
      return;
    }

    setDetailsLoading((prev) => ({ ...prev, [uid]: true }));
    try {
      const response = await fetch(item.url);
      const data = await response.json();
      const properties = data.result?.properties || {};
      setPlanetDetails((prev) => ({ ...prev, [uid]: properties }));
    } catch (err) {
      setDetailsError((prev) => ({ ...prev, [uid]: 'Failed to load planet details' }));
    } finally {
      setDetailsLoading((prev) => ({ ...prev, [uid]: false }));
    }
  };

  const togglePlanetDetails = (item) => {
    const uid = item.uid;
    const isExpanded = expandedPlanets[uid];
    if (isExpanded) {
      setExpandedPlanets((prev) => ({ ...prev, [uid]: false }));
      return;
    }
    fetchPlanetDetails(item);
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

  const renderPlanet = ({ item }) => {
    const isExpanded = expandedPlanets[item.uid];
    const details = planetDetails[item.uid];
    const loadingDetailsForPlanet = detailsLoading[item.uid];
    const errorDetails = detailsError[item.uid];

    return (
      <View
        style={styles.planetItem}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEnd(e, item.name)}
      >
        <Text style={styles.planetName}>{item.name}</Text>
        <TouchableOpacity style={styles.showMoreButton} onPress={() => togglePlanetDetails(item)}>
          <Text style={styles.showMoreText}>{isExpanded ? 'Hide details' : 'Show more'}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.extraDetails}>
            {loadingDetailsForPlanet ? (
              <ActivityIndicator size="small" color="#0a7ea4" />
            ) : errorDetails ? (
              <Text style={styles.error}>{errorDetails}</Text>
            ) : details ? (
              <>
                <Text style={styles.planetDetail}>Climate: {details.climate || 'Unknown'}</Text>
                <Text style={styles.planetDetail}>Surface Water: {details.surface_water || 'Unknown'}</Text>
                <Text style={styles.planetDetail}>Population: {details.population || 'Unknown'}</Text>
                <Text style={styles.planetDetail}>Gravity: {details.gravity || 'Unknown'}</Text>
                <Text style={styles.planetDetail}>Terrain: {details.terrain || 'Unknown'}</Text>
              </>
            ) : null}
          </View>
        )}
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Planets</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0a7ea4" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <FlatList
            data={planets}
            keyExtractor={(item) => item.uid}
            renderItem={renderPlanet}
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
  planetItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  planetName: {
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
  planetDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
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

export default Planets;