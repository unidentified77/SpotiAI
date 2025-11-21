import { StyleSheet, Text, View } from 'react-native';

export default function Rated() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rated</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

