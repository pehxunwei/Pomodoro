import * as React from 'react';
import PropTypes from 'prop-types';
import { Text, View, StyleSheet, StatusBar, TextInput } from 'react-native';
import { Colors, IconButton } from 'react-native-paper';
import CheckBox from 'react-native-check-box';

class TodoCheckbox extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <CheckBox
          checkBoxColor={this.props.inverted ? 'white' : 'black'}
          style={styles.checkBox}
          onClick={this.props.onPress}
          isChecked={this.props.isChecked}
          disabled={this.props.disabled}
        />
        <TextInput
          style={{
            ...styles.textInput,
            color: this.props.inverted ? 'white' : 'black',
          }}
          onChangeText={this.props.onChangeText}
          onSubmitEditing={this.props.onSubmitEditing}
          value={this.props.task}
          returnKeyType="done"
        />
        {!this.props.isInputField ? (
          <IconButton
            style={styles.button}
            icon="delete"
            color={Colors.red500}
            size={20}
            onPress={this.props.onDelete}
          />
        ) : (
          <View />
        )}
      </View>
    );
  }
}

TodoCheckbox.propTypes = {
  task: PropTypes.String,
  inverted: PropTypes.bool,
  isChecked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onCheckBoxPress: PropTypes.Func,
  onChangeText: PropTypes.Func,
  onSubmitEditing: PropTypes.Func,
  onDelete: PropTypes.Func,
};

TodoCheckbox.defaultProps = {
  isChecked: false,
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 20,
  },
  checkBox: {
    paddingRight: 10,
  },
  textInput: {
    width: '80%',
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  button: {
    width: 25,
    height: 25,
  },
});

export default TodoCheckbox;
