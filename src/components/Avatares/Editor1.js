import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import logo from '../../assets/log1.png';
import twitterIcon from '../../assets/twitter-icon.png';
import telegramIcon from '../../assets/telegram-icon.png';
import './Editor.css';
import './EditorMobile.css'; // Cargar el CSS móvil

const Editor1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);
  const fileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Detectar si es móvil
  const [mainImage, setMainImage] = useState(null); // Guardar información de la imagen principal
  const [noiseLevel, setNoiseLevel] = useState(50); // Nivel de ruido ajustable
  const [isNoiseActive, setIsNoiseActive] = useState(false); // Estado para el filtro ON/OFF
  const noiseLayer = useRef(null); // Capa de ruido

  const stickers = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    src: `${process.env.PUBLIC_URL}/assets/builder/pfp${i + 1}.png`,
  }));

    // Detectar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const toggleNoise = () => {
    if (!canvasInstance.current || !mainImage) return;
  
    if (isNoiseActive) {
      // Eliminar la capa de ruido
      if (noiseLayer.current) {
        canvasInstance.current.remove(noiseLayer.current);
        noiseLayer.current = null;
      }
    } else {
      // Crear y agregar la capa de ruido sobre la imagen principal
      const noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = mainImage.originalWidth;
      noiseCanvas.height = mainImage.originalHeight;
      const noiseContext = noiseCanvas.getContext('2d');
  
      // Generar ruido granular con escala ajustada
      const imageData = noiseContext.createImageData(noiseCanvas.width, noiseCanvas.height);
      const { data } = imageData;
  
      // Reducimos el rango para que el nivel máximo (100%) sea equivalente al 35% del actual
      const scaledNoiseLevel = noiseLevel * 0.35; // Escalamos proporcionalmente
  
      for (let i = 0; i < data.length; i += 4) {
        const randomValue = Math.random() * 255; // Valor aleatorio para "grano"
        data[i] = randomValue; // Rojo
        data[i + 1] = randomValue; // Verde
        data[i + 2] = randomValue; // Azul
        data[i + 3] = scaledNoiseLevel * 2.55; // Opacidad ajustable (0-255)
      }
      noiseContext.putImageData(imageData, 0, 0);
  
      // Crear un objeto fabric.Image para la capa de ruido
      const noiseImage = new fabric.Image(noiseCanvas, {
        left: mainImage.left,
        top: mainImage.top,
        scaleX: mainImage.width / mainImage.originalWidth,
        scaleY: mainImage.height / mainImage.originalHeight,
        selectable: false,
        evented: false,
      });
  
      canvasInstance.current.add(noiseImage);
      noiseLayer.current = noiseImage;
      canvasInstance.current.bringToFront(noiseLayer.current);
    }
  
    setIsNoiseActive(!isNoiseActive); // Alternar estado del ruido
  };
  
  
  
  // Effect to update the noise dynamically
  useEffect(() => {
    if (isNoiseActive && noiseLayer.current) {
      toggleNoise(); // Eliminar ruido actual
      toggleNoise(); // Reaplicar con nuevo nivel
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noiseLevel]);
  
  
  
  
  const initCanvas = useCallback(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: '#f0f0f0',
      width: isMobile ? window.innerWidth * 0.9 : window.innerWidth * 0.7,
      height: isMobile ? window.innerHeight * 0.6 : window.innerHeight * 0.8,
      preserveObjectStacking: true,
      selection: true,
    });
  
    // Guardar referencia del canvas
    canvasInstance.current = canvas;
  
    // Redimensionar canvas al cambiar tamaño de la ventana
    const resizeCanvas = () => {
      if (canvasInstance.current) {
        canvasInstance.current.setWidth(isMobile ? window.innerWidth * 0.9 : window.innerWidth * 0.7);
        canvasInstance.current.setHeight(isMobile ? window.innerHeight * 0.6 : window.innerHeight * 0.8);
        canvasInstance.current.renderAll();
      }
    };
    window.addEventListener('resize', resizeCanvas);
  
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.dispose();
      canvasInstance.current = null;
    };
  }, [isMobile]); // Dependencia de 'isMobile'
  
  
  const addElement = (element) => {
    canvasInstance.current.add(element);
    if (noiseLayer.current) {
      canvasInstance.current.bringToFront(noiseLayer.current); // Mantener el ruido al frente
    }
    canvasInstance.current.renderAll();
  };
  
  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && canvasInstance.current) {
        const activeObj = canvasInstance.current.getActiveObject();
        if (activeObj) {
          canvasInstance.current.remove(activeObj);
          canvasInstance.current.discardActiveObject();
          canvasInstance.current.renderAll();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!location.state?.image) {
      navigate('/MemeBuilder');
      return;
    }
  
    initCanvas();
  
    fabric.Image.fromURL(location.state.image, (img) => {
      const canvasWidth = canvasInstance.current.width;
      const canvasHeight = canvasInstance.current.height;
  
      // Escala dinámica optimizada
      const scaleFactor = Math.min(
        canvasWidth / img.width, // Escala basada en el ancho
        canvasHeight / img.height // Escala basada en la altura
      ) * 1.03; // Escalar un poco más para cubrir espacio
  
  
      img.set({
        left: Math.max((canvasWidth - img.width * scaleFactor) / 2, 0), // Garantiza que no quede negativo
        top: Math.max((canvasHeight - img.height * scaleFactor) / 2, 0), // Garantiza que no quede negativo
        scaleX: scaleFactor,
        scaleY: scaleFactor,
        selectable: false,
        hasBorders: false,
        hasControls: false,
    });
    
  
      canvasInstance.current.setBackgroundImage(
        img,
        canvasInstance.current.renderAll.bind(canvasInstance.current),
        {
          crossOrigin: 'anonymous', // Evita problemas de CORS
        }
      );
  
      // Guarda las dimensiones originales para ajustes posteriores
    setMainImage({
      left: img.left,
      top: img.top,
      width: img.width * scaleFactor,
      height: img.height * scaleFactor,
      originalWidth: img.width,
      originalHeight: img.height,
    });
  });
  
  return () => {
    if (canvasInstance.current) {
      canvasInstance.current.dispose();
      canvasInstance.current = null;
    }
  };
}, [location.state, navigate, initCanvas, isMobile]);
  
  
  
  const handleAddText = () => {
    const text = new fabric.IText('TYPE HERE', {
      left: canvasInstance.current.width / 2, // Centrado horizontal
      top: canvasInstance.current.height / 2, // Centrado vertical
      fontSize: isMobile ? 40 : 80, // Tamaño reducido en móviles
      fill: '#ffffff',
      fontFamily: 'Halau',
      borderColor: '#69c7ff',
      cornerColor: '#69c7ff',
      cornerSize: 8,
      transparentCorners: false,
      selectable: true,
    });
    addElement(text);
  };
  
  const handleAddSticker = (src) => {
    fabric.Image.fromURL(src, (img) => {
      img.set({
        left: canvasInstance.current.width / 2 - img.width * 0.05, // Centrado horizontal
        top: canvasInstance.current.height / 2 - img.height * 0.05, // Centrado vertical
        scaleX: isMobile ? 0.05 : 0.1, // Tamaño más pequeño en móviles
        scaleY: isMobile ? 0.05 : 0.1,
        borderColor: '#69c7ff',
        cornerColor: '#69c7ff',
        cornerSize: 8,
        transparentCorners: false,
        selectable: true,
      });
      addElement(img);
    });
  };
  
  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => {
        fabric.Image.fromURL(f.target.result, (img) => {
          const canvasWidth = canvasInstance.current.width;
          const canvasHeight = canvasInstance.current.height;
  
          // Incrementar el factor de escala inicial
          const scaleFactor = Math.min(
            canvasWidth / img.width,
            canvasHeight / img.height
        ) * 1.1; // Incrementa un poco para aprovechar mejor el espacio
  
          img.set({
            left: canvasWidth / 2 - (img.width * scaleFactor) / 2, // Centrado horizontal
            top: canvasHeight / 2 - (img.height * scaleFactor) / 2, // Centrado vertical
            scaleX: scaleFactor,
            scaleY: scaleFactor,
            borderColor: '#69c7ff',
            cornerColor: '#69c7ff',
            cornerSize: 8,
            transparentCorners: false,
            selectable: true,
          });
  
          // Añadir la imagen al canvas
          canvasInstance.current.add(img);
  
          // Asegurarse de que la imagen esté debajo del ruido
          if (noiseLayer.current) {
            canvasInstance.current.sendToBack(img);
            canvasInstance.current.bringToFront(noiseLayer.current); // Mantener el ruido al frente
          }
  
          canvasInstance.current.renderAll();
  
          // Restablecer el input de archivo
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };
  

  const handleDeleteObject = () => {
    const activeObj = canvasInstance.current?.getActiveObject();
    if (activeObj) {
      canvasInstance.current.remove(activeObj);
      canvasInstance.current.discardActiveObject();
      canvasInstance.current.renderAll();
    }
  };

  const handleDownload = () => {
    if (!mainImage || !canvasInstance.current) return;
  
    const { left, top, width, height, originalWidth, originalHeight } = mainImage;
  
    // Crear un canvas temporal con las dimensiones originales de la imagen principal
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalWidth;
    tempCanvas.height = originalHeight;
    const tempContext = tempCanvas.getContext('2d');
  
    // Escalar el contenido del canvas al tamaño original de la imagen principal
    const scaleFactor = originalWidth / width;
  
    // Exportar el contenido del canvas actual como imagen
    const canvasDataUrl = canvasInstance.current.toDataURL({
      format: 'png',
      multiplier: scaleFactor, // Escala al tamaño original de la imagen principal
    });
  
    const img = new Image();
    img.onload = () => {
      // Calcular las coordenadas relativas de recorte dentro del canvas escalado
      const cropX = left * scaleFactor;
      const cropY = top * scaleFactor;
      const cropWidth = width * scaleFactor;
      const cropHeight = height * scaleFactor;
  
      // Dibujar solo el área de la imagen principal en el canvas temporal
      tempContext.drawImage(
        img, // Imagen completa del canvas
        cropX, // Coordenada X inicial del recorte
        cropY, // Coordenada Y inicial del recorte
        cropWidth, // Ancho del área recortada
        cropHeight, // Altura del área recortada
        0, // Coordenada X inicial en el canvas temporal
        0, // Coordenada Y inicial en el canvas temporal
        originalWidth, // Ancho final en el canvas temporal
        originalHeight // Altura final en el canvas temporal
      );
  
      // Descargar la imagen generada
      const link = document.createElement('a');
      link.download = 'meme_with_content.png';
      link.href = tempCanvas.toDataURL('image/png', 1.0); // Alta calidad
      link.click();
    };
    img.src = canvasDataUrl;
  };
  
  
  const handleReset = () => {
    navigate('/MemeBuilder');
  };

  const bringForward = () => {
    const activeObj = canvasInstance.current?.getActiveObject();
    if (activeObj) {
      canvasInstance.current.bringForward(activeObj);
      canvasInstance.current.renderAll();
    }
  };

  const sendBackward = () => {
    const activeObj = canvasInstance.current?.getActiveObject();
    if (activeObj) {
      canvasInstance.current.sendBackwards(activeObj);
      canvasInstance.current.renderAll();
    }
  };

  return (
    <div className={`editor-container ${isMobile ? 'editor-mobile' : ''}`}>
      <header className={`header ${isMobile ? 'mobile-header' : ''}`}>
        <img
          src={logo}
          alt="Logo"
          className={`logo ${isMobile ? 'mobile-logo' : ''}`}
        />
        <div
          className={`header-actions ${isMobile ? 'mobile-header-actions' : ''}`}
        >
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img
              src={twitterIcon}
              alt="Twitter"
              className={`nav-icon ${isMobile ? 'mobile-nav-icon' : ''}`}
            />
          </a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer">
            <img
              src={telegramIcon}
              alt="Telegram"
              className={`nav-icon ${isMobile ? 'mobile-nav-icon' : ''}`}
            />
          </a>
          <button
            className={`buy-dvil-button ${
              isMobile ? 'mobile-buy-dvil-button' : ''
            }`}
          >
            BUY $IMP
          </button>
        </div>
      </header>
  
      <div className={`editor-content ${isMobile ? 'mobile-editor-content' : ''}`}>
        <aside
          className={`sidebar left ${
            isMobile ? 'mobile-sidebar mobile-sidebar-left' : ''
          }`}
        >
          <h2 className={isMobile ? 'mobile-sticker-title' : ''}>STICKERS</h2>
          <ul
            className={`sticker-list ${
              isMobile ? 'mobile-sticker-list' : ''
            }`}
          >
            {stickers.map((sticker) => (
              <li key={sticker.id}>
                <img
                  src={sticker.src}
                  alt={`Sticker ${sticker.id}`}
                  onClick={() => handleAddSticker(sticker.src)}
                  className={`sticker-preview ${
                    isMobile ? 'mobile-sticker-preview' : ''
                  }`}
                />
              </li>
            ))}
          </ul>
          <button
            onClick={handleAddText}
            className={`editor-button ${isMobile ? 'mobile-editor-button' : ''}`}
          >
            Add Text
          </button>
          <label
            htmlFor="add-image"
            className={`editor-button ${isMobile ? 'mobile-editor-button' : ''}`}
          >
            Add Image
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              id="add-image"
              onChange={handleAddImage}
              style={{ display: 'none' }}
            />
          </label>
        </aside>
  
        <div
          className={`canvas-container ${
            isMobile ? 'mobile-canvas-container' : ''
          }`}
        >
          <canvas ref={canvasRef} />
        </div>
  
        <aside
          className={`sidebar right ${
            isMobile ? 'mobile-sidebar mobile-sidebar-right' : ''
          }`}
        >
          <div
            className={`button-group ${
              isMobile ? 'mobile-button-group' : ''
            }`}
          >
            <button
              className={`download-button editor-button ${
                isMobile ? 'mobile-editor-button' : ''
              }`}
              onClick={handleDownload}
            >
              Download
            </button>
            <button
              className={`reset-button editor-button ${
                isMobile ? 'mobile-editor-button' : ''
              }`}
              onClick={handleReset}
            >
              Reset
            </button>
            <button
              className={`editor-button ${
                isMobile ? 'mobile-editor-button' : ''
              }`}
              onClick={bringForward}
            >
              Move Up
            </button>
            <button
              className={`editor-button ${
                isMobile ? 'mobile-editor-button' : ''
              }`}
              onClick={sendBackward}
            >
              Move Down
            </button>
            <button
              className={`editor-button delete-button ${
                isMobile ? 'mobile-editor-button' : ''
              }`}
              onClick={handleDeleteObject}
            >
              Delete
            </button>
            <button
              className={`editor-button noise-button ${
                isMobile ? 'mobile-editor-button' : ''
              } ${isNoiseActive ? 'active' : ''}`}
              onClick={toggleNoise}
              disabled={!mainImage}
            >
              {isNoiseActive ? 'Remove Noise' : 'Apply Noise'}
            </button>
            <label
              htmlFor="noise-range"
              className={isMobile ? 'mobile-label' : ''}
            >
              Noise Level
            </label>
            <input
              id="noise-range"
              type="range"
              min="0"
              max="100"
              value={noiseLevel}
              onChange={(e) => {
                setNoiseLevel(Number(e.target.value));
                if (isNoiseActive) {
                  toggleNoise();
                  toggleNoise();
                }
              }}
              className={isMobile ? 'mobile-noise-slider' : ''}
            />
          </div>
        </aside>
      </div>
    </div>
  );
  
};

export default Editor1;
