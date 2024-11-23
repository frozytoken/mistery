import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import BuySection from "./components/BuySection";
import Avatares from "./components/Avatares/Avatares";
import AvatarGenerator from "./components/Avatares/AvatarGenerator";
import AddDvilToPfp from "./components/Avatares/AddDvilToPfp";

function MainView() {
  return (
    <div>
      <Navbar />
      <Home />
      <About />
      <BuySection />
      <Avatares />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainView />} />
        <Route path="/make-your-own-dvil" element={<AvatarGenerator />} />
        <Route path="/add-dvil-to-current-pfp" element={<AddDvilToPfp />} />
      </Routes>
    </Router>
  );
}

export default App;
