import React, { useEffect, useState } from "react";
import Words from "./Words";
import "../styles/Game.css";
import { getWords } from "../Utils/Words";

const gamemodes = ["time", "words", "quotes"];
const options = {
  time: [10, 30, 60, 120],
  words: [10, 25, 50, 100],
  quotes: ["short", "medium", "long"],
};
const extras = ["punctuations", "numbers"];

export default function Game() {
  const [words, setWords] = useState([]);

  const [currWordIndex, setCurrWordIndex] = useState(undefined);

  const [gamemode, setGamemode] = useState("time");
  const [option, setOption] = useState(undefined);
  const [configs, setConfigs] = useState(undefined);

  const [extraOptions, setExtraOptions] = useState([]);
  const [extraEnabled, setExtraEnabled] = useState(true);

  const [gameStatus, setGameStatus] = useState("waiting");

  const [timer, setTimer] = useState(undefined);

  const [stopwatch, setStopwatch] = useState(0);

  const [rawWPM, setrawWPM] = useState(0);
  const [netWPM, setNetWPM] = useState(0);

  const [totalTyped, setTotalTyped] = useState(0);
  const [totalIncorrect, setTotalIncorrect] = useState(0);

  useEffect(() => {
    setConfigs({
      gamemode: gamemode,
      option: option,
      extraOptions: extraOptions,
      extraEnabled: extraEnabled,
    });
  }, [option, extraOptions, extraEnabled]);

  useEffect(() => {
    if (configs == undefined) return;
    const mywords = getWords(configs);
    setWords(
      mywords.map((word) =>
        word.split("").map((letter) => {
          return { letter: letter, state: "none" };
        })
      )
    );
  }, [configs]);

  useEffect(() => {
    if (option !== options[gamemode][0]) {
      setOption(options[gamemode][0]);
    } else {
      setConfigs({
        gamemode: gamemode,
        option: option,
        extraOptions: extraOptions,
        extraEnable: extraEnabled,
      });
    }
    setExtraOptions([]);
    setExtraEnabled(gamemode != "quotes");
  }, [gamemode]);

  const updateExtras = (extra) => {
    // if already exists, remove it
    if (extraOptions.includes(extra)) {
      setExtraOptions(extraOptions.filter((ext) => ext !== extra));
    } else {
      setExtraOptions([...extraOptions, extra]);
    }
  };

  const start = () => {
    setGameStatus("running");
    console.log("game started");
    if (gamemode === "time") {
      setTimer(option);
      startCountdown();
    }
  };

  const startCountdown = () => {
    let interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          end();
          clearInterval(interval);
        } else {
          return prevTimer - 1;
        }
      });
    }, 1000);
  };

  // Stopwatch to how much time elapsed
  useEffect(() => {
    let interval = null;
    if (gameStatus === "running") {
      interval = setInterval(() => {
        setStopwatch((prevtime) => {
          return prevtime + 1;
        });
      }, 1000);
    } else clearInterval(interval);
    return () => clearInterval(interval);
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus !== "running") return;
    const gross_wpm = totalTyped / 5 / (stopwatch / 60);
    const net_wpm = (totalTyped - totalIncorrect) / 5 / (stopwatch / 60);

    setrawWPM(gross_wpm.toFixed(2));
    setNetWPM(net_wpm.toFixed(2));
  }, [stopwatch]);

  const end = () => {
    console.log("game ended");
    setGameStatus("finished");
  };

  const getAccuracy = () => {
    const accuracy = (1 - totalIncorrect / totalTyped) * 100;
    return accuracy;
  };

  if (option == undefined) return <></>;

  return (
    <div className="game">
      <div
        className={`game_container ${
          gameStatus === "finished" ? "hidden" : ""
        }`}
      >
        <div className={`header ${gameStatus === "running" ? "hidden" : ""}`}>
          <div className="options item">
            {options[gamemode].map((opt, index) => (
              <div
                className={`option ${option == opt ? "active" : ""}`}
                onClick={() => setOption(opt)}
                key={index}
              >
                {opt}
              </div>
            ))}
          </div>
          <div className="rightside">
            <div className="extras item">
              {extras.map((item, index) => (
                <div
                  className={`addition ${
                    extraOptions.includes(item) ? "active" : ""
                  } ${!extraEnabled ? "disabled" : ""}`}
                  onClick={() => updateExtras(item)}
                  key={index}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="gamemodes item">
              {gamemodes.map((mode, index) => (
                <div
                  className={`gamemode ${gamemode == mode ? "active" : ""}`}
                  key={index}
                  onClick={() => setGamemode(mode)}
                >
                  {mode}
                </div>
              ))}
            </div>
          </div>
        </div>
        {gameStatus === "running" && (
          <div className={`header playing`}>
            <p className="status">
              {gamemode === "time" ? timer : `${currWordIndex}/${words.length}`}
            </p>
            <p className="status">{Math.round(netWPM)}</p>
          </div>
        )}
        <Words
          configs={configs}
          startGame={start}
          endGame={end}
          gameStatus={gameStatus}
          currWordIndex={currWordIndex}
          setCurrWordIndex={setCurrWordIndex}
          words={words}
          setWords={setWords}
          totalTyped={totalTyped}
          setTotalTyped={setTotalTyped}
          totalIncorrect={totalIncorrect}
          setTotalIncorrect={setTotalIncorrect}
        />
        <button
          className="restart_btn"
          style={{ opacity: `${gameStatus === "running" ? "1" : "0"}` }}
        >
          <i class="fa-solid fa-rotate-right"></i>
        </button>
      </div>
      {gameStatus === "finished" && (
        <div className={`results`}>
          <div className="head">
            <h1>Result</h1>
            <p>
              {gamemode},{option}
            </p>
          </div>
          <div className="content">
            <div className="top">
              <div className="item">
                <p className="label">wpm</p>
                <h1 className="value">{Math.round(netWPM)}</h1>
              </div>
            </div>
            <div className="footer">
              <div className="item">
                <p className="label">acc</p>
                <h1 className="value">{getAccuracy().toFixed(0)}%</h1>
              </div>
              <div className="item">
                <p className="label">raw</p>
                <h1 className="value">{Math.round(rawWPM)}</h1>
              </div>
              <div className="item">
                <p className="label">time</p>
                <h1 className="value">{stopwatch.toFixed(0)}s</h1>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
