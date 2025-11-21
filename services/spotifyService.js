import { getRecommendationsByGenre } from '../config/spotify';

// Genre'a göre şarkı önerileri çek (daha temiz API)
export const fetchSongRecommendations = async (genre, limit = 20) => {
  try {
    const tracks = await getRecommendationsByGenre(genre, limit);
    
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

