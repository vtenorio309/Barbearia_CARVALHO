import React, { useState, useEffect } from 'react'; // Certifique-se de importar useState e useEffect
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from "react-native-gifted-charts";
import * as FileSystem from 'expo-file-system';
import * as SQlite from 'expo-sqlite/legacy';


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

const db = SQlite.openDatabase('barbearia.db');

// === AdminReportScreen ===
const AdminReportScreen = () => {
  const [month, setMonth] = useState('Todos'); // Filtro de mês
  const [year, setYear] = useState(new Date().getFullYear().toString()); // Filtro de ano
  const [barber, setBarber] = useState('Todos'); // Filtro de barbeiro
  const [service, setService] = useState('Todos'); // Filtro de serviço
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [barbersList, setBarbersList] = useState([]); // Lista de barbeiros
  const [servicesList, setServicesList] = useState([]); // Lista de serviços

  useEffect(() => {
    loadBarbersAndServices(); // Carrega barbeiros e serviços do banco
    loadReportData(); // Carrega dados para os gráficos
  }, [month, year, barber, service]);

  // Função para carregar os barbeiros e serviços
  const loadBarbersAndServices = () => {
    db.transaction(tx => {
      // Carregar barbeiros
      tx.executeSql(
        `SELECT DISTINCT barber FROM appointments`,
        [],
        (_, { rows }) => {
          const barbers = rows._array.map(row => row.barber);
          setBarbersList(['Todos', ...barbers]); // Adicionar "Todos" como opção padrão
        }
      );

      // Carregar serviços
      tx.executeSql(
        `SELECT DISTINCT service FROM appointments`,
        [],
        (_, { rows }) => {
          const services = rows._array.map(row => row.service);
          setServicesList(['Todos', ...services]); // Adicionar "Todos" como opção padrão
        }
      );
    });
  };

  // Função para carregar dados dos gráficos com base nos filtros
  const loadReportData = () => {
    db.transaction(tx => {
      const filters = [];
      let query = 'SELECT * FROM appointments WHERE 1=1';

      if (month !== 'Todos') {
        query += ' AND strftime("%m", date) = ?';
        filters.push(month);
      }
      if (year !== 'Todos') {
        query += ' AND strftime("%Y", date) = ?';
        filters.push(year);
      }
      if (barber !== 'Todos') {
        query += ' AND barber = ?';
        filters.push(barber);
      }
      if (service !== 'Todos') {
        query += ' AND service = ?';
        filters.push(service);
      }

      tx.executeSql(query, filters, (_, { rows }) => {
        const data = rows._array;
        processChartData(data); // Processar os dados para gráficos
      });
    });
  };

  // Processar dados para gráficos
  const processChartData = data => {
    const serviceCount = {};
    const revenueByService = {};
    const barberPopularity = {};

    let total = 0;

    data.forEach(item => {
      // Serviço mais pedido
      serviceCount[item.service] = (serviceCount[item.service] || 0) + 1;

      // Faturamento total por serviço
      revenueByService[item.service] = (revenueByService[item.service] || 0) + item.price;

      // Barbeiro mais popular
      barberPopularity[item.barber] = (barberPopularity[item.barber] || 0) + 1;

      // Faturamento total
      total += item.price;
    });

    // Atualiza o estado para os gráficos
    setBarChartData(
      Object.entries(serviceCount).map(([key, value]) => ({
        value,
        label: key,
      }))
    );

    setPieChartData(
      Object.entries(revenueByService).map(([key, value]) => ({
        value,
        label: key,
      }))
    );

    setTotalRevenue(total);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Filtros */}
      <View style={styles.filters}>
        <View style={styles.filterItem}>
          <Text>Mês:</Text>
          <Picker selectedValue={month} onValueChange={value => setMonth(value)}>
            <Picker.Item label="Todos" value="Todos" />
            {Array.from({ length: 12 }, (_, i) => {
              const month = (i + 1).toString().padStart(2, '0');
              return <Picker.Item key={month} label={month} value={month} />;
            })}
          </Picker>
        </View>

        <View style={styles.filterItem}>
          <Text>Ano:</Text>
          <Picker selectedValue={year} onValueChange={value => setYear(value)}>
            <Picker.Item label="Todos" value="Todos" />
            {[...Array(5)].map((_, i) => {
              const currentYear = new Date().getFullYear() - i;
              return <Picker.Item key={currentYear} label={currentYear.toString()} value={currentYear.toString()} />;
            })}
          </Picker>
        </View>

        <View style={styles.filterItem}>
          <Text>Barbeiro:</Text>
          <Picker selectedValue={barber} onValueChange={value => setBarber(value)}>
            {barbersList.map((barber, index) => (
              <Picker.Item key={index} label={barber} value={barber} />
            ))}
          </Picker>
        </View>

        <View style={styles.filterItem}>
          <Text>Serviço:</Text>
          <Picker selectedValue={service} onValueChange={value => setService(value)}>
            {servicesList.map((service, index) => (
              <Picker.Item key={index} label={service} value={service} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Gráficos */}
      <View>
        <Text style={styles.chartTitle}>Serviço Mais Pedido</Text>
        <BarChart
          data={barChartData}
          barWidth={30}
          spacing={10}
          roundedTop
          noOfSections={4}
          maxValue={Math.max(...barChartData.map(d => d.value), 100)}
        />

        <Text style={styles.chartTitle}>Faturamento por Serviço</Text>
        <PieChart
          data={pieChartData}
          donut
          showText
          textColor="black"
          radius={100}
          innerRadius={50}
          textSize={10}
          textBackgroundColor="white"
        />

        <Text style={styles.totalRevenue}>Faturamento Total: R$ {totalRevenue.toFixed(2)}</Text>
      </View>
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
  const [selectedTime, setSelectedTime] = useState('');
  const [servicesList, setServicesList] = useState([]);
  const [barbersList, setBarbersList] = useState([]);
  const [periods, setPeriods] = useState(['Manhã', 'Tarde', 'Noite']);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    setupDatabase();
    loadData();
    fetchAppointments();
  }, []);

  const setupDatabase = () => {
    db.transaction(tx => {
      tx.executeSql(
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
          concluido INTEGER DEFAULT 0
        );`,
        [],
        () => console.log("Tabela 'appointments' criada com sucesso."),
        (_, error) => console.error("Erro ao criar a tabela:", error)
      );
    });
  };

  const fetchAppointments = () => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM appointments 
         WHERE concluido = 0 
         ORDER BY year ASC, month ASC, day ASC, time ASC`,
        [],
        (_, { rows }) => {
          console.log("Agendamentos atualizados (ordenados):", rows._array);
          setAppointments(rows._array || []);
        },
        (_, error) => console.error("Erro ao buscar agendamentos:", error)
      );
    });
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

 // useEffect(() => {
   // db.transaction((tx) => {
     // tx.executeSql('SELECT * FROM appointments', [], (_, { rows }) => {
     //  console.log('Dados do banco de dados:', rows._array);
     // });
  // });
 //}, []);


 useEffect(() => {
  console.log("Agendamentos atuais:", appointments);
}, [appointments]);

const handleCompleteAppointment = (id) => {
  console.log("Tentando concluir agendamento com ID:", id);

  db.transaction(
    (tx) => {
      tx.executeSql(
        `UPDATE appointments SET concluido = 1 WHERE id = ?`,
        [id],
        (_, result) => {
          console.log("Resultado do UPDATE:", result);
          if (result.rowsAffected > 0) {
            console.log("Agendamento marcado como concluído no banco.");

            // Atualizar lista de agendamentos no estado
            tx.executeSql(
              `SELECT * FROM appointments WHERE concluido = 0`,
              [],
              (_, { rows }) => {
                const updatedAppointments = rows._array || [];
                console.log("Lista de agendamentos atualizada (não concluídos):", updatedAppointments);
                setAppointments(updatedAppointments);
                fetchAppointments();
              },
              (_, error) => console.error("Erro ao buscar agendamentos atualizados:", error)
            );
          } else {
            console.error("Nenhum agendamento encontrado para concluir.");
          }
        },
        (_, error) => console.error("Erro ao executar UPDATE:", error)
      );
    },
    (error) => console.error("Erro na transação de conclusão:", error),
    () => console.log("Transação de conclusão finalizada com sucesso.")
  );
};

const handleRemoveAppointment = (id) => {
  console.log("Tentando remover agendamento com ID:", id);

  db.transaction(
    (tx) => {
      tx.executeSql(
        `DELETE FROM appointments WHERE id = ?`,
        [id],
        (_, result) => {
          console.log("Resultado do DELETE:", result);
          if (result.rowsAffected > 0) {
            console.log("Agendamento removido do banco com sucesso.");

            // Atualizar lista de agendamentos no estado
            tx.executeSql(
              `SELECT * FROM appointments WHERE concluido = 0`,
              [],
              (_, { rows }) => {
                const updatedAppointments = rows._array || [];
                console.log("Lista de agendamentos atualizada (não concluídos):", updatedAppointments);
                setAppointments(updatedAppointments);
                fetchAppointments();
              },
              (_, error) => console.error("Erro ao buscar agendamentos atualizados:", error)
            );
          } else {
            console.error("Nenhum agendamento encontrado para remover.");
          }
        },
        (_, error) => console.error("Erro ao executar DELETE:", error)
      );
    },
    (error) => console.error("Erro na transação de remoção:", error),
    () => console.log("Transação de remoção concluída com sucesso.")
  );
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
      const isOccupied = appointments.some(app => 
        app.period === selectedPeriod &&
        app.day === date.getDate() &&
        app.month === date.getMonth() + 1 &&
        app.year === date.getFullYear() &&
        app.time === time
      );

      if (!isOccupied) {
        availableSlots.push(time);
      }

      currentMinute += serviceDuration;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }
    setAvailableTimes(availableSlots);
  };

  useEffect(() => {
    calculateAvailableTimes();
  }, [selectedService, selectedPeriod, date]);

  const handleSchedule = () => {
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

      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO appointments (clientName, service, barber, period, time, day, month, year, concluido) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [clientName, selectedService, selectedBarber, selectedPeriod, selectedTime, newAppointment.day, newAppointment.month, newAppointment.year, 0],
          (_, result) => {
            fetchAppointments();
            setAppointments([...appointments, { id: result.insertId, ...newAppointment }]);
          },
          (_, error) => console.error('Erro ao inserir agendamento', error)
        );
      });
      

      setClientName('');
      setSelectedService('');
      setSelectedBarber('');
      setSelectedPeriod('');
      setSelectedTime('');
    } else {
      alert("Por favor, preencha todos os campos antes de marcar.");
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
      {appointments.map((appointment, _index) => (
        <View key={appointment.id} style={styles.appointment}>
          <Text>{`${appointment.clientName} às ${appointment.time}`}</Text>
          <Text style={styles.moreInfo}> {'>'} Ver mais informações </Text>
          <View style={styles.appointmentButtons}>
          <TouchableOpacity style={styles.agendButton} onPress={() => null(appointment.id)}>
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
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  filterItem: {
    width: '50%',
    padding: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  totalRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
});