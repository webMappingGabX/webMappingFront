import { createContext, useContext, useRef, useState } from "react";

const appMainContext = createContext();

export function useAppMainContext () {
    return useContext(appMainContext);
}

const AppProvider = ({ children }) => {
    const [activeMenu, setActiveMenu] = useState(0);
    const [drawPolygon, setDrawPolygon] = useState(false);
    const [editEntity, setEditEntity] = useState(false);
    const [geojsonContents, setGeojsonContents] = useState([]);

    const [ fileName, setFileName ] = useState("");
    const [ fileSize, setFileSize ] = useState(0);
    const [ fileToUpload, setFileToUpload ] = useState(null);
    const [ coordSys, setCoordSys ] = useState("");
    const [ intersectionsArea, setIntersectionsArea ] = useState(0);
    const [ isGeneratingPDF, setIsGeneratingPDF ] = useState(false);
    const [ isPopupVisible, setIsPopupVisible ] = useState(false);
    const [ popupMessage, setPopupMessage ] = useState("");

    const uploadGeojsonBtn = useRef(null);
    const saveBtnRef = useRef(null);
    const generatePDFBtnRef = useRef(null);

    const value = {
        activeMenu, setActiveMenu,
        drawPolygon, setDrawPolygon,
        editEntity, setEditEntity,
        geojsonContents, setGeojsonContents,
        fileName, setFileName,
        fileSize, setFileSize,
        fileToUpload, setFileToUpload,
        coordSys, setCoordSys,
        intersectionsArea, setIntersectionsArea,
        isGeneratingPDF, setIsGeneratingPDF,
        isPopupVisible, setIsPopupVisible,
        popupMessage, setPopupMessage,
        uploadGeojsonBtn,
        generatePDFBtnRef,
        saveBtnRef
    };

  return <appMainContext.Provider value={value}>{children}</appMainContext.Provider>;
}

export default AppProvider;