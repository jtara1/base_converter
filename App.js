import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, TextInput, Button } from 'react-native';
import _ from 'lodash';

class NavBar extends Component {
  render() {
    return(
      <View style={styles.navBar}>
          <Text style={styles.title}>Base Converter</Text>
          <Button 
            title="      Clear      " 
            style={styles.clearButton}
            onPress={NumberInputView.clearAllText}
          />
      </View>
    );
  }
}

/**
 * Renders a view that contains an input field that will filter
 * the input from the user and update the other instances of this
 * class with the converted number.
 * Instances are associated with a specific numberBase.
 */
class NumberInputView extends Component {

  // region: static //

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
  /**
   * Change the text of each of the TextInput within each NumberInputView
   * to that of the empty string.
   */
  static clearAllText() {
    for (numberBase in NumberInputView.inputViews) {
      NumberInputView.inputViews[numberBase].setState((prevState, props) => {
        return {text: ''};
      });
    }
  }

  // endregion //

  constructor(props) {
    super(props);
    this.state = {text: ''};
    // name or label associated with the numberBase
    this.label = NumberInputView.labels[this.props.numberBase];
    this.keyboardType = this.props.numberBase <= 10 ? 'numeric' : 'default';
    this.autoFocus = this.props["autoFocus"] == 'undefined' ? false : this.props.autoFocus;

    NumberInputView.inputViews[this.props.numberBase] = this;

    // used in regex pattern that matches non-accepted characters
    validDigits = NumberInputView.alphanumericCharacters
      .slice(0, this.props.numberBase)
      .join('');
    console.log(validDigits);

    // match all characters that are not valid digits for this numberBase
    this.unAcceptedCharacterRegex = new RegExp("[^" + validDigits + "]*", "g");
  }

  /**
   * @param {string} input 
   * @returns {string} input with removed unaccepted characters
   */
  filterInput(input) {
    input = input.toUpperCase();
    console.log('input: ' + input);
    
    let filteredInput = input.replace(this.unAcceptedCharacterRegex, "");
    return filteredInput;
  }

  render() {
    return (
      <View style={styles.inputView}>
        <Text style={styles.inputLabel}>{this.label}</Text>
        <TextInput
          autoFocus={this.autoFocus}
          placeholder={"enter number here"}
          style={styles.textInput}
          placeholderTextColor={"#000000"}
          value={this.state.text}
          keyboardType={this.keyboardType}
          onChangeText={(text) => this.setState(
            state=(prevState, props) => {
              let filteredInput = this.filterInput(text);
              console.log('filteredInput: ' + filteredInput);
              return {text: filteredInput};
            },
            callback=() => {
              for (toBase in NumberInputView.inputViews) {
                if (toBase == this.props.numberBase || toBase == 'undefined') {
                  console.log('not converting toBase: ' + toBase);
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
        <NavBar>
        </NavBar>
        <NumberInputView
          autoFocus={false}
          numberBase={2}
        />
        <NumberInputView
          numberBase={8}
        />
        <NumberInputView
          numberBase={10}
        />
        <NumberInputView
          autoFocus={true}
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
    margin: 0,
    borderRadius: 0,
    borderWidth: 0,
  },

  navBar: {
    flex: 0.15,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'steelblue'
  },

  // title within navBar
  title: {
    flex: 1,
    fontSize: 30,
    lineHeight: 150,
    textAlignVertical: 'center',
    alignSelf: 'flex-start',
    paddingLeft: 20,
  },

  // clear button within navBar
  clearButton: {
    flex: 1,
    width: 150,
    height: 200,
  },

  // view of each input section
  inputView: {
    flex: 0.1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'lightblue',
    marginTop: 10,
  },

  // view used for label
  inputLabel: {
    alignItems: 'center',
    lineHeight: 150,
    flex: 0.3,
    textAlign: 'center',
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
