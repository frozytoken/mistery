import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useLocation, useNavigate } from 'react-router-dom';
import './Editor.css';
import halauFont from '../../assets/fonts/Halau.ttf';
import logo from "../../assets/log1.png";
import twitterIcon from "../../assets/twitter-icon.png";
import telegramIcon from "../../assets/telegram-icon.png";
import ReactDOM from 'react-dom';

const StickerImage = ({ sticker, isSelected, onSelect, onChange }) => {
  const [image] = useImage(sticker.src);
  const shapeRef = useRef();
  const trRef = useRef(); // Agregar el Transformer ref

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
    }
  }, [isSelected]);
  return (
    <>
      <KonvaImage
        image={image}
        x={sticker.x}
        y={sticker.y}
        width={sticker.width}
        height={sticker.height}
        rotation={sticker.rotation}
        draggable
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({
            ...sticker,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          const newWidth = node.width() * scaleX;
          const newHeight = node.height() * scaleY;

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            ...sticker,
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
};
// Editable Text Component
const EditableText = ({ text, isSelected, onSelect, onChange, setIsEditing }) => {
  const textRef = useRef(null);
  const transformerRef = useRef(null);
  const textareaRef = useRef(null);
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [textareaStyle, setTextareaStyle] = useState(null);

  const handleDblClick = () => {
    if (!textRef.current) return;

    setIsEditingLocal(true);
    setIsEditing(true);

    const stage = textRef.current.getStage();
    const position = textRef.current.getAbsolutePosition();
    const scale = stage.scaleX();

    setTextareaStyle({
      position: 'absolute',
      top: `${position.y}px`,
      left: `${position.x}px`,
      width: `${textRef.current.width() * scale}px`,
      fontSize: `${text.fontSize * scale}px`,
      fontFamily: text.fontFamily || 'Arial',
      color: text.fill,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      border: '1px solid black',
      padding: '2px',
      margin: '0',
      resize: 'none',
      overflow: 'hidden',
      transform: `scale(${1 / scale})`,
      transformOrigin: 'top left',
      zIndex: 1000,
    });
  };

  const handleSave = () => {
    if (!textareaRef.current) return;

    onChange({ ...text, content: textareaRef.current.value });
    setIsEditingLocal(false);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <>
      <Text
        ref={textRef}
        text={text.content}
        x={text.x}
        y={text.y}
        fontSize={text.fontSize}
        fontFamily="Halau, sans-serif"
        fill={text.fill}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) =>
          onChange({
            ...text,
            x: e.target.x(),
            y: e.target.y(),
          })
        }
        onDblClick={handleDblClick}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
      {isEditingLocal &&
        ReactDOM.createPortal(
          <textarea
            ref={textareaRef}
            defaultValue={text.content}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            style={textareaStyle}
          />,
          document.body
        )}
    </>
  );
};




const Editor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const trRef = useRef(null);


  const [initialImage, setInitialImage] = useState(location.state?.image || null);
  const [overlayImages, setOverlayImages] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [texts, setTexts] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const stageRef = useRef();
  const [baseImage] = useImage(initialImage || '');
  const [isEditing, setIsEditing] = useState(false);

  
  const handleSelectSticker = (id) => {
    setSelectedStickerId(id);
    setSelectedType('sticker');
  };
  
  const handleSelectText = (id) => {
    setSelectedId(id);
    setSelectedType('text');
  };
  const canvasWidth = window.innerWidth * 0.7;
  const canvasHeight = window.innerHeight * 0.8;
  // Adjust image size proportionally
  
  // Centrar la imagen cargada
  const centeredImagePosition = () => {
    if (!baseImage) return { width: 0, height: 0, x: 0, y: 0 };
  
    const aspectRatio = baseImage.width / baseImage.height;
    let width = canvasWidth;
    let height = canvasWidth / aspectRatio;
  
    if (height > canvasHeight) {
      height = canvasHeight;
      width = canvasHeight * aspectRatio;
    }
  
    const x = (canvasWidth - width) / 2;
    const y = (canvasHeight - height) / 2;
  
    return { width, height, x, y };
  };

  const handleDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty && !isEditing) {
      setSelectedId(null);
      setSelectedStickerId(null);
    }
  };
  
  const updateText = (id, updatedText) => {
    setTexts((prev) =>
      prev.map((text) => (text.id === id ? { ...text, ...updatedText } : text))
    );
  };
  

  const handleAddText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      content: 'Editable Text',
      x: canvasWidth / 2, // Centro del canvas
      y: canvasHeight / 2, // Centro del canvas
      fontSize: 20,
      fill: '#ffffff',
    };
    setTexts((prev) => [...prev, newText]);
  };
  
  useEffect(() => {
    console.log('Texts updated:', texts); // Debug: Verifica el estado de texts
  }, [texts]);
  
  
  const handleLayerMove = (id, direction) => {
    const list = selectedType === 'text' ? texts : stickers;
    const setList = selectedType === 'text' ? setTexts : setStickers;
  
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) return;
  
    const updated = [...list];
    const [moved] = updated.splice(index, 1);
    const newIndex = direction === 'up' ? index + 1 : index - 1;
  
    updated.splice(newIndex, 0, moved);
    setList(updated);
  };
  
  

  let scaledWidth = canvasWidth;
let scaledHeight = canvasWidth / (baseImage?.width / baseImage?.height || 1);

if (scaledHeight > canvasHeight) {
  scaledHeight = canvasHeight;
  scaledWidth = canvasHeight * (baseImage?.width / baseImage?.height || 1);
}

useEffect(() => {
  const handleKeyDown = (event) => {
    if (event.key === 'Delete' || event.key === 'Del') {
      // Eliminar el elemento seleccionado
      if (!selectedStickerId) return;
  
      // Eliminar de stickers
      setStickers((prev) =>
        prev.filter((sticker) => sticker.id !== selectedStickerId)
      );
  
      // Eliminar de imágenes cargadas
      setOverlayImages((prev) =>
        prev.filter((image) => image.id !== selectedStickerId)
      );
  
      // Desseleccionar el elemento
      setSelectedStickerId(null);
    }
  };

  // Añadir el evento de teclado
  window.addEventListener('keydown', handleKeyDown);

  // Limpiar el evento al desmontar el componente
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [selectedStickerId]); // `selectedStickerId` es suficiente como dependencia

  useEffect(() => {
    if (!initialImage) {
      navigate('/MemeBuilder');
    }
  }, [initialImage, navigate]);

  const stickerList = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    src: `/assets/builder/pfp${i + 1}.png`,
  }));

  const addStickerToCanvas = (sticker) => {
    const newSticker = {
      ...sticker,
      id: Date.now(),
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      rotation: 0,
    };
    setStickers((prev) => [...prev, newSticker]);
  };

  const updateSticker = (id, updatedSticker) => {
    // Actualizar stickers
    setStickers((prev) =>
      prev.map((sticker) => (sticker.id === id ? updatedSticker : sticker))
    );
  
    // Actualizar imágenes cargadas
    setOverlayImages((prev) =>
      prev.map((image) => (image.id === id ? updatedSticker : image))
    );
  };

  const handleDeleteSelectedItem = () => {
    if (selectedStickerId) {
      // Eliminar el sticker seleccionado
      setStickers((prev) => prev.filter((sticker) => sticker.id !== selectedStickerId));
      setSelectedStickerId(null);
    } else if (selectedId) {
      // Eliminar el texto seleccionado
      setTexts((prev) => prev.filter((text) => text.id !== selectedId));
      setSelectedId(null);
    }
  
    // Limpiar nodos del Transformer
    if (trRef.current) {
      trRef.current.nodes([]);
    }
  };
  
  
  const handleReset = () => {
    setInitialImage(null);
    setOverlayImages([]);
    setStickers([]);
    navigate('/MemeBuilder');
  };

  const handleDownload = () => {
    const stage = stageRef.current; // Referencia al Stage de Konva
    if (!stage) return;
  
    // Deseleccionar cualquier sticker
    setSelectedStickerId(null);
  
    // Asegurarnos de que la imagen base esté definida
    if (!initialImage || !baseImage) return;
  
    // Obtener las dimensiones originales de la imagen base
    const originalWidth = baseImage.width;
    const originalHeight = baseImage.height;
  
    // Obtener las dimensiones escaladas y posición de la imagen base en el canvas
    const baseImageWidth = scaledWidth;
    const baseImageHeight = scaledHeight;
    const baseImageX = (canvasWidth - scaledWidth) / 2;
    const baseImageY = (canvasHeight - scaledHeight) / 2;
  
    // Crear un canvas temporal con las dimensiones originales de la imagen base
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalWidth;
    tempCanvas.height = originalHeight;
    const tempContext = tempCanvas.getContext('2d');
  
    // Renderizar el Stage completo en un canvas
    const stageCanvas = stage.toCanvas();
  
    // Recortar y escalar la parte correspondiente a la imagen base
    tempContext.drawImage(
      stageCanvas,
      baseImageX, // Recorte inicial en X
      baseImageY, // Recorte inicial en Y
      baseImageWidth, // Ancho del área a recortar
      baseImageHeight, // Altura del área a recortar
      0, // Posición inicial en el canvas temporal
      0, // Posición inicial en el canvas temporal
      originalWidth, // Escalar al ancho original
      originalHeight // Escalar a la altura original
    );
  
    // Crear un enlace para descargar la imagen
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
  };
  
  const handleUploadNewImage = (event) => {
    const file = event.target.files[0]; // Obtener el archivo cargado
    if (file) {
      const img = new Image();
      img.src = URL.createObjectURL(file); // Crear una URL temporal para la imagen
  
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        let width = canvasWidth;
        let height = canvasWidth / aspectRatio;
  
        // Ajustar tamaño para mantener proporción dentro del canvas
        if (height > canvasHeight) {
          height = canvasHeight;
          width = canvasHeight * aspectRatio;
        }
  
        // Calcular posición centrada
        const x = (canvasWidth - width) / 2;
        const y = (canvasHeight - height) / 2;
  
        // Agregar la nueva imagen al estado
        const newImage = {
          id: Date.now(),
          src: img.src,
          x: x,
          y: y,
          width: width,
          height: height,
          rotation: 0,
        };
  
        setOverlayImages((prev) => [...prev, newImage]);
      };
    }
  };
  useEffect(() => {
    const font = new FontFace('Halau', `url(${halauFont})`);
    font.load().then(() => {
      document.fonts.add(font);
    }).catch((error) => {
      console.error('Error al cargar la fuente Halau:', error);
    });
  }, []);

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
        {/* Sidebar izquierda */}
        <aside className="sidebar left">
          <h2>STICKERS</h2>
          <button onClick={handleAddText}>TEXT</button>
          <ul className="sticker-list">
            {stickerList.map((sticker) => (
              <li key={sticker.id}>
                <img
                  src={sticker.src}
                  alt={`Sticker ${sticker.id}`}
                  onClick={() => addStickerToCanvas(sticker)}
                />
              </li>
            ))}
          </ul>
        </aside>
  
        {/* Contenedor principal del canvas */}
        <div className="canvas-container">
        <Stage
  width={canvasWidth}
  height={canvasHeight}
  ref={stageRef}
  onMouseDown={handleDeselect} // Agregar el evento aquí
  onClick={handleDeselect}    // También puedes mantener `onClick` para asegurar compatibilidad
>

            <Layer>
            {baseImage && (
              
  <KonvaImage
  image={baseImage}
  {...centeredImagePosition()} // Usamos directamente la función
/>
)}

{texts.map((text) => (
  <EditableText
  key={text.id}
  text={text}
  isSelected={selectedId === text.id}
  onSelect={() => handleSelectText(text.id)}
  onChange={(newAttrs) => updateText(newAttrs.id, newAttrs)}
  setIsEditing={setIsEditing}
/>


))}

              {overlayImages.map((image) => (
                <StickerImage
                  key={image.id}
                  sticker={image}
                  isSelected={selectedStickerId === image.id}
                  onSelect={() => setSelectedStickerId(image.id)}
                  onChange={(newAttrs) => updateSticker(image.id, newAttrs)}
                />
              ))}
              {stickers.map((sticker) => (
  <StickerImage
    key={sticker.id}
    sticker={sticker}
    isSelected={selectedStickerId === sticker.id}
    onSelect={() => handleSelectSticker(sticker.id)}
    onChange={(newAttrs) => updateSticker(sticker.id, newAttrs)}
  />
))}
            </Layer>
          </Stage>
        </div>
  
                {/* Sidebar derecha */}
                <aside className="sidebar right">
  <div className="button-group">
    <button className="download-button editor-button" onClick={handleDownload}>
      Download
    </button>
    <button className="reset-button editor-button" onClick={handleReset}>
      Reset
    </button>
    
    <button className="delete-button editor-button" onClick={handleDeleteSelectedItem}>
      Delete
    </button>
    <button
      onClick={() => document.getElementById('uploadNewImageInput').click()}
      className="upload-new-image editor-button"
    >
      Upload New Image
    </button>
    <input
      id="uploadNewImageInput"
      type="file"
      accept="image/*"
      style={{ display: 'none' }}
      onChange={handleUploadNewImage}
    />
    {selectedStickerId && (
      <>
        <button className="move-button editor-button" onClick={() => handleLayerMove(selectedStickerId, 'up')}>
          Move Up
        </button>
        <button className="move-button editor-button" onClick={() => handleLayerMove(selectedStickerId, 'down')}>
          Move Down
        </button>
      </>
    )}
  </div>
</aside>

      </div>
    </div>
  );
};

export default Editor;
