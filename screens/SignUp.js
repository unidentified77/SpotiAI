import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function SignUp({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      // Firebase Authentication ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestore'da kullanıcı bilgilerini kaydet
      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        email: email,
        displayName: displayName || email.split('@')[0], // Email'den isim çıkar
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert('Başarılı', 'Kayıt işlemi tamamlandı!', [
        {
          text: 'Tamam',
          onPress: () => {
            // Navigation otomatik olarak App.js'deki auth state'e göre yapılacak
          },
        },
      ]);
    } catch (error) {
      let errorMessage = 'Kayıt olurken bir hata oluştu';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu email adresi zaten kullanılıyor';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz email adresi';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf';
      }
      
      Alert.alert('Kayıt Hatası', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <LinearGradient
          colors={['#121212', '#1a1a1a']}
          style={styles.gradient}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Text style={styles.title}>Kayıt Ol</Text>
              <Text style={styles.subtitle}>SpotiAI'ya katılın</Text>

              <View style={styles.form}>
                <TextInput
                  style={styles.input}
                  placeholder="İsim (Opsiyonel)"
                  placeholderTextColor="#666"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Şifre Tekrar"
                  placeholderTextColor="#666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                />

                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleSignUp}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Kayıt Ol</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>Zaten hesabınız var mı? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                    <Text style={styles.signInLink}>Giriş Yap</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  keyboardView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#b3b3b3',
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  signUpButton: {
    backgroundColor: '#1DB954',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 50,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signInText: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  signInLink: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
  },
});

