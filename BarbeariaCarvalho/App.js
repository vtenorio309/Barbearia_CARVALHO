import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Button, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

// Tela de gerenciamento para admin sem agendamento
function AdminHomeScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text>Gerenciamento de negócio - Sem agendamento</Text>
    </View>
  );
}

// Tela de relatórios gráficos para admin
function AdminReportScreen() {
  return (
    <View style={styles.screenContainer}>
      <Text>Relatório Gráfico dos Dados</Text>
    </View>
  );
}

// Tela de agendamentos para usuários
function UserHomeScreen() {
  // Estado para armazenar as seleções
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDay, setSelectedDay] = useState('1');
  const [selectedMonth, setSelectedMonth] = useState('1');
  const [period, setPeriod] = useState('');
  const [appointments, setAppointments] = useState([]);

  // Função para formatar a data selecionada
  const formatDate = (day, month) => {
    return `${day}/${month}`;
  };

  // Função para adicionar um agendamento
  const handleSchedule = () => {
    if (selectedService && selectedBarber && period) {
      const newAppointment = {
        service: selectedService,
        barber: selectedBarber,
        date: formatDate(selectedDay, selectedMonth),
        period: period,
      };
      setAppointments([...appointments, newAppointment]);
      // Limpa a seleção após o agendamento
      setSelectedService('');
      setSelectedBarber('');
      setPeriod('');
    }
  };

  // Função para remover um agendamento
  const handleRemoveAppointment = (index) => {
    setAppointments(appointments.filter((_, i) => i !== index));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agendamentos</Text>

      {/* Selecionar serviço */}
      <Text style={styles.label}>Selecione o Serviço</Text>
      <Picker
        selectedValue={selectedService}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedService(itemValue)}
      >
        <Picker.Item label="Selecione um serviço" value="" />
        <Picker.Item label="Corte Masculino" value="Corte Masculino" />
        <Picker.Item label="Barba" value="Barba" />
        <Picker.Item label="Corte + Barba" value="Corte + Barba" />
      </Picker>

      {/* Selecionar cabeleireiro */}
      <Text style={styles.label}>Selecione o Cabeleireiro</Text>
      <Picker
        selectedValue={selectedBarber}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedBarber(itemValue)}
      >
        <Picker.Item label="Selecione um cabeleireiro" value="" />
        <Picker.Item label="João" value="João" />
        <Picker.Item label="Carlos" value="Carlos" />
        <Picker.Item label="Lucas" value="Lucas" />
      </Picker>

      {/* Selecionar dia */}
      <Text style={styles.label}>Selecione o Dia</Text>
      <Picker
        selectedValue={selectedDay}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedDay(itemValue)}
      >
        {[...Array(31).keys()].map((day) => (
          <Picker.Item label={`${day + 1}`} value={`${day + 1}`} key={day} />
        ))}
      </Picker>

      {/* Selecionar mês */}
      <Text style={styles.label}>Selecione o Mês</Text>
      <Picker
        selectedValue={selectedMonth}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
      >
        <Picker.Item label="Janeiro" value="1" />
        <Picker.Item label="Fevereiro" value="2" />
        <Picker.Item label="Março" value="3" />
        <Picker.Item label="Abril" value="4" />
        <Picker.Item label="Maio" value="5" />
        <Picker.Item label="Junho" value="6" />
        <Picker.Item label="Julho" value="7" />
        <Picker.Item label="Agosto" value="8" />
        <Picker.Item label="Setembro" value="9" />
        <Picker.Item label="Outubro" value="10" />
        <Picker.Item label="Novembro" value="11" />
        <Picker.Item label="Dezembro" value="12" />
      </Picker>

      {/* Selecionar período */}
      <Text style={styles.label}>Selecione o Período</Text>
      <Picker
        selectedValue={period}
        style={styles.picker}
        onValueChange={(itemValue) => setPeriod(itemValue)}
      >
        <Picker.Item label="Selecione um período" value="" />
        <Picker.Item label="Manhã" value="Manhã" />
        <Picker.Item label="Tarde" value="Tarde" />
        <Picker.Item label="Noite" value="Noite" />
      </Picker>

      {/* Botão para marcar */}
      <TouchableOpacity style={styles.button} onPress={handleSchedule}>
        <Text style={styles.buttonText}>Marcar</Text>
      </TouchableOpacity>

      {/* Exibir agendamentos previstos para o dia */}
      <Text style={styles.subtitle}>Cortes Agendados</Text>
      {appointments.map((appointment, index) => (
        <View key={index} style={styles.appointment}>
          <Text>{`${appointment.service} com ${appointment.barber} em ${appointment.date} (${appointment.period})`}</Text>
          <View style={styles.appointmentButtons}>
            <Button title="Remover" onPress={() => handleRemoveAppointment(index)} />
            <Button title="Passar Fila" onPress={() => alert('Cliente passou a vez')} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// Configuração das Tabs
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Agendamento"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
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
                height: 70,
                borderRadius: 35,
                backgroundColor: 'tomato',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: -20,
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
          height: 70,
          paddingBottom: 10,
        },
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Administração" component={AdminHomeScreen} />
      <Tab.Screen name="Agendamento" component={UserHomeScreen} />
      <Tab.Screen name="Graficos" component={AdminReportScreen} />
    </Tab.Navigator>
  );
}

// Componente principal
export default function App() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  button: {
    backgroundColor: 'tomato',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointment: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  appointmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});
