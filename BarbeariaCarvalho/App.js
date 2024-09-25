import React, { useState, useEffect } from 'react'; // Certifique-se de importar useState e useEffect
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TextInput, Button, TouchableOpacity, ScrollView, StyleSheet, Alert} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit'; // Para os gráficos
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'; 
import XLSX from 'xlsx';

function AdminHomeScreen() {
  const [service, setService] = useState('');
  const [barber, setBarber] = useState('');
  const [servicesList, setServicesList] = useState([]);
  const [barbersList, setBarbersList] = useState([]);
  
  useEffect(() => {
  const loadData = async () => {
    try {
      const services = await AsyncStorage.getItem('services');
      const barbers = await AsyncStorage.getItem('barbers');
      if (services) setServicesList(JSON.parse(services));
      if (barbers) setBarbersList(JSON.parse(barbers));
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    }
  };
  loadData();
}, []);


  // Carregar dados ao iniciar
  useEffect(() => {
    loadData();
  }, []);

  // Função para salvar dados localmente
  const saveData = async () => {
    try {
      await AsyncStorage.setItem('services', JSON.stringify(servicesList));
      await AsyncStorage.setItem('barbers', JSON.stringify(barbersList));
    } catch (e) {
      console.error("Erro ao salvar dados", e);
    }
  };

  // Carregar os dados salvos
  const loadData = async () => {
    try {
      const services = await AsyncStorage.getItem('services');
      const barbers = await AsyncStorage.getItem('barbers');
      if (services) setServicesList(JSON.parse(services));
      if (barbers) setBarbersList(JSON.parse(barbers));
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    }
  };

  // Adicionar serviço
  const addService = () => {
    if (service) {
      setServicesList([...servicesList, service]);
      setService('');
      saveData();
    }
  };

  // Adicionar barbeiro
  const addBarber = () => {
    if (barber) {
      setBarbersList([...barbersList, barber]);
      setBarber('');
      saveData();
    }
  };

  // Remover serviço
  const removeService = (index) => {
    Alert.alert('Confirmação', 'Deseja remover este serviço?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        onPress: () => {
          const newServices = servicesList.filter((_, i) => i !== index);
          setServicesList(newServices);
          saveData();
        },
      },
    ]);
  };

  // Remover barbeiro
  const removeBarber = (index) => {
    Alert.alert('Confirmação', 'Deseja remover este barbeiro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        onPress: () => {
          const newBarbers = barbersList.filter((_, i) => i !== index);
          setBarbersList(newBarbers);
          saveData();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Administração - Serviços e Barbeiros</Text>

      {/* Adicionar Serviço */}
      <TextInput
        style={styles.input}
        placeholder="Adicionar Serviço"
        value={service}
        onChangeText={setService}
      />
      <Button title="Adicionar Serviço" onPress={addService} />
      <Text style={styles.subtitle}>Serviços</Text>
      {servicesList.map((service, index) => (
        <View key={index} style={styles.listItem}>
          <Text>{service}</Text>
          <Button title="Remover" onPress={() => removeService(index)} />
        </View>
      ))}

      {/* Adicionar Barbeiro */}
      <TextInput
        style={styles.input}
        placeholder="Adicionar Barbeiro"
        value={barber}
        onChangeText={setBarber}
      />
      <Button title="Adicionar Barbeiro" onPress={addBarber} />
      <Text style={styles.subtitle}>Barbeiros</Text>
      {barbersList.map((barber, index) => (
        <View key={index} style={styles.listItem}>
          <Text>{barber}</Text>
          <Button title="Remover" onPress={() => removeBarber(index)} />
        </View>
      ))}
    </ScrollView>
  );
}

// === AdminReportScreen ===
const AdminReportScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState('');  // Filtro de mês
  const [selectedYear, setSelectedYear] = useState('');    // Filtro de ano
  const [reportData, setReportData] = useState(null);      // Dados extraídos do Excel

  useEffect(() => {
    loadDataFromExcel(); // Carregar os dados do Excel na inicialização
  }, []);

  const loadDataFromExcel = async () => {
    // Caminho do arquivo Excel (precisa ser o caminho salvo no app)
    const pathToFile = `${FileSystem.documentDirectory}relatorio_servicos.xlsx`;

    try {
      const fileData = await FileSystem.readAsStringAsync(pathToFile, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(fileData, { type: 'base64' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Atualizar o estado com os dados do Excel
      setReportData(jsonData);
    } catch (error) {
      console.error('Erro ao carregar arquivo Excel:', error);
    }
  };

  // Função para filtrar dados por mês e ano
  const filterDataByDate = () => {
    if (!reportData) return [];
    return reportData.filter(item => {
      const itemDate = new Date(item.Horario); // A coluna "Horario" no arquivo Excel
      const month = itemDate.getMonth() + 1; // Mês do item (0-indexado)
      const year = itemDate.getFullYear();   // Ano do item
      return (month === parseInt(selectedMonth) && year === parseInt(selectedYear));
    });
  };

  // Gerar dados de gráficos a partir dos dados filtrados
  const generateChartsData = () => {
    const filteredData = filterDataByDate();

    // Dados de faturamento
    const totalFaturamento = filteredData.reduce((sum, item) => sum + parseFloat(item.Preco), 0);

    // Contagem de clientes
    const totalClientes = filteredData.length;

    // Serviço mais popular
    const servicePopularity = {};
    filteredData.forEach(item => {
      if (servicePopularity[item.Serviço]) {
        servicePopularity[item.Serviço]++;
      } else {
        servicePopularity[item.Serviço] = 1;
      }
    });
    const mostPopularService = Object.keys(servicePopularity).reduce((a, b) =>
      servicePopularity[a] > servicePopularity[b] ? a : b
    );

    return {
      faturamento: totalFaturamento,
      clientes: totalClientes,
      popularService: mostPopularService,
    };
  };

  // Renderizar gráficos com base nos dados
  const renderCharts = () => {
    const chartsData = generateChartsData();

    if (!chartsData) return null;

    return (
      <View>
        <Text style={styles.chartTitle}>Faturamento Total: R${chartsData.faturamento.toFixed(2)}</Text>
        <Text style={styles.chartTitle}>Total de Clientes: {chartsData.clientes}</Text>
        <Text style={styles.chartTitle}>Serviço Mais Popular: {chartsData.popularService}</Text>

        {/* Exemplo de gráfico de barras para o número de clientes */}
        <BarChart
          data={{
            labels: ['Clientes'],
            datasets: [
              {
                data: [chartsData.clientes],
              },
            ],
          }}
          width={300}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#e26a00',
            backgroundGradientFrom: '#fb8c00',
            backgroundGradientTo: '#ffa726',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          style={styles.chart}
        />

        {/* Exemplo de gráfico de linha para o faturamento */}
        <LineChart
          data={{
            labels: ['Faturamento'],
            datasets: [
              {
                data: [chartsData.faturamento],
              },
            ],
          }}
          width={300}
          height={220}
          yAxisLabel="R$"
          chartConfig={{
            backgroundColor: '#022173',
            backgroundGradientFrom: '#1E2923',
            backgroundGradientTo: '#08130D',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Relatórios da Barbearia</Text>

      {/* Filtros de Data */}
      <Text style={styles.subtitle}>Selecionar Mês e Ano</Text>
      <Picker
        selectedValue={selectedMonth}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
      >
        <Picker.Item label="Selecione o Mês" value="" />
        <Picker.Item label="Janeiro" value="1" />
        <Picker.Item label="Fevereiro" value="2" />
        <Picker.Item label="Março" value="3" />
        <Picker.Item label="Abril" value="4" />
        {/* Adicione outros meses */}
      </Picker>

      <Picker
        selectedValue={selectedYear}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedYear(itemValue)}
      >
        <Picker.Item label="Selecione o Ano" value="" />
        <Picker.Item label="2023" value="2023" />
        <Picker.Item label="2024" value="2024" />
        {/* Adicione outros anos */}
      </Picker>

      {/* Botão para gerar relatórios */}
      <Button title="Gerar Relatórios" onPress={renderCharts} />

      {/* Renderização dos gráficos */}
      {renderCharts()}
    </ScrollView>
  );
};

// Tela de agendamentos para usuários
function UserHomeScreen() {
  const [clientName, setClientName] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [queue, setQueue] = useState([]); // Fila de espera
  const [currentAppointmentIndex, setCurrentAppointmentIndex] = useState(0); // Controla a fila

  // Função para adicionar um agendamento
  const handleSchedule = () => {
    if (clientName && selectedService && selectedBarber && selectedPeriod) {
      const newAppointment = {
        clientName,
        service: selectedService,
        barber: selectedBarber,
        period: selectedPeriod,
        time: new Date().toLocaleTimeString(), // Hora atual como exemplo
      };
      setAppointments([...appointments, newAppointment]);
      setQueue([...queue, newAppointment]);
      // Limpa os campos após agendamento
      setClientName('');
      setSelectedService('');
      setSelectedBarber('');
      setSelectedPeriod('');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const services = await AsyncStorage.getItem('services');
        const barbers = await AsyncStorage.getItem('barbers');
        if (services) setServicesList(JSON.parse(services));
        if (barbers) setBarbersList(JSON.parse(barbers));
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      }
    };
    loadData();
  }, []);  

  // Função para remover um agendamento com confirmação
  const handleRemoveAppointment = (index) => {
    Alert.alert('Confirmação', 'Você tem certeza que deseja remover este agendamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        onPress: () => {
          setAppointments(appointments.filter((_, i) => i !== index));
          setQueue(queue.filter((_, i) => i !== index));
        },
      },
    ]);
  };

  // Função para passar a vez na fila
  const handlePassQueue = () => {
    if (queue.length > 1) {
      setQueue((prevQueue) => {
        const updatedQueue = [...prevQueue];
        const passedClient = updatedQueue.shift(); // Remove o primeiro da fila
        updatedQueue.push(passedClient); // Coloca no final
        return updatedQueue;
      });
    }
  };

  // Função para concluir o serviço
  const handleCompleteAppointment = (index) => {
    const completedAppointment = appointments[index];
    // Salva no arquivo Excel (essa parte será conectada depois com o armazenamento real)
    saveAppointmentToExcel(completedAppointment);
    // Remove o agendamento da lista
    setAppointments(appointments.filter((_, i) => i !== index));
  };

  // Função para salvar no Excel (exemplo)
  const saveAppointmentToExcel = (appointment) => {
    const data = `
      Nome: ${appointment.clientName},
      Serviço: ${appointment.service},
      Barbeiro: ${appointment.barber},
      Período: ${appointment.period},
      Horário: ${appointment.time}\n`;

    FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'appointments.csv', data, {
      encoding: FileSystem.EncodingType.UTF8,
    })
      .then(() => alert('Serviço concluído e salvo com sucesso!'))
      .catch((err) => console.log(err));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agendamentos</Text>

      {/* Campo para nome do cliente */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Cliente"
        value={clientName}
        onChangeText={setClientName}
      />

      {/* Selecionar serviço */}
      <Picker
        selectedValue={selectedService}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedService(itemValue)}
      >
        <Picker.Item label="Selecione o Serviço" value="" />
        <Picker.Item label="Corte Masculino" value="Corte Masculino" />
        <Picker.Item label="Barba" value="Barba" />
        <Picker.Item label="Corte + Barba" value="Corte + Barba" />
      </Picker>

      {/* Selecionar barbeiro */}
      <Picker
        selectedValue={selectedBarber}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedBarber(itemValue)}
      >
        <Picker.Item label="Selecione o Barbeiro" value="" />
        <Picker.Item label="João" value="João" />
        <Picker.Item label="Carlos" value="Carlos" />
        <Picker.Item label="Lucas" value="Lucas" />
      </Picker>

      {/* Selecionar período */}
      <Picker
        selectedValue={selectedPeriod}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
      >
        <Picker.Item label="Selecione o Período" value="" />
        <Picker.Item label="Manhã" value="Manhã" />
        <Picker.Item label="Tarde" value="Tarde" />
        <Picker.Item label="Noite" value="Noite" />
      </Picker>

      {/* Botão para marcar */}
      <TouchableOpacity style={styles.button} onPress={handleSchedule}>
        <Text style={styles.buttonText}>Marcar</Text>
      </TouchableOpacity>

      {/* Exibir agendamentos */}
      <Text style={styles.subtitle}>Agendamentos</Text>
      {appointments.map((appointment, index) => (
        <View key={index} style={styles.appointment}>
          <Text>{`${appointment.clientName} às ${appointment.time}`}</Text>
          <Text style={styles.moreInfo}> {'>'} Ver mais informações </Text>
          <View style={styles.appointmentButtons}>
            <Button title="Passar Fila" onPress={handlePassQueue} />
            <Button title="Remover" onPress={() => handleRemoveAppointment(index)} />
            <Button title="Concluir" onPress={() => handleCompleteAppointment(index)} />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

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
                height: 90,
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

export default function App() {
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

// Estilos CSS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});