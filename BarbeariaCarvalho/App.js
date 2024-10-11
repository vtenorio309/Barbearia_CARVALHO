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
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [barber, setBarber] = useState('');
  const [servicesList, setServicesList] = useState([]);
  const [barbersList, setBarbersList] = useState([]);
  const [morningHours, setMorningHours] = useState(''); // Horário de funcionamento da manhã
  const [afternoonHours, setAfternoonHours] = useState(''); // Horário de funcionamento da tarde
  const [eveningHours, setEveningHours] = useState(''); // Horário de funcionamento da noite

  useEffect(() => {
    const loadData = async () => {
      try {
        const services = await AsyncStorage.getItem('services');
        const barbers = await AsyncStorage.getItem('barbers');
        const hours = await AsyncStorage.getItem('workingHours');
        if (services) setServicesList(JSON.parse(services));
        if (barbers) setBarbersList(JSON.parse(barbers));
        if (hours) {
          const { morning, afternoon, evening } = JSON.parse(hours);
          setMorningHours(morning);
          setAfternoonHours(afternoon);
          setEveningHours(evening);
        }
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      }
    };
    loadData();
  }, []);

  // Função para salvar dados localmente
  const saveData = async () => {
    try {
      await AsyncStorage.setItem('services', JSON.stringify(servicesList));
      await AsyncStorage.setItem('barbers', JSON.stringify(barbersList));
      const workingHours = { morning: morningHours, afternoon: afternoonHours, evening: eveningHours };
      await AsyncStorage.setItem('workingHours', JSON.stringify(workingHours));
    } catch (e) {
      console.error("Erro ao salvar dados", e);
    }
  };

  // Adicionar serviço
  const addService = () => {
    if (service && price && duration) {
      const newService = { name: service, price, duration };
      setServicesList([...servicesList, newService]);
      setService('');
      setPrice('');
      setDuration('');
      saveData();
    } else {
      Alert.alert('Erro', 'Preencha todos os campos do serviço');
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
        placeholder="Nome do Serviço"
        value={service}
        onChangeText={setService}
      />
      <TextInput
        style={styles.input}
        placeholder="Preço do Serviço"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />
      <TextInput
        style={styles.input}
        placeholder="Duração (minutos)"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />
      
      <Button title="Adicionar Serviço" onPress={addService} />
      
      <Text style={styles.subtitle}>Serviços</Text>
      {servicesList.map((service, index) => (
        <View key={index} style={styles.listItem}>
          <Text>{service.name} - R${service.price} - {service.duration} min</Text>
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

    <Text style={styles.subtitle}>Horários de Funcionamento</Text>

    {/* Definir horário da manhã */}
    <View style={styles.periodContainer}>
      <Text style={styles.periodTitle}>Manhã</Text>
      <TextInput
        style={styles.input}
        placeholder="Horário Inicial (Ex: 7:30)"
        value={morningHours.start}
        onChangeText={(text) => setMorningHours({ ...morningHours, start: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Horário Final (Ex: 12:00)"
        value={morningHours.end}
        onChangeText={(text) => setMorningHours({ ...morningHours, end: text })}
      />
    </View>

    {/* Definir horário da tarde */}
    <View style={styles.periodContainer}>
      <Text style={styles.periodTitle}>Tarde</Text>
      <TextInput
        style={styles.input}
        placeholder="Horário Inicial (Ex: 13:00)"
        value={afternoonHours.start}
        onChangeText={(text) => setAfternoonHours({ ...afternoonHours, start: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Horário Final (Ex: 17:30)"
        value={afternoonHours.end}
        onChangeText={(text) => setAfternoonHours({ ...afternoonHours, end: text })}
      />
    </View>

    {/* Definir horário da noite */}
    <View style={styles.periodContainer}>
      <Text style={styles.periodTitle}>Noite</Text>
      <TextInput
        style={styles.input}
        placeholder="Horário Inicial (Ex: 18:00)"
        value={eveningHours.start}
        onChangeText={(text) => setEveningHours({ ...eveningHours, start: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Horário Final (Ex: 21:00)"
        value={eveningHours.end}
        onChangeText={(text) => setEveningHours({ ...eveningHours, end: text })}
      />
    </View>

      <Button title="Salvar Horários" onPress={saveData} />
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
    const pathToFile = `${FileSystem.documentDirectory}relatorio_servicos.xlsx`;

    try {
      const fileData = await FileSystem.readAsStringAsync(pathToFile, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const workbook = XLSX.read(fileData, { type: 'base64' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

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
      const month = itemDate.getMonth() + 1;   // Mês do item (0-indexado)
      const year = itemDate.getFullYear();     // Ano do item
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
  
    if (!chartsData || !chartsData.clientes || !chartsData.faturamento) {
      return <Text>Não há dados suficientes para gerar gráficos.</Text>;
    }

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
  const [queue, setQueue] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [barbersList, setBarbersList] = useState([]);
  const [periods, setPeriods] = useState(['Manhã', 'Tarde', 'Noite']);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const services = await AsyncStorage.getItem('services');
        const barbers = await AsyncStorage.getItem('barbers');
        const hours = await AsyncStorage.getItem('workingHours');
        if (services) setServicesList(JSON.parse(services));
        if (barbers) setBarbersList(JSON.parse(barbers));
        if (hours) {
          const { morning, afternoon, evening } = JSON.parse(hours);
          setPeriods([`Manhã: ${morning}`, `Tarde: ${afternoon}`, `Noite: ${evening}`]);
        }
      } catch (e) {
        console.error("Erro ao carregar dados", e);
      }
    };
    loadData();
  }, []);

  const calculateNextAvailableTime = (lastTime, duration) => {
    const [hours, minutes] = lastTime.split(':').map(Number);
    let nextMinutes = minutes + parseInt(duration);
    let nextHours = hours;
  
    if (nextMinutes >= 60) {
      nextHours += Math.floor(nextMinutes / 60);
      nextMinutes = nextMinutes % 60;
    }
  
    return `${nextHours}:${nextMinutes < 10 ? '0' : ''}${nextMinutes}`;
  };  

  const handleSchedule = () => {
    if (clientName && selectedService && selectedBarber && selectedPeriod && day && month) {
      const currentYear = new Date().getFullYear();
      const appointmentDate = `${day}/${month}/${currentYear}`;
      
      // Define os horários de início e fim para o período selecionado
      const periodHours = {
        'Manhã': periods[0].split(': ')[1],
        'Tarde': periods[1].split(': ')[1],
        'Noite': periods[2].split(': ')[1],
      };
      
      const [start, end] = periodHours[selectedPeriod].split('-');
      let nextAvailableTime = start;
  
      // Calcula o próximo horário disponível baseado nos agendamentos anteriores
      if (queue.length > 0) {
        const lastAppointment = queue[queue.length - 1];
        const serviceDuration = servicesList.find(service => service.name === selectedService).duration;
        nextAvailableTime = calculateNextAvailableTime(lastAppointment.time, serviceDuration);
        
        // Verifica se o próximo horário disponível ultrapassa o limite do período
        if (nextAvailableTime > end) {
          alert('Não é possível agendar, o horário disponível excede o limite do período.');
          return;
        }
      }
  
      // Cria o novo agendamento com o horário disponível
      const newAppointment = {
        clientName,
        service: selectedService,
        barber: selectedBarber,
        period: selectedPeriod,
        time: nextAvailableTime,
        date: appointmentDate,
      };
  
      // Atualiza os estados e limpa os campos
      setAppointments([...appointments, newAppointment]);
      setQueue([...queue, newAppointment]);
      setClientName('');
      setSelectedService('');
      setSelectedBarber('');
      setSelectedPeriod('');
      setDay('');
      setMonth('');
    } else {
      alert("Por favor, preencha todos os campos antes de marcar.");
    }
  };
  
  
  

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

  const handlePassQueue = () => {
    if (queue.length > 1) {
      setQueue((prevQueue) => {
        const updatedQueue = [...prevQueue];
        const passedClient = updatedQueue.shift();
        updatedQueue.push(passedClient);
        return updatedQueue;
      });
    }
  };

  const handleCompleteAppointment = (index) => {
    const completedAppointment = appointments[index];
    const { clientName, service, barber, period, date } = completedAppointment;
    const price = servicesList.find(s => s.name === service)?.price || 0;

    const data = `
      Nome: ${clientName},
      Serviço: ${service},
      Barbeiro: ${barber},
      Período: ${period},
      Data: ${date},
      Preço: R$${price}\n`;

    FileSystem.writeAsStringAsync(FileSystem.documentDirectory + 'appointments.csv', data, {
      encoding: FileSystem.EncodingType.UTF8,
    })
      .then(() => alert('Serviço concluído e salvo com sucesso!'))
      .catch((err) => console.log(err));

    setAppointments(appointments.filter((_, i) => i !== index));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agendamentos</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Cliente"
        value={clientName}
        onChangeText={setClientName}
      />

      <Picker
        selectedValue={selectedService}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedService(itemValue)}
      >
        <Picker.Item label="Selecione o Serviço" value="" />
        {servicesList.map((service, index) => (
          <Picker.Item key={index} label={service.name} value={service.name} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedBarber}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedBarber(itemValue)}
      >
        <Picker.Item label="Selecione o Barbeiro" value="" />
        {barbersList.map((barber, index) => (
          <Picker.Item key={index} label={barber} value={barber} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedPeriod}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
      >
        <Picker.Item label="Selecione o Período" value="" />
        {periods.map((period, index) => (
          <Picker.Item key={index} label={period} value={period} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Dia (Ex: 12)"
        keyboardType="numeric"
        value={day}
        onChangeText={setDay}
      />

      <Picker
        selectedValue={month}
        style={styles.picker}
        onValueChange={(itemValue) => setMonth(itemValue)}
      >
        <Picker.Item label="Selecione o Mês" value="" />
        <Picker.Item label="Janeiro" value="1" />
        <Picker.Item label="Fevereiro" value="2" />
        <Picker.Item label="Março" value="3" />
        <Picker.Item label="Abril" value="4" />
        {/* Adicionar mais meses */}
      </Picker>

      <TouchableOpacity style={styles.button} onPress={handleSchedule}>
        <Text style={styles.buttonText}>Marcar</Text>
      </TouchableOpacity>

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
  // Estilo geral da aplicação
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  
  // Títulos principais
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },

  // Subtítulos (usado para pequenos títulos ou descrições)
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },

  // Campo de seleção de data (mês e ano)
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  // Botão para gerar relatórios
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Estilos dos títulos de gráficos
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },

  // Estilos dos gráficos
  chart: {
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Estilo para listagem de informações (UserHomeScreen)
  listItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  
  // Estilo para o campo de nome do cliente
  inputField: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 12,
  },

  // Estilos para relatórios e gráficos
  reportSection: {
    marginTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reportText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
});