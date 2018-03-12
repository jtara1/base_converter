import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

class TextInputView extends Component {
  constructor(props) {
      super(props);
      // this.state = {text: 'BASE ' + props.numberBase};
  }

  render() {
    return (
      <View style={{
        flex: 0.2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'powderblue',
        }}>
        <Text style={
          styles.inputLabel
        }>Bin
        </Text>
        <TextInput
          placeholder={"enter number here"}
          style={{flex: 0.8, alignItems: 'center'}}
          onChangeText={(text) => this.setState({text})}
          // value={(this.state.text)}
        />
    </View>
    );
  }
}

export default class App extends Component {
  render() {
    return (
      <View
        style={
          styles.container
        }>
        <View style={{
            flex: 0.2,
            justifyContent: 'center',
            // alignItems: 'center',
            backgroundColor: 'steelblue'
            }}>
          <Text style={{alignItems: 'center'}}>Base Converter - No Ads</Text>
        </View>
        <TextInputView
          numberBase={2}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },

  inputLabel: {
    alignItems: 'center',
    lineHeight: 100,
    flex: 0.3,
    textAlign: 'center',
    padding: 20,
    backgroundColor: 'skyblue',
    borderRadius: 4
  }
});
