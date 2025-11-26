// Spotify API yapılandırması
// Spotify Developer Dashboard'dan alacağınız bilgiler
export const SPOTIFY_CONFIG = {
  clientId: 'e73eb5e97413407b8d315e8c7639f68c',
  clientSecret: '92ab0a12de2c4f01b48f2f0fa58db89b',
};

// Spotify API base URL
export const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
export const SPOTIFY_ACCOUNTS_BASE = 'https://accounts.spotify.com/api';

// Genre mapping - uygulama genre'larını Spotify genre'larına map et
export const GENRE_MAPPING = {
  'Pop': 'pop',
  'Rock': 'rock',
  'Hip Hop': 'hip-hop',
  'Jazz': 'jazz',
  'Classical': 'classical',
  'Electronic': 'electronic',
  'R&B': 'r-n-b',
  'Country': 'country',
  'Reggae': 'reggae',
  'Blues': 'blues',
  'Folk': 'folk',
  'Metal': 'metal',
  'Latin': 'latin',
  'Indie': 'indie',
  'Alternative': 'alternative',
  'Dance': 'dance',
  'Soul': 'soul',
  'Funk': 'funk',
};

// Base64 encoding helper (React Native'de btoa yok)
const base64Encode = (str) => {
  try {
    // React Native için base64 encoding
    if (typeof btoa !== 'undefined') {
      return btoa(str);
    }
    // Node.js/Expo için
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str).toString('base64');
    }
    // Fallback - manual base64 encoding
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let result = '';
    let i = 0;
    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;
      const bitmap = (a << 16) | (b << 8) | c;
      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
    }
    return result;
  } catch (error) {
    console.error('Base64 encoding error:', error);
    throw error;
  }
};

// Spotify API token alma (Client Credentials Flow)
export const getSpotifyAccessToken = async () => {
  try {
    const credentials = `${SPOTIFY_CONFIG.clientId}:${SPOTIFY_CONFIG.clientSecret}`;
    const encodedCredentials = base64Encode(credentials);

    const response = await fetch(`${SPOTIFY_ACCOUNTS_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${encodedCredentials}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify token error:', errorText);
      throw new Error('Failed to get Spotify access token');
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};

// Genre'a göre şarkı önerileri çek (Search API kullanarak - daha güvenilir)
export const getRecommendationsByGenre = async (genre, limit = 20) => {
  try {
    const accessToken = await getSpotifyAccessToken();
    const spotifyGenre = GENRE_MAPPING[genre] || genre.toLowerCase();

    // Search API ile genre'a göre popüler şarkıları bul
    // Birden fazla arama terimi deneyelim
    const searchQueries = [
      `genre:"${spotifyGenre}"`,
      `tag:"${spotifyGenre}"`,
      spotifyGenre, // Direkt genre adı
    ];

    let tracks = [];

    // Her bir arama terimini dene
    for (const query of searchQueries) {
      const encodedQuery = encodeURIComponent(query);
      const searchResponse = await fetch(
        `${SPOTIFY_API_BASE}/search?q=${encodedQuery}&type=track&limit=${limit}&market=US`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const foundTracks = searchData.tracks?.items || [];
        
        if (foundTracks.length > 0) {
          tracks = foundTracks;
          break; // İlk başarılı sonuçta dur
        }
      }
    }

    // Eğer hiçbir arama sonuç vermezse, genre adını direkt kullan
    if (tracks.length === 0) {
      const fallbackQuery = encodeURIComponent(spotifyGenre);
      const fallbackResponse = await fetch(
        `${SPOTIFY_API_BASE}/search?q=${fallbackQuery}&type=track&limit=${limit}&market=US`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        tracks = fallbackData.tracks?.items || [];
      }
    }

    // Eğer hala track yoksa, popüler şarkıları getir
    if (tracks.length === 0) {
      const popularResponse = await fetch(
        `${SPOTIFY_API_BASE}/search?q=year:2020-2024&type=track&limit=${limit}&market=US`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (popularResponse.ok) {
        const popularData = await popularResponse.json();
        tracks = popularData.tracks?.items || [];
      }
    }

    return tracks;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

// Spotify Recommendation API kullanarak kişiselleştirilmiş öneriler
// seed_tracks: kullanıcının beğendiği şarkıların ID'leri (max 5)
// seed_genres: genre'lar (max 5)
export const getPersonalizedRecommendations = async (seedTracks = [], seedGenres = [], limit = 20) => {
  try {
    const accessToken = await getSpotifyAccessToken();
    
    // Spotify API parametreleri
    const params = new URLSearchParams();
    
    // Spotify API gereksinimleri:
    // - En az 1 seed parametresi olmalı
    // - Toplam seed sayısı (tracks + artists + genres) 5'i geçmemeli
    // - seed_tracks + seed_artists + seed_genres toplamı 5 olmalı
    
    let totalSeeds = 0;
    const maxSeeds = 5;
    
    // Seed tracks (kullanıcının beğendiği şarkılar) - max 5
    if (seedTracks.length > 0) {
      // Geçerli track ID'lerini filtrele (boş veya geçersiz olanları çıkar)
      const validTracks = seedTracks
        .filter(trackId => trackId && trackId.trim().length > 0)
        .slice(0, maxSeeds);
      
      if (validTracks.length > 0) {
        const tracksToUse = validTracks.join(',');
        params.append('seed_tracks', tracksToUse);
        totalSeeds += validTracks.length;
      }
    }
    
    // Seed genres - kalan slot sayısına göre ekle
    if (seedGenres.length > 0 && totalSeeds < maxSeeds) {
      const remainingSlots = maxSeeds - totalSeeds;
      const genresToUse = seedGenres.slice(0, remainingSlots).join(',');
      params.append('seed_genres', genresToUse);
      totalSeeds += seedGenres.slice(0, remainingSlots).length;
    } else if (totalSeeds === 0) {
      // Eğer hiç seed yoksa, en azından genre kullan
      params.append('seed_genres', seedGenres.length > 0 ? seedGenres[0] : 'pop');
      totalSeeds = 1;
    }
    
    // En az 1 seed olmalı
    if (totalSeeds === 0) {
      throw new Error('At least one seed parameter is required');
    }
    
    params.append('limit', limit.toString());
    params.append('market', 'US');
    
    const url = `${SPOTIFY_API_BASE}/recommendations?${params.toString()}`;
    console.log('Spotify Recommendation API URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        const errorJson = JSON.parse(errorText);
        console.error('Spotify recommendations error:', response.status, JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.error('Spotify recommendations error:', response.status, errorText);
      }
      
      // 401 hatası - yetki sorunu (Client Credentials Flow recommendations için yeterli olmayabilir)
      if (response.status === 401) {
        throw new Error('Authentication failed. Recommendations API may require user authorization.');
      }
      
      // 404 hatası - endpoint bulunamadı veya geçersiz parametreler
      if (response.status === 404) {
        // Spotify Recommendation API Client Credentials Flow ile çalışmayabilir
        // Bu durumda fallback'e dön
        console.warn('Recommendations API returned 404. This may be due to Client Credentials Flow limitations.');
        throw new Error('Recommendations API not available with current authentication');
      }
      
      throw new Error(`Failed to get personalized recommendations: ${response.status}`);
    }
    
    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    throw error;
  }
};

