import * as React from 'react';
import {
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TextInput,
  AsyncStorage,
} from 'react-native';
import { Card, Title, Paragraph, Button, Colors } from 'react-native-paper';
import TodoCheckbox from './TodoCheckbox';

export default class DashboardScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      newTask: '',
    };
  }

  loadData = async () => {
    console.log('Loading tasks');
    try {
      const tasksString = await AsyncStorage.getItem('tasks');
      const tasks = JSON.parse(tasksString);
      if (tasks !== null) {
        console.log('Old data loaded');
        this.setState({
          tasks: tasks,
        });
      }
    } catch (error) {
      console.log('Problem retriving data');
    }
  };

  saveData = async () => {
    console.log('Saving tasks');
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(this.state.tasks));
    } catch (error) {
      console.log('Error saving');
    }
  };

  addTask = task => {
    console.log('Submit new task');
    if (this.state.newTask.length > 0) {
      const newTask = {
        id: this.state.tasks.length + 1,
        taskName: this.state.newTask,
        isChecked: false,
        timeCompleted: null,
      };
      let tasks = this.state.tasks;
      tasks.push(newTask);
      this.setState({
        tasks: tasks,
        newTask: '',
      });
      this.saveData();
    }
  };

  updateTask = task => {
    console.log('Updating task');
    const tasks = this.state.tasks;
    const index = tasks.findIndex(item => item.id === task.id);
    tasks[index] = task;
    this.setState({
      tasks: tasks,
    });
    this.saveData();
  };

  deleteTask = task => {
    console.log('Deleting task');
    const tasks = this.state.tasks;
    const index = tasks.findIndex(item => item.id === task.id);
    tasks.splice(index, 1);
    this.setState({
      tasks: tasks,
    });
    this.saveData();
  };

  listTodoTasks() {
    return this.state.tasks.map(item => {
      return (
        <TodoCheckbox
          key={item.id}
          task={item.taskName}
          inverted={false}
          isChecked={item.isChecked}
          onPress={() => {
            this.updateTask({
              id: item.id,
              taskName: item.taskName,
              isChecked: !item.isChecked,
              timeCompleted: null,
            });
          }}
          onChangeText={text => {
            this.updateTask({
              id: item.id,
              taskName: text,
              isChecked: false,
              timeCompleted: null,
            });
          }}
          onDelete={() =>
            this.deleteTask({
              id: item.id,
            })
          }
        />
      );
    });
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <StatusBar hidden={false} />
        {this.listTodoTasks()}
        <TodoCheckbox
          task={this.state.newTask}
          isInputField={true}
          inverted={false}
          disabled={true}
          onPress={null}
          onChangeText={text => {
            console.log('Update task text', text);
            this.setState({
              newTask: text,
            });
          }}
          onSubmitEditing={() => this.addTask()}
        />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: 5,
  },
});
