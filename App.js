import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, TextInput } from 'react-native';
import _ from 'lodash';

/**
 * Renders a view that contains an input field that will filter
 * the input from the user and update the other instances of this
 * class with the converted number.
 * Instances are associated with a specific numberBase.
 */
class NumberInputView extends Component {
  // map numberBase to label
  static labels = {
    2: "Bin",
    8: "Oct",
    10: "Dec",
    16: "Hex",
  };    

  // keeps track of the views that contain info on numbers converting to
  // e.g.: { 2: binaryNumberInputViewObject }
  static inputViews = {};
  
  // [0, 1, ..., 9, A, B, C, ..., Z]
  static alphanumericCharacters = _.concat(
    _.range(10), 
    // English alphabet [A, B, C, ..., Z] is 26 characters
    _.map(
      _.map(
        _.range(26), 
        (x) => x + 65),
      (x) => String.fromCharCode(x)));

  constructor(props) {
    super(props);
    this.state = {text: ''};
    // name or label associated with the numberBase
    this.label = NumberInputView.labels[this.props.numberBase];

    NumberInputView.inputViews[this.props.numberBase] = this;

    // used in regex pattern that matches non-accepted characters
    this.validDigits = NumberInputView.alphanumericCharacters
      .slice(0, this.props.numberBase)
      .join('');
    console.log(this.validDigits);
  }

  /**
   * @param {string} input 
   * @returns {string} input with removed unaccepted characters
   */
  filterInput(input) {
    input = input.toUpperCase();
    console.log('input: ' + input);
    
    let pattern = new RegExp("[^" + this.validDigits + "]*", 'g');
    let filteredInput = input.replace(pattern, "");
    return filteredInput;
  }

  render() {
    return (
      <View style={styles.inputView}>
        <Text style={styles.inputLabel}>{this.label}</Text>
        <TextInput
          placeholder={"enter number here"}
          style={styles.textInput}
          onChangeText={(text) => this.setState(
            state=(prevState, props) => {
              return {text: this.filterInput(text)}
            },
            callback=() => {
              for (toBase in NumberInputView.inputViews) {
                if (toBase == this.props.numberBase || toBase == 'undefined') {
                  // console.log('not converting toBase: ' + toBase);
                  continue;
                }

                // converting an empty string would return NaN, but
                // we want to print empty string for converted values
                let convertedValue = this.state.text === '' ? 
                  '':
                  NumberConverter.convert(
                  this.state.text,
                  this.props.numberBase,
                  toBase
                  ).toString().toUpperCase();
                  
                console.log('---debug---');
                console.log('converting value: ' + this.state.text);
                console.log('converting from: ' + this.props.numberBase);
                console.log('converting to: ' + toBase);
                console.log('converted value: ' + convertedValue);

                let numberInputView = NumberInputView.inputViews[toBase];
                numberInputView.setState(
                  state=(prevState, props) => {
                    return {text: convertedValue};
                  }
                )
              }
            })
          }
          value={this.state.text}
        />
      </View>
    );
  }
}

class NumberConverter {

  /**
   * Tested and working with conversions between bin, dec, oct, and hex
   * values
   * @param {*} value number we are converting
   * @param {*} fromBase the base of the number, value
   * @param {*} toBase the base that we'd like to convert to
   * @returns {integer} the converted value of base toBase
   */
  static convert(value, fromBase, toBase) {  
    if (fromBase == "10") {
      return NumberConverter._convertFromDecimal(value, toBase);
    } else if (toBase == "10") {
      return NumberConverter._convertToDecimal(value, fromBase);
    } else {
      // e.g.: 2A -> 42 -> 101010
      // e.g.: 101010 -> 42 -> 2A
      return NumberConverter._convertFromDecimal(
        NumberConverter._convertToDecimal(value, fromBase),
        toBase
      );
    }
  }

  static _convertFromDecimal(value, toBase) {
    return (new Number(value)).toString(toBase);
  }

  static _convertToDecimal(value, fromBase) {
    return parseInt(value, fromBase);
  }
}

/**
 * Root Component and entry point for my app
 */
export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.navBar}>
          <Text style={styles.title}>Base Converter</Text>
        </View>
        <NumberInputView
          numberBase={2}
        />
        <NumberInputView
          numberBase={8}
        />
        <NumberInputView
          numberBase={10}
        />
        <NumberInputView
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
    borderRadius: 0,
    padding: 0,
    marginTop: 10,
  },

  // view used for label
  inputLabel: {
    alignItems: 'center',
    lineHeight: 150,
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
