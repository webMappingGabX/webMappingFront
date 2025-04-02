import { FaInfo } from "react-icons/fa";
import { useAppMainContext } from "../context/AppProvider";
import { useState } from "react";
import axios from "../api/axios";

const CreateLayerPopup = () => {

    const { isCLPVisible, setIsCLPVisible, currentWorspaceIdx, setCurrentWorspaceIdx } = useAppMainContext();
    const [ name, setName ]  = useState("");
    const [ description, setDescription ] = useState("");

    const [ message, setMessage ] = useState("");

    const CREATE_WORKSPACE_URL = "/workspaces";
    const authToken = localStorage.getItem("authToken");

    const handleHidePopup = () => {
        setIsCLPVisible(false);
    }

    const handleCreateLayer = async (e) =>
    {
        e.preventDefault();

        try
        {
            var response = await axios.post(CREATE_WORKSPACE_URL, {
                name, description
              }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`
                },
            });

            let idx = response.data.workspace.id;
            
            setMessage("Espace de travail créé avec succès");

            window.localStorage.setItem("currentWorkspace", JSON.stringify({ id: idx }));
            
            setTimeout(() => {
                setCurrentWorspaceIdx(idx);
                setIsCLPVisible(false);
                setMessage(``);
            }, 2000);
        } catch (e)
        {
            console.log("error", e);
        }
    }
    return (
        <>
            {/* popup back */}
            <div className="fixed z-[3000] bg-gray-700 opacity-70 top-0 left-0 bottom-0 right-0" onClick={handleHidePopup}></div>

            <div className="fixed z-[3001] shadow-md flex flex-col w-[90%] md:w-[400px] rounded-md space-y-6 p-8 bg-gray-100 top-1/2 left-1/2 -translate-1/2">
                <h2 className="text-lg font-bold text-center md:text-2xl">Creer un espace de travail</h2>
                <form className="space-y-4">
                    <div className="my-4 text-lg text-green-400 animate-bounce">
                        {message !== `` ? message : ``}
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                            type="text"
                            id="name"
                            className="w-full px-3 py-2 mt-1 border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                            required
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrption</label>
                        <textarea 
                            id="description"
                            className="w-full px-3 py-2 mt-1 border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                            onChange={(e) => setDescription(e.target.value)}
                        > </textarea>
                    </div>

                    
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onClick={(e) => handleCreateLayer(e)}
                    >
                        Confirmer
                    </button>
                </form>

            </div>
        </>
    );
}

export default CreateLayerPopup;