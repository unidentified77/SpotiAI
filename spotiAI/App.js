import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPlaylists, setShowPlaylists] = useState(false);

  const categories = ['Chill', 'Workout', 'Focus', 'Happy'];

  const playlists = {
    Chill: [
      { id: 1, name: 'Chill Vibes', description: 'Relax and unwind' },
      { id: 2, name: 'Evening Chill', description: 'Smooth evening tunes' },
    ],
    Workout: [
      { id: 3, name: 'Pump It Up', description: 'High energy tracks' },
      { id: 4, name: 'Gym Beats', description: 'Motivating workout music' },
    ],
    Focus: [
      { id: 5, name: 'Deep Focus', description: 'Concentrate and code' },
      { id: 6, name: 'Study Mode', description: 'Stay productive' },
    ],
    Happy: [
      { id: 7, name: 'Happy Hits', description: 'Feel-good songs' },
      { id: 8, name: 'Sunny Vibes', description: 'Cheerful playlist' },
    ],
  };

  const handleGetPlaylist = () => {
    if (!selectedCategory) {
      Alert.alert('Seçim yap!', 'Lütfen bir kategori seçin.');
      return;
    }
    setShowPlaylists(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SpotiAI</Text>

      <Text style={styles.subtitle}>Bir ruh hali seçin:</Text>
      <View style={styles.buttonContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.button,
              selectedCategory === cat && styles.buttonSelected,
            ]}
            onPress={() => {
              setSelectedCategory(cat);
              setShowPlaylists(false); // yeni seçimde önce listeyi gizle
            }}
          >
            <Text style={[styles.buttonText, selectedCategory === cat && { color: '#fff' }]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.getButton} onPress={handleGetPlaylist}>
        <Text style={styles.getButtonText}>Get Playlist</Text>
      </TouchableOpacity>

      {showPlaylists && (
        <ScrollView style={styles.playlistContainer}>
          {playlists[selectedCategory].map((pl) => (
            <View key={pl.id} style={styles.card}>
              <Text style={styles.cardTitle}>{pl.name}</Text>
              <Text style={styles.cardDesc}>{pl.description}</Text>
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => Alert.alert('Play', pl.name)}
              >
                <Text style={styles.playButtonText}>Play</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 50 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1DB954', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 },
  button: { backgroundColor: '#eee', padding: 12, borderRadius: 20, margin: 5 },
  buttonSelected: { backgroundColor: '#1DB954' },
  buttonText: { color: '#000', fontWeight: 'bold' },
  getButton: { backgroundColor: '#1DB954', padding: 15, borderRadius: 30, alignSelf: 'center', marginBottom: 20 },
  getButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  playlistContainer: { marginTop: 10 },
  card: { backgroundColor: '#f7f7f7', padding: 15, borderRadius: 15, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardDesc: { fontSize: 14, color: '#555', marginBottom: 10 },
  playButton: { backgroundColor: '#1DB954', padding: 10, borderRadius: 25, alignItems: 'center' },
  playButtonText: { color: '#fff', fontWeight: 'bold' },
});
