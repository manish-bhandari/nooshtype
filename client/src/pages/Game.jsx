import React, { useEffect, useState } from "react";
import styled from "styled-components";
import randomWords from "random-words";
// import sentence from "txtgen";
import { article } from "https://unpkg.com/txtgen/dist/txtgen.esm.js";
import useKeyPress from "../Utils/useKeyPress";
import {
  findCurrentCharIndex,
  findNumBlanks,
  getWordLength,
  isWordCorrect,
} from "../Utils/utils";

export default function Game() {
  const [words, setWords] = useState([]);
  const [mode, setMode] = useState("words");
  const [currInput, setCurrInput] = useState("");
  const [currWordIndex, setCurrWordIndex] = useState(0);
  const [currWordCharIndex, setCurrWordCharIndex] = useState(0);
  const [currIndex, setCurrIndex] = useState(0);
  const [caretPos, setCaretPos] = useState(6.4);
  const [caretState, setCaretState] = useState("blink");
  const [wordsCorrectness, setWordsCorrectness] = useState([]);

  useEffect(() => {
    if (wordsCorrectness.length == 0 && words.length != 0) {
      let correctnessArr = [];
      words.forEach(() => {
        correctnessArr.push("");
      });
      setWordsCorrectness(correctnessArr);
    }
  }, [words]);

  useEffect(() => {
    // const letterWidth = 15;
    // const OFFSET = 7;
    // setCaretPos(currIndex * letterWidth + OFFSET);
  }, [currIndex]);

  useEffect(() => {
    if (wordsCorrectness.length == 0) {
    }
  }, [currWordIndex]);

  useEffect(() => {
    if (currWordIndex) {
    }
  }, [currWordIndex]);

  useEffect(() => {
    if (mode === "words") {
      const words = randomWords({ exactly: 50 });
      const words_arr = words.map((word) =>
        word.split("").map((letter) => {
          return { letter: letter, state: "none" };
        })
      );
      setWords(words_arr);
    } else if (mode === "quotes") {
      setWords(article([1]).split(" "));
    }
  }, [mode]);

  useEffect(() => {}, [words]);

  if (mode === "words") {
  } else if (mode === "quotes") {
  }

  useKeyPress((key) => {
    const letterWidth = 17.24;
    const spaceWidth = 12.8;
    const OFFSET = 7;
    // console.log(key);

    if (key == " ") {
      // if pressing space before the word is done
      if (currWordCharIndex != getWordLength(words[currWordIndex])) {
        // pressing space at beginning of word shouldn't do anything
        if (currWordCharIndex != 0) {
          const lettersRemain = words[currWordIndex].length - currWordCharIndex;
          setCaretPos(caretPos + lettersRemain * letterWidth + spaceWidth);
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
        let arr = [...wordsCorrectness];
        arr[currWordIndex] = isWordCorrect(words[currWordIndex])
          ? ""
          : "incorrect";
        setWordsCorrectness(arr);
        setCaretPos(caretPos + spaceWidth);
        setCurrWordIndex(currWordIndex + 1);
        setCurrWordCharIndex(0);
      }
    } else if (key === "Backspace") {
      if (currWordCharIndex == 0) {
        if (currWordIndex != 0) {
          const numBlanks = findNumBlanks(words[currWordIndex - 1]);
          setCaretPos(caretPos - numBlanks * letterWidth - spaceWidth);
          setCurrWordIndex(currWordIndex - 1);
          setCurrWordCharIndex(words[currWordIndex - 1].length - numBlanks);
          wordsCorrectness[currWordIndex - 1] = "correct";
        } else if (currWordIndex == 0 && currWordCharIndex != 0) {
          setCurrWordCharIndex(words[currWordIndex - 1].length);
          setCaretPos(caretPos - spaceWidth);
        }
      } else {
        // if erasing extra chars at the end
        if (currWordCharIndex > getWordLength(words[currWordIndex])) {
          words[currWordIndex].pop();
          setCaretPos(caretPos - letterWidth);
        } else {
          const newWords = [...words];
          newWords[currWordIndex][currWordCharIndex - 1].state = "none";
          setWords(newWords);
          setCaretPos(caretPos - letterWidth);
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
        setCaretPos(caretPos + letterWidth);
        setCurrWordCharIndex(currWordCharIndex + 1);
      } else {
        // CASE: At the end of the word and you're typing letters instead of space
        words[currWordIndex].push({ letter: key, state: "extra" });
        setCaretPos(caretPos + letterWidth);
        setCurrWordCharIndex(currWordCharIndex + 1);
      }
    }

    // CARET BLINK: when idle, blink caret
    setCaretState("");
    setTimeout(() => {
      setCaretState("blink");
    }, 4000);
  });

  if (words.length == 0) return;
  return (
    <GameComponent>
      <div className="gamemodes">
        <button onClick={() => setMode("words")}>words</button>
        <button onClick={() => setMode("quotes")}>quotes</button>
      </div>
      <p>{findCurrentCharIndex(currWordCharIndex, words[currWordIndex])}</p>
      {/* <h1>{`currentWord: ${words[currWordIndex]}`}</h1> */}
      <p>{`index: ${currWordCharIndex}/${getWordLength(
        words[currWordIndex]
      )}`}</p>
      <div className="words_wrapper">
        <div
          className={`caret ${caretState}`}
          style={{ left: `${caretPos}px` }}
        ></div>
        <Words className="words">
          {words.map((word, index) => {
            const isPastWord = index < currWordIndex;
            const isCurrentWord = index == currWordIndex;
            return (
              <div className={`word ${wordsCorrectness[index]}`} key={index}>
                {word.map((letter, index) => {
                  const isPastLetter = index < currWordCharIndex;
                  return (
                    <span className={`letter ${letter.state}`} key={index}>
                      {letter.letter}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </Words>
      </div>
    </GameComponent>
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
    position: relative;
    .caret {
      position: absolute;
      height: 2rem;
      width: 3px;
      border-radius: 2px;
      top: 1px;
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
