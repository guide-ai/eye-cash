import React from 'react';
import { StyleSheet, View } from 'react-native';

import { ImageDetector } from './components/ImageDetector';

export default function App() {
  return (
    <View style={styles.container}>
      <ImageDetector />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
