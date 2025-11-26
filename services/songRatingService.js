import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Kullanıcının bir şarkıya like/dislike vermesi
export const rateSong = async (userId, songData, rating) => {
  try {
    // Subcollection path: users/{userId}/ratings
    const ratingsRef = collection(db, 'users', userId, 'ratings');
    
    // Önce bu kullanıcının bu şarkı için daha önce bir rating'i var mı kontrol et
    const q = query(
      ratingsRef, 
      where('songId', '==', songData.id)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Eğer varsa, mevcut rating'i güncelle
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        rating: rating, // 'like' veya 'dislike'
        popularity: songData.popularity || 0, // AI önerileri için güncelle
        duration: songData.duration || 0, // AI önerileri için güncelle
        updatedAt: Timestamp.now(),
      });
      return { success: true, action: 'updated' };
    } else {
      // Yoksa yeni rating ekle
      await addDoc(ratingsRef, {
        songId: songData.id,
        songName: songData.name,
        artist: songData.artist,
        album: songData.album,
        albumImage: songData.albumImage,
        externalUrl: songData.externalUrl,
        rating: rating, // 'like' veya 'dislike'
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { success: true, action: 'created' };
    }
  } catch (error) {
    console.error('Error rating song:', error);
    throw error;
  }
};

// Kullanıcının bir şarkı için rating'ini kaldırma
export const removeRating = async (userId, songId) => {
  try {
    const ratingsRef = collection(db, 'users', userId, 'ratings');
    const q = query(
      ratingsRef, 
      where('songId', '==', songId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);
      return { success: true };
    }
    
    return { success: false, message: 'Rating not found' };
  } catch (error) {
    console.error('Error removing rating:', error);
    throw error;
  }
};

// Kullanıcının bir şarkı için mevcut rating'ini getir
export const getUserRating = async (userId, songId) => {
  try {
    const ratingsRef = collection(db, 'users', userId, 'ratings');
    const q = query(
      ratingsRef, 
      where('songId', '==', songId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const ratingData = querySnapshot.docs[0].data();
      return ratingData.rating; // 'like' veya 'dislike'
    }
    
    return null; // Rating yoksa null döndür
  } catch (error) {
    console.error('Error getting user rating:', error);
    throw error;
  }
};

// Kullanıcının tüm rating'lerini getir (history için)
export const getUserRatings = async (userId, ratingType = null) => {
  try {
    const ratingsRef = collection(db, 'users', userId, 'ratings');
    let q;
    
    if (ratingType) {
      // Belirli bir rating tipine göre filtrele (like veya dislike)
      q = query(
        ratingsRef,
        where('rating', '==', ratingType)
      );
    } else {
      // Tüm rating'leri getir (query olmadan direkt collection'ı al)
      q = query(ratingsRef);
    }
    
    const querySnapshot = await getDocs(q);
    const ratings = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ratings.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      });
    });
    
    // Client-side'da tarihe göre sırala (en yeni önce)
    ratings.sort((a, b) => {
      const dateA = a.updatedAt || a.createdAt || new Date(0);
      const dateB = b.updatedAt || b.createdAt || new Date(0);
      return dateB - dateA; // Descending order
    });
    
    return ratings;
  } catch (error) {
    console.error('Error getting user ratings:', error);
    throw error;
  }
};

// Kullanıcının belirli şarkılar için rating'lerini getir (optimize edilmiş - tek istek)
// songIds: string[] - Şarkı ID'lerinin array'i
// Returns: { [songId]: 'like' | 'dislike' } - Şarkı ID'sine göre rating map'i
export const getRatingsForSongs = async (userId, songIds = []) => {
  try {
    if (!userId || songIds.length === 0) {
      return {};
    }
    
    // Tüm rating'leri tek seferde getir
    const allRatings = await getUserRatings(userId);
    
    // Sadece istenen şarkılar için filtrele ve map oluştur
    const ratingsMap = {};
    const songIdSet = new Set(songIds); // Hızlı lookup için Set kullan
    
    allRatings.forEach((rating) => {
      if (songIdSet.has(rating.songId)) {
        ratingsMap[rating.songId] = rating.rating; // 'like' veya 'dislike'
      }
    });
    
    return ratingsMap;
  } catch (error) {
    console.error('Error getting ratings for songs:', error);
    throw error;
  }
};
