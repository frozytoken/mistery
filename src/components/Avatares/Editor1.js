import React, { useEffect, useRef } from 'react';
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

  const stickers = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    src: `/assets/builder/pfp${i + 1}.png`,
  }));

  const initCanvas = () => {
    canvasInstance.current = new fabric.Canvas(canvasRef.current, {
      backgroundColor: '#f0f0f0',
      width: window.innerWidth * 0.7,
      height: window.innerHeight * 0.8,
      preserveObjectStacking: true,
      selection: true,
    });

    const resizeCanvas = () => {
      canvasInstance.current.setWidth(window.innerWidth * 0.7);
      canvasInstance.current.setHeight(window.innerHeight * 0.8);
    };

    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvasInstance.current.dispose();
    };
  };

  useEffect(() => {
    // Redirigir si no hay imagen cargada en el estado
    if (!location.state?.image) {
      navigate('/MemeBuilder');
      return;
    }

    initCanvas();

    // Cargar la imagen base al canvas
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
        selectable: false, // Imagen base no manipulable
        hasBorders: false,
        hasControls: false,
      });
      canvasInstance.current.add(img).sendToBack();
    });

    // Habilitar doble clic para editar texto
    canvasInstance.current.on('mouse:dblclick', (event) => {
      const target = event.target;
      if (target && target.type === 'i-text') {
        target.enterEditing();
        target.selectAll();
      }
    });

    // Detectar selección y cambios
    canvasInstance.current.on('object:modified', () => {
      canvasInstance.current.renderAll();
    });

    canvasInstance.current.on('object:selected', (event) => {
      const activeObject = event.target;
      if (activeObject) {
        activeObject.set({
          borderColor: '#69c7ff',
          cornerColor: '#69c7ff',
          cornerSize: 10,
          transparentCorners: false,
        });
      }
    });

    canvasInstance.current.on('selection:cleared', () => {
      canvasInstance.current.renderAll();
    });

    return () => {
      canvasInstance.current.dispose();
    };
  }, [location.state, navigate]);

  const handleAddText = () => {
    const text = new fabric.IText('Editable Text', {
      left: 100,
      top: 100,
      fontSize: 24,
      fill: '#ffffff',
      fontFamily: 'Halau',
      borderColor: '#69c7ff',
      cornerColor: '#69c7ff',
      cornerSize: 8,
      transparentCorners: false,
      lockUniScaling: false, // Permitir cambio proporcional
      selectable: true,
    });
    canvasInstance.current.add(text).setActiveObject(text);
    canvasInstance.current.renderAll();
  };

  const handleAddSticker = (src) => {
    fabric.Image.fromURL(src, (img) => {
      img.set({
        left: 100,
        top: 100,
        scaleX: 0.5,
        scaleY: 0.5,
        borderColor: '#69c7ff',
        cornerColor: '#69c7ff',
        cornerSize: 8,
        transparentCorners: false,
        lockScalingFlip: true, // No permitir inversión
        selectable: true,
      });
      canvasInstance.current.add(img).setActiveObject(img);
      canvasInstance.current.renderAll();
    });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvasInstance.current.toDataURL({ format: 'png', quality: 1 });
    link.click();
  };

  const handleReset = () => {
    navigate('/MemeBuilder'); // Redirigir al resetear
  };

  const bringForward = () => {
    const activeObject = canvasInstance.current.getActiveObject();
    if (activeObject) {
      canvasInstance.current.bringForward(activeObject);
    }
  };

  const sendBackward = () => {
    const activeObject = canvasInstance.current.getActiveObject();
    if (activeObject) {
      canvasInstance.current.sendBackwards(activeObject);
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
              Bring Forward
            </button>
            <button className="editor-button" onClick={sendBackward}>
              Send Backward
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor1;
