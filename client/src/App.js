import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Stars from "./components/Stars";
import Game from "./components/Game";

function App() {
  return (
    <Router>
      <Stars />
      <Routes>
        <Route path="/" element={<Game />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
