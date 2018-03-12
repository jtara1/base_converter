import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

class NumberInputView extends Component {
  constructor(props) {
    let labels = {
      2: "Bin",
      8: "Oct",
      10: "Dec",
      16: "Hex",
    }
    props.label = labels[props.numberBase];

    super(props);
    this.state = {text: ''};

    // used in regex pattern that matches non-accepted characters
    this.validDigits = "";
    for (let i = 0; i < this.props.numberBase; i++) {
      this.validDigits += i;
    }
  }

  /**
   * Take the value, this.props.value and remove unaccepted characters
   * @param {string} input 
   */
  filterInput(input) {
    // console.log(this.validDigits);
    console.log('input: ' + input);
    console.log('state.text: ' + this.state.text);
    let pattern = new RegExp("[^" + this.validDigits + "]*");
    let filteredInput = input.replace(pattern, "");
    return filteredInput;
  }

  render() {
    return (
      <View style={styles.inputView}>
        <Text style={styles.inputLabel}>{this.props.label}</Text>
        <TextInput
          placeholder={"enter number here"}
          style={styles.textInput}
          onChangeText={(text) => this.setState(
            state=(prevState, props) => {
              return {text: this.filterInput(text)}
            })
          }
          value={this.state.text}
        />
      </View>
    );
  }
}

class NumberInputController {
  static convert(value, fromBase, toBase) {  
    if (fromBase == "10") {
      return this._convertFromDecimal(value, toBase);
    } else if (toBase == "10") {
      return this._convertToDecimal(value, fromBase);
    } else if (fromBase == "2" || toBase == "2") {
      // e.g.: 2A -> 42 -> 101010
      return this._convertFromDecimal(
        this._convertToDecimal(value, fromBase),
        toBase
      ).toString();
    }
  }

  static _convertFromDecimal(value, toBase) {
    return (new Number(value)).toString(toBase);
  }

  static _convertToDecimal(value, fromBase) {
    return parseInt(value, fromBase);
  }
}

export default class App extends Component {
  constructor(props) {
    super(props);

    this.inputController = null;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.navBar}>
          <Text style={styles.title}>Base Converter</Text>
        </View>
        <NumberInputView
          label={"Bin"}
          numberBase={2}
        />
        <NumberInputView
          label={"Hex"}
          numberBase={16}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
  },

  navBar: {
    flex: 0.15,
    justifyContent: 'center',
    backgroundColor: 'steelblue'
  },

  // title within navBar
  title: {
    fontSize: 24,
    textAlign: 'center',
  },

  // view of each input section
  inputView: {
    flex: 0.1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
    borderRadius: 10,
    padding: 0,
    marginTop: 10,
  },

  // view used for label
  inputLabel: {
    alignItems: 'center',
    lineHeight: 200,
    flex: 0.3,
    textAlign: 'center',
    padding: 0,
    margin: 0,
    backgroundColor: 'skyblue',
    borderRadius: 10
  },

  // text input within input view
  textInput: {
    flex: 0.7, 
    alignItems: 'center',
    fontSize: 16,
    padding: 10,
  },
});
