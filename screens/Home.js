import { Platform, StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const genres = [
  'Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic',
  'R&B', 'Country', 'Reggae', 'Blues', 'Folk', 'Metal',
  'Latin', 'Indie', 'Alternative', 'Dance', 'Soul', 'Funk'
];

// Her genre için özel renk paleti
const genreColors = {
  'Pop': ['#FF6B9D', '#C44569'],
  'Rock': ['#8B0000', '#FF4500'],
  'Hip Hop': ['#1DB954', '#1ed760'],
  'Jazz': ['#FFA500', '#FF8C00'],
  'Classical': ['#9370DB', '#8A2BE2'],
  'Electronic': ['#00CED1', '#20B2AA'],
  'R&B': ['#FF1493', '#DC143C'],
  'Country': ['#FFD700', '#FFA500'],
  'Reggae': ['#FF6347', '#FF4500'],
  'Blues': ['#4169E1', '#0000CD'],
  'Folk': ['#228B22', '#32CD32'],
  'Metal': ['#2F2F2F', '#000000'],
  'Latin': ['#FF4500', '#FF6347'],
  'Indie': ['#BA55D3', '#DA70D6'],
  'Alternative': ['#FF69B4', '#FF1493'],
  'Dance': ['#00BFFF', '#1E90FF'],
  'Soul': ['#FF1493', '#FF69B4'],
  'Funk': ['#FFD700', '#FFA500'],
};

export default function Home({ navigation }) {
  const handleGenrePress = (genre) => {
    navigation.navigate('SongRecommendation', { genre });
  };

  const getGenreColors = (genre) => {
    return genreColors[genre] || ['#1DB954', '#1ed760'];
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Discover Music</Text>
        <Text style={styles.subtitle}>Select a genre to get AI-powered song recommendations</Text>
        
        <View style={styles.genreGrid}>
          {genres.map((genre, index) => {
            const colors = getGenreColors(genre);
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleGenrePress(genre)}
                activeOpacity={0.8}
                style={styles.genreCardContainer}
              >
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.genreCard}
                >
                  <Text style={styles.genreText}>{genre}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#b3b3b3',
    fontWeight: '500',
    marginBottom: 30,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  genreCardContainer: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  genreCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  genreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
});

