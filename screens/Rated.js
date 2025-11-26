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
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getUserRatings, removeRating } from '../services/songRatingService';

export default function Rated() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'like', 'dislike'

  useEffect(() => {
    if (user) {
      loadRatings();
    }
  }, [user, activeTab]);

  // Sayfa focus olduğunda veriyi yenile
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadRatings();
      }
    }, [user])
  );

  const loadRatings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const ratingType = activeTab === 'all' ? null : activeTab;
      const userRatings = await getUserRatings(user.uid, ratingType);
      setRatings(userRatings);
    } catch (err) {
      console.error('Error loading ratings:', err);
      Alert.alert('Hata', 'Beğeniler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const openSpotify = (url) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Hata', 'Spotify açılamadı');
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleRemoveRating = async (rating) => {
    if (!user) {
      return;
    }

    try {
      await removeRating(user.uid, rating.songId);
      // Veriyi yenile
      await loadRatings();
    } catch (err) {
      console.error('Error removing rating:', err);
      Alert.alert('Hata', 'Beğeni kaldırılırken bir hata oluştu: ' + err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Beğenilerim</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Tümü
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'like' && styles.tabActive]}
          onPress={() => setActiveTab('like')}
        >
          <Text style={[styles.tabText, activeTab === 'like' && styles.tabTextActive]}>
            👍 Beğendiklerim
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dislike' && styles.tabActive]}
          onPress={() => setActiveTab('dislike')}
        >
          <Text style={[styles.tabText, activeTab === 'dislike' && styles.tabTextActive]}>
            👎 Beğenmediklerim
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1DB954" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        )}

        {!loading && ratings.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'all' 
                ? 'Henüz beğendiğiniz şarkı yok.' 
                : activeTab === 'like'
                ? 'Henüz beğendiğiniz şarkı yok.'
                : 'Henüz beğenmediğiniz şarkı yok.'}
            </Text>
          </View>
        )}

        {!loading && ratings.length > 0 && (
          <View style={styles.ratingsList}>
            {ratings.map((rating) => (
              <View
                key={rating.id}
                style={styles.ratingCard}
              >
                {rating.albumImage && (
                  <Image
                    source={{ uri: rating.albumImage }}
                    style={styles.albumImage}
                  />
                )}
                <View style={styles.ratingInfo}>
                  <View style={styles.ratingHeader}>
                    <Text style={styles.ratingEmoji}>
                      {rating.rating === 'like' ? '👍' : '👎'}
                    </Text>
                    <Text style={styles.ratingDate}>
                      {formatDate(rating.updatedAt)}
                    </Text>
                  </View>
                  <Text style={styles.songName} numberOfLines={1}>
                    {rating.songName}
                  </Text>
                  <Text style={styles.songArtist} numberOfLines={1}>
                    {rating.artist}
                  </Text>
                  <Text style={styles.songAlbum} numberOfLines={1}>
                    {rating.album}
                  </Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleRemoveRating(rating);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      openSpotify(rating.externalUrl);
                    }}
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
    padding: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: '#282828',
  },
  tabActive: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  tabText: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
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
  emptyContainer: {
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
  },
  ratingsList: {
    marginTop: 10,
  },
  ratingCard: {
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
  ratingInfo: {
    flex: 1,
    marginRight: 10,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  ratingEmoji: {
    fontSize: 16,
  },
  ratingDate: {
    fontSize: 11,
    color: '#808080',
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
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff4444',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 5, // Android için
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
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
