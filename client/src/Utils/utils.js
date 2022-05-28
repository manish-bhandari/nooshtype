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
