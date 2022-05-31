import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import randomWords from "random-words";
import { article } from "https://unpkg.com/txtgen/dist/txtgen.esm.js";
import useKeyPress from "../Utils/useKeyPress";
import "../styles/Words.css";

import {
  findCurrentCharIndex,
  findNumBlanks,
  getWordLength,
  isWordCorrect,
  getLengthTillWrapping,
  getEndOfFirstLine,
  getWordsWrappingStates,
} from "../Utils/utils";
import { getWords } from "../Utils/Words";

export default function Words({
  configs,
  startGame,
  endGame,
  currWordIndex,
  setCurrWordIndex,
}) {
  const [opacity, setOpacity] = useState(undefined);

  const [words, setWords] = useState([]);
  const [wordsLoaded, setWordsLoaded] = useState(false);

  const [currWordCharIndex, setCurrWordCharIndex] = useState(undefined);

  const [caretPosTop, setCaretPosTop] = useState(undefined);
  const [caretPosLeft, setCaretPosLeft] = useState(undefined);

  const [caretState, setCaretState] = useState("blink");
  const [wordsWrapState, setWordsWrapState] = useState(undefined);
  const [wordsCorrectness, setWordsCorrectness] = useState(undefined);

  const [printFrom, setPrintFrom] = useState(0);
  const [currLine, setCurrLine] = useState(1);
  const [visibleLine, setVisibleLine] = useState(1);

  const wordsContainer = useRef(null);

  const [started, setStarted] = useState(false);

  useEffect(() => {
    const mywords = getWords(configs);
    setWords(
      mywords.map((word) =>
        word.split("").map((letter) => {
          return { letter: letter, state: "none" };
        })
      )
    );
    setWordsWrapState(new Array(mywords.length).fill(false));
    setWordsCorrectness(new Array(mywords.length).fill(""));
    setCurrWordCharIndex(0);
    setCurrWordIndex(0);
    setOpacity(0);
  }, [configs]);

  // fade in when new words come
  useEffect(() => {
    if (configs.option == undefined || opacity >= 1) return;
    const timer = setInterval(() => {
      setOpacity(opacity + 0.1);
    }, 50);
    return () => clearInterval(timer);
  }, [opacity]);

  // make caret blink on idle
  useEffect(() => {
    if (currWordCharIndex == undefined) return;
    const timeout = setTimeout(() => {
      setCaretState("blink");
    }, 2500);
    return () => {
      clearTimeout(timeout);
      setCaretState("");
    };
  }, [currWordCharIndex]);

  const scrollWords = () => {
    const firstLineEndIndex = getEndOfFirstLine(wordsWrapState, printFrom);
    setPrintFrom(firstLineEndIndex);
    setCurrLine(currLine + 1);
  };

  const updateCaret = () => {
    const currentWordNodeList = document
      ?.querySelector("#words .active")
      ?.querySelectorAll(".letter");

    if (currWordIndex == words.length) {
      const currWordNode = document.querySelector("#words").lastChild.children;
      let currentLetter = currWordNode[currWordNode.length - 1];

      const { top, left } = currentLetter.getBoundingClientRect();
      setCaretPosTop(top - 3);
      setCaretPosLeft(left + 17.4);
    }

    if (!currentWordNodeList) {
      return;
    }

    if (currWordCharIndex >= getWordLength(words[currWordIndex])) {
      let currentLetter = currentWordNodeList[currWordCharIndex - 1];
      const { top, left } = currentLetter.getBoundingClientRect();
      setCaretPosTop(top - 3);
      setCaretPosLeft(left + 17.4);
    } else {
      let currentLetter = currentWordNodeList[currWordCharIndex];
      const { top, left } = currentLetter.getBoundingClientRect();
      setCaretPosTop(top - 3);
      setCaretPosLeft(left);
    }
  };

  useEffect(() => {
    adjustNewLineWords();
  }, [wordsLoaded, currWordIndex]);

  const adjustNewLineWords = () => {
    if (wordsContainer.current) {
      const data = getWordsWrappingStates(
        wordsContainer.current,
        printFrom,
        wordsWrapState
      );
      setWordsWrapState(data);
    }
  };

  var doit;
  window.onresize = function () {
    clearTimeout(doit);
    doit = setTimeout(adjustNewLineWords, 100);
  };

  useEffect(() => {
    updateCaret();
    if (
      currWordIndex == words.length - 1 &&
      currWordCharIndex == words[currWordIndex].length
    ) {
      endGame();
    }
  }, [currWordIndex, currWordCharIndex]);

  useEffect(() => {
    if (!words) {
      setWordsLoaded(true);
    }
  }, [words]);

  useKeyPress((key) => {
    if (key == " ") {
      // check if need to go to next line
      const needsToWrap = wordsWrapState[currWordIndex];

      if (needsToWrap) {
        if (visibleLine == 2) {
          scrollWords();
        } else {
          setVisibleLine(visibleLine + 1);
          setCurrLine(2);
        }
      }

      // if pressing space before the word is done
      if (currWordCharIndex != getWordLength(words[currWordIndex])) {
        // pressing space at beginning of word shouldn't do anything
        if (currWordCharIndex != 0) {
          let arr = [...wordsCorrectness];
          arr[currWordIndex] = isWordCorrect(words[currWordIndex])
            ? ""
            : "incorrect";
          setWordsCorrectness(arr);

          setCurrWordIndex(currWordIndex + 1);
          setCurrWordCharIndex(0);
        }
      }
      // if pressing space at the end of the word
      else {
        let arr = [...wordsCorrectness];
        arr[currWordIndex] = isWordCorrect(words[currWordIndex])
          ? ""
          : "incorrect";
        setWordsCorrectness(arr);
        setCurrWordIndex(currWordIndex + 1);
        setCurrWordCharIndex(0);
      }
    } else if (key === "Backspace") {
      if (currWordCharIndex == 0) {
        // check if going to previous line
        if (currWordIndex != printFrom && wordsWrapState[currWordIndex - 1]) {
          setVisibleLine(visibleLine - 1);
        }
        if (currWordIndex != printFrom) {
          const numBlanks = findNumBlanks(words[currWordIndex - 1]);
          setCurrWordIndex(currWordIndex - 1);
          setCurrWordCharIndex(words[currWordIndex - 1].length - numBlanks);
          wordsCorrectness[currWordIndex - 1] = "correct";
        } else if (currWordIndex == 0 && currWordCharIndex != 0) {
          setCurrWordCharIndex(words[currWordIndex - 1].length);
        }
      } else {
        // if erasing extra chars at the end
        if (currWordCharIndex > getWordLength(words[currWordIndex])) {
          words[currWordIndex].pop();
        } else {
          const newWords = [...words];
          newWords[currWordIndex][currWordCharIndex - 1].state = "none";
          setWords(newWords);
        }
        setCurrWordCharIndex(currWordCharIndex - 1);
      }
    }
    // Any other key is pressed
    else {
      // START THE GAME WHEN FIRST KEY PRESSED
      if (!started) setStarted(true);

      if (
        findCurrentCharIndex(currWordCharIndex, words[currWordIndex]) !=
        getWordLength(words[currWordIndex])
      ) {
        const newState =
          key === words[currWordIndex][currWordCharIndex].letter
            ? "correct"
            : "incorrect";
        const newWords = [...words];
        newWords[currWordIndex][currWordCharIndex].state = newState;
        setWords(newWords);
        setCurrWordCharIndex(currWordCharIndex + 1);
      } else {
        // CASE: At the end of the word and you're typing letters instead of space
        words[currWordIndex].push({ letter: key, state: "extra" });
        setCurrWordCharIndex(currWordCharIndex + 1);
      }
    }
  });

  /* === ENDS GAME IF CURR WORD IS OUT OF BOUNDS*/
  useEffect(() => {
    if (currWordIndex == words.length - 1) endGame();
  }, [caretPosLeft]);

  useEffect(() => {
    if (started) startGame();
  }, [started]);

  if (words.length == 0) return;
  return (
    <div className="words_wrapper" style={{ opacity: `${opacity}` }}>
      <div
        className={`caret ${caretState}`}
        style={{ top: `${caretPosTop}px`, left: `${caretPosLeft}px` }}
      ></div>
      <div id="words" className="words" ref={wordsContainer}>
        {words.slice(printFrom, words.length).map((word, index) => {
          index = index + printFrom;
          return (
            <div
              className={`word ${wordsCorrectness[index]} ${
                index == currWordIndex ? "active" : ""
              }`}
              key={index}
            >
              {word.map((letter, index) => {
                return (
                  <span className={`letter ${letter.state}`} key={index}>
                    {letter.letter}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
