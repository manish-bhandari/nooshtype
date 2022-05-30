import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import randomWords from "random-words";
import { article } from "https://unpkg.com/txtgen/dist/txtgen.esm.js";
import useKeyPress from "../Utils/useKeyPress";
import "../styles/Game.css";

import {
  findCurrentCharIndex,
  findNumBlanks,
  getWordLength,
  isWordCorrect,
  getLengthTillWrapping,
  getEndOfFirstLine,
  getWordsWrappingStates,
} from "../Utils/utils";

export default function Game() {
  const caretRef = useRef();
  const [words, setWords] = useState([]);
  const [wordsLoaded, setWordsLoaded] = useState(false);

  const [mode, setMode] = useState("words");
  const [currInput, setCurrInput] = useState("");
  const [currWordIndex, setCurrWordIndex] = useState(undefined);
  const [currWordCharIndex, setCurrWordCharIndex] = useState(undefined);
  const [currIndex, setCurrIndex] = useState(0);

  const [caretPosTop, setCaretPosTop] = useState(undefined);
  const [caretPosLeft, setCaretPosLeft] = useState(undefined);

  const [caretState, setCaretState] = useState("blink");
  const [wordsWrapState, setWordsWrapState] = useState(undefined);
  const [wordsCorrectness, setWordsCorrectness] = useState(undefined);

  const [printFrom, setPrintFrom] = useState(0);
  const [currLine, setCurrLine] = useState(1);
  const [visibleLine, setVisibleLine] = useState(1);
  const [prevLine, setPrevLine] = useState(1);

  const [firstLineLen, setFirstLineLen] = useState(undefined);

  const wordsContainer = useRef(null);

  useEffect(() => {
    if (currWordCharIndex == undefined) {
      return;
    }
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
    setPrevLine(currLine);
    setCurrLine(currLine + 1);
  };

  useEffect(() => {
    console.log("firstlinelen", firstLineLen);
  }, [firstLineLen]);

  const updateCaret = () => {
    const currentWordNodeList = document
      ?.querySelector("#words .active")
      ?.querySelectorAll(".letter");

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
    if (caretPosTop != undefined) console.log("caret pos top changed");
  }, [caretPosTop]);

  useEffect(() => {
    let newWords = [];
    if (mode === "words") {
      newWords = randomWords({ exactly: 50 }).map((word) =>
        word.split("").map((letter) => {
          return { letter: letter, state: "none" };
        })
      );
    } else if (mode === "quotes") {
      words = article([1]).split(" ");
    }
    setWords(newWords);
    setWordsWrapState(new Array(newWords.length).fill(false));
    setWordsCorrectness(new Array(newWords.length).fill(""));
    setCurrWordCharIndex(0);
    setCurrWordIndex(0);
  }, [mode]);

  useEffect(() => {
    updateCaret();
  }, [currWordIndex, currWordCharIndex]);

  useEffect(() => {
    if (!words) {
      setWordsLoaded(true);
    }
  }, [words]);

  if (mode === "words") {
  } else if (mode === "quotes") {
  }

  useKeyPress((key) => {
    const letterWidth = 17.24;
    const spaceWidth = 12.8;
    const OFFSET = 7;
    // console.log(key);

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
          setCurrWordIndex(currWordIndex + 1);
          setCurrWordCharIndex(0);
          let arr = [...wordsCorrectness];
          arr[currWordIndex] = isWordCorrect(words[currWordIndex])
            ? ""
            : "incorrect";
          setWordsCorrectness(arr);
        }
      }
      // if pressing space at anywhere else in the word
      else {
        // if (currTop != nextTop) {
        //   scrollWords();
        //   setCaretPosTop(nextTop);
        // }
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
    } else {
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

    // CARET BLINK: when idle, blink caret
  });

  if (words.length == 0) return;
  return (
    <div className="game">
      <div className="gamemodes">
        <button onClick={() => setMode("words")}>words</button>
        <button onClick={() => setMode("quotes")}>quotes</button>
      </div>
      <div className="words_wrapper">
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
    </div>
  );
}

const GameComponent = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .gamemodes {
    display: flex;
    margin-bottom: 20px;
    gap: 10px;
  }
  .words_wrapper {
    width: 60%;
    height: 110px;
    overflow: hidden;
    .caret {
      position: absolute;
      height: 2rem;
      width: 3px;
      border-radius: 2px;
      background-color: var(--main-color);
      transition: all 0.2s ease 0s;

      &.blink {
        animation: caretFlashSmooth 1s infinite;
      }
      @keyframes caretFlashSmooth {
        0%,
        100% {
          opacity: 0;
        }

        50% {
          opacity: 1;
        }
      }
    }
  }
`;

const Words = styled.div`
  color: var(--text-color-none);
  font-size: 1.5rem;
  line-height: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 1em;
  transition: all 0.25s ease 0s;
  margin-left: unset;
  .wrapping {
    background-color: red;
  }
  .word {
    display: flex;
    border-bottom: 2px solid transparent;
    line-height: 1rem;
    margin: 0.4rem;
    &.incorrect {
      border-bottom: 2px solid var(--text-color-incorrect);
      text-shadow: 1px 0 0 var(--bg-color), -1px 0 0 var(--bg-color),
        0 1px 0 var(--bg-color), 1px 1px 0 var(--bg-color),
        -1px 1px 0 var(--bg-color);
    }
    .correct {
      color: var(--text-color-correct);
    }
    .incorrect {
      color: var(--text-color-incorrect);
    }
    .extra {
      color: var(--text-color-extra);
    }
    span {
      font-size: 24px;
      padding: 0.2rem 0.08rem;
    }
  }
`;
