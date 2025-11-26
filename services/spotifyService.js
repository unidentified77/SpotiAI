import { getRecommendationsByGenre, getPersonalizedRecommendations } from '../config/spotify';
import { getUserRatings } from './songRatingService';

// Kullanıcı giriş yapmışsa, beğenilerine göre AI ile kişiselleştirilmiş öneriler verir
export const fetchSongRecommendations = async (genre, limit = 20, userId = null) => {
  try {
    let tracks = [];
    
    if (tracks.length === 0) {
      tracks = await getRecommendationsByGenre(genre, limit);
    } else {
      // Kullanıcı giriş yapmamışsa, genre'a göre arama yap
      tracks = await getRecommendationsByGenre(genre, limit);
    }
    
    // Track'leri daha kullanışlı formata çevir
    return tracks.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      albumImage: track.album.images?.[0]?.url || track.album.images?.[1]?.url || null,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
      duration: track.duration_ms,
      popularity: track.popularity,
    }));
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    throw error;
  }
};

