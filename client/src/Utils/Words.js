import { article } from "https://unpkg.com/txtgen/dist/txtgen.esm.js";
import randomWords from "random-words";
import { shortQuotes, mediumQuotes, longQuotes } from "./quotes";

export const getWords = (settings) => {
  const { gamemode, option, extraOptions, extraEnabled } = settings;
  let words = [];
  if (gamemode === "time") {
    return getWordsForOption(100, extraOptions);
  } else if (gamemode === "words") {
    return getWordsForOption(option, extraOptions);
  } else {
    words = getRandomQuote(option).split(" ");
  }

  return words;
};

/**
 * Helper method to get words for given option
 */
const getWordsForOption = (option, extras) => {
  let myWords = randomWords({ exactly: option });
  if (extras.includes("numbers")) {
    myWords = randomlyAddNumsToArray(myWords);
  }
  if (extras.includes("punctuations")) {
    myWords = randomlyPunctuateAll(myWords);
  }
  return myWords;
};

const randomlyAddNumsToArray = (array) => {
  let resultArr = [];
  array.forEach((value) => {
    const random = Math.random();
    const randomNum = Math.floor(Math.random() * 990 + 10);
    if (random < 0.1) resultArr.push(randomNum.toString());
    else resultArr.push(value);
  });

  return resultArr;
};

/**
 * Returns a string of quote of desired length
 * @param length -> what length of quote
 * @returns string
 */
const getRandomQuote = (length) => {
  let n = undefined;
  if (length == "short") n = 0;
  else if (length == "medium") n = 1;
  else n = 2;

  const quotes = [shortQuotes, mediumQuotes, longQuotes];

  const randomIndex = Math.floor(Math.random() * quotes[n].length);
  return quotes[n][randomIndex];
};

const randomlyPunctuateAll = (words) => {
  let punctuatedWords = words.map((word, index) => {
    // likelihood to add a punctuation: 20%
    const random = Math.random();
    if (random <= 0.2 && index != 0) {
      return punctuateWord(word);
    } else {
      return word;
    }
  });

  // Capitalize first letter
  punctuatedWords[0] = capitalizeWord(punctuatedWords[0]);

  // Add capitalizations after periods
  for (var i = 1; i < punctuatedWords.length - 1; i++) {
    const currentWord = punctuatedWords[i];
    const pastWord = punctuatedWords[i - 1];

    if (pastWord.charAt(pastWord.length - 1) === ".") {
      punctuatedWords[i] = capitalizeWord(punctuatedWords[i]);
    }
  }

  return punctuatedWords;
};

/**
 * Capitalize the word
 * @param {*} word
 * @returns capitalized word
 */
const capitalizeWord = (word) => {
  return word.charAt(0).toUpperCase() + word.slice(1);
};

/**
 * Adds a random punctuation to a given word
 */
const punctuateWord = (word) => {
  const punc_end = "!?.:;,";
  const punc_both = "\"'(";
  const punctuations = punc_end + punc_both;

  const randomPunc =
    punctuations[Math.floor(Math.random() * punctuations.length)];

  if (punc_end.includes(randomPunc)) {
    return word + randomPunc;
  } else {
    if (randomPunc === "(") {
      return "(" + word + ")";
    } else {
      return randomPunc + word + randomPunc;
    }
  }
};
