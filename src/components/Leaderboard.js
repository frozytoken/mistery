import React, { useEffect, useState } from "react";
import "./Leaderboard.css";
import database from "../firebase/firebaseConfig";
import { ref, onValue } from "firebase/database";

const Leaderboard = () => {
  const [clickData, setClickData] = useState([]); // Datos de clics por país
  const [expanded, setExpanded] = useState(false); // Estado para expandir o colapsar
  const [userCountry, setUserCountry] = useState(""); // Código del país del usuario
  const [totalGlobalClicks, setTotalGlobalClicks] = useState(0); // Total de clics globales

  // Función para formatear números con comas
  const formatNumber = (number) => (number ? number.toLocaleString() : "0");

  // Función para obtener la URL de la bandera
  const getFlagUrl = (countryCode) => {
    if (!countryCode) {
      return "https://via.placeholder.com/24x16.png?text=No+Flag";
    }
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  };

  // Obtener el país del usuario desde la API de geolocalización
  useEffect(() => {
    const fetchCountry = async () => {
      try {
        const response = await fetch("https://ipwhois.app/json/");
        if (!response.ok) throw new Error("Error en la solicitud de país");
        const data = await response.json();
        setUserCountry(data.country_code || ""); // Eliminamos UNKNOWN
      } catch (error) {
        console.error("Error al obtener el país del usuario:", error.message);
        setUserCountry(""); // Fallback si hay error
      }
    };

    fetchCountry();
  }, []);

  // Obtener los datos de Firebase
  useEffect(() => {
    const countryClicksRef = ref(database, "countryClicks");
    const globalClickCountRef = ref(database, "clickCount");

    // Escuchar cambios en los datos de clics por país
    onValue(countryClicksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedData = Object.keys(data)
          .map((countryCode) => ({
            id: countryCode,
            totalClicks: data[countryCode]?.totalClicks || 0,
          }))
          .sort((a, b) => b.totalClicks - a.totalClicks); // Ordenar por clics descendentes

        setClickData(sortedData);
      }
    });

    // Escuchar cambios en el total de clics globales
    onValue(globalClickCountRef, (snapshot) => {
      setTotalGlobalClicks(snapshot.val() || 0);
    });
  }, []);

  // Alternar entre expandir y colapsar
  const toggleExpand = () => setExpanded(!expanded);

  // Obtener el rango (posición) de un país
  const getRankDisplay = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div className={`leaderboard ${expanded ? "expanded" : "collapsed"}`}>
      {/* Cabecera del leaderboard */}
      <div className="leaderboard-header" onClick={toggleExpand}>
        {expanded ? (
          <h3 className="leaderboard-title">
            <span className="trophy">🏆</span> Leaderboard
          </h3>
        ) : (
          <>
            <div className="leaderboard-left">
              {/* Mostrar el primer país (mayor clics) */}
              {clickData[0] && (
                <>
                  <span className="trophy">🏆</span>
                  <span className="country-rank">#1</span>
                  <img
                    src={getFlagUrl(clickData[0].id)}
                    alt={`${clickData[0].id} flag`}
                    className="country-flag"
                  />
                  <span className="country-name">
                    {clickData[0].id} {formatNumber(clickData[0].totalClicks)}
                  </span>
                </>
              )}
            </div>
            <div className="leaderboard-right">
              {/* Mostrar datos del país del usuario */}
              {userCountry && (
                <>
                  <img
                    src={getFlagUrl(userCountry)}
                    alt={`${userCountry} flag`}
                    className="country-flag"
                  />
                  <span className="country-name">
                    {userCountry}{" "}
                    {formatNumber(
                      clickData.find((country) => country.id === userCountry)
                        ?.totalClicks || 0
                    )}
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Contenido expandido */}
      {expanded && (
        <div className="leaderboard-content">
          <div className="leaderboard-item leaderboard-worldwide">
            <span className="globe-icon">🌍</span>
            <span className="country-name">Worldwide</span>
            <span className="country-clicks">
              {formatNumber(totalGlobalClicks)} PUMPS
            </span>
          </div>
          <ul>
            {/* Listar todos los países */}
            {clickData.map((country, index) => (
              <li key={country.id} className="leaderboard-item">
                <span className="country-rank">{getRankDisplay(index)}</span>
                <img
                  src={getFlagUrl(country.id)}
                  alt={`${country.id} flag`}
                  className="country-flag"
                />
                <span className="country-name">{country.id}</span>
                <span className="country-clicks">
                  {formatNumber(country.totalClicks)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
