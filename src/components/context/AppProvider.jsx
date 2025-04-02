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
    const [ featureGroupLayers, setFeatureGroupLayers ] = useState([]);

    const [ fileName, setFileName ] = useState("");
    const [ fileSize, setFileSize ] = useState(0);
    const [ fileToUpload, setFileToUpload ] = useState(null);
    const [ coordSys, setCoordSys ] = useState("");
    const [ intersectionsArea, setIntersectionsArea ] = useState(0);
    const [ isGeneratingPDF, setIsGeneratingPDF ] = useState(false);
    const [ isPopupVisible, setIsPopupVisible ] = useState(false);
    const [ popupMessage, setPopupMessage ] = useState("");
    
    const [ createLayerName, setCreateLayerName ] = useState("");
    const [ createLayerDescription, setCreateLayerDescription ] = useState("");

    const [ isSWPVisible, setIsSWPVisible ] = useState(false); // if select Workspace popup is visible
    const [ isCWPVisible, setIsCWPVisible ] = useState(false); // if create Workspace popup is visible

    const [ isSLPVisible, setIsSLPVisible ] = useState(false); // if select Layer popup is visible
    const [ iCSLPVisible, setIsCLPVisible ] = useState(false); // if create Layer popup is visible

    const [ currentWorspaceIdx, setCurrentWorspaceIdx ] = useState(null);
    const [ editionActiveLayer, setEditionActiveLayer ] = useState(null);
    const [ currentLayersIdx, setCurrentLayersIdx ] = useState([]);

    const uploadGeojsonBtn = useRef(null);
    const saveBtnRef = useRef(null);
    const generatePDFBtnRef = useRef(null);

    const createWorkspaceBtnRef = useRef(null);
    const selectWorkspaceBtnRef = useRef(null);

    const CreateWorkspaceHandle = () => {
        setIsCWPVisible(true);
    }

    const SelectWorkspaceHandle = () => {
        setIsSWPVisible(true);
    };

    const SelectLayersHandle = () => {
        setIsSLPVisible(true);
    };

    const value = {
        activeMenu, setActiveMenu,
        drawPolygon, setDrawPolygon,
        editEntity, setEditEntity,
        geojsonContents, setGeojsonContents,
        featureGroupLayers, setFeatureGroupLayers,
        fileName, setFileName,
        fileSize, setFileSize,
        fileToUpload, setFileToUpload,
        coordSys, setCoordSys,
        intersectionsArea, setIntersectionsArea,
        isGeneratingPDF, setIsGeneratingPDF,
        currentWorspaceIdx, setCurrentWorspaceIdx,
        currentLayersIdx, setCurrentLayersIdx,
        createLayerName, setCreateLayerName,
        createLayerDescription, setCreateLayerDescription,
        editionActiveLayer, setEditionActiveLayer,

        // Popup
        isPopupVisible, setIsPopupVisible,
        popupMessage, setPopupMessage,
        isSWPVisible, setIsSWPVisible,
        isCWPVisible, setIsCWPVisible,
        isSLPVisible, setIsSLPVisible,
        iCSLPVisible, setIsCLPVisible,

        //Handle
        CreateWorkspaceHandle,
        SelectWorkspaceHandle,
        SelectLayersHandle,

        // Ref
        uploadGeojsonBtn,
        generatePDFBtnRef,
        saveBtnRef,
        createWorkspaceBtnRef,
        selectWorkspaceBtnRef
    };

  return <appMainContext.Provider value={value}>{children}</appMainContext.Provider>;
}

export default AppProvider;