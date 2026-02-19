import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { cities } from './data/cities';
import 'leaflet/dist/leaflet.css';
import './App.css';

delete L.Icon.Default.prototype._getIconUrl;

const ponticIcon = new L.DivIcon({
  className: 'custom-pontic-marker',
  html: `
    <div class="marker-container">
      <div class="marker-dot"></div>
      <div class="marker-ring"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const ponticIconDark = new L.DivIcon({
  className: 'custom-pontic-marker-dark',
  html: `
    <div class="marker-container-dark">
      <div class="marker-dot-dark"></div>
      <div class="marker-ring-dark"></div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

function FlyToCity({ coordinates }) {
  const map = useMap();
  React.useEffect(() => {
    if (coordinates) {
      map.flyTo(coordinates, 10, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [coordinates, map]);
  return null;
}

function App() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [flyToCoords, setFlyToCoords] = useState(null);
  const [version, setVersion] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('pontus-theme');
    return saved ? JSON.parse(saved) : false;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState([]);
  const [currentCityName, setCurrentCityName] = useState('');
  const [showMoreImages, setShowMoreImages] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('pontus-theme', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalOpen]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setFlyToCoords(city.coordinates);
    setVersion(v => v + 1);
    setShowMoreImages(false);
  };

  const handleMarkerClick = (city) => {
    setSelectedCity(city);
    setVersion(v => v + 1);
    setShowMoreImages(false);
  };

  const handleClose = () => {
    setSelectedCity(null);
    setShowMoreImages(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const openGitHub = () => {
    window.open('https://github.com/KaloudasDev', '_blank');
  };

  const openImageModal = (images, index, cityName) => {
    setCurrentImages(images);
    setCurrentImageIndex(index);
    setCurrentImage(images[index]);
    setCurrentCityName(cityName);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    const newIndex = (currentImageIndex + 1) % currentImages.length;
    setCurrentImageIndex(newIndex);
    setCurrentImage(currentImages[newIndex]);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    const newIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    setCurrentImageIndex(newIndex);
    setCurrentImage(currentImages[newIndex]);
  };

  const toggleMoreImages = () => {
    setShowMoreImages(prev => !prev);
  };

  const toggleLeftSidebar = () => {
    setLeftSidebarOpen(!leftSidebarOpen);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <button 
        className={`menu-button ${darkMode ? 'dark' : ''} ${!leftSidebarOpen ? 'menu-button-closed' : ''}`}
        onClick={toggleLeftSidebar}
        aria-label="Toggle menu"
      >
        <span className="menu-icon"></span>
        <span className="menu-icon"></span>
        <span className="menu-icon"></span>
      </button>

      <AnimatePresence mode="wait">
        {leftSidebarOpen && (
          <motion.div 
            className={`sidebar left-sidebar ${darkMode ? 'dark' : ''}`}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="sidebar-header">
              <h1>Ιστορικός Χάρτης</h1>
              <h1 className="subtitle-main">του Πόντου</h1>
              <p className="subtitle">Επτά σημαντικές πόλεις</p>
            </div>
            <div className="city-list">
              {cities.map((city, index) => (
                <motion.div
                  key={city.id}
                  className={`city-list-item ${selectedCity?.id === city.id ? 'active' : ''} ${darkMode ? 'dark' : ''}`}
                  onClick={() => handleCitySelect(city)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, backgroundColor: darkMode ? 'rgba(212, 175, 55, 0.2)' : 'rgba(212, 175, 55, 0.1)' }}
                >
                  <span className="city-name">{city.name}</span>
                  <span className="city-region">{city.region}</span>
                </motion.div>
              ))}
            </div>
            <div className="sidebar-footer">
              <p>© 2026 • Giachasidis Project</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MapContainer
        center={[39.5, 33.0]}
        zoom={6}
        className="map-container"
        minZoom={7}
        maxBounds={[[30, 20], [50, 50]]}
        attributionControl={false}
        zoomControl={false}
        preferCanvas={true}
        updateWhenZooming={false}
        updateWhenIdle={true}
      >
        <AttributionControl position="bottomright" prefix={false} />
        <TileLayer
          attribution=''
          url={darkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
          keepBuffer={5}
          maxNativeZoom={19}
        />
        
        <FlyToCity coordinates={flyToCoords} />

        {cities.map((city) => (
          <Marker
            key={city.id}
            position={city.coordinates}
            icon={darkMode ? ponticIconDark : ponticIcon}
            eventHandlers={{
              click: () => handleMarkerClick(city),
              mouseover: (e) => {
                e.target.openPopup();
              },
              mouseout: (e) => {
                e.target.closePopup();
              }
            }}
          >
            <Popup>
              <div className={`custom-popup ${darkMode ? 'dark' : ''}`}>
                <h3>{city.name}</h3>
                <p>{city.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <AnimatePresence mode="wait">
        {selectedCity && (
          <motion.div
            key={`${selectedCity.id}-${version}`}
            className={`sidebar right-sidebar ${darkMode ? 'dark' : ''}`}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <button className="close-button" onClick={handleClose}>×</button>
            <div className="city-details">
              <h2>{selectedCity.name}</h2>
              <p className="city-meta">
                <span className="region">{selectedCity.region}</span>
                <span className="established">{selectedCity.established}</span>
              </p>
              
              <div className="city-images">
                {selectedCity.images.slice(0, 2).map((img, index) => (
                  <motion.img
                    key={index}
                    src={img}
                    alt={`${selectedCity.name} - view ${index + 1}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    onClick={() => openImageModal(selectedCity.images, index, selectedCity.name)}
                    style={{ cursor: 'pointer' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=Ιστορική+Εικόνα';
                    }}
                  />
                ))}
              </div>

              {selectedCity.images.length > 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <button className="more-images-button" onClick={toggleMoreImages}>
                    {showMoreImages ? 'Δείτε λιγότερες εικόνες' : 'Δείτε περισσότερες εικόνες'}
                  </button>
                  
                  <AnimatePresence>
                    {showMoreImages && (
                      <motion.div 
                        className="more-images-grid"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {selectedCity.images.slice(2).map((img, index) => (
                          <motion.img
                            key={index + 2}
                            src={img}
                            alt={`${selectedCity.name} - view ${index + 3}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => openImageModal(selectedCity.images, index + 2, selectedCity.name)}
                            style={{ cursor: 'pointer' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/300x200?text=Ιστορική+Εικόνα';
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              <motion.div
                className="city-description"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="short-desc">{selectedCity.description}</p>
                <p className="long-desc">{selectedCity.longDescription}</p>
              </motion.div>

              <motion.div
                className="city-stats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="stat">
                  <span className="stat-label">Πληθυσμός:</span>
                  <span className="stat-value">{selectedCity.population}</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && (
          <motion.div 
            className="image-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeImageModal}
          >
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="image-modal-close" onClick={closeImageModal}>×</button>
              
              {currentImages.length > 1 && (
                <>
                  <button className="image-modal-nav image-modal-prev" onClick={prevImage}>‹</button>
                  <button className="image-modal-nav image-modal-next" onClick={nextImage}>›</button>
                </>
              )}
              
              <motion.img 
                key={currentImage}
                src={currentImage}
                alt={`${currentCityName} - enlarged view`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              
              {currentImages.length > 1 && (
                <div className="image-modal-caption">
                  {currentCityName} - {currentImageIndex + 1} / {currentImages.length}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="bottom-bar"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <button 
          className="bottom-bar-button theme-toggle-bottom"
          onClick={toggleDarkMode}
          aria-label="Toggle theme"
        >
          <span className="theme-icon">
            <span className={`moon-icon ${darkMode ? 'hidden' : ''}`}></span>
            <span className={`sun-icon ${darkMode ? '' : 'hidden'}`}></span>
          </span>
          <span className="button-text">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        
        <button 
          className="bottom-bar-button github-button"
          onClick={openGitHub}
          aria-label="GitHub Profile"
        >
          <span className="github-icon"></span>
          <span className="button-text">GitHub</span>
        </button>
      </motion.div>
    </div>
  );
}

export default App;