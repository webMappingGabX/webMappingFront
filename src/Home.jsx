import { FeatureGroup, MapContainer, TileLayer, useMap, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import 'leaflet/dist/leaflet.css';
import "leaflet-draw/dist/leaflet.draw.css";
import L, { featureGroup } from "leaflet";
import "leaflet-draw";
import { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
import { useAppMainContext } from "./components/context/AppProvider";
import axios from "./components/api/axios";
import * as turf from "@turf/turf";
import jsPDF from 'jspdf';
import "leaflet-simple-map-screenshoter";
import MessageBox from "./components/popups/MessageBox";
import CreateWorkspacePopup from "./components/popups/CreateWorkspacePopup";
import SelectWorkspacePopup from "./components/popups/SelectWorkspacePopup";
import SelectLayerPopup from "./components/popups/SelectLayerPopup";

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


function DrawControls({ map, featureGroupRef, isEditing, setIsEditing })
{

  useEffect(() => {
    if (!map || !featureGroupRef.current) {
      console.error("Map or FeatureGroup is not defined");
      return;
    }
  
    console.log("Map:", map);
    console.log("FeatureGroup layers:", featureGroupRef.current.getLayers());
  
    if (isEditing) {
      if (!map.editHandler) {
        console.log("Initializing editHandler");
        map.editHandler = new L.EditToolbar.Edit(map, {
          featureGroup: featureGroupRef.current,
        });
      }
      console.log("Enabling editHandler");
      map.editHandler.enable();
    } else if (map.editHandler) {
      console.log("Disabling editHandler");
      map.editHandler.disable();
      map.editHandler = null;
    }
  
    return () => {
      if (map.editHandler) {
        console.log("Cleaning up editHandler");
        map.editHandler.disable();
        map.editHandler = null;
      }
    };
  }, [map, featureGroupRef, isEditing]);
  
  return null;
}

DrawControls.propTypes = {
  map: PropTypes.object.isRequired,
  featureGroupRef: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  setIsEditing: PropTypes.func.isRequired
};
//}

function MapController({ featureGroupRef, isEditing, setIsEditing }) {
    const map = useMap();
    return <DrawControls 
      map={map} 
      featureGroupRef={featureGroupRef} 
      isEditing={isEditing} 
      setIsEditing={setIsEditing} />;
}

MapController.propTypes = {
  featureGroupRef: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  setIsEditing: PropTypes.object.isRequired
}

const Home = () => {

  const featureGroupRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [drawnItems, setDrawnItems] = useState([]);
  const [ initialCenter, setInitialCenter ] = useState([3.868177, 11.519596]);

  const { drawPolygon, editEntity, setDrawPolygon, geojsonContents, uploadGeojsonBtn,
    featureGroupLayers, setFeatureGroupLayers,
    fileName, setFileName,
    fileSize, setFileSize,
    fileToUpload, setFileToUpload,
    isGeneratingPDF, setIsGeneratingPDF,
    isPopupVisible, setIsPopupVisible,
    isSWPVisible, setIsSWPVisible,
    isCWPVisible, setIsCWPVisible,
    isSLPVisible, setIsSLPVisible,
    popupMessage, setPopupMessage,
    coordSys, setCoordSys,
    setIntersectionsArea,
    editionActiveLayer,
    currentLayersIdx, setCurrentLayersIdx,
    saveBtnRef,
    currentWorspaceIdx,
    generatePDFBtnRef,
   } = useAppMainContext();

  const [activeLayer, setActiveLayer] = useState(null);
  const [geojsonLayers, setGeojsonLayers] = useState([]);
  const [intersections, setIntersections] = useState([]);

  const screenshoterRef = useRef(null); // Référence pour le screenshoter

  //const authToken = getCookie("token");
  const authToken = localStorage.getItem("authToken");

  const UPLOAD_URL = "/geodatas/upload";

  const GEODATAS_URL = "/geodatas";

  // Composant interne pour gérer la carte et le screenshoter
  const MapScreenShotController = () => {
    const map = useMap(); // Obtenir la référence de la carte

    // Initialiser le screenshoter une fois que la carte est prête
    useEffect(() => {
      if (map) {
        screenshoterRef.current = L.simpleMapScreenshoter({ 
          hidden: true,
          preventDownload: true,
          screenName: 'map-parcellaire',
          // Add these options:
          captureMethod: 'canvas', // Force canvas method
          cropImageByInnerWH: true, // Crop by inner dimensions
          // Avoid showing tile gaps
          leafletGap: false, // Disable leaflet gaps
          tileLayer: { 
            hideTileLayersGap: true // Prevent tile gaps from showing
          }
         }).addTo(map);
        // Optionnel : Configurer des options supplémentaires pour le screenshoter
        screenshoterRef.current.options = {
          hideElementsWithSelectors: [".leaflet-control-container"], // Masquer les contrôles de la carte
          mimeType: "image/png", // Format de l'image
          quality: 1, // Qualité de l'image (0 à 1)
          scale : 2, // Facteur d'échelle
        };
      }
    }, [map]);

    return null; // Ce composant ne rend rien
  };
    
  useEffect(() => {
    if (drawPolygon) {
      startDrawingPolygon();
    }
  }, [drawPolygon]);

  // Expoter les donnees en geojson
  const exportToGeoJSON = async () => {
    if (featureGroupRef.current) {
      //const layers = featureGroupRef.current.getLayers();
      //const features = layers.map(layer => layer.toGeoJSON());
      let layersIdx = JSON.parse(localStorage.getItem("currentLayers")) | [];
      let fIdx = 0;
      for(let i = 0; i < layersIdx.length; i++)
      {
          if(layersIdx[i].toString() === editionActiveLayer.toString())
          {
            fIdx = i;
            break;
          }
      }
      
      const features = featureGroupLayers[fIdx].map(layer => layer.toGeoJSON());
      
      //console.log("FEATURES TO SAVE", features);
      
      // Remove duplicate features
      const uniqueFeatures = [];
      const featureSet = new Set();
      features.forEach(feature => {
        const featureString = JSON.stringify(feature);
        if (!featureSet.has(featureString)) {
          featureSet.add(featureString);
          uniqueFeatures.push(feature);
        }
      });
      
      //Remove features with empty properties
      /*const filteredFeatures = uniqueFeatures.filter(feature => {
        return feature.properties && Object.keys(feature.properties).length > 0;
      });

      // Filter out intersection features
      const nonIntersectionFeatures = filteredFeatures.filter(feature => {
        return !feature.properties.isIntersection;
      });*/
      const nonIntersectionFeatures = uniqueFeatures.filter(feature => {
        return !feature.properties.isIntersection;
      });
      const geoJSON = {
        type: "FeatureCollection",
        name: "Parcelles",
        crs: {
          type: "name",
          properties: {
            name: "urn:ogc:def:crs:OGC:1.3:CRS84"
          }
        },
        features: nonIntersectionFeatures
      };
  
      const blob = new Blob([JSON.stringify(geoJSON, null, 2)], { type: "application/json" });
      const newFile = new File([blob], "map-features.geojson", { type: "application/json" });
      const updatedGeojson = JSON.parse(await newFile.text());
      updatedGeojson.crs = {
        type: "name",
        properties: {
          name: "urn:ogc:def:crs:OGC:1.3:CRS84"
        }
      };
      const updatedBlob = new Blob([JSON.stringify(updatedGeojson)], { type: "application/json" });
      const updatedFile = new File([updatedBlob], newFile.name, { type: "application/json" });
  
      const formData = new FormData();
      formData.append("file", newFile);
      formData.append("layerId", editionActiveLayer);
  
      try {
        const response = await axios.post(UPLOAD_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${authToken}`
          },
        });
        //alert("File uploaded successfully");
        setIsPopupVisible(true);
        setPopupMessage("Données sauvegardées avec succès");

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error(error);
      }
      
    } else {
      console.error("FeatureGroup is not defined");
    }
  };

  // Importer les donnees geojson
  const importGeoJSON = async (event) => {

    const inputFile = uploadGeojsonBtn.current;

    setFileName(inputFile.files[0].name);
    setFileSize((inputFile.files[0].size / 1024).toFixed(2));
    setFileToUpload(inputFile.files[0]);
    setCoordSys(inputFile.files[0] ? JSON.parse(await inputFile.files[0].text()).crs?.properties?.name : "Unknown");

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const geoJSON = JSON.parse(e.target.result);
        const geoJsonLayer = L.geoJSON(geoJSON, {
          style: dynamicStyle,
          onEachFeature: (feature, layer) => onEachFeature(feature, layer)
        });
        featureGroupRef.current.addLayer(geoJsonLayer);
      };
      reader.readAsText(file);
    }
  };

  const calculateIntersections = () => {
    if (!featureGroupRef.current) return;
  
    const layers = featureGroupRef.current.getLayers();
    const polygons = layers.filter(layer => layer instanceof L.Polygon);
    //const polygons = layers;
    const intersections = [];
    // Parcourir toutes les paires de polygones
    for (let i = 0; i < polygons.length; i++) {
      for (let j = i + 1; j < polygons.length; j++) {
        const polygon1 = polygons[i];
        const polygon2 = polygons[j];
  
        // Convertir les polygones Leaflet en GeoJSON
        const geoJSON1 = polygon1.toGeoJSON();
        const geoJSON2 = polygon2.toGeoJSON();
        
        // Vérifier que les géométries sont valides
        
        if (turf.booleanValid(geoJSON1) && turf.booleanValid(geoJSON2)) {
          // Calculer l'intersection
          const intersection = turf.intersect(turf.featureCollection([ geoJSON1, geoJSON2 ]));

          if (intersection) {
            // Calculer la surface de l'intersection
            const area = turf.area(intersection);
            intersections.push({
              polygon1: geoJSON1,
              polygon2: geoJSON2,
              intersection,
              area,
            });
          }
        } else {
          //console.warn("Un des polygones est invalide et ne peut pas être utilisé pour calculer une intersection.");
        }
      }
    }
  
    setIntersections(intersections);
    console.log("Intersections:", intersections);
  };

  useEffect(() => {
    fetchGeojsonData();
  }, []);

  useEffect(() => {
    console.log("GeoJSON layers updated:", geojsonLayers);
  }, [geojsonLayers]);

  const fetchGeojsonData = async () => {
    let wIdx = JSON.parse(window.localStorage.getItem("currentWorkspace"))?.id | 0;

    try {
      const response = await axios.get(GEODATAS_URL, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        params: {
          workspaceId: wIdx
        }
      });
      setGeojsonLayers(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données GeoJSON:", error);
    }
  };

  useEffect(() => {
      setIsEditing(editEntity);
  }, [editEntity]);

  const handleCreated = (e) => {
    console.log("Shape created", e.layer);
    e.layer.feature = e.layer.feature || {};
    e.layer.feature.type = "Feature";
    e.layer.feature.properties = e.layer.feature.properties || {};
    e.layer.feature.properties.id = "00";
    if (featureGroupRef.current) {
      featureGroupRef.current.addLayer(e.layer); // Ajouter la nouvelle entité au FeatureGroup
    }
    setDrawnItems([...drawnItems, e.layer]);
  };
  
  const startDrawingPolygon = () => {
    let layersIdx = JSON.parse(localStorage.getItem("currentLayers")) | [];
    let fIdx = 0;
    for(let i = 0; i < layersIdx.length; i++)
    {
        if(layersIdx[i].toString() === editionActiveLayer.toString())
        {
          fIdx = i;
          break;
        }
    }

    // Accès à l'instance de la carte via le featureGroupRef
    if (featureGroupRef.current && featureGroupRef.current._map) {
      const map = featureGroupRef.current._map;
      
      // Listen for the 'draw:created' event to capture the drawn polygon
      map.on('draw:created', (event) => {
        const layer = event.layer;
        let datas = featureGroupLayers;
        datas[fIdx].push(layer);
        
        setFeatureGroupLayers(datas);
        const drawnPolygon = layer.toGeoJSON(); // Convert the drawn layer to GeoJSON
        console.log("Drawn Polygon:", drawnPolygon); // Log the polygon to the console
        // You can now store the drawnPolygon in a state or variable
      });
      // Création d'un outil de dessin de polygone
      const polygonDrawHandler = new L.Draw.Polygon(map);
      polygonDrawHandler.enable();
    }
    setDrawPolygon(false);
  };
  
  const handleLayerEditing = (e) => {
    const layers = e.layers.getLayers();
    if (layers.length > 0) {
      const editedGeoJSON = layers[0].toGeoJSON();
      setActiveLayer(editedGeoJSON);
      console.log("Couche éditée:", editedGeoJSON);
    }
  };

  const dynamicStyle = (feature) => {
    /*return {
      color: feature.properties.color || 'olive', // Couleur basée sur une propriété
      weight: 2,
      fillOpacity: 0.7,
    };*/
    return {
      color: 'blue', // Red borders
      weight: 2,
      fillColor: 'blue', // Blue background
      fillOpacity: 0.3, // Transparent background
      };
  };

  useEffect(() => {
    console.log("Active layer updated:", activeLayer);
  }, [activeLayer]);
  
  const onEachFeature = (feature, layer, id) => {
    layer.on({
      click: () => {
        setActiveLayer({ ...feature, id });
      }
    });
  };

  useEffect(() => {
    //console.log("FEATURE GROUP REF", featureGroupRef);
    if(featureGroupRef.current != null)
      featureGroupRef.current.clearLayers();
    /*window.localStorage.setItem("currentLayers", []);
    setCurrentLayersIdx([]);*/
  }, [currentWorspaceIdx, currentLayersIdx]);

  // Ajouter les couches GeoJSON au FeatureGroup
  useEffect(() => {
    if (featureGroupRef.current && geojsonContents.length > 0) {
      let distinctsDatas = [];
      featureGroupRef.current.clearLayers();
      geojsonContents.forEach(geojson => {
        const geoJsonLayer = L.geoJSON(geojson, {
          style: dynamicStyle,
          onEachFeature: (feature, layer) => onEachFeature(feature, layer, geojson.id)
        });
        const reprojectedGeoJSON = turf.transformScale(geojson, 1, { mutate: true });
        console.log("Adding GeoJSON layer:", reprojectedGeoJSON, "geojson layer", geoJsonLayer);
        //featureGroupRef.current.addLayer(geoJsonLayer);
        let datas = [];
        geoJsonLayer.getLayers().forEach(layer => {
          featureGroupRef.current.addLayer(layer);
          datas.push(layer);
        });
        distinctsDatas.push(datas);
      });
      setFeatureGroupLayers(distinctsDatas);
      console.log("DISTINCTS DATAS", distinctsDatas);
    }

    if (geojsonContents.length > 0) {
      calculateIntersections();
    }
    console.log({ "message" : "GEO CONTENTS", geojsonContents, featureGroupLayers, featureGroupRef });
  }, [geojsonContents]);

  useEffect(() => {
    if (geojsonContents[0]?.features[0]?.geometry?.type === "Point") {
      setInitialCenter(geojsonContents[0]?.features[0]?.geometry?.coordinates/*.reverse()*/);
    } else if (geojsonContents[0]?.features[0]?.geometry?.type === "LineString") {
        setInitialCenter(geojsonContents[0]?.features[0]?.geometry?.coordinates[0]/*.reverse()*/);
    } else if (geojsonContents[0]?.features[0]?.geometry?.type === "Polygon") {
      setInitialCenter(geojsonContents[0]?.features[0]?.geometry?.coordinates[0][0]/*.reverse()*/);
    } else if (geojsonContents[0]?.features[0]?.geometry?.type === "MultiPolygon") {
      setInitialCenter(geojsonContents[0]?.features[0]?.geometry?.coordinates[0][0][0]/*.reverse()*/);
    }
  }, [geojsonContents, initialCenter]);
  
  const intersectionStyle = {
    color: "red", // Couleur de la bordure
    weight: 1, // Épaisseur de la bordure
    fillColor: "red", // Couleur de remplissage
    fillOpacity: 0.4, // Opacité du remplissage
  };
  
  // Gestionnaire d'événements pour chaque empietement
  const onEachFeaturesIntersection = (feature, layer) => {
      // Ajoute une action au clic
      layer.on('click', () => {
  
          let map = layer._map;
          console.log('Intersection cliquée:', feature);
          
          //let tmp_lat = feature.geometry.coordinates[0][0][1] | feature.geometry.coordinates[0][0][0][1];
          //let tmp_long = feature.geometry.coordinates[0][0][0] | feature.geometry.coordinates[0][0][0][0];
  
          //console.log({ "tmp_lat": tmp_lat, "tmp_long": tmp_long });
          //map.setView([tmp_lat, tmp_long], 15);
  
          layer.bindPopup(`
              <h2 class="text-green-500 text-center font-mono mb-3 text-lg">Empietement</h2>
              <b>Surface :</b> ${feature.properties.area.toFixed(4)} m<sup>2</sup><br>
              `).openPopup();
      });
    };

  useEffect(() => {
    if (intersections.length > 0 && featureGroupRef.current) {
      // Supprimer les anciennes intersections pour éviter les doublons
      featureGroupRef.current.eachLayer((layer) => {
        if (layer.options && layer.options.isIntersection) {
          featureGroupRef.current.removeLayer(layer);
        }
      });
      
      // Surface totale de tous les empietements
      let total = 0;

      // Ajouter les nouvelles intersections
      intersections.forEach((intersection) => {
        const intersectionLayer = L.geoJSON(intersection.intersection, {
          style: intersectionStyle,
          onEachFeature : onEachFeaturesIntersection
        });
        intersectionLayer.eachLayer((layer) => {
          if (!layer.feature.properties) {
            layer.feature.properties = {};
          }
          layer.feature.properties.area = intersection.area;
        });
        total += intersection.area;
        intersectionLayer.options = { isIntersection: true }; // Marquer comme couche d'intersection
        featureGroupRef.current.addLayer(intersectionLayer);
      });

      setIntersectionsArea(total);
    }
  }, [intersections]);

  // Fonction pour générer le PDF
  /*const generatePDF = async () => {
    if (!screenshoterRef.current) {
      console.error("Screenshoter non initialisé");
      return;
    }

    try {
      setIsGeneratingPDF(true);

      const map = featureGroupRef.current._map;
      map.invalidateSize(); // Forcer un redimensionnement de la carte
      
      // Attendre que les tuiles soient chargées
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Capturer la carte en tant qu'image
      const imageBlob = await screenshoterRef.current.takeScreen("blob");

      // Convertir l'image en URL
      const imageUrl = URL.createObjectURL(imageBlob);

      // Créer un élément Image pour obtenir les dimensions de l'image
      const img = new Image();
      img.src = imageUrl;

      // Attendre que l'image soit chargée
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      // Créer un nouveau document PDF
      const pdf = new jsPDF("p", "mm", "a4");

      
      // Ajouter un titre au PDF
      pdf.setFontSize(16);
      pdf.text("Carte Parcellaire", 105, 15, { align: "center" });

      // Ajouter la date de génération
      pdf.setFontSize(10);
      const date = new Date().toLocaleDateString();
      pdf.text(`Généré le: ${date}`, 105, 22, { align: "center" });

      // Définir les dimensions de l'image dans le PDF
      //const imgWidth = 190; // Largeur de l'image en mm (A4 - marges)
      const pageWidth = 190;
      const imgWidth = 150; // Largeur de l'image en mm (A4 - marges)
      const imgHeight = (imgWidth * img.height) / img.width; // Conserver le ratio

      // Ajouter l'image de la carte au PDF
      //pdf.addImage(img, "PNG", 10, 30, imgWidth, imgHeight);
      pdf.addImage(img, "PNG", pageWidth - imgWidth, 30, imgWidth, imgHeight);

      // Télécharger le PDF
      pdf.save("carte-parcellaire.pdf");
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
      setIsGeneratingPDF(false);
    }
  };*/
  
  const generatePDF = async () => {
    if (!screenshoterRef.current) {
      console.error("Screenshoter non initialisé");
      return;
    }
  
    try {
      setIsGeneratingPDF(true);
  
      const map = featureGroupRef.current._map;
      map.invalidateSize(); // Forcer un redimensionnement de la carte
  
      // Attendre que les tuiles soient chargées
      await new Promise((resolve) => setTimeout(resolve, 2000));
  
      // Capturer la carte en tant qu'image
      const imageBlob = await screenshoterRef.current.takeScreen("blob");
  
      // Convertir l'image en URL
      const imageUrl = URL.createObjectURL(imageBlob);
  
      // Créer un élément Image pour obtenir les dimensions de l'image
      const img = new Image();
      img.src = imageUrl;
  
      // Attendre que l'image soit chargée
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
  
      // Créer un nouveau document PDF
      const pdf = new jsPDF("p", "mm", "a4");
  
      // Définir les marges et les dimensions
      const margin = 10; // Marge en mm
      const pageWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
      const pageHeight = pdf.internal.pageSize.getHeight() - 2 * margin;
      
      // Ajouter un titre au PDF
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Carte Parcellaire", 105, 15, { align: "center" });

      // Ajouter la date de génération
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const date = new Date().toLocaleDateString();
      pdf.text(`Généré le: ${date}`, 105, 22, { align: "center" });

      // Ajouter une légende au PDF
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Légende:", margin, margin + 30);
  
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor("blue");
      pdf.text("• Parcelle : Bleu", margin, margin + 38);
      pdf.setTextColor("red");
      pdf.text("• Empiètement : Rouge", margin, margin + 46);
  
      // Définir les dimensions de l'image dans le PDF
      const imgWidth = pageWidth / 2 + 50; // Largeur de l'image en mm (moitié de la page)
      //const imgHeight = (imgWidth * img.height) / img.width; // Conserver le ratio
      const imgHeight = imgWidth; // Conserver le ratio
  
      // Positionner l'image à droite
      const imgX = margin + pageWidth / 2 - 40; // Décalage de 10mm pour l'espace entre la légende et l'image
      const imgY = margin + 30; // Aligner l'image avec le titre
  
      // Ajouter l'image de la carte au PDF
      pdf.addImage(img, "PNG", imgX, imgY, imgWidth, imgHeight);
  
      // Télécharger le PDF
      pdf.save("carte-parcellaire.pdf");
      setIsGeneratingPDF(false);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
      setIsGeneratingPDF(false);
    }
  };
  
  // Calculate the center based on the first feature's coordinates
  //const initialCenter = geojsonContents[0]?.features[0]?.geometry?.coordinates[0][0][0] || [3.86929756871891, 16.029131742598274]//[3.868177, 11.519596];

  return (
    <div className="w-full h-full">
      <div className="absolute top-4 left-4 z-[3000] bg-white p-4 rounded shadow hidden">
        <button
          onClick={exportToGeoJSON}
          ref={saveBtnRef}
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          Exporter en GeoJSON
        </button>
      </div>

      <button
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          ref={generatePDFBtnRef}
          className={`px-4 py-2 text-white rounded hidden ${isGeneratingPDF ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {isGeneratingPDF ? 'Génération en cours...' : 'Générer un PDF à partir de la vue actuelle'}
        </button>
      <input
        type="file"
        accept=".geojson"
        ref={uploadGeojsonBtn}
        onChange={importGeoJSON}
        className="hidden mt-2"
      />



      {/* {activeLayer && (
        <div className="absolute top-4 right-4 z-[3000] bg-white p-4 rounded shadow">
          <button 
            onClick={saveChanges}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Sauvegarder les modifications
          </button>
        </div>
      )} */}

      {/* <div className="absolute top-20 left-4 z-[3000] bg-white p-4 rounded shadow">
        <h3>Intersections</h3>
        <ul>
          {intersections.map((intersection, index) => (
            <li key={index}>
              Intersection {index + 1}: {intersection.area.toFixed(2)} m²
            </li>
          ))}
        </ul>
      </div> */}
      
      <MapContainer 
        center={initialCenter} 
        zoom={15} 
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleLayerEditing}
            draw={{
              polygon: false, // Désactivé car nous utilisons notre propre bouton
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false
            }}
            edit={{
              //edit: false, // Désactivé car nous utilisons notre propre bouton
              featureGroup: featureGroupRef.current, // Important: référence au FeatureGroup
              edit: {
                selectedPathOptions: {
                  color: '#fe57a1', // Couleur de la forme pendant l'édition
                  fillColor: '#fe57a1',
                  fillOpacity: 0.4,
                }
              },
              remove: true
            }}
          />
        </FeatureGroup>
        
        <MapController 
          featureGroupRef={featureGroupRef} 
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />

        <MapScreenShotController />
        
        { isPopupVisible ? 
          <MessageBox content={popupMessage} /> : ``
        }

        { isCWPVisible ? 
          <CreateWorkspacePopup /> : ``
        }
        
        { isSLPVisible ? 
          <SelectLayerPopup /> : ``
        }

        { isSWPVisible ? 
          <SelectWorkspacePopup /> : ``
        }
        
      {/* {geojsonContents.map((geojson, index) => (
        <GeoJSON 
          key={index} 
          style={dynamicStyle} 
          data={geojson} 
          // onEachFeature={(feature, layer) => onEachFeature(feature, layer, geojson.id)}
          />
      ))} */}

      </MapContainer>

    </div>
  );
};

export default Home;