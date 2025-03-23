import { FaInfo } from "react-icons/fa";
import { useAppMainContext } from "./components/context/AppProvider";

const MessageBox = ( { content, title = "Opération reussie" } ) => {
    const { setIsPopupVisible } = useAppMainContext();

    const handleHidePopup = () => {
        setIsPopupVisible(false);
    }

    return (
        <>
            {/* popup back */}
            <div className="fixed z-[3000] bg-gray-700 opacity-70 top-0 left-0 bottom-0 right-0" onClick={handleHidePopup}></div>

            <div className="fixed z-[3001] shadow-md flex flex-col rounded-md p-8 bg-white top-1/2 left-1/2 -translate-1/2">
                <h1 className="mb-8 text-xl text-center text-green-500">{ title }</h1>

                <div className="flex flex-row">
                    <FaInfo className="mr-4 text-xl text-gray-400" />
                    <div className="text-lg text-gray-700">{ content }</div>
                </div>
            </div>
        </>
    );
}

export default MessageBox;