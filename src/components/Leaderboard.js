import React, { useEffect, useState, useRef } from "react";
import "./Leaderboard.css";
import database from "../firebase/firebaseConfig";
import { ref, onValue } from "firebase/database";

const Leaderboard = () => {
  const [clickData, setClickData] = useState([]); // Datos de clics por país
  const [expanded, setExpanded] = useState(false); // Estado para expandir o colapsar
  const [userCountry, setUserCountry] = useState(""); // Código del país del usuario
  const [totalGlobalClicks, setTotalGlobalClicks] = useState(0); // Total de clics globales
  const [ppsData, setPpsData] = useState({}); // PPS por país

  const lastClicksRef = useRef({});
  const lastClickTimeRef = useRef({});
  const ppsTimeoutsRef = useRef({});

  const toggleExpandRef = useRef(false); // Prevenir alternancia rápida

  // Función para formatear números con comas
  const formatNumber = (number) => {
    if (isNaN(number) || number === null || number === undefined) return "0";
    return Number(number).toLocaleString("en-US");
  };

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
        setUserCountry(data.country_code || "");
      } catch (error) {
        console.error("Error al obtener el país del usuario:", error.message);
      }
    };

    fetchCountry();
  }, []);

  // Obtener los datos de Firebase
  useEffect(() => {
    const countryClicksRef = ref(database, "countryClicks");
    const globalClickCountRef = ref(database, "clickCount");

    onValue(countryClicksRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sortedData = Object.keys(data)
          .map((countryCode) => ({
            id: countryCode,
            totalClicks: data[countryCode]?.totalClicks || 0,
          }))
          .sort((a, b) => b.totalClicks - a.totalClicks);

        setClickData(sortedData);

        // Calcular PPS para cada país
        sortedData.forEach((country) => {
          const previousClicks = lastClicksRef.current[country.id] || 0;
          const currentTime = Date.now();
          const previousTime = lastClickTimeRef.current[country.id] || currentTime;
          const timeDifference = (currentTime - previousTime) / 1000;
          const clickDifference = country.totalClicks - previousClicks;
          const pps = timeDifference > 0 ? Math.round(clickDifference / timeDifference) : 0;

          lastClicksRef.current[country.id] = country.totalClicks;
          lastClickTimeRef.current[country.id] = currentTime;

          if (clickDifference > 0) {
            setPpsData((prev) => ({
              ...prev,
              [country.id]: pps,
            }));

            // Reiniciar temporizador para ocultar el PPS
            clearTimeout(ppsTimeoutsRef.current[country.id]);
            ppsTimeoutsRef.current[country.id] = setTimeout(() => {
              setPpsData((prev) => ({
                ...prev,
                [country.id]: 0,
              }));
            }, 5000);
          }
        });
      }
    });

    onValue(globalClickCountRef, (snapshot) => {
      setTotalGlobalClicks(snapshot.val() || 0);
    });
  }, [userCountry]);

  // Alternar entre expandir y colapsar
  const toggleExpand = () => {
    if (!toggleExpandRef.current) {
      toggleExpandRef.current = true;
      setExpanded((prev) => !prev);
      setTimeout(() => {
        toggleExpandRef.current = false;
      }, 300); // Evitar múltiples cambios en un corto período
    }
  };

  // Obtener el rango (posición) de un país
  const getRankDisplay = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <div
      className={`leaderboard ${expanded ? "expanded" : "collapsed"}`}
      onClick={toggleExpand}
    >
      <div className="leaderboard-header">
        {expanded ? (
          <h3 className="leaderboard-title">
            <span className="trophy">🏆</span> Leaderboard
          </h3>
        ) : (
          <>
            <div className="leaderboard-left">
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
              {userCountry && (
                <>
                  {ppsData[userCountry] > 0 && (
                    <span className="country-pps">
                      ({ppsData[userCountry]} PPS)
                    </span>
                  )}
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
            {clickData.map((country, index) => (
              <li key={country.id} className="leaderboard-item">
                <span className="country-rank">{getRankDisplay(index)}</span>
                <img
                  src={getFlagUrl(country.id)}
                  alt={`${country.id} flag`}
                  className="country-flag"
                />
                <span className="country-name">{country.id}</span>
                {ppsData[country.id] > 0 && (
                  <span className="country-pps">({ppsData[country.id]} PPS)</span>
                )}
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
