import React from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import BuySection from "./components/BuySection";
import Avatares from "./components/Avatares/Avatares";
import AvatarGenerator from "./components/Avatares/AvatarGenerator";
import MemeBuilder from "./components/Avatares/MemeBuilder";
import Editor1 from "./components/Avatares/Editor1";

// Componentes anidados para la vista principal
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

// Configuración del enrutador
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <MainView />,
    },
    {
      path: "/make-your-own-dvil",
      element: <AvatarGenerator />,
    },
    {
      path: "/MemeBuilder",
      element: <MemeBuilder />,
    },
    {
      path: "/editor1",
      element: <Editor1 />,
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);


// Componente principal de la aplicación
function App() {
  return <RouterProvider router={router} />;
}

export default App;
