import { useMap } from "react-leaflet";
import leafletImage from "leaflet-image";
import jsPDF from "jspdf";
import { useEffect } from "react";

const MapCapture = ({ generatePDF, setIsGeneratingPDF, intersections, featureGroupRef }) => {
  const map = useMap(); // Obtenir l'instance de la carte

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);

      // Capturer la carte avec leaflet-image
      leafletImage(
        map,
        async (err, canvas) => {
          if (err) {
            console.error("Erreur lors de la capture de la carte:", err);
            setIsGeneratingPDF(false);
            return;
          }

          // Convertir le canvas en image PNG
          const imgData = canvas.toDataURL("image/png");

          // Créer un nouveau document PDF
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const pdf = new jsPDF("p", "mm", "a4");

          // Titre du document
          pdf.setFontSize(16);
          pdf.text("Carte Parcellaire", 105, 15, { align: "center" });

          // Ajouter la date de génération
          pdf.setFontSize(10);
          const date = new Date().toLocaleDateString();
          pdf.text(`Généré le: ${date}`, 105, 22, { align: "center" });

          // Ajouter l'image de la carte
          pdf.addImage(imgData, "PNG", 10, 30, imgWidth - 20, imgHeight * 0.8);

          // Informations additionnelles
          pdf.setFontSize(10);
          const yPosition = 30 + imgHeight * 0.8 + 10;

          // Ajouter les informations sur les empietements si disponibles
          if (intersections.length > 0) {
            let totalArea = 0;
            intersections.forEach((intersection) => {
              totalArea += intersection.area;
            });

            pdf.text(`Nombre d'empietements: ${intersections.length}`, 15, yPosition);
            pdf.text(`Surface totale des empietements: ${totalArea.toFixed(2)} m²`, 15, yPosition + 7);
          }

          // Télécharger le PDF
          pdf.save("carte-parcellaire.pdf");
          setIsGeneratingPDF(false);
        },
        {
          // Inclure les couches vectorielles (comme les couches GeoJSON)
          layers: [featureGroupRef.current], // Ajouter le FeatureGroup contenant les couches GeoJSON
        }
      );
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF.");
      setIsGeneratingPDF(false);
    }
  };

  // Appeler la fonction generatePDF passée en prop
  useEffect(() => {
    if (generatePDF) {
      handleGeneratePDF();
    }
  }, [generatePDF]);

  return null; // Ce composant ne rend rien visuellement
};

export default MapCapture;