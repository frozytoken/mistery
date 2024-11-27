import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useLocation, useNavigate } from 'react-router-dom';
import './Editor.css';

const StickerImage = ({ sticker, isSelected, onSelect, onChange }) => {
  const [image] = useImage(sticker.src);
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
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
        scaleX={sticker.scaleX} // Asegúrate de usar el valor actualizado
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
        
          // Extrae las dimensiones escaladas
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
        
          // Calcula el nuevo ancho y alto
          const newWidth = node.width() * scaleX;
          const newHeight = node.height() * scaleY;
        
          // Restablece el escalado a 1 para evitar aumentos posteriores
          node.scaleX(1);
          node.scaleY(1);
        
          // Actualiza el sticker con las nuevas dimensiones y otras propiedades
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

const Editor = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [initialImage, setInitialImage] = useState(location.state?.image || null);
  const [overlayImages, setOverlayImages] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [selectedStickerId, setSelectedStickerId] = useState(null);

  const stageRef = useRef();

  // Declarar el hook useImage dentro del componente y después de initialImage
  const [baseImage] = useImage(initialImage || '');
  const canvasWidth = window.innerWidth * 0.7;
  const canvasHeight = window.innerHeight * 0.8;
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

  const handleDeleteSelected = () => {
    if (!selectedStickerId) return;
  
    // Eliminar de stickers
    setStickers((prev) => prev.filter((sticker) => sticker.id !== selectedStickerId));
  
    // Eliminar de imágenes cargadas
    setOverlayImages((prev) => prev.filter((image) => image.id !== selectedStickerId));
  
    // Desseleccionar el elemento
    setSelectedStickerId(null);
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
  
  
  
  return (
    <div className="editor-container">
      <header className="header">
        <img src="/path-to-your-logo.png" alt="DVIL Logo" className="logo" />
        <div className="header-actions">
          <button className="close-button">✖</button>
          <button className="buy-button">BUY $DVIL</button>
        </div>
      </header>
      <div className="editor-content">
        <aside className="sidebar left">
          <h2 className="sidebar-title">Stickers</h2>
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
          <button
            className="upload-new-image"
            onClick={() => document.getElementById('uploadNewImageInput').click()}
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
        </aside>
        <div className="canvas-container">
          <Stage
            width={window.innerWidth * 0.7}
            height={window.innerHeight * 0.8}
            ref={stageRef}
          >
            <Layer>
  {/* Renderizar la imagen base */}
  {initialImage && baseImage && (
  <KonvaImage
    image={baseImage}
    x={(canvasWidth - scaledWidth) / 2}
    y={(canvasHeight - scaledHeight) / 2}
    width={scaledWidth}
    height={scaledHeight}
  />
)}

  {/* Renderizar las imágenes cargadas */}
  {overlayImages.map((image) => (
    <StickerImage
      key={image.id}
      sticker={image}
      isSelected={selectedStickerId === image.id}
      onSelect={() => setSelectedStickerId(image.id)}
      onChange={(newAttrs) => updateSticker(image.id, newAttrs)}
    />
  ))}
              {/* Renderizar los stickers */}
  {stickers.map((sticker) => (
    <StickerImage
      key={sticker.id}
      sticker={sticker}
      isSelected={selectedStickerId === sticker.id}
      onSelect={() => setSelectedStickerId(sticker.id)}
      onChange={(newAttrs) => updateSticker(sticker.id, newAttrs)}
    />
  ))}
</Layer>
          </Stage>
        </div>
        <aside className="sidebar right">
          <button className="download-button" onClick={handleDownload}>
            Download
          </button>
          <button className="reset-button" onClick={handleReset}>
            Reset
          </button>
          {selectedStickerId && (
            <button
              className="delete-button"
              onClick={() => handleDeleteSelected()}
            >
              Delete
            </button>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Editor;
