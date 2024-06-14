/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Button, Alert, Image} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import axios from 'axios';
import {launchImageLibrary} from 'react-native-image-picker';

// Definir un objeto de Usuario
type User = {
  id: number;
  userName: string;
  isActive: string;
};

//Definir una interfaz llamada AddTaskProps
interface AddTaskProps {
  setRefreshFlag: React.Dispatch<React.SetStateAction<boolean>>; // Prop para actualizar el estadp de refresco
}

function AddTask({setRefreshFlag}: AddTaskProps): React.JSX.Element {
  const [users, setUsers] = useState<User[]>([]); //State para para almacenar la lista de los usuarios
  const [title, setTitle] = useState(''); // State para almacenar el título de la tarea
  const [description, setDescription] = useState(''); // State para almacenar la descripción de la tarea
  const [dueDate, setDueDate] = useState<string | null>(null); // State para almacenar la fecha de vencimiento de la tarea
  const [taskProgress, setTaskProgress] = useState(''); // State para almacenar el progreso de la tarea
  const [priority, setPriority] = useState(''); // State para almacenar la prioridad de la tarea
  const [selectedUser, setSelectedUser] = useState<number | null>(null); // State para almacenar el usuario asignado a la tarea
  const [imageUri, setImageUri] = useState<string | null>(null); // State para almacenar la URI de la imagen seleccionada
  const [hours, setHours] = useState<string>(''); // State para almacenar las horas de la tarea

  //Obtener usuarios
  useEffect(() => {
    axios
      .get('http://10.0.2.2:1111/user/listar')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error al obtener los usuarios:', error);
      });
  }, []);

  //Funcion para seleccionar una imagen de la galeria
  const handleImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        if (response.assets && response.assets.length > 0) {
          // Verificiar si se seleccionó una imagen
          setImageUri(response.assets[0].uri || null); // Guardamos el URI
        }
      },
    );
  };

  //Funcion para manejar el guardado de una tarea
  const handleSaveTask = () => {
    if (
      !title ||
      !description ||
      !dueDate ||
      !taskProgress ||
      !priority ||
      !selectedUser ||
      !hours
    ) {
      Alert.alert('Por favor llenar todos los campos');
    }

    //Funcion para subir la imagen
    const uploadImage = () => {
      const uriParts = imageUri!.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const formData = new FormData();

      formData.append('file', {
        uri: imageUri, //Almacena toda la ruta del archivo
        name: `photo.${fileType}`, // Almacena photo.extension
        type: `image/${fileType}`, //Almacena el tipo de archivo, en este caso una imagen de tipo {extension}
      });

      //Subir la imagen al servidor
      return axios
        .post('http://10.0.2.2:1111/task/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(response => response.data.url)
        .then(url => {
          console.info('Imagen subida:', url);
          return url;
        })
        .catch(error => {
          console.error('Error al subir la imagen:', error);
          Alert.alert('Error al subir la imagen');
          throw error;
        });
    };

    // Función para guardar la tarea en el servidor
    const saveTask = (photoUrl: string) => {
      // Función para guardar la tarea en el servidor
      const taskData = {
        title,
        description,
        dueDate,
        taskProgress,
        priority,
        photoUrl,
        hours: parseInt(hours, 10), // Convertir las horas a un número entero
        user: {id: selectedUser},
      };

      axios
        .post('http://10.0.2.2:1111/task/agregar', taskData)
        .then(response => {
          Alert.alert('Task saved successfully'); // Mostrar una alerta cuando la tarea se guarda exitosamente
          setRefreshFlag(prevFlag => !prevFlag); // Actualiza la bandera de refresco
          // Limpiar el formulario después de guardar la tarea
          setTitle('');
          setDescription('');
          setDueDate(null);
          setTaskProgress('');
          setPriority('');
          setSelectedUser(null);
          setImageUri(null);
          setHours(''); // Limpiar el campo de horas
        })
        .catch(error => {
          console.error('Error saving task:', error);
          Alert.alert('Error saving task');
        });
    };

    //Subir la imagen y guardar la tarea
    if (imageUri) {
      uploadImage().then(saveTask);
    } else {
      saveTask('');
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formLabel}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />
      <Text style={styles.formLabel}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <Text style={styles.formLabel}>Due Date</Text>
      <TextInput
        style={styles.input}
        value={dueDate || ''}
        onChangeText={setDueDate}
        placeholder="YYYY-MM-DD"
      />
      <Text style={styles.formLabel}>Task Progress</Text>
      <TextInput
        style={styles.input}
        value={taskProgress}
        onChangeText={setTaskProgress}
      />
      <Text style={styles.formLabel}>Priority</Text>
      <TextInput
        style={styles.input}
        value={priority}
        onChangeText={setPriority}
      />
      <Text style={styles.formLabel}>Hours</Text>
      <TextInput
        style={styles.input}
        value={hours}
        onChangeText={setHours}
        keyboardType="numeric" // Asegurar que el input sea numérico
      />
      <Text style={styles.formLabel}>Assign to User *</Text>
      <Picker
        selectedValue={selectedUser}
        style={styles.input}
        onValueChange={(itemValue: number | null) =>
          setSelectedUser(itemValue)
        }>
        <Picker.Item label="Select User" value={null} />
        {users.map(user => (
          <Picker.Item key={user.id} label={user.userName} value={user.id} />
        ))}
      </Picker>
      <Button title="Pick an Image" onPress={handleImagePicker} />
      {imageUri && <Image source={{uri: imageUri}} style={styles.image} />}
      <Button title="Save Task" onPress={handleSaveTask} />
    </View>
  );
}

const styles = {
  formContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
};
export default AddTask;
