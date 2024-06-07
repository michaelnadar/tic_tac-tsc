
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Room from "./components/Room";

function App() {
 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room" element={<Room />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;