import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';

const Spaceships = ({ onBack }) => {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shipDetails, setShipDetails] = useState({});
  const [expandedShips, setExpandedShips] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});
  const [detailsError, setDetailsError] = useState({});

  useEffect(() => {
    fetchShips();
  }, []);

  const fetchShips = async () => {
    try {
      const response = await fetch('https://www.swapi.tech/api/starships');
      const data = await response.json();
      setShips(data.results || []);
    } catch (err) {
      setError('Failed to load spaceships');
    } finally {
      setLoading(false);
    }
  };

  const fetchShipDetails = async (item) => {
    const uid = item.uid;
    setExpandedShips((prev) => ({ ...prev, [uid]: true }));
    if (shipDetails[uid] || detailsLoading[uid]) {
      return;
    }

    setDetailsLoading((prev) => ({ ...prev, [uid]: true }));
    try {
      const response = await fetch(item.url);
      const data = await response.json();
      const properties = data.result?.properties || {};
      setShipDetails((prev) => ({ ...prev, [uid]: properties }));
    } catch (err) {
      setDetailsError((prev) => ({ ...prev, [uid]: 'Failed to load spaceship details' }));
    } finally {
      setDetailsLoading((prev) => ({ ...prev, [uid]: false }));
    }
  };

  const toggleShipDetails = (item) => {
    const uid = item.uid;
    const isExpanded = expandedShips[uid];
    if (isExpanded) {
      setExpandedShips((prev) => ({ ...prev, [uid]: false }));
      return;
    }
    fetchShipDetails(item);
  };

  const renderShip = ({ item }) => {
    const isExpanded = expandedShips[item.uid];
    const details = shipDetails[item.uid];
    const loadingDetailsForShip = detailsLoading[item.uid];
    const errorDetails = detailsError[item.uid];

    return (
      <View style={styles.item}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <TouchableOpacity style={styles.showMoreButton} onPress={() => toggleShipDetails(item)}>
          <Text style={styles.showMoreText}>{isExpanded ? 'Hide details' : 'Show more'}</Text>
        </TouchableOpacity>
        {isExpanded && (
          <View style={styles.extraDetails}>
            {loadingDetailsForShip ? (
              <ActivityIndicator size="small" color="#0a7ea4" />
            ) : errorDetails ? (
              <Text style={styles.error}>{errorDetails}</Text>
            ) : details ? (
              <>
                <Text style={styles.detail}>Model: {details.model || 'Unknown'}</Text>
                <Text style={styles.detail}>Manufacturer: {details.manufacturer || 'Unknown'}</Text>
                <Text style={styles.detail}>Cost: {details.cost_in_credits || 'Unknown'}</Text>
                <Text style={styles.detail}>Crew: {details.crew || 'Unknown'}</Text>
                <Text style={styles.detail}>Passengers: {details.passengers || 'Unknown'}</Text>
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
        <Text style={styles.title}>Spaceships</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0a7ea4" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <FlatList
            data={ships}
            keyExtractor={(item) => item.uid}
            renderItem={renderShip}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
});

export default Spaceships;