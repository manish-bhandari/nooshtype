import React, { useEffect, useRef, useState } from "react";
import Words from "./Words";
import "../styles/Game.css";
import { getWords } from "../Utils/Words";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";

import { useLocalStorage } from "../Utils/useLocalStorage";

const gamemodes = ["time", "words", "quotes"];
const options = {
  time: [10, 30, 60, 120],
  words: [10, 25, 50, 100],
  quotes: ["short", "medium", "long"],
};
const extras = ["punctuations", "numbers"];

export default function Game() {
  const restartRef = useRef();

  const [words, setWords] = useState([]);

  const [currWordIndex, setCurrWordIndex] = useState(undefined);

  const [gamemode, setGamemode] = useLocalStorage("gamemode", "time");
  // const [option, setOption] = useState(undefined);
  // const [extraOptions, setExtraOptions] = useState(undefined);

  const [configs, setConfigs] = useState(undefined);

  const [gameStatus, setGameStatus] = useState("waiting");

  const [timer, setTimer] = useState(undefined);

  const [stopwatch, setStopwatch] = useState(0);

  const [rawWPM, setrawWPM] = useState(0);
  const [netWPM, setNetWPM] = useState(0);

  const [totalTyped, setTotalTyped] = useState(0);
  const [totalIncorrect, setTotalIncorrect] = useState(0);

  const [restartFocus, setRestartFocus] = useState(false);

  const [gameOpacity, setGameOpacity] = useState(0);

  const [totalUncor, setTotalUncor] = useState(0);
  const [totalCorrectUncor, setTotalCorrectUncor] = useState(0);

  useEffect(() => {
    if (gameOpacity >= 1) return;
    const timer = setInterval(() => {
      setGameOpacity(gameOpacity + 0.1);
    }, 30);
    return () => clearInterval(timer);
  }, [gameOpacity]);

  useEffect(() => {
    if (configs == undefined) return;
    console.log(configs);
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
    // const settingsStorage = localStorage.getItem("modes");
    // const settings = JSON.parse(modesStorage);

    // if (settings) {
    //   const { gamemode, option, extraOptions } = settings;
    // }
    localStorage.setItem("gamemode", JSON.stringify(gamemode));
    const settingsStorage = localStorage.getItem("settings");
    let settings = JSON.parse(settingsStorage);

    if (!settings) {
      settings = {
        time: {
          option: options["time"][0],
          extraOptions: [],
        },
        words: { option: options["words"][0], extraOptions: [] },
        quotes: { option: options["quotes"][0], extraOptions: [] },
      };
      localStorage.setItem("settings", JSON.stringify(settings));
    }
    const myOption = settings[gamemode].option;
    const myExtraOptions = settings[gamemode].extraOptions;
    setConfigs({
      gamemode: gamemode,
      option: myOption,
      extraOptions: myExtraOptions,
    });
  }, [gamemode]);

  const updateExtras = (extra) => {
    // if already exists, remove it
    const save = { ...configs };
    if (configs.extraOptions.includes(extra)) {
      save["extraOptions"] = configs.extraOptions.filter(
        (ext) => ext !== extra
      );
      setConfigs(save);
    } else {
      save["extraOptions"] = [...configs.extraOptions, extra];
      setConfigs(save);
    }
    const storage = localStorage.getItem("settings");
    const settings = JSON.parse(storage);
    settings[gamemode].extraOptions = save.extraOptions;
    localStorage.setItem("settings", JSON.stringify(settings));
  };

  const updateOption = (option) => {
    let save = { ...configs };
    save["option"] = option;
    const storage = localStorage.getItem("settings");
    const settings = JSON.parse(storage);
    settings[gamemode].option = option;
    localStorage.setItem("settings", JSON.stringify(settings));
    setConfigs(save);
  };

  const start = () => {
    setGameStatus("running");
    if (gamemode === "time") {
      setTimer(configs.option);
    }
  };

  useEffect(() => {
    let interval = null;
    if (gameStatus === "running" && gamemode == "time") {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 0) {
            end();
            clearInterval(interval);
          } else {
            return prevTimer - 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus]);

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
    setGameStatus("finished");
  };

  const restart = () => {
    setGameStatus("waiting");
    restartRef.current.blur();
    setGameOpacity(0);
    setConfigs({
      gamemode: gamemode,
      option: configs.option,
      extraOptions: configs.extraOptions,
    });
  };

  const getAccuracy = () => {
    return (totalCorrectUncor / totalUncor) * 100;
  };

  useEffect(() => {
    if (restartFocus) {
      restartRef.current.focus();
    }
  }, [restartFocus]);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      if (e.repeat) return;
      if (document.activeElement !== restartRef.current) {
        restartRef.current.focus();
        setRestartFocus(true);
      }
    }
  });

  if (configs == undefined || words == undefined) return <></>;

  return (
    <div className="game" style={{ opacity: gameOpacity }}>
      {/* <h1
        style={{ color: "white" }}
      >{`${totalTyped} - ${totalIncorrect}) / 5 / (${stopwatch} / 60`}</h1> */}
      <div
        className={`game_container ${
          gameStatus === "finished" ? "hidden" : ""
        }`}
      >
        <div className={`header ${gameStatus === "running" ? "hidden" : ""}`}>
          <div className="options item">
            {options[gamemode].map((opt, index) => (
              <div
                className={`option ${configs.option == opt ? "active" : ""}`}
                onClick={() => {
                  updateOption(opt);
                }}
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
                    configs.extraOptions.includes(item) ? "active" : ""
                  } ${gamemode === "quotes" ? "disabled" : ""}`}
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
          setGameStatus={setGameStatus}
          currWordIndex={currWordIndex}
          setCurrWordIndex={setCurrWordIndex}
          words={words}
          setWords={setWords}
          totalTyped={totalTyped}
          setTotalTyped={setTotalTyped}
          totalIncorrect={totalIncorrect}
          setTotalIncorrect={setTotalIncorrect}
          totalUncor={totalUncor}
          setTotalUncor={setTotalUncor}
          totalCorrectUncor={totalCorrectUncor}
          setTotalCorrectUncor={setTotalCorrectUncor}
        />
      </div>
      {gameStatus === "finished" && (
        <div className={`results`}>
          <div className="head">
            <h1>Result</h1>
            <p>
              {gamemode},{configs.option}
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
      <button
        className="restart_btn"
        ref={restartRef}
        onClick={restart}
        onKeyDown={(e) => (e.key === "Enter" ? restart() : e.target.blur())}
      >
        <FontAwesomeIcon icon={faRotateRight} />
      </button>
    </div>
  );
}
