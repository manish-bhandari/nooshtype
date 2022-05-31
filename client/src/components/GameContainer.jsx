import React, { useEffect, useState } from "react";
import Game from "../pages/Game";
import "../styles/GameContainer.css";

const gamemodes = ["time", "words", "quotes"];
const options = {
  time: [10, 30, 60, 120],
  words: [10, 25, 50, 100],
  quotes: ["short", "medium", "long"],
};
const extras = ["punctuations", "numbers"];

export default function GameContainer() {
  const [gamemode, setGamemode] = useState("time");
  const [option, setOption] = useState(undefined);

  const [configs, setConfigs] = useState({
    gamemode: gamemode,
    option: option,
  });

  const [extraOptions, setExtraOptions] = useState([]);

  const [extraEnabled, setExtraEnabled] = useState(true);

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

  useEffect(() => {}, [option]);

  const updateExtras = (extra) => {
    // if already exists, remove it
    if (extraOptions.includes(extra)) {
      setExtraOptions(extraOptions.filter((ext) => ext !== extra));
    } else {
      setExtraOptions([...extraOptions, extra]);
    }
  };

  if (option == undefined) return <></>;

  return (
    <div className="game">
      <div className="game_container">
        <div className="settings">
          <div className="options setting">
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
            <div className="extras setting">
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
            <div className="gamemodes setting">
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
        <Game configs={configs} />
      </div>
    </div>
  );
}
