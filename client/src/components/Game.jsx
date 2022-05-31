import React, { useEffect, useState } from "react";
import Words from "./Words";
import "../styles/Game.css";

const gamemodes = ["time", "words", "quotes"];
const options = {
  time: [10, 30, 60, 120],
  words: [10, 25, 50, 100],
  quotes: ["short", "medium", "long"],
};
const extras = ["punctuations", "numbers"];

export default function Game() {
  const [currWordIndex, setCurrWordIndex] = useState(undefined);

  const [gamemode, setGamemode] = useState("time");
  const [option, setOption] = useState(undefined);
  const [configs, setConfigs] = useState(undefined);

  const [extraOptions, setExtraOptions] = useState([]);
  const [extraEnabled, setExtraEnabled] = useState(true);

  const [gameStatus, setGameStatus] = useState("waiting");

  const [timer, setTimer] = useState(undefined);

  useEffect(() => {
    setConfigs({
      gamemode: gamemode,
      option: option,
      extraOptions: extraOptions,
      extraEnabled: extraEnabled,
    });
  }, [option, extraOptions, extraEnabled]);

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
      startTimer();
    }
  };

  const startTimer = () => {
    let interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          end();
          clearInterval(interval);
        } else return prevTimer - 1;
      });
    }, 1000);
  };

  const end = () => {
    console.log("game ended");
    setGameStatus("finished");
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

        <div
          className={`header ${
            gameStatus === "running" && gamemode == "time" ? "" : "hidden"
          }`}
        >
          <p className="status item">{timer}</p>
        </div>

        <div
          className={`header ${
            gameStatus === "running" && gamemode != "time" ? "" : "hidden"
          }`}
        >
          <p className="status item">{`${currWordIndex}/${option}`}</p>
        </div>
        <Words
          configs={configs}
          startGame={start}
          endGame={end}
          currWordIndex={currWordIndex}
          setCurrWordIndex={setCurrWordIndex}
        />
      </div>
      <div className={`results ${gameStatus === "finished" ? "" : "hidden"}`}>
        <h1>Results</h1>
      </div>
    </div>
  );
}
