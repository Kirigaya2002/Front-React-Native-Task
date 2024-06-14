import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddTask from './views/AddTask.tsx';
import UpdateTask from './views/UpdateTask.tsx';
import { SafeAreaView, ScrollView, StatusBar, useColorScheme, View, Text, Button, Modal, Image, Alert } from 'react-native';
import { Colors, Header } from 'react-native/Libraries/NewAppScreen';
import { styles } from './styles/styles.ts';
import { TaskList } from './views/TaskList.tsx';
import ConfirmModal from './components/ConfirmModal.tsx';
import { Section } from './components/Section';
import { Task } from './types/types.ts';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskToUpdate, setSelectedTaskToUpdate] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateTaskKey, setUpdateTaskKey] = useState<number>(0);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [taskIdToDelete, setTaskIdToDelete] = useState<number | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false); // Estado para controlar el refresco de la vista

  useEffect(() => {
    axios
      .get('http://10.0.2.2:1111/task/listar')
      .then(response => {
        setTasks(response.data);
        console.info(response.data);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
  }, [refreshFlag]); // Agrega refreshFlag como dependencia para que se actualice la lista de tareas cuando cambie

  const handleShowTask = (task: Task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleUpdateTask = (task: Task) => {
    setSelectedTaskToUpdate(task);
    setUpdateTaskKey(prevKey => prevKey + 1);
  };

  const handleDeleteTask = (taskId: number) => {
    setTaskIdToDelete(taskId);
    setConfirmVisible(true);
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
  };

  const handleConfirmDelete = () => {
    if (taskIdToDelete !== null) {
      axios
        .delete(`http://10.0.2.2:1111/task/delete?id=${taskIdToDelete}`)
        .then(response => {
          console.log('Task deleted successfully:', taskIdToDelete);
          setTasks(prevTasks => prevTasks.filter(task => task.id !== taskIdToDelete));
          setConfirmVisible(false);
          Alert.alert('Tarea eliminada con éxito');
        })
        .catch(error => {
          console.error('Error deleting task:', error);
        });
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={backgroundStyle.backgroundColor} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={backgroundStyle}>
        <ScrollView horizontal={true} style={styles.horizontalScroll}>
          <TaskList
            tasks={tasks}
            handleShowTask={handleShowTask}
            handleUpdateTask={handleUpdateTask}
            handleDeleteTask={handleDeleteTask}
          />
        </ScrollView>
        <Section title="Update Task" key={updateTaskKey}>
          {selectedTaskToUpdate && <UpdateTask taskToUpdate={selectedTaskToUpdate} setRefreshFlag={setRefreshFlag}  />}
        </Section>
        <Section title="Add Task">
          <AddTask setRefreshFlag={setRefreshFlag} />
        </Section>
      </ScrollView>
      <ConfirmModal
        visible={confirmVisible}
        message="¿Estás seguro de que deseas eliminar esta tarea?"
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
      {selectedTask && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedTask.title}</Text>
              <Text>{selectedTask.description}</Text>
              <Text>Fecha de Vencimiento: {selectedTask.dueDate}</Text>
              <Text>Progreso: {selectedTask.taskProgress}</Text>
              <Text>Prioridad: {selectedTask.priority}</Text>
              <Text>Horas: {selectedTask.hours}</Text>
              <Text>Usuario: {selectedTask.user.userName}</Text>
              {selectedTask.photoUrl && (
                <Image
                  source={{ uri: selectedTask.photoUrl }}
                  style={styles.modalImage}
                />
              )}
              <Button title="Cerrar" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};


export default App;
