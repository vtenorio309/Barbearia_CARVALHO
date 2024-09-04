import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Telas para admins
function AdminHomeScreen() {
  return (
    <View>
      <Text>Gerenciamento de negocio - Sem agendamento</Text>
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

// Telas para usuários
function UserLoginScreen() {
  return (
    <View>
      <Text>Login</Text>
    </View>
  );
}

function UserRegisterScreen() {
  return (
    <View>
      <Text>Registro</Text>
    </View>
  );
}

function UserHomeScreen() {
  return (
    <View>
      <Text>Agendamentos</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Administrador') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Gráficos') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            } else if (route.name === 'Login') {
              iconName = focused ? 'log-in' : 'log-in-outline';
            } else if (route.name === 'Register') {
              iconName = focused ? 'person-add' : 'person-add-outline';
            } else if (route.name === 'Início') {
              iconName = focused ? 'calendar' : 'calendar-outline';
            }

            // Você pode retornar qualquer componente aqui!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        {/* Abas para admins */}
        <Tab.Screen name="Administrador" component={AdminHomeScreen} />
        <Tab.Screen name="Gráficos" component={AdminReportScreen} />

        {/* Abas para usuários */}
        <Tab.Screen name="Login" component={UserLoginScreen} />
        <Tab.Screen name="Register" component={UserRegisterScreen} />
        <Tab.Screen name="Início" component={UserHomeScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
