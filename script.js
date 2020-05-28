// The event handlers and handler function is declared at the very bottom

const keypad = document.querySelector('.calculator__keypad');
const screen = document.querySelector('.calculator__screen');

// the string of numbers and operators representing the mathematical expression to be calculated
let inputString = '';

// indicates whether the current number on the calculator screen was the resulting value of the previous calculation
let lastCalc = false;

function calculate() {
  /*
    We prevent the calculation if any of the following conditions are true:
    1) Empty string
    2) The entire string is '.'
    3) The last character in the string is an operator
    
    Otherwise we get 'NaN'
  */

  if (inputString === '') return;
  if (inputString.charAt(0) === '.' && inputString.length === 1) return;
  if (
    inputString.charAt(inputString.length - 1) === '-' ||
    inputString.charAt(inputString.length - 1) === '+' ||
    inputString.charAt(inputString.length - 1) === '/' ||
    inputString.charAt(inputString.length - 1) === '*'
  ) {
    return;
  }

  /*
    Here we set up an array for the numbers that we extract from the input string as well as an array
    for the operators.
  */

  let numArr = [];
  const opArr = [];

  const stringArr = inputString.split('');

  stringArr.forEach((char) => {
    if (char === '*') {
      opArr.push('*');
    } else if (char === '/') {
      opArr.push('/');
    } else if (char === '+') {
      opArr.push('+');
    } else if (char === '-') {
      opArr.push('-');
    }
  });

  if (inputString.includes('.')) {
    /*
      -We do this because the regex we use below to split the input string by operators uses the decimal
      as a split point as well.
      -So we first have to split the string by the decimal points and then split each of those resulting pieces
      by operators and store them in 'nestedArr' (an array of arrays).
      -If we have something like [ [4,5,6] , [7,8,9] ] and use the join('.') method, we get the string 
      '4,5,6.7,8,9' so we have to split them by the commas to get an array filled with those numbers (numArr).
    */
    const splitDecimal = inputString.split('.');
    const nestedArr = [];

    splitDecimal.forEach((item) => {
      nestedArr.push(item.split(/[+-/*]/));
    });

    numArr = nestedArr.join('.').split(',');
  } else {
    numArr = inputString.split(/[+-/*]/);
  }

  /*
    Without the below code, if we have a negative number on display and try to do any operation on it,
    we get 'NaN'. For example, if we have '-2' on display and try to add 2, the numArr would be
    ['', '2', '2'] and the opArr would be ['-', '+'] instead of ['-2', '2'] and ['+']. So if the code
    in the if-statement is executed we get ['-1, '2', '2'] and ['*', '+'] which provides the intended
    calculation.
  */

  if (numArr[0] === '') {
    numArr.splice(0, 1, '-1');
    opArr.splice(0, 1, '*');
  }

  numArr = numArr.map((num) => parseFloat(num));

  /*
    We start executing the operations in proper order (division and multiplication before addition and subtraction)
    using the two for loops below. The numArr gets two adjacent elements removed and replaced with
    the calculated value. The opArr has the corresponding operator involved in that calculation removed 
    from the array. Due to each array's size decreasing by one, we have to roll back the iteration sequence 
    of the for loop by one or else it skips an iteration.
  */

  for (i = 0; i <= opArr.length; i++) {
    let tempVal;

    if (opArr[i] === '*') {
      tempVal = numArr[i] * numArr[i + 1];
      numArr.splice(i, 2, tempVal);
      opArr.splice(i, 1);
      i--;
    } else if (opArr[i] === '/') {
      tempVal = numArr[i] / numArr[i + 1];
      numArr.splice(i, 2, tempVal);
      opArr.splice(i, 1);
      i--;
    }
  }

  for (i = 0; i <= opArr.length; i++) {
    let tempVal;

    if (opArr[i] === '+') {
      tempVal = numArr[i] + numArr[i + 1];
      numArr.splice(i, 2, tempVal);
      opArr.splice(i, 1);
      i--;
    } else if (opArr[i] === '-') {
      tempVal = numArr[i] - numArr[i + 1];
      numArr.splice(i, 2, tempVal);
      opArr.splice(i, 1);
      i--;
    }
  }

  /*
    At the end of the total calculation, numArr is reduced to a size of one containing the resulting value.
    If the result is 0, then we want to clear the input string so a new string of calculations can
    be entered. If it's not 0, then we want the input string to be that value so that if the user
    wants to continue running more operations on it then they can. So we set the 'lastCalc' variable
    to true, which allows the handleKey function to do exactly that.
  */

  if (numArr[0] === 0) {
    screen.textContent = '0';
    inputString = '';
  } else {
    screen.textContent = numArr[0];
    inputString = `${numArr[0]}`;

    lastCalc = true;
  }
}

/*
  This function is checking if it would be valid to add any operator to the end of the current input string.
  We check if the last character in the string is already an operator and if so, we return true,
  which means another operator can't be added. Also, an operator should not be added if the input string is empty.
  If the entire string is either '.' or '0', then we don't add an operator as well.
*/

function checkInvalidOperator() {
  const lastChar = inputString.slice(inputString.length - 1);

  if (
    lastChar === '/' ||
    lastChar === '*' ||
    lastChar === '-' ||
    lastChar === '+' ||
    inputString === ''
  ) {
    return true;
  } else if (
    (inputString.charAt(0) === '.' || inputString.charAt(0) === '0') &&
    inputString.length === 1
  ) {
    return true;
  } else {
    return false;
  }
}

/*
  This function checks whether it's valid to add another decimal to the end of the current input string
  if it returns true that means it's an invalid decimal input (another decimal should not be added)
*/

function checkInvalidDecimal() {
  // if the input string does not contain any decimals at all, then adding a decimal is valid
  if (!inputString.includes('.')) return false;

  // if the input string already has a decimal, but no operators, then a decimal should not be added
  if (
    inputString.includes('.') &&
    !(
      inputString.includes('+') ||
      inputString.includes('-') ||
      inputString.includes('*') ||
      inputString.includes('/')
    )
  ) {
    return true;
  }

  /*
    Here we are looking at the case where there are multiple decimals and operators in the string.
    ie. '0.9+5/2+3.6-.10', which in this case the function would return true.
    We set up two arrays where one stores the position/index of all of the decimals in the input string and the
    other one stores the position/index of all of the operators.
    Then we check if the index value of the last item in the decimal array is greater than the index
    value of the last item in the operator array. If that's true, then we return true. Which means we
    have something like '0.9+5/2+3.6-.10' where adding another decimal would be invalid. If on the other
    hand we had something like '0.9+5/2+3.6-10', then adding another decimal would be valid.
  */

  const stringArr = inputString.split('');

  const decIndexArr = [];
  const opIndexArr = [];

  stringArr.forEach((char, i) => {
    if (char === '.') {
      decIndexArr.push(i);
    } else if (char === '+' || char === '-' || char === '*' || char === '/') {
      opIndexArr.push(i);
    }
  });

  if (decIndexArr[decIndexArr.length - 1] > opIndexArr[opIndexArr.length - 1]) {
    return true;
  }

  // if no if-statements are triggered we return false by default
  return false;
}

// Adds the inputed numbers, operators, or decimals to the inputString
function handleKey(key) {
  /*
    This makes sure that if the inputString is for example, '3+0' currently, you should only be able to
    add a decimal to the end of the string. So '3+09' or '3+0-' is invalid.
  */

  if (
    key !== '.' &&
    inputString.charAt(inputString.length - 1) === '0' &&
    (inputString.charAt(inputString.length - 2) === '+' ||
      inputString.charAt(inputString.length - 2) === '-' ||
      inputString.charAt(inputString.length - 2) === '*' ||
      inputString.charAt(inputString.length - 2) === '/')
  ) {
    return;
  }

  /*
    This is to make sure that if the currently displayed number on the screen is the value from the
    previous calculation (we determine this using the 'lastCalc' variable) and then you enter a number, 
    that number you entered replaces the previous value on the screen. 
    The same thing happens if the currently displayed number is 0 (not '0.' which has a decimal).
    Otherwise you add the input to the end of the string.
  */

  if (
    (lastCalc || (inputString.charAt(0) === '0' && inputString.charAt(1) !== '.')) &&
    key !== '+' &&
    key !== '-' &&
    key !== '*' &&
    key !== '/'
  ) {
    inputString = `${key}`;
    screen.textContent = inputString;

    lastCalc = false;
  } else {
    lastCalc = false;
    inputString = inputString.concat(`${key}`);
    screen.textContent = inputString;
  }
}

// This highlights the corresponding button element on a keypress and then removes it
function keypressHighlight(keyclass) {
  const key = document.querySelector(`.${keyclass}`);
  key.classList.add('pressed');

  setTimeout(() => {
    key.classList.remove('pressed');
  }, 150);
}

// Handles every click and keypress event
function handleInput(e) {
  /*
    This gets rid of the focus on the button after it gets clicked. We do this because if you try to keypress
    on any other button afterwards, it will only activate that initially focused button
  */
  e.target.blur();

  if (e.target.dataset.key === '9' || e.keyCode === 57) {
    handleKey(9);
    keypressHighlight('nine');
  } else if (e.target.dataset.key === '8' || e.keyCode === 56) {
    handleKey(8);
    keypressHighlight('eight');
  } else if (e.target.dataset.key === '7' || e.keyCode === 55) {
    handleKey(7);
    keypressHighlight('seven');
  } else if (e.target.dataset.key === '6' || e.keyCode === 54) {
    handleKey(6);
    keypressHighlight('six');
  } else if (e.target.dataset.key === '5' || e.keyCode === 53) {
    handleKey(5);
    keypressHighlight('five');
  } else if (e.target.dataset.key === '4' || e.keyCode === 52) {
    handleKey(4);
    keypressHighlight('four');
  } else if (e.target.dataset.key === '3' || e.keyCode === 51) {
    handleKey(3);
    keypressHighlight('three');
  } else if (e.target.dataset.key === '2' || e.keyCode === 50) {
    handleKey(2);
    keypressHighlight('two');
  } else if (e.target.dataset.key === '1' || e.keyCode === 49) {
    handleKey(1);
    keypressHighlight('one');
  } else if (e.target.dataset.key === '0' || e.keyCode === 48) {
    if (inputString === '') return;
    handleKey(0);
    keypressHighlight('zero');
  } else if (e.target.dataset.key === '*' || e.keyCode === 42) {
    if (checkInvalidOperator()) return;
    handleKey('*');
    keypressHighlight('times');
  } else if (e.target.dataset.key === '/' || e.keyCode === 47) {
    if (checkInvalidOperator()) return;
    handleKey('/');
    keypressHighlight('division');
  } else if (e.target.dataset.key === '+' || e.keyCode === 43) {
    if (checkInvalidOperator()) return;
    handleKey('+');
    keypressHighlight('plus');
  } else if (e.target.dataset.key === '-' || e.keyCode === 45) {
    if (checkInvalidOperator()) return;
    handleKey('-');
    keypressHighlight('minus');
  } else if (e.target.dataset.key === '.' || e.keyCode === 46) {
    if (checkInvalidDecimal()) return;
    handleKey('.');
    keypressHighlight('decimal');
  } else if (e.target.dataset.key === '=' || e.keyCode === 61 || e.keyCode === 13) {
    calculate();
    keypressHighlight('equals');
  } else if (e.target.dataset.key === 'C' || e.keyCode === 99 || e.keyCode === 67) {
    inputString = '';
    screen.textContent = '0';
    keypressHighlight('clear');
  } else if (e.target.dataset.key === 'delete' || e.keyCode === 8) {
    inputString = inputString.slice(0, inputString.length - 1);
    screen.textContent = inputString !== '' ? inputString : '0';
    keypressHighlight('delete');
  }
}

keypad.addEventListener('click', handleInput);
window.addEventListener('keypress', handleInput);

// We do this because the backspace key is not included in the class of 'keypress' keys
window.addEventListener('keydown', (e) => {
  if (e.keyCode === 8) handleInput(e);
});
