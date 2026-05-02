import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Platform, Animated, ScrollView } from 'react-native';
import Banner from './Banner';
const Planets = ({ onBack }) => {
  const [planets, setPlanets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [planetDetails, setPlanetDetails] = useState({});
  const [expandedPlanets, setExpandedPlanets] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});
  const [detailsError, setDetailsError] = useState({});
  const [detailPlanet, setDetailPlanet] = useState(null);
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
    fetchPlanets();
  }, []);

  useEffect(() => {
    if (planets.length > 0) {
      initializeAnimatedValues(planets);
      const animations = planets.map((planet) =>
        Animated.timing(animatedValues.current[planet.uid], {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      );

      Animated.stagger(100, animations).start();
    }
  }, [planets]);

  const handleSwipe = (item) => {
    setDetailPlanet(item);
    fetchPlanetDetails(item);
  };

  const fetchPlanets = async () => {
    try {
      const response = await fetch('https://www.swapi.tech/api/planets');
      const data = await response.json();
      const items = data.results || [];
      initializeAnimatedValues(items);
      setPlanets(items);
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

  const handleTouchEnd = (e, item) => {
    const touchEndX = e.nativeEvent.pageX;
    const distance = touchEndX - touchStartX.current;
    if (distance < -50) {
      handleSwipe(item);
    }
  };

  const formatDetailValue = (key, value) => {
    if (value == null || value === '') {
      return 'Unknown';
    }

    if (key === 'created' || key === 'edited') {
      const date = new Date(value);
      if (!isNaN(date)) {
        return date.toLocaleString();
      }
    }

    if (key === 'diameter') {
      return `${value} km`;
    }

    if (key === 'rotation_period') {
      return `${value} hours`;
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return String(value);
  };

  const renderPlanet = ({ item }) => {
    const isExpanded = expandedPlanets[item.uid];
    const details = planetDetails[item.uid];
    const loadingDetailsForPlanet = detailsLoading[item.uid];
    const errorDetails = detailsError[item.uid];

    const animatedStyle = {
      opacity: animatedValues.current[item.uid] || new Animated.Value(0),
    };

    return (
      <Animated.View
        style={[styles.planetItem, animatedStyle]}
        onTouchStart={handleTouchStart}
        onTouchEnd={(e) => handleTouchEnd(e, item)}
      >
        <Text style={styles.planetName}>{item.name}</Text>
        <Text style={styles.swipeHint}>Swipe left for details</Text>
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
      </Animated.View>
    );
  };


  if (detailPlanet) {
    const uid = detailPlanet.uid;
    const details = planetDetails[uid];
    const loadingDetailsForPlanet = detailsLoading[uid];
    const errorDetails = detailsError[uid];

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setDetailPlanet(null)} style={styles.backButton}>
          <Text style={styles.backText}>← Back to planets</Text>
        </TouchableOpacity>
        <Banner />
        <ScrollView style={styles.content} contentContainerStyle={styles.detailContent}>
          <Text style={styles.title}>{detailPlanet.name}</Text>
          {loadingDetailsForPlanet ? (
            <ActivityIndicator size="large" color="#0a7ea4" />
          ) : errorDetails ? (
            <Text style={styles.error}>{errorDetails}</Text>
          ) : details ? (
            <View style={styles.detailList}>
              {Object.entries(details).map(([key, value]) => (
                <View key={key} style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{key.replace(/_/g, ' ').replace(/\b\w/g, (chr) => chr.toUpperCase())}</Text>
                  <Text style={styles.detailValue}>{formatDetailValue(key, value)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.error}>Planet details not available.</Text>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Banner />
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
  detailContent: {
    paddingBottom: 20,
  },
  detailList: {
    marginTop: 16,
  },
  detailItem: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#f4f8fb',
    borderRadius: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a7ea4',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  swipeHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 10,
  },
});

export default Planets;