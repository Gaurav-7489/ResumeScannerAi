import { BrowserRouter, Routes, Route } from "react-router-dom";

import Intro from "./pages/Intro";
import UserType from "./pages/UserType";
import Recruiter from "./pages/Recruiter";
import Analyzing from "./pages/Analyzing";
import Result from "./pages/Result";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Intro />} />
        <Route path="/type" element={<UserType />} />
        <Route path="/recruiter" element={<Recruiter />} />
        <Route path="/analyzing" element={<Analyzing />} />
        <Route path="/result" element={<Result />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;