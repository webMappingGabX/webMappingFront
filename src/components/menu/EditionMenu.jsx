import { FaPlusCircle, FaSave } from "react-icons/fa";
import { useAppMainContext } from "../context/AppProvider";
import axios from "../api/axios";
import { useEffect, useState } from "react";
const LAYER_URL = "/layers";

const EditionMenu = ({ setDrawPolygon, saveBtnRef }) => {
    const { currentLayersIdx, setEditionActiveLayer, editionActiveLayer } = useAppMainContext();
    
    const [layers, setLayers] = useState([]);

    const [message, setMessage] = useState("");

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        console.log("currentLayersIdx", currentLayersIdx);
        const workspace = JSON.parse(localStorage.getItem("currentWorkspace"));
        const fetchLayers = async () => {
            try {
                if (!currentLayersIdx || currentLayersIdx.length === 0) return;

                let datas = [];
                
                for(let i = 0; i < currentLayersIdx.length; i++)
                {
                    let id = currentLayersIdx[i];

                    try {
                        const response = await axios.get(`${LAYER_URL}/${id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            },
                            params: {
                                workspaceId: workspace,
                            },
                        });
                        if (!datas.some(layer => layer.id === response.data.id)) {
                            datas.push(response.data);
                            console.log("PUSHED", response.data);
                            
                        }
                    } catch (error) {
                        console.error(`Error fetching layer with id ${id}:`, error);
                    }
                }
                setLayers(datas);

            } catch (error) {
                console.error("Error fetching layers:", error);
            }
        };

        fetchLayers();
    }, [currentLayersIdx]);
    
    const handleSaveModifications = (e) => {
        e.preventDefault();
        if(editionActiveLayer == null)
        {
            setMessage("Couche non valide");

            setTimeout(() => {
                setMessage("");
            }, 5000);
            return;
        }

        saveBtnRef.current.click();
    }

    return (
        <>
            <h3 className="p-4 mb-3 text-lg font-semibold bg-blue-300 rounded-md shadow-md md:text-2xl text-blue-950">Edition</h3>
            <div className="p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                
                <h4 className="p-2 mb-1 text-sm font-semibold md:text-lg">Dans quelle couche les nouvelles entités
                    <br /> doivent elles êtes sauvegardées ?</h4>
                {/* className="w-full px-4 py-3 text-lg border border-gray-700 rounded-lg cursor-pointer md:text-xl hover:bg-gray-200" */}
                
                { message !== "" && 
                    (
                    <div className="text-sm text-center text-red-500 animate-bounce">{message}</div>
                    )
                }
                
                <select
                    className="w-full px-4 py-2 text-sm border border-gray-700 rounded-lg cursor-pointer md:text-xl hover:bg-gray-200"
                    onChange={(e) => setEditionActiveLayer(e.target.value)}
                >
                    <option> -- Selectionner un couche -- </option>
                    {layers.map((layer) => (
                        <option  key={layer.id} value={layer.id} className="text-black">
                            {layer.name}
                        </option>
                    ))}
                </select>
                
            </div>
            <div className="flex flex-col p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                
                <button className="flex flex-row items-center px-4 py-2 mr-4 text-sm font-semibold rounded-md cursor-pointer md:text-lg text-blue-950 hover:bg-blue-400"
                    onClick={() => setDrawPolygon(true)}>

                    <FaPlusCircle className="mr-4 text-lg md:text-xl" />
                    Ajouter une nouvelle entites
                </button>

                <button className="flex flex-row items-center px-4 py-2 mr-4 text-sm font-semibold rounded-md cursor-pointer md:text-xl text-blue-950 hover:bg-blue-400"
                    onClick={handleSaveModifications}>

                    <FaSave className="mr-4 text-lg md:text-xl" />
                    Sauvegarder les modifications
                </button>
            </div>

        </>
    );
}

export default EditionMenu;