import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GameContainer from "./components/GameContainer";
import Stars from "./components/Stars";
import Game from "./pages/Game";

function App() {
  return (
    <Router>
      <Stars />
      <Routes>
        <Route path="/" element={<GameContainer />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
