import { BrowserRouter, Routes, Route } from "react-router-dom";
import Upload from "./pages/Upload";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;