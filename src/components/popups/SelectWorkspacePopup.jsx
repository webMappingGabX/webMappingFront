import { FaInfo } from "react-icons/fa";
import { useAppMainContext } from "../context/AppProvider";
const WORKSPACE_URL  = "/workspaces";
import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
const SelectWorkspacePopup = () => {

    const { isSWPVisible, setIsSWPVisible, setCurrentWorspaceIdx, setCurrentLayersIdx } = useAppMainContext();
    const [workspaces, setWorkspaces] = useState([]);
    const [errMsg, setErrMsg] = useState(false);
    const [message, setMessage] = useState(false);

    const [ isWorkspaceDeleted, setIsWorkspaceDeleted ] = useState(false);
    const selectionRef = useRef(null);

    const handleHidePopup = () => {
        setIsSWPVisible(false);
    }
    
    const token = localStorage.getItem("authToken");

    useEffect(() => {

        const getWorkspaces = async () => {

            try {
                const response = await axios.get(WORKSPACE_URL, {headers: {Authorization: `Bearer ${token}`}});
                setWorkspaces(response?.data);
                console.log(response?.data);
            }catch(err) {
                setErrMsg(err?.data)
            }
        }
        getWorkspaces();
    }, [isWorkspaceDeleted])

    const handleDeleteWorkspace = async (e) => {

        e.preventDefault();
        
        let selectionIdx = selectionRef.current.value;
        
        try {
            const response = await axios.delete(`${WORKSPACE_URL}/${selectionIdx}`, {headers: {Authorization: `Bearer ${token}`}});
            setWorkspaces(response?.data);
            setMessage("Espace de travail supprimé avec succès");
            
            setIsWorkspaceDeleted(!isWorkspaceDeleted);
            
            setTimeout(() => {
                setMessage(``);
            }, 3000);
        } catch(err) {
            setErrMsg(err?.data)
        }
    }


    const handleSelectWorkspace = async (e) =>
        {
            e.preventDefault();
    
            try
            {
                let idx = selectionRef.current.value;

                window.localStorage.setItem("currentWorkspace", JSON.stringify({ id: idx }));

                setCurrentWorspaceIdx(idx);

                window.localStorage.setItem("currentLayers", []);
                setCurrentLayersIdx([]);

                setIsSWPVisible(false);

            } catch (e)
            {
                console.log("error", e);
            }
        }


    return (
        <>
            {/* popup back */}
            <div className="fixed z-[3000] bg-gray-700 opacity-70 top-0 left-0 bottom-0 right-0" onClick={handleHidePopup}></div>

            <div className="fixed z-[3001] shadow-md flex flex-col rounded-md p-4 bg-white top-1/2 left-1/2 -translate-1/2">
                <div className="w-full max-w-md p-8 mt-1 space-y-6 bg-gray-100 rounded shadow-md">
                    <h2 className="text-lg font-bold text-center md:text-2xl">Selectionner un espace de travail</h2>
                    
                    <div className="my-4 text-lg text-red-400 animate-bounce">
                        {message !== `` ? message : ``}
                    </div>

                    <div>
                        <select ref={selectionRef} className="w-full px-4 py-3 text-lg border border-gray-700 rounded-lg cursor-pointer md:text-xl hover:bg-gray-200">
                            {workspaces.map(workspace => {
                                return (
                                    <option value={workspace.id} key={workspace.id}>
                                        {workspace.name}
                                    </option>
                                )
                            })}
                        </select>
                    </div>

                    <div className="flex flex-row">
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 mx-2 text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onClick={(e) => handleSelectWorkspace(e)}
                    >
                        Confirmer
                    </button>

                    <button
                        className="flex-1 px-4 py-2 mx-2 text-white bg-red-600 rounded-md cursor-pointer hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={(e) => handleDeleteWorkspace(e)}
                    >
                        Supprimer
                    </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SelectWorkspacePopup;