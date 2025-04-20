import { FaCut, FaFileExport, FaTimes } from "react-icons/fa";
import PropTypes from "prop-types";


const AnalyzeMenu = ({ intersectionsArea, cropBtnRef, cancelSelectionBtnRef, exportToGeojsonBtnRef }) => {
    
    return (
        <>
            <h3 className="p-4 mb-3 text-lg font-semibold bg-blue-300 rounded-md shadow-md md:text-2xl text-blue-950">Analyses</h3>
            <div className="p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                
                <button className="flex flex-row items-center mt-2 text-sm transition-colors cursor-pointer md:text-xl hover:text-red-700 text-blue-950"
                    onClick={(e) => { e.preventDefault(); cropBtnRef.current.click() }}>
                    <FaCut  className="mr-4" />
                    Sélectionner une zone d&apos;intérêt
                </button>

                <button className="flex flex-row items-center mt-2 text-sm transition-colors cursor-pointer md:text-xl hover:text-red-700 text-blue-950"
                    onClick={(e) => { e.preventDefault(); cancelSelectionBtnRef.current.click() }}>
                    <FaTimes  className="mr-4" />
                    Annuler la sélection
                </button>
                
            </div>
            <div className="flex flex-col p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                
                <div className="flex flex-col mt-2 space-y-2">
                    <div><div className="text-semibold">Surface totale de tous les empietements : </div> <div className="font-semibold, font-mono text-green-700">{intersectionsArea.toFixed(4)} m<sup>2</sup></div> </div>
                </div>

                <div>
                
                    <h4 className="p-2 mb-1 text-sm font-semibold md:text-lg">Exporter les données d&apos;analyses</h4>
                    
                    <button className="flex flex-row items-center px-4 py-2 mr-4 text-sm font-semibold rounded-md cursor-pointer md:text-xl text-blue-950 hover:bg-blue-400"
                        onClick={() => { 
                            if(exportToGeojsonBtnRef.current)
                                exportToGeojsonBtnRef.current.click();
                         }}>

                        <FaFileExport className="mr-4 text-lg md:text-xl" />
                        Exporter
                    </button>
                </div>
            </div>

        </>
    );
}

AnalyzeMenu.propTypes = {
    intersectionsArea: PropTypes.number.isRequired,
    cropBtnRef: PropTypes.object.isRequired,
    cancelSelectionBtnRef: PropTypes.object.isRequired,
};

export default AnalyzeMenu;