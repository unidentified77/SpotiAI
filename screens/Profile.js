import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    console.log('handleSignOut called');
    try {
      console.log('Calling signOut...');
      await signOut();
      console.log('signOut completed successfully');
    } catch (error) {
      console.error('Sign out error in Profile:', error);
      Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Hesabınız</Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userEmail}>{user.email}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
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
  userInfo: {
    marginTop: 20,
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#282828',
    borderRadius: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#e22134',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

