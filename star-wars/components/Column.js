import React from 'react';
import { View, StyleSheet } from 'react-native';

const Column = ({ children, style, ...props }) => {
  return (
    <View style={[styles.column, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  column: {
    flexDirection: 'column',
  },
});

export default Column;