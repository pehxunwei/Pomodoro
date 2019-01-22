import moment from 'moment';
import * as React from 'react';
import { Text, View, StyleSheet, ImageBackground, StatusBar, AsyncStorage, Animated, Easing } from 'react-native';
import { IconButton, Colors } from 'react-native-paper';
import { NavigationEvents } from 'react-navigation';
import TodoCheckbox from './TodoCheckbox';
import imageBackground from '../assets/galaxy.png';

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {
    s = '0' + s;
  }
  return s;
};

export default class FocusScreen extends React.Component {
  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(0);
    this.state = {
      tasks: [],
      currentTimerString: '25 : 00',
      remainingTime: null,
      isTimerStarted: false,
      currentTaskIsChecked: false,
      currentTaskIndex: -1,
      currentTaskName: null,
      isAllTasksCompleted: true,
    };
  }

  loadData = async () => {
    console.log('Loading tasks');
    try {
      const tasksString = await AsyncStorage.getItem('tasks');
      const tasks = JSON.parse(tasksString);
      if (tasks !== null) {
        console.log('Old data loaded');
        this.getLatestTask(tasks);
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

  getLatestTask = tasks => {
    console.log('Getting latest task', tasks);
    const latestIndex = tasks.findIndex(item => item.isChecked === false);
    console.log('Getting latest task', latestIndex);
    if (latestIndex !== -1) {
      this.setState({
        tasks: tasks,
        currentTimerString: '25 : 00',
        remainingTime: null,
        isTimerStarted: false,
        currentTaskIsChecked: tasks[latestIndex].isChecked || false,
        currentTaskIndex: tasks[latestIndex].id || -1,
        currentTaskName: tasks[latestIndex].taskName || null,
        isAllTasksCompleted: false,
      });
    } else {
      this.setState({
        tasks: tasks,
        currentTimerString: '25 : 00',
        remainingTime: null,
        isTimerStarted: false,
        currentTaskIsChecked: false,
        currentTaskIndex: 0,
        currentTaskName: null,
        isAllTasksCompleted: true,
      });
    }
  };

  updateTask = task => {
    console.log('Updating task');
    const tasks = this.state.tasks;
    const latestIndex = tasks.findIndex(item => item.id === task.id);
    if (latestIndex !== -1) {
      tasks[latestIndex] = task;
      console.log(task, latestIndex);
      this.setState({
        tasks: tasks,
        currentTaskIsChecked: tasks[latestIndex].isChecked || false,
        currentTaskIndex: tasks[latestIndex].id || -1,
        currentTaskName: tasks[latestIndex].taskName || null,
      });
      console.log(this.state.tasks);
      this.saveData();
      this.loadData();
    }
  };

  startTimer() {
    console.log('Start timer');
    this.setState({
      isTimerStarted: true,
    });

    let pomodoroTime = moment().add('25', 'minutes').add('1', 'seconds');
    this.interval = setInterval(() => {
      const timeDiff = pomodoroTime.diff(moment());
      const timeRemainingTime = moment.duration(timeDiff, 'milliseconds');
      const displayTimeRemaining = `${timeRemainingTime
        .minutes()
        .pad(2)} : ${timeRemainingTime.seconds().pad(2)}`;
      this.setState({
        currentTimerString: displayTimeRemaining,
        remainingTime: pomodoroTime,
      });
      if (timeDiff < 0) {
        clearInterval(this.interval);
        this.setState({
          currentTimerString: '25 : 00',
          isTimerStarted: false,
          remainingTime: null,
        });
      }
    }, 1000);
  }

  stopTimer() {
    console.log('Stop timer');
    clearInterval(this.interval);
    this.setState({
      currentTimerString: '25 : 00',
      isTimerStarted: false,
      remainingTime: null,
    });
  }

  componentDidMount() {
    this.loadData();
    clearInterval(this.interval);
  }

  render() {
    const size = this.animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.5, 2],
    });
    return (
      <ImageBackground source={imageBackground} style>
        <NavigationEvents
          onWillFocus={async payload => {
            console.log('Receiving new updates');
            const tasksString = await AsyncStorage.getItem('tasks');
            const tasks = JSON.parse(tasksString);

            const latestIndex = tasks.findIndex(
              item => item.isChecked === false
            );
            console.log('componentWillReceiveProps', tasks, latestIndex);
            if (latestIndex !== -1) {
              this.setState({
                tasks: tasks,
                currentTaskIsChecked: tasks[latestIndex].isChecked || false,
                currentTaskIndex: tasks[latestIndex].id || -1,
                currentTaskName: tasks[latestIndex].taskName || null,
                isAllTasksCompleted: false,
              });
            } else {
              this.setState({
                isAllTasksCompleted: true,
              });
            }
          }}
        />
        <StatusBar hidden />
        <View style={styles.overlay}>
          <View style={styles.buttonGroup}>
            <IconButton
              style={styles.button}
              icon={this.state.isTimerStarted ? 'stop' : 'play-circle-filled'}
              color={Colors.white}
              size={30}
              onPress={() => {
                console.log('test');
                if (this.state.isTimerStarted) {
                  this.stopTimer();
                } else {
                  this.startTimer();
                }
              }}
            />
            <IconButton
              style={styles.button}
              icon="dashboard"
              color={Colors.white}
              size={30}
              onPress={() => {
                this.props.navigation.navigate('dashboardScreen');
              }}
            />
          </View>
          <Animated.Text
            style={{ ...styles.countdownText, transform: [{ scale: size }] }}>
            {this.state.currentTimerString}
          </Animated.Text>
          {!this.state.isAllTasksCompleted ? (
            <TodoCheckbox
              inverted={true}
              isInputField={true}
              isChecked={this.state.currentTaskIsChecked}
              task={this.state.currentTaskName}
              onChangeText={text => {
                this.updateTask({
                  id: this.state.currentTaskIndex,
                  taskName: text,
                  isChecked: this.state.currentTaskIsChecked,
                  timeCompleted: this.state.currentTimerString,
                });
              }}
              onPress={() => {
                if (!this.state.currentTaskIsChecked) {
                  this.setState({
                    currentTaskIsChecked: true,
                  });
                  this.stopTimer();
                } else {
                  this.setState({
                    currentTaskIsChecked: false,
                  });
                }
                this.updateTask({
                  id: this.state.currentTaskIndex,
                  taskName: this.state.currentTaskName,
                  isChecked: !this.state.currentTaskIsChecked,
                  timeCompleted: this.state.currentTimerString,
                });
                Animated.timing(this.animatedValue, {
                  toValue: 1,
                  duration: 200,
                  easing: Easing.linear,
                }).start(() => this.animatedValue.setValue(0));
              }}
            />
          ) : (
            <View>
              <Text style={styles.text}>
                Add new task at Dashboard to begin.
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 55,
  },

  overlay: {
    backgroundColor: 'rgba(0,0,0,.6)',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },

  text: {
    textAlign: 'center',
    color: 'white',
  },

  countdownText: {
    color: 'white',
    marginTop: -15,
    textAlign: 'center',
    fontSize: 80,
  },
});
