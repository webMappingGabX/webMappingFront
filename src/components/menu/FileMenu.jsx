import { FaCheck, FaHandPointer, FaPlug, FaPlus, FaUpload } from "react-icons/fa";
import { useAppMainContext } from "../context/AppProvider";

const FileMenu = ({ uploadGeojsonBtn, fileName, fileSize, coordSys, handleUpload, handleFileChange, handleUploadgeoJsonFile, workspaces, layerNameRef }) => {
    let workspaceInfos = workspaces.filter(workspace => workspace.isSelected)[0];
    const { CreateWorkspaceHandle, SelectWorkspaceHandle, SelectLayersHandle } = useAppMainContext();
    
    return (
        <>
            <h3 className="p-4 mb-3 text-lg font-semibold bg-blue-300 rounded-md shadow-md md:text-2xl text-blue-950">Fichiers</h3>
            <div className="p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                
                <h3 className="p-2 mb-1 text-lg font-semibold md:text-xl">Espace de travail</h3>
                <div className="text-sm md:text-lg">
                    <strong>{workspaceInfos.name}</strong>
                    <div>{workspaceInfos.description}</div>
                </div>
                
                <button onClick={CreateWorkspaceHandle} className="flex flex-row items-center mt-4 text-lg transition-colors cursor-pointer md:text-xl hover:text-red-700 text-blue-950">
                    <FaPlus  className="mr-4" />
                    Creer un nouvel espace de travail
                </button>
                <button onClick={SelectWorkspaceHandle} className="flex flex-row items-center mt-4 text-lg transition-colors cursor-pointer md:text-xl hover:text-red-700 text-blue-950">
                    <FaHandPointer  className="mr-4" />
                    Sélectionner un espace de travail
                </button>     
                
            </div>
            <div className="p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                
                <button className="flex flex-row items-center text-lg transition-colors cursor-pointer md:text-xl hover:text-red-700 text-blue-950" 
                    onClick={(e) => SelectLayersHandle(e)} >
                    <FaCheck  className="mr-4" />
                    Sélectionner les couches à afficher
                </button>
            </div>
            <div className="p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                
                <button className="flex flex-row items-center text-lg transition-colors cursor-pointer md:text-xl hover:text-red-700 text-blue-950" 
                    onClick={(e) => handleUploadgeoJsonFile(e)}>
                    <FaUpload  className="mr-4" />
                    Ajouter une couche
                </button>
                {uploadGeojsonBtn.current && uploadGeojsonBtn.current.files.length > 0 && (
                    <div>
                        <div className="mt-2">
                            <h4 className="text-lg font-semibold text-blue-950">Informations :</h4>
                            <p className="text-blue-950">Nom : { fileName }</p>
                            <p className="text-blue-950">Taille : { fileSize } KB</p>
                            <p className="text-blue-950">Système de coordonnées : { coordSys }</p>
                            <p className="flex items-center justify-center my-2 text-blue-950"><span>Nom : </span><input type="text" defaultValue="Nouvelle couche" ref={layerNameRef} className="flex-1 px-2 py-1 ml-3 border rounded-sm"/></p>
                        </div>
                        <button className="flex flex-row items-center justify-center px-6 py-2 mt-3 bg-blue-400 rounded-sm cursor-pointer hover:bg-blue-600"
                            onClick={handleUpload}>
                            <FaUpload className="mr-4" />
                            Confirmer
                        </button>
                    </div>
                )}
                <input type="file" name="geojsonFile" className="hidden" ref={uploadGeojsonBtn} onChange={handleFileChange}/>
            </div>
        </>
    );
}

export default FileMenu;