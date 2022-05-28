import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Game from "./pages/Game";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Game />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
