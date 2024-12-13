import React, { useEffect, useState, useRef } from "react";
import "./Leaderboard.css";
import database from "../firebase/firebaseConfig";
import { ref, onValue, set } from "firebase/database";

const Leaderboard = () => {
  const [clickData, setClickData] = useState([]); // Datos de clics por país
  const [playerData, setPlayerData] = useState([]); // Datos individuales de jugadores
  const [expanded, setExpanded] = useState(false); // Estado para expandir o colapsar
  const [userCountry, setUserCountry] = useState(""); // Código del país del usuario
  const [totalGlobalClicks, setTotalGlobalClicks] = useState(0); // Total de clics globales
  const [ppsData, setPpsData] = useState({}); // PPS por país
  const [selectedPlayer, setSelectedPlayer] = useState(null); // Jugador seleccionado para ver detalles
  const [isPlayerStatsVisible, setIsPlayerStatsVisible] = useState(false); // Controlar vista de Player Stats
  const [username, setUsername] = useState(""); // Estado para el nombre de usuario
  const [isUsernameSet, setIsUsernameSet] = useState(false); // Controla si el usuario ya tiene nombre
  const [isModalVisible, setIsModalVisible] = useState(false); // Controla si el modal es visible

  const normalizeIP = (ip) => ip.replace(/\./g, "-"); // Reemplaza los puntos por guiones
  const lastClicksRef = useRef({});
  const lastClickTimeRef = useRef({});
  const ppsTimeoutsRef = useRef({});

  const toggleExpandRef = useRef(false); // Prevenir alternancia rápida

  //Solicitar username
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || username.length < 3) {
      alert("Username must be at least 3 characters long.");
      return;
    }
    const userIP = await fetchUserIP();
    if (userIP && username) {
      const normalizedIP = normalizeIP(userIP);
      const userByIPRef = ref(database, `usersByIP/${normalizedIP}`);
      const userStatsRef = ref(database, `users/${username || "Unknown"}`);
      
      set(userByIPRef, { username });
      set(userStatsRef, {
        totalClicks: 0, // Inicializa las estadísticas
        highestLevel: 0,
        playTime: 0,
      });
      setIsUsernameSet(true);
      setIsModalVisible(false); // Ocultar el modal
    }
  };

  // Mostrar modal si el usuario no tiene nombre
  const handlePlayerClick = async () => {
    if (!isUsernameSet) {
      const userIP = await fetchUserIP();
      if (userIP) {
        const normalizedIP = normalizeIP(userIP);
        const userRef = ref(database, `usersByIP/${normalizedIP}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data && data.username) {
            setUsername(data.username);
            setIsUsernameSet(true);
          } else {
            setIsModalVisible(true); // Mostrar el modal si no tiene nombre
          }
        });
      }
    }
  };

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

    //Api gelocalización IP usuario
    const fetchUserIP = async () => {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        if (!response.ok) throw new Error("Error al obtener la IP del usuario");
        const data = await response.json();
        return data.ip; // Devuelve la IP del usuario
      } catch (error) {
        console.error("Error al obtener la IP del usuario:", error.message);
        return null; // Devuelve null si falla
      }
    };
    useEffect(() => {
      const checkUsername = async () => {
        const userIP = await fetchUserIP(); // Obtén la IP del usuario
        if (userIP) {
          const normalizedIP = normalizeIP(userIP); // Normaliza la IP
          const userRef = ref(database, `usersByIP/${normalizedIP}`);
          onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.username) {
              setUsername(data.username);
              setIsUsernameSet(true); // Marca como registrado
            }
          });
        }
      };
      checkUsername();
    }, []);
    
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
  const playerStatsRef = ref(database, "users");

  // Obtener datos de clics por país
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

  // Obtener total de clics globales
  onValue(globalClickCountRef, (snapshot) => {
    setTotalGlobalClicks(snapshot.val() || 0);
  });

  // Obtener estadísticas de jugadores individuales
  onValue(playerStatsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const players = Object.keys(data)
        .filter((username) => username && username.trim() !== "undefined") // Filtrar usernames inválidos
        .map((username) => ({
          id: username, // El ID será el nombre de usuario
          username: username, // Incluye el nombre de usuario directamente
          totalClicks: data[username]?.totalClicks || 0,
          highestLevel: data[username]?.highestLevel || 0,
          playTime: data[username]?.playTime || 0,
        }))
        .sort((a, b) => {
          // Ordenar por nivel más alto primero; si es igual, por clics
          if (b.highestLevel === a.highestLevel) {
            return b.totalClicks - a.totalClicks;
          }
          return b.highestLevel - a.highestLevel;
        });

      setPlayerData(players);
    } else {
      setPlayerData([]); // Limpia los datos si no hay información
    }
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

  // Alternar entre páginas
  const togglePage = () => {
    setIsPlayerStatsVisible((prev) => !prev); // Cambia la página sin afectar el estado de expansión.
};

  // Obtener el rango (posición) de un país
  const getRankDisplay = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `#${index + 1}`;
  };

  return (
    <>
      {isModalVisible && (
        <div className="username-modal-overlay">
          <div className="username-form">
            <form onSubmit={handleUsernameSubmit}>
              <label htmlFor="username">Enter your username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
      <div className={`leaderboard ${expanded ? "expanded" : "collapsed"}`}>
        <div className="leaderboard-header" onClick={toggleExpand}>
          {expanded ? (
            <div className="leaderboard-navigation">
              {!isPlayerStatsVisible && (
                <span
                  className="arrow left"
                  onClick={(e) => {
                    e.stopPropagation(); // Evita el colapso al hacer clic
                    togglePage();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4a90e2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-chevron-right"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </span>
              )}
              {isPlayerStatsVisible && (
                <span
                  className="arrow right"
                  onClick={(e) => {
                    e.stopPropagation(); // Evita el colapso al hacer clic
                    togglePage();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4a90e2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-chevron-left"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </span>
              )}
              <h3 className="leaderboard-title">
                {isPlayerStatsVisible ? "Player Stats" : "Leaderboard"}
              </h3>
            </div>
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
          <>
            {/* Leaderboard de países */}
            <div
              className={`leaderboard-content ${
                isPlayerStatsVisible ? "hidden" : "visible"
              }`}
            >
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
  
            {/* Leaderboard de jugadores */}
<div
  className={`leaderboard-player-stats ${
    isPlayerStatsVisible ? "visible" : "hidden"
  }`}
>
  {playerData.length > 0 ? (
    <ul>
      {playerData.map((player, index) => (
    <li
    key={player.id || Math.random()}
    className={`leaderboard-item ${
      selectedPlayer && selectedPlayer.id === player.id ? "selected" : ""
    }`}
    onClick={() => {
      if (!isUsernameSet) {
        handlePlayerClick();
      }
      setSelectedPlayer(player);
    }}
       >
          {/* Asignar medallas a los tres primeros */}
      <span className="player-rank">
        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
      </span>
      <span className="player-name">{player.username?.trim() || "Unknown"}</span>
      <span className="player-clicks">{formatNumber(player.totalClicks || 0)} Clicks</span>
      <span className="player-level">Max Level: {player.highestLevel || 0}</span>
    </li>
      ))}
    </ul>
  ) : (
    <p className="no-data-message">No players available to display.</p> // Mensaje si no hay jugadores
  )}
               {selectedPlayer && (
    <div className="player-details">
      <h3 className="player-details-title">
        {selectedPlayer.username || "Unknown"}
      </h3>
      <div className="player-stats">
        <p>
          <strong>Total Clicks:</strong>{" "}
          {formatNumber(selectedPlayer.totalClicks || 0)}
        </p>
        <p>
          <strong>Highest Level:</strong>{" "}
          {selectedPlayer.highestLevel || 0}
        </p>
        <p>
          <strong>Play Time:</strong>{" "}
          {selectedPlayer.playTime || 0} seconds
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
  
  
};

export default Leaderboard;