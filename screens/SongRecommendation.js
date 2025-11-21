import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Linking,
  Alert
} from 'react-native';
import { fetchSongRecommendations } from '../services/spotifyService';

export default function SongRecommendation({ route, navigation }) {
  const { genre } = route.params || { genre: 'Unknown' };
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, [genre]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const recommendations = await fetchSongRecommendations(genre, 20);
      setSongs(recommendations);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Şarkılar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const openSpotify = (url) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Hata', 'Spotify açılamadı');
    });
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{genre}</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Şarkı Önerileri</Text>
        <Text style={styles.subtitle}>{genre} türüne göre öneriler</Text>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1DB954" />
            <Text style={styles.loadingText}>Şarkılar yükleniyor...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadRecommendations}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && songs.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Bu tür için şarkı bulunamadı.</Text>
          </View>
        )}

        {!loading && !error && songs.length > 0 && (
          <View style={styles.songsList}>
            {songs.map((song, index) => (
              <TouchableOpacity
                key={song.id}
                style={styles.songCard}
                onPress={() => openSpotify(song.externalUrl)}
                activeOpacity={0.7}
              >
                {song.albumImage && (
                  <Image 
                    source={{ uri: song.albumImage }} 
                    style={styles.albumImage}
                  />
                )}
                <View style={styles.songInfo}>
                  <Text style={styles.songName} numberOfLines={1}>
                    {song.name}
                  </Text>
                  <Text style={styles.songArtist} numberOfLines={1}>
                    {song.artist}
                  </Text>
                  <Text style={styles.songAlbum} numberOfLines={1}>
                    {song.album}
                  </Text>
                  <View style={styles.songMeta}>
                    <Text style={styles.songDuration}>
                      {formatDuration(song.duration)}
                    </Text>
                    <Text style={styles.songPopularity}>
                      ⭐ {song.popularity}
                    </Text>
                  </View>
                </View>
                <View style={styles.playButton}>
                  <Text style={styles.playButtonText}>▶</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b3b3b3',
    marginBottom: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#b3b3b3',
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyContainer: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
  },
  songsList: {
    marginTop: 10,
  },
  songCard: {
    flexDirection: 'row',
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  albumImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  songInfo: {
    flex: 1,
    marginRight: 10,
  },
  songName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#b3b3b3',
    marginBottom: 2,
  },
  songAlbum: {
    fontSize: 12,
    color: '#808080',
    marginBottom: 6,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  songDuration: {
    fontSize: 12,
    color: '#808080',
  },
  songPopularity: {
    fontSize: 12,
    color: '#1DB954',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 2,
  },
});

