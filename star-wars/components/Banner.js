import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';

const bannerSource = require('../assets/star-wars-banner.png');

const Banner = () => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setShouldLoad(true);
      setLoading(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <View style={styles.bannerContainer}>
      {shouldLoad ? (
        <>
          <Image
            source={bannerSource}
            style={styles.banner}
            resizeMode="contain"
            onLoadEnd={() => setLoading(false)}
          />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#fff" />
            </View>
          )}
        </>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    width: '100%',
    height: 120,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  banner: {
    width: '95%',
    height: '95%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#111',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
});

export default Banner;
