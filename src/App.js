import React from "react";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import BuySection  from "./components/BuySection";


function App() {
    return (
        <div>
            <Navbar />
            <Home />
            <About />
            <BuySection />
        </div>
    );
}

export default App;
