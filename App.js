import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, TextInput, Button, Alert, FlatList, Linking } from 'react-native';
import Hamburger from 'react-native-hamburger';
import _ from 'lodash';

class PaypalDonationButton extends Component {
  render() {
    return(
      <p>{"Hello there"}</p>
    )
  }
}

class HamburgerMenu extends Component {
  static instances = [];

  static get instance() {
    return HamburgerMenu.instances[0];
  }

  static listItemsInfo = {
    About: 'Created using React Native \n' +
      'by jtara1 \n' +
      'source code and github repo: base_converter',
    // $1 donation button
    // Donate: 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=XJR3MNT7EL4YQ&lc=US&item_name=base_converter&amount=1%2e00&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted',
    Donate: 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=XJR3MNT7EL4YQ&lc=US&item_name=base_converter%20by%20jtara1&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted',
    Failed: 'An error occurred',
  }

  static itemClickCallbacks = {
    About: () => { HamburgerMenu.alertForItem('About'); },
    Donate: () => { 
      let url = HamburgerMenu.listItemsInfo['Donate'];
      if (Linking.canOpenURL(url))
        Linking.openURL(url); 
      else
      HamburgerMenu.alertForItem('Failed')
    },
  }

  constructor(props) {
    super(props);
    this.state = {
      enabled: false,
      listItems: [
        {key: 'About'},
        // {key: 'Donate'}
      ]
    };

    HamburgerMenu.instances.push(this);
  }

  static alertForItem(itemValue) {
    // params: title, message, list of button options, cancelable
    Alert.alert(
      itemValue,
      HamburgerMenu.listItemsInfo[itemValue],
      [
        {text: 'Ok', onPress: () => {}},
      ],
      {cancelable: false}
    );
  }

  render() {
    if (this.state.enabled) {
      return(
        <View style={{
          justifyContent: 'center',
          flex: 1,
          margin: 10,
          position: 'absolute',
          backgroundColor: 'white',
          right: 0,
          top: "14%",
          zIndex: 10,
        }}
        >
          <FlatList
            data={this.state.listItems}
            renderItem={({item}) => 
              <Text 
                style={{
                  fontSize: 20,
                  padding: 10,
                }}
                onPress={() => { 
                  HamburgerMenu.itemClickCallbacks[item.key]();
                }}
              >
                {item.key}
              </Text>
            }
          />
        </View>
      );
    }
    // render nothing for this component
    return null;
  }
}

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {active: false};
  }

  render() {
    return(
      <View style={styles.navBar}>
          <Text style={styles.title}>Base Converter</Text>
          <Button 
            title={"     Clear     "} // make the button wider
            style={styles.clearButton}
            onPress={NumberInputView.clearAllText}
          />
          <Hamburger
            style={styles.hamburgerButton}
            active={this.state.active}
            type="cross"
            onPress={() => {
              this.setState({active: !this.state.active});
              // if (HamburgerMenu.instance !== null || HamburgerMenu.instance != 'undefined')
              HamburgerMenu.instance.setState({enabled: !this.state.active});
            }}
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
  
  // [0, 1, ..., 9, Aa, Bb, Cc, ..., Zz]
  static alphanumericCharacters = _.concat(
    _.range(10), 
    // English alphabet [A, B, C, ..., Z] is 26 characters
    _.map(
      _.map(
        _.range(26), 
        (x) => x + 65),
      (x) => String.fromCharCode(x) + String.fromCharCode(x + 32)));

  // group 1 matches a floating point number with decimal, group two is decimal point
  static floatingPointRegex = /(.*\..*)(\..*)/;

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
    this.unAcceptedCharacterRegex = new RegExp("[^" + validDigits + "." + "]*", "g");
  }

  /**
   * @param {string} input 
   * @returns {string} input with removed unaccepted characters
   */
  filterInput(input) {
    // check if there's more than one decimal point
    let matches = NumberInputView.floatingPointRegex.exec(input);
    if (matches !== null) {
      input = matches[1]; // group 1 of the match
    }

    return input.replace(this.unAcceptedCharacterRegex, "");
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
          onChangeText={(newText) => this.setState(
            state=(prevState, props) => {
              return {text: this.filterInput(newText)};
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

/**
 * Utility class that helps convert floating point or integers of one base
 * to the equivalent value of another base
 */
class NumberConverter {
  /**
   * Tested and working with conversions between bin, dec, oct, and hex
   * values for floating point and integer values
   * @param {string} value number we are converting
   * @param {*} fromBase the base of the number, value
   * @param {*} toBase the base that we'd like to convert to
   * @returns {*} the converted value of base toBase
   */
  static convert(value, fromBase, toBase) {  
    let valueSplit = value.split(".");
    let preFP = valueSplit[0];
    let postFP = valueSplit[1];

    if (fromBase == "10") {
      return NumberConverter._convertFromDecimal(value, toBase);
    } else if (toBase == "10") {
      return NumberConverter._convertToFloatingPointDecimal(preFP, postFP, fromBase, toBase);
    } else {
      // e.g.: 2A -> 42 -> 101010
      // e.g.: 101010 -> 42 -> 2A
      return NumberConverter._convertFromDecimal(
        NumberConverter._convertToFloatingPointDecimal(preFP, postFP, fromBase, toBase),
        toBase
      );
    }
  }

  /**
   * @param {*} value 
   * @param {*} toBase 
   * @returns converted FP or integeral value of base 10 to any base specified by toBase
   */
  static _convertFromDecimal(value, toBase) {
    return (new Number(value)).toString(toBase);
  }

  /**
   * @param {*} value 
   * @param {*} fromBase 
   * @returns converted integer value of any base, fromBase, to base 10
   */
  static _convertToDecimal(value, fromBase) {
    return parseInt(value, fromBase);
  }

  /**
   * @param {*} preFP digits before the floating point
   * @param {*} postFP digits after the floating point
   * @param {*} fromBase 
   * @param {*} toBase 
   * @returns converted integer value of any base, fromBase, to any base, toBase
   */
  static _convertToFloatingPointDecimal(preFP, postFP, fromBase, toBase) {
    return NumberConverter._convertToDecimal(preFP, fromBase) + 
      NumberConverter._parseFloat(postFP, fromBase, toBase);
  }

  /**
   * @param {*} postFP digits after the floating point
   * @param {*} fromBase 
   * @param {*} toBase 
   * @returns the post floating point digits of base, toBase
   */
  static _parseFloat(postFP, fromBase, toBase) {
    let parsedFloat = this._convertToDecimal(postFP, fromBase,) / 
      Math.pow(fromBase, (new Number(postFP)).toString().length);

    parsedFloat.toPrecision(4);
    return isNaN(parsedFloat) ? 0 : parsedFloat;
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
        <NavBar />
        {/* FlatList that drops down when Hamburger button is pressed */}
        <HamburgerMenu />

        <NumberInputView
          autoFocus={true}
          numberBase={2}
        />
        <NumberInputView
          numberBase={8}
        />
        <NumberInputView
          numberBase={10}
        />
        <NumberInputView
          autoFocus={false}
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
    alignContent: 'flex-start',
    justifyContent: 'space-around',
    backgroundColor: 'steelblue'
  },

  // title within navBar
  title: {
    flex: 0.75,
    fontSize: 30,
  },

  // clear button within navBar
  clearButton: {
    flex: 1,
    width: 150,
    height: 200,
  },

  hamburgerButton: {
    flex: 1,
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
