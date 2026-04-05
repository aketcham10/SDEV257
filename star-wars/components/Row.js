import React from 'react';
import { View, StyleSheet } from 'react-native';

const Row = ({ children, style, ...props }) => {
    return (
      <View style={[styles.row, style]} {...props}>
        {children}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
    },
  });
  
  export default Row;