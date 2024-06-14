import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { launchImageLibrary } from 'react-native-image-picker';

type User = {
  id: number;
  userName: string;
  isActive: string;
};

type Task = {
  id: number;
  title: string;
  description: string;
  dueDate: string | null;
  taskProgress: string;
  priority: string;
  photoUrl: string | null;
  hours: number;
  isReady: string;
  user: User;
};

type Props = {
  taskToUpdate: Task;
  setRefreshFlag: React.Dispatch<React.SetStateAction<boolean>>; // Prop para actualizar el estado de refresco
};

const UpdateTask: React.FC<Props> = ({ taskToUpdate, setRefreshFlag }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState(taskToUpdate.title);
  const [description, setDescription] = useState(taskToUpdate.description);
  const [dueDate, setDueDate] = useState<string | null>(taskToUpdate.dueDate);
  const [taskProgress, setTaskProgress] = useState(taskToUpdate.taskProgress);
  const [priority, setPriority] = useState(taskToUpdate.priority);
  const [selectedUser, setSelectedUser] = useState<number | null>(taskToUpdate.user.id);
  const [imageUri, setImageUri] = useState<string | null>(taskToUpdate.photoUrl);
  const [hours, setHours] = useState(taskToUpdate.hours.toString());

  useEffect(() => {
    axios.get('http://10.0.2.2:1111/user/listar')
      .then(response => {
        setUsers(response.data);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleImagePicker = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        includeBase64: false,
      },
      response => {
        if (response.assets && response.assets.length > 0) {
          setImageUri(response.assets[0].uri || null);
        }
      }
    );
  };

  const handleUpdateTask = () => {
    if (!title || !description || !dueDate || !taskProgress || !priority || !selectedUser || !hours) {
      Alert.alert('Please fill out all fields.');
      return;
    }

    const uploadImage = () => {
      const uriParts = imageUri!.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      return axios.post('http://10.0.2.2:1111/task/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => response.data.url)
      .then(url => {
        console.info('Image uploaded:', url);
        return url;
      })
      .catch(error => {
        console.error('Error uploading image:', error);
        Alert.alert('Error uploading image');
        throw error;
      });
    };

    const updateTask = (photoUrl: string) => {
      const taskData = {
        ...taskToUpdate,
        title,
        description,
        dueDate,
        taskProgress,
        priority,
        photoUrl,
        hours: parseInt(hours, 10),  // Save hours as integer
        user: { id: selectedUser },
      };

      axios.post('http://10.0.2.2:1111/task/actualizar', taskData)
        .then(response => {
          Alert.alert('Task updated successfully');
          setRefreshFlag(prevFlag => !prevFlag); // Actualiza la bandera de refresco
        })
        .catch(error => {
          console.error('Error updating task:', error);
          Alert.alert('Error updating task');
        });
    };

    if (imageUri) {
      uploadImage().then(updateTask);
    } else {
      updateTask('');
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formLabel}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
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
        keyboardType="numeric"  // Ensure the input is numeric
      />
      <Text style={styles.formLabel}>Assign to User *</Text>
      <Picker
        selectedValue={selectedUser}
        style={styles.input}
        onValueChange={(itemValue: number | null) => setSelectedUser(itemValue)}
      >
        <Picker.Item label="Select User" value={null} />
        {users.map(user => (
          <Picker.Item key={user.id} label={user.userName} value={user.id} />
        ))}
      </Picker>
      <Button title="Pick an Image" onPress={handleImagePicker} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      <Button title="Update Task" onPress={handleUpdateTask} />
    </View>
  );
};

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

export default UpdateTask;
