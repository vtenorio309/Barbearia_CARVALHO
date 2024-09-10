import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, StyleSheet } from 'react-native';

// Telas para admins
function AdminHomeScreen() {
  return (
    <View>
      <Text>Gerenciamento de negócio - Sem agendamento</Text>
    </View>
  );
}

function AdminReportScreen() {
  return (
    <View>
      <Text>Relatório Gráfico dos Dados</Text>
    </View>
  );
}

// Tela principal dos usuários
function UserHomeScreen({ navigation }) {
  return (
    <View>
      <Text style={{ fontSize: 14, marginBottom: 20 }}>Agendamentos</Text>
    </View>
  );
}

// Tela de login
function UserLoginScreen({ navigation, setLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      await AsyncStorage.setItem('loggedIn', 'true');
      setLoggedIn(true); // Atualiza o estado de login
      navigation.replace('Main');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <Button title="Login" onPress={login} />
    </View>
  );
}

// Tela de registro
function UserRegisterScreen({ navigation, setLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const register = async () => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify({ email, password }));
      await AsyncStorage.setItem('loggedIn', 'true');
      setLoggedIn(true); // Atualiza o estado de login
      navigation.replace('Main');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      <Button title="Registrar" onPress={register} />
      <Button title="Já tem uma conta? Faça login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export { UserLoginScreen, UserRegisterScreen };

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="UserHome"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = 30;

          if (route.name === 'Administração') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Graficos') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Agendamento') {
            iconName = focused ? 'calendar' : 'calendar-outline';
            return (
              <View style={{
                width: 70,
                height: 90,
                borderRadius: 30,
                backgroundColor: 'tomato',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: -10, // Deixa o ícone suspenso para criar o efeito de meio círculo
              }}>
                <Ionicons name={iconName} size={50} color="white" />
              </View>
            );
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
        },
        tabBarShowLabel: false, // Esconde os rótulos (nomes) das abas
      })}
    >
      <Tab.Screen name="Administração" component={AdminHomeScreen} />
      <Tab.Screen name="Agendamento" component={UserHomeScreen} />
      <Tab.Screen name="Graficos" component={AdminReportScreen} />
    </Tab.Navigator>
  );
}

function AuthStack({ setLoggedIn }) {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login">
        {(props) => <UserLoginScreen {...props} setLoggedIn={setLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => <UserRegisterScreen {...props} setLoggedIn={setLoggedIn} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('loggedIn');
        setLoggedIn(value === 'true'); // Define o estado de login corretamente
      } catch (e) {
        console.error(e);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <NavigationContainer>
      {loggedIn ? <MainTabs /> : <AuthStack setLoggedIn={setLoggedIn} />}
    </NavigationContainer>
  );
}
