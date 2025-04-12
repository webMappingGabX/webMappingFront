import { FaPerson } from "react-icons/fa6";
import { useAppMainContext } from "../context/AppProvider";
import ManageAccessPopup from "../popups/ManageAccessPopup";

const WorkspaceMenu = () => {
    
    const { isMAPVisible, setIsMAPVisible, ManageAccessHandle } = useAppMainContext();

    return (
        <>
            <h3 className="p-4 mb-3 text-lg font-semibold bg-blue-300 rounded-md shadow-md md:text-2xl text-blue-950">Espace de travail</h3>

            <div className="p-4 mt-2 space-y-2 bg-blue-300 rounded-md shadow-md">
                <h3 className="p-2 mb-1 text-lg font-semibold md:text-xl">Gestion des accès</h3>
                <div className="text-sm md:text-lg">
                    Designer les personnes autorisees à acceder à <br />l&apos;espace de travail en inscrivant leurs emails
                </div>
                <button onClick={ManageAccessHandle} className="flex flex-row items-center mt-4 text-lg transition-colors cursor-pointer md:text-xl hover:text-red-700 text-blue-950">
                    <FaPerson  className="mr-4" />
                    Gerer les accès
                </button>
                
            </div>

        </>
    );
}

export default WorkspaceMenu;