import React, { useState, useEffect, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { fetchSongRecommendations } from '../services/spotifyService';
import { useAuth } from '../contexts/AuthContext';
import { rateSong, getUserRating, removeRating, getRatingsForSongs } from '../services/songRatingService';

export default function SongRecommendation({ route, navigation }) {
  const { genre } = route.params || { genre: 'Unknown' };
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ratings, setRatings] = useState({}); // { songId: 'like' | 'dislike' | null }

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      // Kullanıcı ID'sini geç - AI destekli öneri için
      const userId = user?.uid || null;
      const recommendations = await fetchSongRecommendations(genre, 20, userId);
      setSongs(recommendations);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('Şarkılar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRatings = useCallback(async () => {
    if (!user || songs.length === 0) {
      setRatings({});
      return;
    }
    
    try {
      // Tüm şarkı ID'lerini topla
      const songIds = songs.map(song => song.id).filter(Boolean);
      
      // Tek bir Firebase isteği ile tüm rating'leri getir
      const ratingsMap = await getRatingsForSongs(user.uid, songIds);
      
      // Tüm map'i güncelle (yeni obje referansı ile React render'ı tetikler)
      setRatings(ratingsMap);
    } catch (err) {
      console.error('Error loading user ratings:', err);
    }
  }, [user, songs]);

  useEffect(() => {
    loadRecommendations();
  }, [genre]);

  useEffect(() => {
    if (user && songs.length > 0) {
      loadUserRatings();
    } else if (user && songs.length === 0) {
      // Şarkı yoksa rating'leri temizle
      setRatings({});
    }
  }, [user, songs, loadUserRatings]);

  // Sayfa focus olduğunda rating'leri yenile (Rated sayfasından geri dönünce)
  useFocusEffect(
    React.useCallback(() => {
      if (!user || songs.length === 0) {
        setRatings({});
        return;
      }
      
      let isActive = true;
  
      const load = async () => {
        try {
          // Tüm şarkı ID'lerini topla
          const songIds = songs.map(song => song.id).filter(Boolean);
          
          // Tek bir Firebase isteği ile tüm rating'leri getir
          const ratingsMap = await getRatingsForSongs(user.uid, songIds);
          
          if (isActive) {
            setRatings(ratingsMap);
          }
        } catch (err) {
          console.error('Error loading user ratings:', err);
        }
      };
  
      load();
  
      return () => {
        isActive = false;
      };
    }, [user, songs])
  );

  const handleRateSong = async (song, rating) => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Şarkıları beğenmek için lütfen giriş yapın.');
      return;
    }

    // Mevcut rating'i kontrol et (state'ten al)
    const previousRating = ratings[song.id];
    
    // Optimistic update - state'i hemen güncelle (yeni obje oluştur)
    const newRatings = { ...ratings };
    
    if (previousRating === rating) {
      // Aynı rating'e tekrar tıklanırsa, rating'i kaldır
      delete newRatings[song.id];
    } else {
      // Yeni rating ekle veya güncelle
      newRatings[song.id] = rating;
    }
    
    // State'i hemen güncelle (yeni obje referansı ile React render'ı tetikler)
    setRatings(newRatings);

    try {
      // Firebase'e kaydet
      if (previousRating === rating) {
        await removeRating(user.uid, song.id);
      } else {
        await rateSong(user.uid, song, rating);
      }
      // Başarılı olduğunda, state'i tekrar güncelle (Firebase'den doğrulama için)
      // Bu opsiyonel ama tutarlılık için iyi
    } catch (err) {
      console.error('Error rating song:', err);
      Alert.alert('Hata', 'Şarkı beğenilirken bir hata oluştu.');
      // Hata durumunda state'i geri yükle (eski state'e dön)
      setRatings(prevRatings => {
        const rollbackRatings = { ...prevRatings };
        if (previousRating) {
          rollbackRatings[song.id] = previousRating;
        } else {
          delete rollbackRatings[song.id];
        }
        return rollbackRatings;
      });
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
              <View
                key={song.id}
                style={styles.songCard}
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
                      Popularity: {song.popularity}
                    </Text>
                  </View>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.rateButton,
                      styles.likeButton,
                      (ratings[song.id] === 'like') ? styles.rateButtonActive : null
                    ]}
                    onPress={() => handleRateSong(song, 'like')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.rateButtonText}>👍</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.rateButton,
                      styles.dislikeButton,
                      (ratings[song.id] === 'dislike') ? styles.rateButtonActive : null
                    ]}
                    onPress={() => handleRateSong(song, 'dislike')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.rateButtonText}>👎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => openSpotify(song.externalUrl)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.playButtonText}>▶</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#282828',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#404040',
  },
  likeButton: {
    // Like button özel stil
  },
  dislikeButton: {
    // Dislike button özel stil
  },
  rateButtonActive: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  rateButtonText: {
    fontSize: 16,
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

