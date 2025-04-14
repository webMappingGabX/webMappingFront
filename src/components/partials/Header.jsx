import { useEffect, useState, useRef } from "react";
import { FaCalculator, FaChartArea, FaCheck, FaCog, FaDiagnoses, FaEdit, FaFile, FaFilePdf, FaHandPointer, FaInfoCircle, FaKey, FaLock, FaMap, FaPhone, FaPlusCircle, FaSave, FaSearch, FaShoppingCart, FaTable, FaUnlock, FaUpload, FaUserPlus } from "react-icons/fa";
import { FaAlignJustify, FaBell, FaHouse, FaShop } from "react-icons/fa6";
import { MapContainer, TileLayer } from "react-leaflet";
import { useAppMainContext } from "../context/AppProvider";
import axios from "../api/axios";
import getCookie from "../utils/tools";
import proj4 from "proj4";
import { saveAs } from "file-saver";
import FileMenu from "../menu/FileMenu";
import EditionMenu from "../menu/EditionMenu";
import AnalyzeMenu from "../menu/AnalyzeMenu";
import MapMenu from "../menu/MapMenu";
import WorkspaceMenu from "../menu/WorkspaceMenu";

const LAYER_URL = "layers";

export default function Header() {

    const [navVisible, setNavVisible] = useState(false);
    const upperHeaderRef = useRef(null);
    const mainHeaderRef = useRef(null);
    const loginScreenRef = useRef(null);

    //const uploadGeojsonBtn = useRef(null);
    const [headerFixed, setHeaderFixed] = useState(false);
    const [mainHeaderHeight, setMaiHeaderHeight] = useState(0);
    const [isActionsVisible, setIsActionVisible] = useState(false);

    const [workspaces, setWorkspaces] = useState([]);
    const layerNameRef = useRef(null);

    const { drawPolygon, setDrawPolygon, editEntity, setEditEntity, setGeojsonContents, geojsonContents,
        featureGroupLayers, setFeatureGroupLayers,
        fileName, setFileName,
        fileSize, setFileSize,
        fileToUpload, setFileToUpload,
        coordSys, setCoordSys,
        activeMenu, setActiveMenu,
        isGeneratingPDF, setIsGeneratingPDF,
        isPopupVisible, setIsPopupVisible,
        popupMessage, setPopupMessage,
        setIsErrorMessage,
        setCurrentLayersIdx,
        uploadGeojsonBtn,
        intersectionsArea,
        generatePDFBtnRef,
        saveBtnRef,
        cropBtnRef,
        uploadBtnRef,
        cancelSelectionBtnRef,
        editionActiveLayer,
        currentWorspaceIdx, setCurrentWorspaceIdx,
        currentLayersIdx
     } = useAppMainContext();

    const [ geoDatasFilesContent, setGeoDatasFilesContent ] = useState([]);
    const [ geoDatasFiles, setGeoDatasFiles ] = useState([]);

    const UPLOAD_URL = "/geodatas/upload";
    const GET_USER_WORKSPACES = "/workspaces";
    const authToken = localStorage.getItem("authToken");
    
    //const authToken = getCookie("token");

    useEffect(() => {
        const upperHeader = upperHeaderRef.current;
        const mainHeader = mainHeaderRef.current;

        setCurrentWorspaceIdx(JSON.parse(window.localStorage.getItem("currentWorkspace")));
        let layersIdx = window.localStorage.getItem("currentLayers");
        setCurrentLayersIdx(layersIdx != null && layersIdx != '' ? JSON.parse(layersIdx) : []);
        const handleScroll = () => {
            if(window.scrollY > upperHeader.offsetHeight)
            {
                setHeaderFixed(true);
                setMaiHeaderHeight(mainHeader.offsetHeight);
            }
            else {
                setHeaderFixed(false);
            }
        }

        window.onscroll = handleScroll;
    }, [])

    useEffect(() => { 
        setGeojsonContents([]);

        geoDatasFiles.forEach(async (geoDataFile, index) => {
            try {
            const response = await axios.get(`files/${geoDataFile.filename}`, {
                headers: {
                "Content-Type": "application/json"
                }
            });
            console.log({ "message": "geojson contents block", "response": { "id": geoDataFile.id, ...response.data } });
            setGeojsonContents((geojsonContents) => {
                const updatedContents = [...geojsonContents];
                updatedContents[index] = { "id": geoDataFile.id, ...response.data };
                return updatedContents;
            });
            } catch (error) {
            console.error('Erreur lors du chargement des fichiers:', error);
            }
        });
        /*geoDatasFiles.forEach(async (geoDataFile) => {
        axios.get(`files/${geoDataFile.filename}`, {
            headers: {
                "Content-Type": "application/json"
            }
            })
            .then(response => {
            console.log({ "message" : "geojson contents block", "response" : { "id" : geoDataFile.id, ...response.data } });
            //setGeoDatasFilesContent(geoDatasFilesContent => [...geoDatasFilesContent, response.data]);
            setGeojsonContents(geojsonContents => [...geojsonContents, { "id" : geoDataFile.id, ...response.data }]);
        })
            .catch(error => console.error('Erreur lors du chargement des fichiers:', error));
        })*/
    }, [geoDatasFiles]);

    useEffect(() => {
        //setGeoDatasFiles([]);
        console.log("********** CURRENT LAYERS IDX **********", currentLayersIdx);
        
        const fetchGeoDatasFiles = async () => {
            let geoDatas = [];

            for(let i = 0; i < currentLayersIdx.length; i++)
            {
                let layerIdx = currentLayersIdx[i];
                
                let response = await axios.get(`${LAYER_URL}/${layerIdx}`, {
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${authToken}`
                    },
                    params: {
                        workspaceId: currentWorspaceIdx
                    }
                });
                
                let dt = response.data.GeojsonDatum;
                //datas.push({ "filename" : dt.filename, "id" : dt.id });

                let datas = { "filename" : dt.filename, "id" : dt.id };
                console.log("GEOJSON DATAS FILES", datas);
                geoDatas.push(datas);
                //setGeoDatasFiles(geoDatasFiles => [...geoDatasFiles, ...datas]);

            }
            setGeoDatasFiles(geoDatas);
        }
        fetchGeoDatasFiles();
        
    }, [ currentLayersIdx ]);

    useEffect(() => {
        console.log("CURRENT IDX CHANGE       ", currentWorspaceIdx);
        axios.get(GET_USER_WORKSPACES, {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
              }
            })
            .then(response => {     
                let datas = [];
                let workspaceStorage = window.localStorage.getItem("currentWorkspace");

                console.log("WORKSPACE STORAGE       ", workspaceStorage);
                let currentWorkspace = 0;
                if(workspaceStorage != null && workspaceStorage != undefined)
                {
                    currentWorkspace = workspaceStorage;
                } else currentWorkspace = response.data[0].id;

                console.log("RESPONSE", response.data);
                response.data.forEach(dt => {
                    datas.push({ "id": dt.id,
                        "name" : dt.name,
                        "description" : dt.description,
                        "isSelected": dt.id == currentWorkspace });
                });
                setWorkspaces(datas);

            }).catch(error => console.error('Erreur lors de la recuperations des espaces de travail', error));
    }, [currentWorspaceIdx]);

    const handleShowMenuClick = () => {
        setNavVisible(true);
    };

    const handleHideMenuClick = () => {
        setNavVisible(false);
    };

    const handleActivateMenu = (e, menuIdx) => {
        e.preventDefault();

        if(activeMenu != menuIdx)
        {
            setTimeout(() => {
                //setIsActionVisible(true);
                setIsActionVisible(false);
            }, 100);
    
            setTimeout(() => {
                setActiveMenu(menuIdx);
                setIsActionVisible(true);
            }, 500);
        }

        setNavVisible(false);
    }

    const handleUploadgeoJsonFile = (e) => {
        e.preventDefault();

        const inputFile = uploadGeojsonBtn.current;

        inputFile.click();
    }

    const handleFileChange  = async () => {
        const inputFile = uploadGeojsonBtn.current;

        setFileName(inputFile.files[0].name);
        setFileSize((inputFile.files[0].size / 1024).toFixed(2));
        setFileToUpload(inputFile.files[0]);
        inputFile.files[0].text().then((content) => {
            // console.log(JSON.parse(content));
        });
        setCoordSys(inputFile.files[0] ? JSON.parse(await inputFile.files[0].text()).crs?.properties?.name : "Unknown");
        // setCoordSys(fileToUpload ? JSON.parse(await fileToUpload.text()).crs?.properties?.name : "Unknown");
    }

    const handleUpload = async (e) => {
        e.preventDefault();
        
        try {
            if (!fileToUpload) {
                console.log("No file to upload");
              return;
            }
            
    
            if (uploadBtnRef.current) {
                uploadBtnRef.current.disabled = true;
            }
            
            const convertCoordinates = (geojson, sourceProj = "EPSG:32632") => {
                //const sourceProj = "EPSG:32632";
                const destProj = "EPSG:4326";
    
                let convertedGeojson = JSON.parse(JSON.stringify(geojson));
                if (geojson.crs?.properties?.name !== "urn:ogc:def:crs:OGC:1.3:CRS84") {
                    convertedGeojson.features.forEach((feature) => {
                        feature.geometry.coordinates = feature.geometry.coordinates.map((coords) => {
                            coords[0] = coords[0].map((coord) => {
                                const [x, y] = proj4(sourceProj, destProj, coord);
                                return [x, y];
                            });
                            
                            return coords;
                        });
                    });
                }
    
                return convertedGeojson;
            };
    
            const originalGeojson = JSON.parse(await fileToUpload.text());
    
            const currentProjection = originalGeojson.crs?.properties?.name || "Unknown";
            console.log("Current GeoJSON Projection:", currentProjection);
            let sourceProj = "EPSG:32632";
            if (currentProjection.includes("3857") || currentProjection.includes("900913")) {
                sourceProj = "EPSG:3857"; // Web Mercator
            } else if (currentProjection.includes("4326") || currentProjection.includes("CRS84")) {
                sourceProj = "EPSG:4326"; // LatLong
            }
            const convertedGeojson = convertCoordinates(originalGeojson, sourceProj);
            
            const blob = new Blob([JSON.stringify(convertedGeojson)], { type: "application/json" });
            const newFile = new File([blob], fileToUpload.name, { type: "application/json" });
            const updatedGeojson = JSON.parse(await newFile.text());
            updatedGeojson.crs = {
                type: "name",
                properties: {
                    name: "urn:ogc:def:crs:OGC:1.3:CRS84"
                }
            };
    
            //const existingLayers = geojsonContents.map(layer => layer.features).flat();
            // const existingLayers = geojsonContents.map(layer => layer.features).flat();
            //const existingLayers = features;
            // updatedGeojson.features = [...existingLayers, ...updatedGeojson.features];
            const uniqueFeatures = [];
            const featureIds = new Set();
    
            updatedGeojson.features.forEach((feature) => {
                const featureId = JSON.stringify(feature.geometry.coordinates);
                if (!featureIds.has(featureId)) {
                featureIds.add(featureId);
                uniqueFeatures.push(feature);
                }
            });
    
            updatedGeojson.features = uniqueFeatures;
            const updatedBlob = new Blob([JSON.stringify(updatedGeojson)], { type: "application/json" });
            const updatedFile = new File([updatedBlob], newFile.name, { type: "application/json" });
            //console.log({ "message" : "New File Infos", "proj4Conversion": proj4("EPSG:32632", "EPSG:4326", [ 779856.307984707411379, 427988.729907256143633 ]), "originalGeojson": originalGeojson, "convertedGeojson": convertedGeojson, "newFile": newFile });
            setFileToUpload(updatedFile);
            // console.log({ "message" : "FIle to upload", fileToUpload,  convertedGeojson, blob , newFile });
            const formData = new FormData();
            formData.append("file", updatedFile);
            formData.append("name", layerNameRef.current.value);
            formData.append("description", "Description de la couche");
            formData.append("workspaceId", currentWorspaceIdx);
            
            try {
              const response = await axios.post(UPLOAD_URL, formData, {
                headers: { "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${authToken}`
                 },
              });
        
              //console.log(response.data);
              //setUploadedFilename(response.data.file.filename);
              
              setFileName("");
              setFileSize(0);
              setFileToUpload(null);
              uploadGeojsonBtn.current.value = null;
              setIsPopupVisible(true);
              setPopupMessage("Données geojson chargées avec succès");
              if (uploadBtnRef.current) {
                    uploadBtnRef.current.disabled = false;
                }
    
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } catch (error) {
                console.error(error);
                if (uploadBtnRef.current) {
                    uploadBtnRef.current.disabled = false;
                }
            }
        } catch (err) {
            setIsErrorMessage(true);
            setIsPopupVisible(true);
            setPopupMessage("Le fichier que vous tentez d'envoyer ne pourra pas être visualiser, le système de projection est inconnu");
            console.error("ERROR", err);
            //throw new Error(err);
        }
    };

    const handleGeneratePdf = (e) => {
        e.preventDefault();

        console.log("Generate pdf btn", generatePDFBtnRef);

        generatePDFBtnRef.current.click();
    }

    const handleLogout = () => {
        window.localStorage.clear();

        //loginScreenRef.current.click();
        window.location.href = "/";
    }

    return (
        <>
            <div ref={mainHeaderRef} className={`z-[1001] flex flex-row items-center justify-between w-full py-3 pl-1 pr-6 md:pr-12 md:pl-4 bg-blue-300 shadow-md rounded-sm`}>
                <button className="flex flex-row items-center justify-center w-12 p-2 mr-2 text-blue-950 lg:hidden"
                    onClick={handleShowMenuClick}
                ><FaAlignJustify /></button>

                <a href="" className="flex flex-row items-center text-lg font-bold md:text-2xl">
                    <div className="px-4 py-2 md:py-4 text-lg md:text-[30px] mr-1 rounded-md">Web Mapping GabX</div>
                </a>
                
                {authToken ? (
                    <nav className="flex-row hidden mt-10 text-sm lg:flex">
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 0)}>
                            <FaFile className="mr-3" /> Fichiers
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 1)}>
                            <FaEdit className="mr-3" /> Edition
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 2)}>
                            <FaDiagnoses className="mr-3" /> Analyses
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 3)}>
                            <FaMap className="mr-3" /> Carte
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 4)}>
                            <FaTable className="mr-3" /> Espace de travail
                        </a>
                        <a className="flex items-center px-4 py-2 font-semibold rounded-md cursor-pointer text-blue-950 hover:bg-blue-400"
                            onClick={handleLogout}>
                            <FaLock className="mr-3" /> Deconnexion
                        </a>
                    </nav>
                ) : (
                    <nav className="flex-row hidden mt-10 lg:flex">
                        <a href="/register" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400">
                            <FaUserPlus className="mr-3" /> S&apos;enregistrer
                        </a>

                        <a href="/" ref={loginScreenRef} className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400">
                            <FaKey className="mr-3" /> Se connecter
                        </a>
                    </nav>
                )}
                
            </div>
            

            <div className={`transition-fast-ease-out fixed bottom-5 max-h-[75vh] p-2 z-[1002] overflow-y-auto w-[95%] md:overflow-x-hidden md:w-auto bg-blur-op-20 bg-gray-100 bg-op
                ${isActionsVisible ? `right-3` : `-right-full`}
            `}>
                <button className="absolute text-xl font-bold cursor-pointer top-5 right-8 text-blue-950 hover:text-red-950" onClick={() => {
                    setIsActionVisible(false);
                    setTimeout(() => {
                        setActiveMenu(-1);
                    }, 500);
                }}>X</button>
                    
                    <div className="z-[1005]">

                        { activeMenu == 0 ? <FileMenu 
                            uploadGeojsonBtn={uploadGeojsonBtn}
                            fileName={fileName}
                            fileSize={fileSize}
                            coordSys={coordSys}
                            handleUpload={handleUpload}
                            handleFileChange={handleFileChange}
                            handleUploadgeoJsonFile={handleUploadgeoJsonFile}
                            workspaces={workspaces}
                            layerNameRef={layerNameRef}
                        /> : `` }

                        { activeMenu == 1 ? <EditionMenu 
                            setDrawPolygon={setDrawPolygon}
                            saveBtnRef={saveBtnRef}
                        /> : `` }

                        { activeMenu == 2 ? <AnalyzeMenu 
                            intersectionsArea={intersectionsArea}
                            cropBtnRef={cropBtnRef}
                            cancelSelectionBtnRef={cancelSelectionBtnRef}
                        /> : `` }

                        { activeMenu == 3 ? <MapMenu 
                            isGeneratingPDF={isGeneratingPDF}
                            handleGeneratePdf={handleGeneratePdf}
                        /> : `` }

                        { activeMenu == 4 ? <WorkspaceMenu /> : `` }
                    </div>
            </div>

            {/* Navigation */}
            {/* Navigation background */}
            <div className={`fixed top-0 bottom-0 right-0 left-0 z-[1002] ${navVisible ? `bg-gray-500 opacity-45` : `hidden`}`}
                onClick={handleHideMenuClick}></div>
            
            <div className={`fixed bg-blue-300 top-0 bottom-0 z-[1003] ${navVisible ? `w-[85vw] sm:w-[400px]` : `w-[90vw] sm:w-[200px]`} rounded-r-md 
                shadow-md border transition-fast-ease-out py-4 z-50
                ${navVisible ? `left-0` : `-left-full`}`}>
                <button className="absolute text-2xl top-5 right-5"
                    onClick={handleHideMenuClick}
                >X</button>


                <h1 className="mt-10 ml-8 text-xl">OPTIONS</h1>

                {authToken ? (
                    <nav className="flex flex-col mt-6 space-y-4 text-sm">
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 0)}>
                            <FaFile className="mr-3" /> Fichiers
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 1)}>
                            <FaEdit className="mr-3" /> Edition
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 2)}>
                            <FaDiagnoses className="mr-3" /> Analyses
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 3)}>
                            <FaMap className="mr-3" /> Carte
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                                onClick={(e) => handleActivateMenu(e, 4)}>
                                <FaTable className="mr-3" /> Espace de travail
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 font-semibold rounded-md text-blue-950 hover:bg-blue-400" onClick={handleLogout}>
                            <FaLock className="mr-3" /> Deconnexion
                        </a>
                    </nav>
                ) : (
                    <nav className="flex flex-col mt-6 space-y-4 text-sm">
                        <a href="/register" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400">
                            <FaUserPlus className="mr-3" /> S&apos;enregistrer
                        </a>

                        <a href="/" ref={loginScreenRef} className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400">
                            <FaKey className="mr-3" /> Se connecter
                        </a>
                    </nav>
                )}
                
            </div>
        </>
    );
}