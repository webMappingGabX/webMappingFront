import { FaFilePdf} from "react-icons/fa";


const MapMenu = ({ isGeneratingPDF, handleGeneratePdf }) => {
    
    return (
        <>
            <h3 className="p-4 mb-3 text-lg font-semibold bg-blue-300 rounded-md shadow-md md:text-2xl text-blue-950">Carte</h3>
            <div className="p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                
                <button 
                    className="flex items-center px-4 py-2 text-sm font-semibold rounded-md cursor-pointer text-blue-950 hover:bg-blue-400"
                    disabled={isGeneratingPDF}
                    onClick={(e) => handleGeneratePdf(e)}>
                    <FaFilePdf className="mr-3" /> 
                    {isGeneratingPDF ? 'Génération en cours...' : 'Générer un PDF à partir de la vue actuelle'}
                </button>
                
            </div>

        </>
    );
}

export default MapMenu;