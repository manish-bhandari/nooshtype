import randomWord from "random-words";

const getWords = (mode) => {
  if (mode === "words") {
  } else if (mode === "quotes") {
  }
};

export const getWordLength = (charArr) => {
  let total = 0;
  charArr.forEach((letter) => {
    if (letter.state != "extra") {
      total++;
    }
  });
  return total;
};

export const findCurrentCharIndex = (currentCharIndex, charArr) => {
  if (currentCharIndex > getWordLength(charArr) - 1) {
    return getWordLength(charArr);
  }
  return currentCharIndex;
};

/**
 * Finds if the word given has any letters that aren't correct.
 * @param  charArr -> array of chars in a word
 * @returns true or false
 */
export const isWordCorrect = (charArr) => {
  let found = true;
  charArr.forEach((letter) => {
    if (
      letter.state == "incorrect" ||
      letter.state == "extra" ||
      letter.state == "none"
    ) {
      found = false;
    }
  });
  return found;
};

/**
 * Iterates backwords and returns the number of consecutive blanks in a word
 * @param charArr -> array of chars in a word
 * @returns
 */
export const findNumBlanks = (charArr) => {
  let total = 0;
  for (var i = charArr.length - 1; i >= 0; i--) {
    if (charArr[i].state == "none") {
      total++;
    }
  }
  return total;
};

/**
 * Finds if an element was wrapped to next line
 * @param {*} previous
 * @param {*} current
 * @returns
 */
const isWrapping = (next, current) =>
  next.getBoundingClientRect().top !== current.getBoundingClientRect().top;

/**
 *
 * container -> div with words
 */
export const getWordsWrappingStates = (
  container,
  startIndex,
  wordsWrappingStates
) => {
  const wordsStates = [];
  for (let i = 0; i < startIndex; i++) {
    wordsStates.push(wordsWrappingStates[i]);
  }

  for (let i = 0; i < container.children.length - 1; i++) {
    const next = container.children[i + 1];
    const current = container.children[i];

    const wraps = isWrapping(next, current);
    wordsStates.push(wraps);
  }
  wordsStates.push(false);
  return wordsStates;
};

const getWordFromArr = (charArr) => {
  let word = "";
  for (let i = 0; i < charArr.length; i++) {
    word += charArr[i].innerText;
  }
  return word;
};

export const getEndOfFirstLine = (wordsWrapState, startIndex) => {
  // 2->
  for (var i = startIndex; i < wordsWrapState.length; i++) {
    if (wordsWrapState[i]) {
      return i + 1;
    }
  }
};

/**
 * Gets the count until the first wrapping element
 */
export const getLengthTillWrapping = (thWrapping, words) => {
  let index = 0;
  thWrapping = thWrapping - 3;
  while (index < words.length) {
    if (words[index].isWrapping) {
      if (thWrapping == 0) {
        break;
      } else {
        thWrapping--;
      }
    }
    index++;
  }
  return index;
};
