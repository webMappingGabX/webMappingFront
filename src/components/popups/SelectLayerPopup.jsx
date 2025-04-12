import { FaInfo } from "react-icons/fa";
import { useAppMainContext } from "../context/AppProvider";
const LAYER_URL  = "/layers";
import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";

const SelectLayerPopup = () => {

    const { isSLPVisible, setIsSLPVisible, currentLayersIdx, setCurrentLayersIdx, currentWorspaceIdx } = useAppMainContext();
    const [ layers, setLayers ] = useState([]);
    const [ errMsg, setErrMsg ] = useState(false);
    const [ message, setMessage ] = useState(false);

    const [ isLayerDeleted, setIsLayerDeleted ] = useState(false);
    const checkboxListRef = useRef(null);

    const handleHidePopup = () => {
        setIsSLPVisible(false);
    }
    
    const token = localStorage.getItem("authToken");

    useEffect(() => {

        const getLayers = async () => {
            console.log("currentWorspaceIdx", currentWorspaceIdx);
            try {
                const response = await axios.get(LAYER_URL, {
                    params: {
                        workspaceId: currentWorspaceIdx
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setLayers(response?.data);
                console.log(response?.data);
            }catch(err) {
                setErrMsg(err?.data)
            }
        }
        getLayers();
    }, [isLayerDeleted])

    const handleDeleteLayers = async (e) => {

        e.preventDefault();
        
        //const selectedIndexes = currentLayersIdx;
        const selectedIndexes = Array.from(
            checkboxListRef.current.querySelectorAll('input[type="checkbox"]:checked')
        ).map(checkbox => checkbox.value);

        if (selectedIndexes.length === 0) {
            setErrMsg("Aucune couche sélectionnée pour suppression");
            return;
        }

        for (const index of selectedIndexes) {
            try {
                await axios.delete(`${LAYER_URL}/${index}`, { headers: { Authorization: `Bearer ${token}` } });
            } catch (err) {
                console.error(`Erreur lors de la suppression de la couche avec l'index ${index}:`, err);
            }
        }

        window.localStorage.setItem("currentLayers", JSON.stringify([]));
        setCurrentLayersIdx([]);
        
        setMessage("Couches supprimées avec succès");
            
        setIsLayerDeleted(!isLayerDeleted);
        
        setTimeout(() => {
            setMessage(``);
        }, 3000);
        
        /*let selectionIdx = selectionRef.current.value;
        
        try {
            const response = await axios.delete(`${LAYER_URL}/${selectionIdx}`, {headers: {Authorization: `Bearer ${token}`}});
            setLayers(response?.data);
            setMessage("Espace de travail supprimé avec succès");
            
            setIsLayerDeleted(!isLayerDeleted);
            
            setTimeout(() => {
                setMessage(``);
            }, 3000);
        } catch(err) {
            setErrMsg(err?.data)
        }*/
    }


    const handleSelectLayers = async (e) =>
        {
            e.preventDefault();
    
            try
            {
                const selectedLayers = Array.from(checkboxListRef.current.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
                console.log("Selected Layers:", selectedLayers);
                
                window.localStorage.setItem("currentLayers", JSON.stringify(selectedLayers));
                setCurrentLayersIdx(selectedLayers);
                setIsSLPVisible(false);

            } catch (e)
            {
                console.log("error", e);
            }
        }
        
    return (
        <>
            {/* popup back */}
            <div className="fixed z-[3000] bg-gray-700 opacity-70 top-0 left-0 bottom-0 right-0"></div>

            <div className="fixed z-[3001] shadow-md flex flex-col rounded-md p-4 bg-white top-1/2 left-1/2 -translate-1/2">
                <div className="absolute text-lg text-gray-400 cursor-pointer right-5 top-3 md:text-xl hover:text-gray-700" onClick={handleHidePopup}>X</div>
                
                <div className="w-full max-w-md p-4 mt-6 space-y-6 bg-gray-100 border-gray-300 rounded shadow-md cursor-default">
                    <h2 className="text-lg font-bold text-center md:text-2xl">Selectionner les couches</h2>
                    
                    <div className="my-4 text-lg text-red-400 animate-bounce">
                        {message !== `` ? message : ``}
                    </div>

                    <div ref={checkboxListRef} className="flex flex-col h-[200px] overflow-auto border border-gray-300">

                        {layers.length === 0 && (
                            <div className="flex flex-row items-center space-x-2 text-2xl text-gray-600">
                                Aucune couche disponible
                            </div>
                            )
                        }
                        
                        {layers.map(layer => {
                            return (
                                <div key={layer.id} className="flex flex-row items-center p-2 pl-4 space-x-2 bg-gray-200">
                                    <input 
                                        type="checkbox" 
                                        value={layer.id} 
                                        key={layer.id} 
                                        id={layer.id} 
                                        defaultChecked={currentLayersIdx.includes(layer.id.toString())} 
                                    />
                                    <label htmlFor={layer.id} className="flex-1 cursor-pointer">{layer.name}</label>
                                </div>
                            )
                        })}
                    </div>

                    <div className="flex flex-row">
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 mx-2 text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onClick={(e) => handleSelectLayers(e)}
                    >
                        Confirmer
                    </button>

                    <button
                        className="flex-1 px-4 py-2 mx-2 text-white bg-red-600 rounded-md cursor-pointer hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={(e) => handleDeleteLayers(e)}
                    >
                        Supprimer
                    </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SelectLayerPopup;