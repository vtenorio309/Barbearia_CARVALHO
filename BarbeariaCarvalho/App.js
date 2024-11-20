import React, { useState, useEffect } from 'react'; // Certifique-se de importar useState e useEffect
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit'; // Para os gráficos
import AsyncStorage from 'expo-sqlite/kv-store';
import * as FileSystem from 'expo-file-system'; // Para manipulação de arquivos
import * as SQLite from 'expo-sqlite';


function AdminHomeScreen() {
  const [service, setService] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [barber, setBarber] = useState('');
  const [servicesList, setServicesList] = useState([]);
  const [barbersList, setBarbersList] = useState([]);
  const [morningHours, setMorningHours] = useState({ start: '', end: '' });
  const [afternoonHours, setAfternoonHours] = useState({ start: '', end: '' });
  const [eveningHours, setEveningHours] = useState({ start: '', end: '' });

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

  const addBarber = () => {
    if (barber) {
      setBarbersList([...barbersList, barber]);
      setBarber('');
      saveData();
    }
  };

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

  function validateTime(time) {
    const regex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  }

  return (
    <ScrollView style={styles.container}>
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
      <TouchableOpacity style={styles.adicionarButton} onPress={addService}>
        <Text style={styles.buttonText}>Adicionar Serviço</Text>
      </TouchableOpacity>
      
      <Text style={styles.subtitle}>Serviços</Text>
      {servicesList.map((service, index) => (
        <View key={index} style={styles.listItem}>
          <Text>{service.name} - R${service.price} - {service.duration} min</Text>
          <TouchableOpacity style={styles.removeButton} onPress={() => removeService(index)}>
            <Text style={styles.buttonText}>Remover</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Adicionar Barbeiro */}
      <TextInput
        style={styles.input}
        placeholder="Nome do Barbeiro"
        value={barber}
        onChangeText={setBarber}
      />
      <TouchableOpacity style={styles.adicionarButton} onPress={addBarber}>
        <Text style={styles.buttonText}>Adicionar Barbeiro</Text>
      </TouchableOpacity>
      
      <Text style={styles.subtitle}>Barbeiros</Text>
      {barbersList.map((barber, index) => (
        <View key={index} style={styles.listItem}>
          <Text>{barber}</Text>
          <TouchableOpacity style={styles.removeButton} onPress={() => removeBarber(index)}>
            <Text style={styles.buttonText}>Remover</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Horários de Funcionamento */}
      <Text style={styles.subtitle}>Horários de Funcionamento</Text>

      {/* Manhã */}
      <View style={styles.periodContainer}>
        <Text style={styles.periodTitle}>Manhã</Text>
        <View style={styles.timeInputContainer}>
        <TextInput
          style={[styles.input, !validateTime(morningHours.start) && styles.error]}
          placeholder="Horário Inicial (Ex: 07:30)"
          //keyboardType="numeric"
          value={morningHours.start}
          onChangeText={(text) => setMorningHours({ ...morningHours, start: text })}
        />
        <TextInput
          style={[styles.input, !validateTime(morningHours.start) && styles.error]}
          placeholder="Horário Final (Ex: 12:00)"
          //keyboardType="numeric"
          value={morningHours.end}
          onChangeText={(text) => setMorningHours({ ...morningHours, end: text })}
        />
        </View>
      </View>

      {/* Tarde */}
      <View style={styles.periodContainer}>
        <Text style={styles.periodTitle}>Tarde</Text>
        <View style={styles.timeInputContainer}>
        <TextInput
          style={[styles.input, !validateTime(morningHours.start) && styles.error]}
          placeholder="Horário Inicial (Ex: 13:00)"
          //keyboardType="numeric"
          value={afternoonHours.start}
          onChangeText={(text) => setAfternoonHours({ ...afternoonHours, start: text })}
        />
        <TextInput
          style={[styles.input, !validateTime(morningHours.start) && styles.error]}
          placeholder="Horário Final (Ex: 17:30)"
          //keyboardType="numeric"
          value={afternoonHours.end}
          onChangeText={(text) => setAfternoonHours({ ...afternoonHours, end: text })}
        />
        </View>
      </View>

      {/* Noite */}
      <View style={styles.periodContainer}>
        <Text style={styles.periodTitle}>Noite</Text>
        <View style={styles.timeInputContainer}>
        <TextInput
          style={[styles.input, !validateTime(morningHours.start) && styles.error]}
          placeholder="Horário Inicial (Ex: 18:00)"
          //keyboardType="numeric"
          value={eveningHours.start}
          onChangeText={(text) => setEveningHours({ ...eveningHours, start: text })}
        />
        <TextInput
          style={[styles.input, !validateTime(morningHours.start) && styles.error]}
          placeholder="Horário Final (Ex: 21:00)"
          //keyboardType="numeric"
          value={eveningHours.end}
          onChangeText={(text) => setEveningHours({ ...eveningHours, end: text })}
        />
        </View>
      </View>
      <TouchableOpacity style={styles.adicionarButton} onPress={saveData}>
        <Text style={styles.buttonText}>Salvar Horários</Text>
      </TouchableOpacity>
    </ScrollView>
  );  
}


// === AdminReportScreen ===
const AdminReportScreen = () => {
  const [years, setYears] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [chartsData, setChartsData] = useState(null);

  useEffect(() => {
    const loadFiltersAndData = async () => {
      await loadUniqueFilterValues();
      await updateChartData();
    };
    loadFiltersAndData();
  }, [selectedYear, selectedBarber, selectedPeriod]);

  const loadUniqueFilterValues = async () => {
    try {
      const uniqueYears = await queryUniqueValues('year');
      const uniqueBarbers = await queryUniqueValues('barber');
      const uniquePeriods = await queryUniqueValues('period');
      setYears(uniqueYears || []);
      setBarbers(uniqueBarbers || []);
      setPeriods(uniquePeriods || []);
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
    }
  };

  const queryUniqueValues = (column) => {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT DISTINCT ${column} FROM appointments`,
          [],
          (_, { rows }) => resolve(rows._array.map(item => item[column])),
          (_, error) => reject(error)
        );
      });
    });
  };

  const updateChartData = async () => {
    try {
      const filteredData = await queryFilteredData();
      if (filteredData.length === 0) {
        setChartsData(null);
        return;
      }

      const totalRevenue = filteredData.reduce((sum, item) => sum + item.price, 0);
      const totalClients = filteredData.length;

      const servicePopularity = {};
      const barberPerformance = {};
      const periodDistribution = { Manhã: 0, Tarde: 0, Noite: 0 };

      filteredData.forEach(item => {
        servicePopularity[item.service] = (servicePopularity[item.service] || 0) + 1;
        barberPerformance[item.barber] = (barberPerformance[item.barber] || 0) + 1;
        periodDistribution[item.period] += 1;
      });

      setChartsData({
        revenue: totalRevenue,
        clients: totalClients,
        popularService: Object.keys(servicePopularity).reduce((a, b) => servicePopularity[a] > servicePopularity[b] ? a : b),
        servicePopularity,
        barberPerformance,
        periodDistribution
      });
    } catch (error) {
      console.error('Erro ao atualizar os dados dos gráficos:', error);
    }
  };

  const queryFilteredData = () => {
    return new Promise((resolve, reject) => {
      const filters = [];
      if (selectedYear) filters.push(`year = ${selectedYear}`);
      if (selectedBarber) filters.push(`barber = '${selectedBarber}'`);
      if (selectedPeriod) filters.push(`period = '${selectedPeriod}'`);

      const query = `SELECT * FROM appointments ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}`;
      
      db.transaction(tx => {
        tx.executeSql(
          query,
          [],
          (_, { rows }) => resolve(rows._array),
          (_, error) => reject(error)
        );
      });
    });
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Relatórios da Barbearia</Text>

      <Text style={{ marginTop: 10 }}>Ano:</Text>
      <Picker selectedValue={selectedYear} onValueChange={setSelectedYear}>
        <Picker.Item label="Selecione o Ano" value="" />
        {years.map(year => <Picker.Item key={year} label={year.toString()} value={year.toString()} />)}
      </Picker>

      <Text style={{ marginTop: 10 }}>Barbeiro:</Text>
      <Picker selectedValue={selectedBarber} onValueChange={setSelectedBarber}>
        <Picker.Item label="Selecione o Barbeiro" value="" />
        {barbers.map(barber => <Picker.Item key={barber} label={barber} value={barber} />)}
      </Picker>

      <Text style={{ marginTop: 10 }}>Período:</Text>
      <Picker selectedValue={selectedPeriod} onValueChange={setSelectedPeriod}>
        <Picker.Item label="Selecione o Período" value="" />
        {periods.map(period => <Picker.Item key={period} label={period} value={period} />)}
      </Picker>

      {chartsData ? (
        <View style={{ marginTop: 20 }}>
          <Text>Faturamento Total: R${chartsData.revenue.toFixed(2)}</Text>
          <Text>Total de Clientes: {chartsData.clients}</Text>
          <Text>Serviço Mais Popular: {chartsData.popularService}</Text>

          <BarChart
            data={{
              labels: Object.keys(chartsData.servicePopularity),
              datasets: [{ data: Object.values(chartsData.servicePopularity) }],
            }}
            width={300}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#FB8C00',
              backgroundGradientTo: '#FFA726',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
          />

          <PieChart
            data={Object.keys(chartsData.barberPerformance).map((barber, index) => ({
              name: barber,
              population: chartsData.barberPerformance[barber],
              color: ['#F39C12', '#3498DB', '#2ECC71'][index % 3],
              legendFontColor: '#7F8C8D',
              legendFontSize: 15,
            }))}
            width={300}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />

          <LineChart
            data={{
              labels: Object.keys(chartsData.periodDistribution),
              datasets: [{ data: Object.values(chartsData.periodDistribution) }],
            }}
            width={300}
            height={220}
            chartConfig={{
              backgroundGradientFrom: '#022173',
              backgroundGradientTo: '#1E2923',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
          />
        </View>
      ) : (
        <Text style={{ marginTop: 20 }}>Nenhum dado disponível para exibir no momento.</Text>
      )}
    </ScrollView>
  );
};

const db = await SQLite.openDatabaseAsync('barbearia.db');

// Tela de agendamentos para usuários
function UserHomeScreen() {
  const [db, setDb] = useState(null);
  const [clientName, setClientName] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [queue, setQueue] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [barbersList, setBarbersList] = useState([]);
  const [periods, setPeriods] = useState(['Manhã', 'Tarde', 'Noite']);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  async function setupDatabase() {
    try {
      await db.transaction(async tx => {
        await tx.executeSql(
          `CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clientName TEXT,
            day INTEGER,
            month INTEGER,
            year INTEGER,
            time TEXT,
            period TEXT,
            service TEXT,
            barber TEXT,
            price REAL,
            concluido BOOLEAN DEFAULT 0
          );`,
          []
        );
      });
      console.log("Tabela 'appointments' criada com sucesso.");
    } catch (error) {
      console.error("Erro ao criar a tabela:", error);
    }
  }

  useEffect(() => {
    setupDatabase();
    loadAppointments();
    loadData();
  }, []);

    // Função para carregar agendamentos do banco de dados
    const loadAppointments = async () => {
      try {
        await db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM appointments WHERE concluido = 0 ORDER BY time ASC;',
            [],
            (_, { rows: { _array } }) => {
              setAppointments(_array);
              setQueue(sortQueue(_array));
            },
            (_, error) => {
              console.error('Error fetching appointments:', error);
            }
          );
        });
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

  const loadData = () => {
    AsyncStorage.getItem('services')
      .then(services => {
        if (services) setServicesList(JSON.parse(services));
      })
      .catch(e => console.error("Erro ao carregar serviços", e));

    AsyncStorage.getItem('barbers')
      .then(barbers => {
        if (barbers) setBarbersList(JSON.parse(barbers));
      })
      .catch(e => console.error("Erro ao carregar barbeiros", e));

    AsyncStorage.getItem('workingHours')
      .then(hours => {
        if (hours) {
          const { morning, afternoon, evening } = JSON.parse(hours);
          setPeriods([
            { label: 'Manhã', start: morning.start, end: morning.end },
            { label: 'Tarde', start: afternoon.start, end: afternoon.end },
            { label: 'Noite', start: evening.start, end: evening.end },
          ]);
        }
      })
      .catch(e => console.error("Erro ao carregar horários", e));
  };
//
 // useEffect(() => {
  //  db.transaction((tx) => {
   //   tx.executeSql('SELECT * FROM appointments', [], (_, { rows }) => {
   //     console.log('Dados do banco de dados:', rows._array);
   //   });
   // });
 // }, []);
//

  const handleCompleteAppointment = (appointmentId) => {
    if (!appointmentId) {
      console.error("ID do agendamento inválido");
      return;
    }
  
    // Atualizar o agendamento existente para "concluído"
    db.transaction(tx => {
      tx.executeSql(
        `UPDATE appointments SET concluido = 1 WHERE id = ?`,
        [appointmentId],
        () => {
          console.log('Agendamento concluído com sucesso');
        },
        (_txObj, error) => console.error('Erro ao concluir serviço', error)
      );
    });
  };
  

  const calculateAvailableTimes = () => {
    if (!selectedService || !selectedPeriod) return;
    const service = servicesList.find(s => s.name === selectedService);
    const periodDetails = periods.find(p => p.label === selectedPeriod);
    if (!service || !periodDetails) return;
  
    const serviceDuration = parseInt(service.duration, 10);
    const { start, end } = periodDetails;
  
    const startHour = parseInt(start.split(':')[0], 10);
    const startMinute = parseInt(start.split(':')[1], 10);
    const endHour = parseInt(end.split(':')[0], 10);
    const endMinute = parseInt(end.split(':')[1], 10);
  
    let availableSlots = [];
    let currentHour = startHour;
    let currentMinute = startMinute;
  
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
      // Check if appointment already exists at this time
      const isOccupied = appointments.some(appointment => {
        const appointmentHour = parseInt(appointment.time.split(':')[0], 10);
        const appointmentMinute = parseInt(appointment.time.split(':')[1], 10);
        return (appointmentHour === currentHour && appointmentMinute === currentMinute);
      });
  
      if (!isOccupied) {
        availableSlots.push(time);
      }
  
      // Increment time based on service duration (adjust for minute increments)
      currentMinute += serviceDuration;
      if (currentMinute >= 60) {
        currentMinute -= 60;
        currentHour++;
      }
    }
  
    setAvailableTimes(availableSlots);
  };

  useEffect(() => {
    calculateAvailableTimes();
  }, [selectedService, selectedPeriod, date]);

  const handleSchedule = async () => {
    if (clientName && selectedService && selectedBarber && selectedPeriod && selectedTime) {
      const newAppointment = {
        clientName,
        service: selectedService,
        barber: selectedBarber,
        period: selectedPeriod,
        time: selectedTime,
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        concluido: 0,
      };
  
      try {
        // Open database connection (handle potential errors)
        const db = await SQLite.openDatabaseAsync('appointments.db');
  
        // Execute SQL statement with async/await for clarity
        await db.transactionAsync(tx => {
          tx.executeSql(
            `INSERT INTO appointments (clientName, service, barber, period, time, day, month, year, concluido) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [clientName, selectedService, selectedBarber, selectedPeriod, selectedTime, newAppointment.day, newAppointment.month, newAppointment.year, 0]
          );
        });
        // Update appointments state with the new appointment
        setAppointments([...appointments, { id: result.insertId, ...newAppointment }]);
  
        // Update queue state if applicable (modify if needed)
        setQueue(sortQueue([...queue, newAppointment]));
  
        // Clear user input fields
        setClientName('');
        setSelectedService('');
        setSelectedBarber('');
        setSelectedPeriod('');
        setSelectedTime('');
      } catch (error) {
        console.error('Error inserting appointment:', error);
        // Handle errors appropriately (e.g., display an alert message)
      } finally {
        // Close database connection (optional for Expo SQLite)
        // db.close(); // Consider closing if needed for specific use cases
      }
    } else {
      alert("Por favor, preencha todos os campos antes de marcar.");
    }
  };
  

  const sortQueue = (queue) => {
    return [...queue].sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1, a.day, ...a.time.split(':').map(Number));
      const dateB = new Date(b.year, b.month - 1, b.day, ...b.time.split(':').map(Number));
  
      // Comparar pela data (ano, mês, dia)
      if (dateA < dateB) return -1;
      if (dateA > dateB) return 1;
  
      // Se as datas forem iguais, comparar pelo período ("Manhã" < "Tarde" < "Noite")
      const periodOrder = { 'Manhã': 1, 'Tarde': 2, 'Noite': 3 };
      if (periodOrder[a.period] !== periodOrder[b.period]) {
        return periodOrder[a.period] - periodOrder[b.period];
      }
  
      // Se data e período forem iguais, comparar pela hora (HH:MM)
      const timeA = parseInt(a.time.split(':')[0], 10) * 60 + parseInt(a.time.split(':')[1], 10);
      const timeB = parseInt(b.time.split(':')[0], 10) * 60 + parseInt(b.time.split(':')[1], 10);
      return timeA - timeB;
    });
  };

  const handleRemoveAppointment = async (index) => {
    const appointmentToRemove = appointments[index];
    if (!appointmentToRemove || !appointmentToRemove.id) {
      console.error('Agendamento não encontrado ou ID inválido');
      return;
    }
  
    Alert.alert('Confirmação', 'Você tem certeza que deseja remover este agendamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        onPress: async () => {
          try {
            await db.transactionAsync(tx => {
              tx.executeSql(
                `DELETE FROM appointments WHERE id = ?`,
                [appointmentToRemove.id]
              );
            });
            console.log('Agendamento removido com sucesso');
            const updatedAppointments = appointments.filter((_, i) => i !== index);
            setAppointments(updatedAppointments);
            setQueue(sortQueue(updatedAppointments));
          } catch (error) {
            console.error('Erro ao remover agendamento', error);
          }
        },
      },
    ]);
  };
  

  // Função para passar a vez
  const handlePassQueue = () => {
    if (queue.length > 1) {
      setQueue((prevQueue) => {
        const newQueue = [...prevQueue];
        
        // Pega o primeiro e o segundo cliente na fila
        const firstClient = { ...newQueue[0] };
        const secondClient = { ...newQueue[1] };
  
        // O primeiro cliente assume o horário do segundo
        firstClient.time = secondClient.time;
  
        // O segundo cliente assume o horário do primeiro
        secondClient.time = calculateNextAvailableSlot(secondClient.time, parseInt(firstClient.service.duration));
  
        // Atualiza a fila com os novos horários
        newQueue[0] = firstClient;
        newQueue[1] = secondClient;
  
        // Reordena a fila para manter a ordem correta
        return sortQueue(newQueue);
      });
    } else {
      alert('Não há mais clientes na fila para passar a vez.');
    }
  };  

  return (
    <ScrollView style={styles.container}>
      <TextInput placeholder="  Nome do Cliente" style={styles.picker} value={clientName} onChangeText={setClientName} />
      <Picker selectedValue={selectedService} style={styles.picker} onValueChange={setSelectedService}>
        <Picker.Item label="Selecione o Serviço" value="" />
        {servicesList.map((service, index) => (
          <Picker.Item key={index} label={service.name} value={service.name} />
        ))}
      </Picker>
      <Picker selectedValue={selectedBarber} style={styles.picker} onValueChange={setSelectedBarber}>
        <Picker.Item label="Selecione o Barbeiro" value="" />
        {barbersList.map((barber, index) => (
          <Picker.Item key={index} label={barber} value={barber} />
        ))}
      </Picker>


      <Picker selectedValue={selectedPeriod} style={styles.picker} onValueChange={setSelectedPeriod}>
        <Picker.Item label="Selecione o Período" value="" />
        {periods.map((period, index) => (
          <Picker.Item key={index} label={`${period.label}: ${period.start} - ${period.end}`} value={period.label} />
        ))}
      </Picker>

      {selectedPeriod && availableTimes.length > 0 && (
        <Picker selectedValue={selectedTime} style={styles.picker} onValueChange={setSelectedTime}>
          <Picker.Item label="Selecione o Horário" value="" />
          {availableTimes.map((time, index) => (
            <Picker.Item key={index} label={time} value={time} />
          ))}
        </Picker>
      )}

      <View style={styles.dateBox}>
        <Text style={styles.dateText}>Data Selecionada:</Text>
        <TouchableOpacity style={styles.dateContainer} onPress={setShowDatePicker}>
          <AntDesign name="calendar" size={34} color="#333" />
          <Text>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
      <DateTimePicker
        value={date}
        mode="date"
        display="calendar"
        onChange={(_, selectedDate) => {
          setShowDatePicker(false); // Fecha o picker ao selecionar a data
          if (selectedDate) {
            setDate(selectedDate); // Atualiza a data
          }
        }}
      />
    )}


      <TouchableOpacity style={styles.button} onPress={handleSchedule}>
        <Text style={styles.buttonText}>Marcar</Text>
      </TouchableOpacity>

      <Text style={styles.subtitle}>Agendamentos</Text>
      {appointments.map((appointment) => (
        <View key={appointment.id} style={styles.appointment}>
          <Text>{`${appointment.clientName} às ${appointment.time}`}</Text>
          <Text style={styles.moreInfo}> {'>'} Ver mais informações </Text>
          <View style={styles.appointmentButtons}>
            <TouchableOpacity style={styles.agendButton} onPress={() => handlePassQueue(appointment.id)}>
              <Text style={styles.buttonText}>Passar Fila</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.agendButton} onPress={() => handleRemoveAppointment(appointment.id)}>
              <Text style={styles.buttonText}>Remover</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.agendButton} onPress={() => handleCompleteAppointment(appointment.id)}>
              <Text style={styles.buttonText}>Concluir</Text>
            </TouchableOpacity>
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
                marginBottom: -10,
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
    backgroundColor: '#f2f2f2', // Light gray background
    padding: 12,
    flexDirection: 'column',
  },

  // Títulos principais
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#c02942', // Deep red for main title
    marginBottom: 16,
    textAlign: 'center',
  },

  // Subtítulos
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#c02942', // Deep red for subtitles
    marginBottom: 12,
    textAlign: 'left',
  },

  periodContainer: {
    marginBottom: -8,
    marginTop: -14,
    width: '100%',
    padding: 8,
  },

  adicionarButton: {
    backgroundColor: 'green', // Deep red for buttons
    padding: 15, // Adjust padding for button size preference
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  periodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#c02942',
    textAlign: 'center',
  },

  timeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  // Campo de entrada
  input: {
    borderWidth: 1,
    borderColor: '#c02942', // Deep red border
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff', // White background
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },

  // Campo de seleção (if applicable)
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#c02942',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
  },

  // Botões
  button: {
    backgroundColor: '#c02942', // Deep red for buttons
    padding: 15, // Adjust padding for button size preference
    borderRadius: 25,
    alignItems: 'center',
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Estilo para listagem de informações
  listItem: {
    borderWidth: 1,
    backgroundColor: '#f5f5f5', // Light gray background
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  removeButton: {
    backgroundColor: '#c02942', // Deep red for "remove" button
    padding: 8,
    borderRadius: 8,
  },

  listItemText: {
    fontSize: 16,
    color: '#333', // Dark gray text
  },

  // Estilo para o campo de nome do cliente (if applicable)
  inputField: {
    borderWidth: 1,
    borderColor: '#c02942',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 12,
  },

  // Estilo para listagem de informações (appointments)
  appointment: {
    borderWidth: 1,
    backgroundColor: '#f5f5f5', // Light gray background
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  appointmentText: {
    fontSize: 16,
    color: '#333', // Dark gray text
  },

  moreInfo: {
    fontSize: 14,
    color: '#c02942', // Deep red for "more info" text
  },

    // Estilo para os botões de ação
    agendButton: {
      backgroundColor: '#64B5F6', // cor principal para os botões
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginVertical: 5,
      borderRadius: 8,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 3,
    },

  appointmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },

  // Estilo para data selecionada
  dateContainer: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },

  dateBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 3,
  },

  dateText: {
    fontSize: 16,
    textAlign: 'center', // Centraliza o texto
    marginBottom: 5, // Adiciona um espaço abaixo do texto
  },
});