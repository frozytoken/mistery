import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fabric } from 'fabric';
import logo from '../../assets/log1.png';
import twitterIcon from '../../assets/twitter-icon.png';
import telegramIcon from '../../assets/telegram-icon.png';
import './Editor.css';

const Editor1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);
  const fileInputRef = useRef(null);
  const [mainImage, setMainImage] = useState(null); // Guardar información de la imagen principal
  const [noiseLevel, setNoiseLevel] = useState(50); // Nivel de ruido ajustable
  const [isNoiseActive, setIsNoiseActive] = useState(false); // Estado para el filtro ON/OFF
  const noiseLayer = useRef(null); // Capa de ruido

  const stickers = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    src: `${process.env.PUBLIC_URL}/assets/builder/pfp${i + 1}.png`,
  }));

  
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
  
  
  
  
  const initCanvas = () => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: '#f0f0f0',
      width: window.innerWidth * 0.7,
      height: window.innerHeight * 0.8,
      preserveObjectStacking: true,
      selection: true,
    });

    // Guardar referencia del canvas
    canvasInstance.current = canvas;

    // Redimensionar canvas al cambiar tamaño de la ventana
    const resizeCanvas = () => {
      if (canvasInstance.current) {
        canvasInstance.current.setWidth(window.innerWidth * 0.7);
        canvasInstance.current.setHeight(window.innerHeight * 0.8);
        canvasInstance.current.renderAll();
      }
    };

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.dispose();
      canvasInstance.current = null;
    };
  };
  
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
      const scaleFactor = Math.min(
        canvasInstance.current.width / img.width,
        canvasInstance.current.height / img.height
      );
    
      img.set({
        left: canvasInstance.current.width / 2 - (img.width * scaleFactor) / 2,
        top: canvasInstance.current.height / 2 - (img.height * scaleFactor) / 2,
        scaleX: scaleFactor,
        scaleY: scaleFactor,
        selectable: false,
        hasBorders: false,
        hasControls: false,
      });
    
      canvasInstance.current.setBackgroundImage(img, canvasInstance.current.renderAll.bind(canvasInstance.current), {
        crossOrigin: 'anonymous', // Evita problemas de CORS
      });
    
      // Guardar dimensiones originales de la imagen
      setMainImage({
        left: img.left,
        top: img.top,
        width: img.width * scaleFactor,
        height: img.height * scaleFactor,
        originalWidth: img.width, // Dimensiones originales
        originalHeight: img.height, // Dimensiones originales
      });
    });
    
    

    return () => {
      if (canvasInstance.current) {
        canvasInstance.current.dispose();
        canvasInstance.current = null;
      }
    };
  }, [location.state, navigate]);

  const handleAddText = () => {
    const text = new fabric.IText('TYPE HERE', {
      left: 450,
      top: 300,
      fontSize: 80,
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
        left: 500,
        top: 100,
        scaleX: 0.1,
        scaleY: 0.1,
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
          img.set({
            left: 400,
            top: 200,
            scaleX: 0.2,
            scaleY: 0.2,
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
    if (canvasInstance.current) {
      // Deseleccionar cualquier objeto activo
      canvasInstance.current.discardActiveObject();
      canvasInstance.current.renderAll();
    }
  
    if (mainImage && canvasInstance.current) {
      const { originalWidth, originalHeight } = mainImage;
  
      // Crear un canvas temporal para generar el ruido
      const noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = originalWidth;
      noiseCanvas.height = originalHeight;
      const noiseContext = noiseCanvas.getContext('2d');
  
      // Generar ruido visible
      const imageData = noiseContext.createImageData(originalWidth, originalHeight);
      const { data } = imageData;
      for (let i = 0; i < data.length; i += 4) {
        const randomValue = Math.random() * 255; // Valor aleatorio de ruido
        data[i] = randomValue; // R
        data[i + 1] = randomValue; // G
        data[i + 2] = randomValue; // B
        data[i + 3] = 90; // Transparencia más fuerte para hacer visible el ruido
      }
      noiseContext.putImageData(imageData, 0, 0);
  
      // Crear un canvas temporal para exportar
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = originalWidth;
      tempCanvas.height = originalHeight;
      const tempContext = tempCanvas.getContext('2d');
  
      // Configurar parámetros de suavizado para máxima calidad
      tempContext.imageSmoothingEnabled = true;
      tempContext.imageSmoothingQuality = 'high';
  
      // Dibujar contenido del canvas principal en el canvas temporal
      tempContext.drawImage(
        canvasInstance.current.lowerCanvasEl, // Canvas principal
        mainImage.left, // Coordenada X del área visible
        mainImage.top, // Coordenada Y del área visible
        mainImage.width, // Ancho del área visible
        mainImage.height, // Alto del área visible
        0, // Coordenada X del canvas temporal
        0, // Coordenada Y del canvas temporal
        originalWidth, // Ancho original
        originalHeight // Alto original
      );
  
      // Superponer el ruido al canvas temporal
      tempContext.globalAlpha = 0.5; // Ajustar la intensidad del ruido (más visible)
      tempContext.drawImage(noiseCanvas, 0, 0);
  
      // Descargar la imagen generada
      const link = document.createElement('a');
      link.download = 'meme_with_noise.png';
      link.href = tempCanvas.toDataURL('image/png', 1.0); // Calidad máxima
      link.click();
    }
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
    <div className="editor-container">
      <header className="header">
        <img src={logo} alt="Logo" className="logo" />
        <div className="header-actions">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src={twitterIcon} alt="Twitter" className="nav-icon" />
          </a>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer">
            <img src={telegramIcon} alt="Telegram" className="nav-icon" />
          </a>
          <button className="buy-dvil-button">BUY $DVIL</button>
        </div>
      </header>

      <div className="editor-content">
        <aside className="sidebar left">
          <h2>STICKERS</h2>
          <ul className="sticker-list">
            {stickers.map((sticker) => (
              <li key={sticker.id}>
                <img
                  src={sticker.src}
                  alt={`Sticker ${sticker.id}`}
                  onClick={() => handleAddSticker(sticker.src)}
                  className="sticker-preview"
                />
              </li>
            ))}
          </ul>
          <button onClick={handleAddText}>Add Text</button>
           {/* Botón estilizado para subir imágenes */}
  <label htmlFor="add-image" className="editor-button">
    Add Image
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      id="add-image"
      onChange={handleAddImage}
      style={{ display: 'none' }} // Ocultar el input
    />
     </label>
        </aside>
        

        <div className="canvas-container">
          <canvas ref={canvasRef} />
        </div>

        <aside className="sidebar right">
          <div className="button-group">
            <button className="download-button editor-button" onClick={handleDownload}>
              Download
            </button>
            <button className="reset-button editor-button" onClick={handleReset}>
              Reset
            </button>
            <button className="editor-button" onClick={bringForward}>
              Move Up
            </button>
            <button className="editor-button" onClick={sendBackward}>
              Move Down
            </button>
            <button
              className="editor-button delete-button"
              onClick={handleDeleteObject}
            >
              Delete
            </button>
            <button
  className={`editor-button noise-button ${isNoiseActive ? 'active' : ''}`}
  onClick={toggleNoise}
  disabled={!mainImage} // Deshabilitar si no hay imagen
>
  {isNoiseActive ? 'Remove Noise' : 'Apply Noise'}
</button>


<label htmlFor="noise-range">Noise Level</label>
<input
  id="noise-range"
  type="range"
  min="0"
  max="100"
  value={noiseLevel}
  onChange={(e) => {
    setNoiseLevel(Number(e.target.value));
    if (isNoiseActive) {
      toggleNoise(); // Actualizar el filtro dinámicamente
      toggleNoise();
    }
  }}
  style={{ width: '100%' }}
/>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor1;
