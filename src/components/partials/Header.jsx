import { useEffect, useState, useRef } from "react";
import { FaCalculator, FaChartArea, FaCog, FaDiagnoses, FaEdit, FaFile, FaFilePdf, FaInfoCircle, FaKey, FaLock, FaMap, FaPhone, FaPlusCircle, FaSave, FaSearch, FaShoppingCart, FaUnlock, FaUpload, FaUserPlus } from "react-icons/fa";
import { FaAlignJustify, FaBell, FaHouse, FaShop } from "react-icons/fa6";
import { MapContainer, TileLayer } from "react-leaflet";
import { useAppMainContext } from "../context/AppProvider";
import axios from "../api/axios";
import getCookie from "../utils/tools";
import proj4 from "proj4";
import { saveAs } from "file-saver";

export default function Header() {

    const [query, setQuery] = useState("");
    const [navVisible, setNavVisible] = useState(false);
    const upperHeaderRef = useRef(null);
    const mainHeaderRef = useRef(null);
    const loginScreenRef = useRef(null);

    //const uploadGeojsonBtn = useRef(null);
    const [headerFixed, setHeaderFixed] = useState(false);
    const [mainHeaderHeight, setMaiHeaderHeight] = useState(0);
    const [activeMenu, setActiveMenu] = useState(-1);
    const [isActionsVisible, setIsActionVisible] = useState(false);
    const { drawPolygon, setDrawPolygon, editEntity, setEditEntity, setGeojsonContents, geojsonContents,
        fileName, setFileName,
        fileSize, setFileSize,
        fileToUpload, setFileToUpload,
        coordSys, setCoordSys,
        isGeneratingPDF, setIsGeneratingPDF,
        isPopupVisible, setIsPopupVisible,
        popupMessage, setPopupMessage,
        uploadGeojsonBtn,
        intersectionsArea,
        generatePDFBtnRef,
        saveBtnRef
     } = useAppMainContext();
    /*const [ fileName, setFileName ] = useState("");
    const [ fileSize, setFileSize ] = useState(0);
    const [ fileToUpload, setFileToUpload ] = useState(null);
    const [ coordSys, setCoordSys ] = useState("");*/

    const [ geoDatasFilesContent, setGeoDatasFilesContent ] = useState([]);
    const [ geoDatasFiles, setGeoDatasFiles ] = useState([]);

    const UPLOAD_URL = "/geodatas/upload";
    const authToken = localStorage.getItem("authToken");
    
    //const authToken = getCookie("token");

    useEffect(() => {
        const upperHeader = upperHeaderRef.current;
        const mainHeader = mainHeaderRef.current;
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
          geoDatasFiles.forEach(geoDataFile => {
        axios.get(`uploads/${geoDataFile.filename}`, {
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
        })
    }, [geoDatasFiles]);

    useEffect(() => {
        axios.get('geodatas', {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
              }
            })
            .then(response => {
                let datas = [];
                response.data.forEach(dt => {
                    datas.push({ "filename" : dt.filename, "id" : dt.id });
                });
                //console.log(datas);
                setGeoDatasFiles(geoDatasFiles => [...geoDatasFiles, ...datas]);

            }).catch(error => console.error('Erreur lors du chargement des fichiers:', error));
    }, []);

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
        
        if (!fileToUpload) {
            console.log("No file to upload");
          return;
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
        const convertedGeojson = convertCoordinates(originalGeojson);
        const blob = new Blob([JSON.stringify(convertedGeojson)], { type: "application/json" });
        const newFile = new File([blob], fileToUpload.name, { type: "application/json" });
        const updatedGeojson = JSON.parse(await newFile.text());
        updatedGeojson.crs = {
            type: "name",
            properties: {
                name: "urn:ogc:def:crs:OGC:1.3:CRS84"
            }
        };

        const existingLayers = geojsonContents.map(layer => layer.features).flat();
        updatedGeojson.features = [...existingLayers, ...updatedGeojson.features];
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

          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          console.error(error);
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

                <a href="" className="flex flex-row items-center text-xl font-bold md:text-3xl">
                    <div className="px-4 py-2 md:py-4 text-2xl md:text-[50px] mr-1 rounded-md">Web Mapping GabX</div>
                </a>
                
                {authToken ? (
                    <nav className="flex-row hidden mt-10 lg:flex">
                        <a href="#" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 0)}>
                            <FaFile className="mr-3" /> Fichier
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 1)}>
                            <FaEdit className="mr-3" /> Edition
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 2)}>
                            <FaDiagnoses className="mr-3" /> Analyses
                        </a>
                        <a href="#" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                            onClick={(e) => handleActivateMenu(e, 3)}>
                            <FaMap className="mr-3" /> Carte
                        </a>
                        <a className="flex items-center px-4 py-2 text-lg font-semibold rounded-md cursor-pointer text-blue-950 hover:bg-blue-400"
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

            <div className={`transition-fast-ease-out fixed bottom-5  bg-blue-300 p-4 rounded-md shadow-md z-[1001] overflow-auto w-[95%] md:overflow-hidden md:w-auto
                ${isActionsVisible ? `right-3` : `-right-full`}
            `}>
                <button className="absolute text-xl font-bold cursor-pointer top-3 right-6 text-blue-950 hover:text-red-950" onClick={() => {
                    setIsActionVisible(false);
                    setTimeout(() => {
                        setActiveMenu(-1);
                    }, 500);
                }}>X</button>

                    
                    { activeMenu == 0 ? (
                        <>
                            <h3 className="mb-3 text-2xl font-semibold text-blue-950">Fichier</h3>
                            <div className="mt-2 space-y-2">
                                
                                <button className="flex flex-row text-xl transition-colors cursor-pointer hover:text-red-700 text-blue-950" onClick={(e) => handleUploadgeoJsonFile(e)}>
                                    <FaUpload  className="mr-4" />
                                    Ajouter une nouvelle couche (geojson)
                                </button>
                                {uploadGeojsonBtn.current && uploadGeojsonBtn.current.files.length > 0 && (
                                    <div>
                                        <div className="mt-2">
                                            <h4 className="text-lg font-semibold text-blue-950">Informations :</h4>
                                            <p className="text-blue-950">Nom : { fileName }</p>
                                            <p className="text-blue-950">Taille : { fileSize } KB</p>
                                            <p className="text-blue-950">Système de coordonnées : { coordSys }</p>
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
                    ) : `` }

                    { activeMenu == 1 ? (
                        <>
                            <h3 className="mb-3 text-2xl font-semibold text-blue-950">Edition</h3>
                            <div className="flex flex-row mt-2 space-y-2">
                                <button className="flex flex-col items-center px-4 py-2 mr-4 text-lg font-semibold rounded-md cursor-pointer text-blue-950 hover:bg-blue-400"
                                    onClick={() => setDrawPolygon(true)}>

                                    <FaPlusCircle className="mr-3 text-xl md:text-3xl" />
                                    <div className="mt-3 text-sm md:text-lg">
                                        Ajouter une nouvelle entites
                                    </div>
                                </button>

                                {/* <button className="flex flex-col items-center px-4 py-2 mr-4 text-lg font-semibold rounded-md cursor-pointer text-blue-950 hover:bg-blue-400"
                                    onClick={() => setEditEntity(true)}>

                                    <FaEdit className="mr-3 text-xl md:text-3xl" />
                                    <div className="mt-3 text-sm md:text-lg">
                                        Modifier les entites
                                    </div>
                                </button> */}
                                <button className="flex flex-col items-center px-4 py-2 mr-4 text-lg font-semibold rounded-md cursor-pointer text-blue-950 hover:bg-blue-400"
                                    onClick={(e) => { e.preventDefault(); saveBtnRef.current.click() }}>

                                    <FaSave className="mr-3 text-xl md:text-3xl" />
                                    <div className="mt-3 text-sm md:text-lg">
                                        Sauvegarder les modifications
                                    </div>
                                </button>
                            </div>
                            <div>
                                
                                { editEntity ? (
                                    <div className="mt-2 space-y-2">
                                        <button className="flex flex-row items-center justify-center px-4 py-2 mr-4 font-semibold rounded-md cursor-pointer text-blue-950 hover:bg-blue-400"
                                            onClick={() => setEditEntity(false)}>
                                            <FaSave className="mr-3 text-sm md:text-lg" />
                                            <div className="text-sm md:text-lg">
                                                Terminer l&apos;edition
                                            </div>
                                        </button>
                                    </div>
                                ) : `` }
                            </div>
                        </>
                    ) : `` }

                    { activeMenu == 2 ? (
                        <>
                            <h3 className="mb-3 text-2xl font-semibold text-blue-950">Analyses</h3>
                            <div className="flex flex-col mt-2 space-y-2">
                                {/* <button className="flex flex-col items-center px-4 py-2 mr-4 text-lg font-semibold rounded-md cursor-pointer text-blue-950 hover:bg-blue-400">
                                    <FaChartArea className="mr-3 text-xl md:text-3xl" />
                                    <div className="mt-3 text-sm md:text-lg">
                                        Calculer la surface d&apos;un empietement
                                    </div>
                                </button>

                                <button className="flex flex-col items-center px-4 py-2 mr-4 text-lg font-semibold rounded-md cursor-pointer text-blue-950 hover:bg-blue-400">
                                    <FaCalculator className="mr-3 text-xl md:text-3xl" />
                                    <div className="mt-3 text-sm md:text-lg">
                                        Calculer la surface totale de tous les empietements
                                    </div>
                                </button> */}
                                <div><div className="text-semibold">Surface totale de tous les empietements : </div> <div className="font-semibold, font-mono text-green-700">{intersectionsArea.toFixed(4)} m<sup>2</sup></div> </div>
                            </div>
                        </>
                    ) : `` }

                    { activeMenu == 3 ? (
                        <div className="mt-2 space-y-2">
                            <h3 className="mb-3 text-2xl font-semibold text-blue-950">Carte</h3>
                            {/* <a href="#" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400">
                                <FaUnlock className="mr-3" /> Capturer la carte
                            </a> */}
                            <button 
                                className="flex items-center px-4 py-2 text-lg font-semibold rounded-md cursor-pointer text-blue-950 hover:bg-blue-400"
                                disabled={isGeneratingPDF}
                                onClick={(e) => handleGeneratePdf(e)}>
                                <FaFilePdf className="mr-3" /> 
                                {isGeneratingPDF ? 'Génération en cours...' : 'Générer un PDF à partir de la vue actuelle'}
                            </button>
                        </div>
                    ) : `` }
            </div>

            {/* Navigation */}
            {/* Navigation background */}
            <div className={`fixed top-0 bottom-0 right-0 left-0 z-[1002] ${navVisible ? `bg-gray-500 opacity-45` : `hidden`}`}
                onClick={handleHideMenuClick}></div>
            
            <div className={`fixed bg-blue-300 top-0 bottom-0 z-[1003] ${navVisible ? `w-[85vw]` : `w-[90vw] md:w-[300px]`} rounded-r-md 
                shadow-md border transition-fast-ease-out py-4 z-50
                ${navVisible ? `left-0` : `-left-full`}`}>
                <button className="absolute text-2xl top-5 right-5"
                    onClick={handleHideMenuClick}
                >X</button>

                <h1 className="mt-10 ml-8 text-2xl">OPTIONS</h1>
                <nav className="flex flex-col mt-10 space-y-4">
                    <a href="#" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                        onClick={(e) => handleActivateMenu(e, 0)}>
                        <FaFile className="mr-3" /> Fichier
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                        onClick={(e) => handleActivateMenu(e, 1)}>
                        <FaEdit className="mr-3" /> Edition
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                        onClick={(e) => handleActivateMenu(e, 2)}>
                        <FaDiagnoses className="mr-3" /> Analyses
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400"
                        onClick={(e) => handleActivateMenu(e, 3)}>
                        <FaMap className="mr-3" /> Carte
                    </a>
                    <a href="#" className="flex items-center px-4 py-2 text-lg font-semibold rounded-md text-blue-950 hover:bg-blue-400">
                        <FaLock className="mr-3" /> Deconnexion
                    </a>
                </nav>
            </div>
        </>
    );
}