import React from 'react';
import { View, StyleSheet } from 'react-native';

const Box = ({ children, style, ...props }) => {
  return (
    <View style={[styles.box, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    // Add default styles if needed
  },
});

export default Box;