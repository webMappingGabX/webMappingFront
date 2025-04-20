import { FaInfo, FaTrash } from "react-icons/fa";
import { useAppMainContext } from "../context/AppProvider";
import { useEffect, useState } from "react";
import axios from "../api/axios";

const ManageAccessPopup = () => {

    const { isMAPVisible, setIsMAPVisible, currentWorspaceIdx, setCurrentWorspaceIdx } = useAppMainContext();
    const [ email, setEmail ]  = useState("");

    const [ message, setMessage ] = useState("");
    const [ innerMessage, setInnerMessage ] = useState("Aucun utilisateur disponible");
    const [ users, setUsers ] = useState([]);

    const [ operation, setOperation ] = useState(false);

    const GET_WORKSPACE_USERS_URL = "/workspaces/workspace-users";
    const REMOVE_USER_URL = "/workspaces/remove-user";
    const ADD_USER_URL = "/workspaces/add-user";

    const authToken = localStorage.getItem("authToken");

    const handleHidePopup = () => {
        setIsMAPVisible(false);
    }
    
    useEffect(() => {
        /*const storedWorkspaceIdx = localStorage.getItem("currentWorkspace");
        if (storedWorkspaceIdx) {
            setCurrentWorspaceIdx(storedWorkspaceIdx);
        }*/
        const fetchWorkspaceUsers = async () => {
            try {
                const response = await axios.get(`${GET_WORKSPACE_USERS_URL}/${currentWorspaceIdx}`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                setUsers(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Error fetching workspace users:", error);
                if(error.response.data.message) {
                    setInnerMessage(error.response.data.message);
                }
            }
        };

        if (currentWorspaceIdx) {
            fetchWorkspaceUsers();
        }
    }, [operation]);

    const handleRemoveUser = async (e, userEmail) => {
        e.preventDefault();
        
        try {
            await axios.post(`${REMOVE_USER_URL}/${currentWorspaceIdx}`, {
                email: userEmail
            },  {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .then((response) => { 
                setMessage(response.data.message);
                setOperation(!operation)
            }).catch((err) => {
                console.log(err.response);
                setMessage(err.response.data.message);
            });
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }

    const handleAddUser = async (e) => {
        e.preventDefault();
        
        try {
            axios.post(`${ADD_USER_URL}/${currentWorspaceIdx}`, {
                email: email
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            })
            .then((response) => {                 
                setMessage(response.data.message);
    
                setOperation(!operation)

                setEmail(``);
            }).catch((err) => {
                console.log(err.response);
                setMessage(err.response.data.message);
            });
        } catch (error) {
            console.error("Error adding user:", error);
        }
    }

    return (
        <>
            {/* popup back */}
            <div className="fixed z-[3000] bg-gray-700 opacity-70 top-0 left-0 bottom-0 right-0"></div>

            <div className="fixed z-[3001] shadow-md flex flex-col w-[90%] md:w-[400px] rounded-md space-y-6 p-8 bg-gray-100 top-1/2 left-1/2 -translate-1/2 cursor-default">
                <div className="absolute text-lg text-gray-400 cursor-pointer right-5 top-3 md:text-xl hover:text-gray-700" onClick={handleHidePopup}>X</div>
                
                <h2 className="mt-6 text-lg font-bold text-center md:text-2xl">Utilisateurs autorisés</h2>
                <ul className="space-y-2 h-[100px] overflow-auto border p-2 rounded-sm border-gray-300">

                    {users.length === 0 && (
                        <div className="flex flex-row items-center space-x-2 text-lg text-center text-gray-600">
                            { innerMessage }
                        </div>
                        )
                    }

                    {users.map((user) => (
                        <li key={user.id} className="flex items-center justify-between p-2 border-b border-gray-300">
                            <span>{user.email}</span>
                            <button
                                className="px-2 py-1 text-white bg-red-500 rounded-md cursor-pointer hover:bg-red-600"
                                onClick={(e) => handleRemoveUser(e, user.email)}
                            >
                                <FaTrash />
                            </button>
                        </li>
                    ))}
                </ul>
                <h2 className="text-lg font-bold text-center md:text-2xl">Ajouter un utilisateur</h2>
                <form className="space-y-4">
                    <div className="my-1 text-sm text-center text-red-400 animate-bounce">
                        {message !== `` ? message : ``}
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 mt-1 border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                            required
                            onChange={(e) => { setEmail(e.target.value); if(message.trim() != ``) setMessage(``); }}
                        />
                    </div>
                 
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onClick={(e) => handleAddUser(e)}
                    >
                        Ajouter l&apos;utilisateur
                    </button>
                </form>

            </div>
        </>
    );
}

export default ManageAccessPopup;