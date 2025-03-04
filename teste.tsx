import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons, AntDesign, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase config
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Mock firebase functions for demo purposes
const mockFirebase = {
  auth: {
    createUserWithEmailAndPassword: async (email, password) => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!email.includes('@')) throw new Error('Invalid email format');
      if (password.length < 6) throw new Error('Password should be at least 6 characters');
      return { user: { uid: 'user-' + Math.random().toString(36).substring(2, 9), email } };
    },
    signInWithEmailAndPassword: async (email, password) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (!email || !password) throw new Error('Email and password are required');
      if (email === 'error@test.com') throw new Error('Invalid credentials');
      return { user: { uid: 'user-' + Math.random().toString(36).substring(2, 9), email } };
    },
    signInWithGoogle: async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { user: { uid: 'google-user-' + Math.random().toString(36).substring(2, 9), email: 'google@example.com' } };
    },
    signOut: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return true;
    }
  },
  firestore: {
    collection: (name) => ({
      doc: (id) => ({
        set: async (data) => {
          await new Promise(resolve => setTimeout(resolve, 800));
          return true;
        },
        get: async () => {
          await new Promise(resolve => setTimeout(resolve, 800));
          return { 
            exists: true, 
            data: () => ({ name: 'Test User', email: 'test@example.com', createdAt: new Date() }) 
          };
        }
      }),
      where: () => ({
        get: async () => {
          await new Promise(resolve => setTimeout(resolve, 800));
          return {
            empty: false,
            docs: [{ 
              id: 'doc1', 
              data: () => ({ name: 'Test User', email: 'test@example.com', createdAt: new Date() }) 
            }]
          };
        }
      })
    })
  }
};

const AuthContext = React.createContext(null);

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUserAuthentication = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserAuthentication();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await mockFirebase.auth.signInWithEmailAndPassword(email, password);
      const userData = { uid: response.user.uid, email: response.user.email };
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setLoading(true);
      const response = await mockFirebase.auth.createUserWithEmailAndPassword(email, password);
      const userData = { 
        uid: response.user.uid, 
        email: response.user.email,
        name,
        createdAt: new Date().toISOString()
      };
      
      // Store user data in Firestore
      await mockFirebase.firestore.collection('users').doc(response.user.uid).set(userData);
      
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const response = await mockFirebase.auth.signInWithGoogle();
      const userData = { 
        uid: response.user.uid, 
        email: response.user.email,
        authProvider: 'google'
      };
      
      // Check if user exists, if not create profile
      const userDoc = await mockFirebase.firestore.collection('users').doc(response.user.uid).get();
      
      if (!userDoc.exists) {
        await mockFirebase.firestore.collection('users').doc(response.user.uid).set({
          ...userData,
          createdAt: new Date().toISOString()
        });
      }
      
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await mockFirebase.auth.signOut();
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formError, setFormError] = useState('');
  const { login, loginWithGoogle, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setFormError('Email e senha são obrigatórios');
      return;
    }
    
    try {
      setFormError('');
      await login(email, password);
    } catch (error) {
      setFormError(error.message || 'Falha ao fazer login. Tente novamente.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setFormError('');
      await loginWithGoogle();
    } catch (error) {
      setFormError('Falha ao fazer login com Google. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://api.a0.dev/assets/image?text=modern%20app%20logo%20minimalist&aspect=1:1' }} 
            style={styles.logo} 
          />
        </View>
        
        <Text style={styles.title}>Bem-vindo de volta</Text>
        <Text style={styles.subtitle}>Faça login na sua conta para continuar</Text>
        
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={22} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={22} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.visibilityIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Feather name={passwordVisible ? "eye" : "eye-off"} size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.divider} />
        </View>
        
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <AntDesign name="google" size={20} color="#EA4335" style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Continuar com Google</Text>
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Não tem uma conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Registre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [formError, setFormError] = useState('');
  const { register, loginWithGoogle, loading } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Todos os campos são obrigatórios');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('As senhas não correspondem');
      return;
    }
    
    if (password.length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      setFormError('');
      await register(email, password, name);
    } catch (error) {
      setFormError(error.message || 'Falha ao criar conta. Tente novamente.');
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setFormError('');
      await loginWithGoogle();
    } catch (error) {
      setFormError('Falha ao registrar com Google. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://api.a0.dev/assets/image?text=modern%20app%20logo%20minimalist&aspect=1:1' }} 
            style={styles.logo} 
          />
        </View>
        
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Registre-se para começar</Text>
        
        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={22} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={22} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={22} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.visibilityIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Feather name={passwordVisible ? "eye" : "eye-off"} size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={22} color="#6b7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!passwordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.divider} />
        </View>
        
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleRegister}
          disabled={loading}
        >
          <AntDesign name="google" size={20} color="#EA4335" style={styles.googleIcon} />
          <Text style={styles.googleButtonText}>Continuar com Google</Text>
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Já tem uma conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.registerLink}>Faça login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function HomeScreen() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // In a real app, you would fetch user data from Firestore here
        const userDoc = await mockFirebase.firestore.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao fazer logout. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.homeContainer}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bem-vindo!</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <Image
          source={{ uri: 'https://api.a0.dev/assets/image?text=avatar%20profile%20professional&aspect=1:1' }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Usuário'}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Seu cadastro foi concluído com sucesso!</Text>
        <Text style={styles.infoDescription}>
          Você agora está conectado ao Firebase e pode acessar todos os recursos do aplicativo.
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Recursos disponíveis:</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <MaterialIcons name="security" size={24} color="#6366f1" />
            <Text style={styles.featureText}>Autenticação segura</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="cloud" size={24} color="#6366f1" />
            <Text style={styles.featureText}>Armazenamento em nuvem</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="sync" size={24} color="#6366f1" />
            <Text style={styles.featureText}>Sincronização em tempo real</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="devices" size={24} color="#6366f1" />
            <Text style={styles.featureText}>Multiplataforma</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!loading) {
      setInitializing(false);
    }
  }, [loading]);

  if (initializing) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return user ? <HomeScreen /> : <AuthNavigator />;
}

function AuthNavigator() {
  const [activeScreen, setActiveScreen] = useState('Login');

  const navigation = {
    navigate: (screenName) => {
      setActiveScreen(screenName);
    }
  };

  return (
    <>
      {activeScreen === 'Login' ? (
        <LoginScreen navigation={navigation} />
      ) : (
        <RegisterScreen navigation={navigation} />
      )}
    </>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  visibilityIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#6b7280',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '500',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  registerLink: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 15,
    fontSize: 14,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  homeContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  logoutButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileInfo: {
    marginLeft: 15,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
  featuresContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 15,
  },
  featuresList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 10,
  },
});