import React from 'react';
import { Section } from '../components/Section';
import { Table, Row, Rows } from 'react-native-table-component';
import { Task } from '../types/types';
import { styles } from '../styles/styles';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
    TouchableOpacity,
    Modal,
    Image,
    Button,
    Alert,
  } from 'react-native';

interface TaskListProps {
  tasks: Task[];
  handleShowTask: (task: Task) => void;
  handleUpdateTask: (task: Task) => void;
  handleDeleteTask: (taskId: number) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  handleShowTask,
  handleUpdateTask,
  handleDeleteTask,
}) => {
  const tableHead = ['Título', 'Descripción', 'Usuario', 'Acciones'];
  const tableData = tasks.map(task => [
    task.title,
    task.description,
    <View style={styles.userCell}>
      <Image source={{ uri: task.photoUrl }} style={styles.avatar} />
      <Text>{task.user.userName}</Text>
    </View>,
    <View style={styles.actionCell}>
      <Button title="Mostrar" onPress={() => handleShowTask(task)} />
      <Button title="Actualizar" onPress={() => handleUpdateTask(task)} />
      <Button
        title="Eliminar"
        onPress={() => handleDeleteTask(task.id)}
        color="red"
      />
    </View>,
  ]);

  return (
    <Section title="Tasks">
      <ScrollView style={styles.verticalScroll}>
        <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}>
          <Row
            data={tableHead}
            style={styles.head}
            textStyle={styles.text}
            widthArr={[120, 150, 150, 200]}
          />
          <Rows
            data={tableData}
            textStyle={styles.text}
            widthArr={[120, 150, 150, 200]}
          />
        </Table>
      </ScrollView>
    </Section>
  );
};
