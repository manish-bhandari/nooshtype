import React, { useEffect, useState } from "react";
import Game from "../pages/Game";
import "../styles/GameContainer.css";

const gamemodes = ["time", "words", "quotes"];
const options = {
  time: [10, 30, 60, 120],
  words: [10, 25, 50, 100],
  quotes: ["short", "medium", "long"],
};

export default function GameContainer() {
  const [gamemode, setGamemode] = useState("time");
  const [option, setOption] = useState(undefined);

  useEffect(() => {}, [option]);
  useEffect(() => {
    setOption(options[gamemode][0]);
  }, [gamemode]);

  if (!option) return;

  return (
    <div className="game">
      <div className="game_container">
        <div className="settings">
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
        </div>
        <Game />
      </div>
    </div>
  );
}
