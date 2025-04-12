import { FaCut, FaTimes } from "react-icons/fa";
import PropTypes from "prop-types";


const AnalyzeMenu = ({ intersectionsArea, cropBtnRef, cancelSelectionBtnRef }) => {
    
    return (
        <>
            <h3 className="p-4 mb-3 text-lg font-semibold bg-blue-300 rounded-md shadow-md md:text-2xl text-blue-950">Analyses</h3>
            <div className="p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                
                <button className="flex flex-row items-center mt-2 text-sm transition-colors cursor-pointer md:text-xl hover:text-red-700 text-blue-950"
                    onClick={(e) => { e.preventDefault(); cropBtnRef.current.click() }}>
                    <FaCut  className="mr-4" />
                    Restreindre la zone
                </button>

                <button className="flex flex-row items-center mt-2 text-sm transition-colors cursor-pointer md:text-xl hover:text-red-700 text-blue-950"
                    onClick={(e) => { e.preventDefault(); cancelSelectionBtnRef.current.click() }}>
                    <FaTimes  className="mr-4" />
                    Annuler la sélection
                </button>
                
            </div>
            <div className="flex flex-row p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                
                <div className="flex flex-col mt-2 space-y-2">
                    <div><div className="text-semibold">Surface totale de tous les empietements : </div> <div className="font-semibold, font-mono text-green-700">{intersectionsArea.toFixed(4)} m<sup>2</sup></div> </div>
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