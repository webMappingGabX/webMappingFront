import { useEffect, useRef, useState } from "react";
import axios from "./components/api/axios";
import { useAppMainContext } from "./components/context/AppProvider";
import { useNavigate } from "react-router-dom";

const LAYER_URL  = "/layers";

const Login = () => {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  
  const [ message, setMessage ] = useState('');

  const goToHome = useRef(null);

  const loginBtnRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      navigate('/home');
    }
  }, [navigate]);
  
  const getLayers = async (currentWorspaceIdx, token) => {
      try {
          const response = await axios.get(LAYER_URL, {
              params: {
                  workspaceId: currentWorspaceIdx
              },
              headers: {
                  Authorization: `Bearer ${token}`
              }
          });
          let layersIdx = [];

          response?.data?.forEach(layer => {
            layersIdx.push(layer.id.toString())
          });

          console.log("LAYERS IDX ON LOGIN", layersIdx);
          
          window.localStorage.setItem("currentLayers", JSON.stringify(layersIdx));
          console.log(response?.data);
      }catch(err) {
        console.log("LAYERS IDX ON FAILED");
          console.log(err?.data)
      }
  }

  const handleLogin = (e) => {
    e.preventDefault();

    if (loginBtnRef.current) {
      loginBtnRef.current.disabled = true;
    }

    const results = axios.post('auth/login', {
      email: email,
      password: password 
    });
    
    results.then(response => {
      if (response.status === 201 || response.status === 200) {
        //setMessage("Connexion réussi !");
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log("LOGIN DATAS", response.data);
        localStorage.setItem("currentWorkspace", response.data.workspaceIdx);

        getLayers(response.data.workspaceIdx, response.data.token).then(() => {
          goToHome.current.click();
          if (loginBtnRef.current) {
            loginBtnRef.current.disabled = false;
          }
        })
        
      } else {
        setMessage("Erreur lors de la connexion- : " + response.data.message);
        if (loginBtnRef.current) {
          loginBtnRef.current.disabled = false;
        }
      }
    }).catch(error => {
      setMessage("Adresse email ou mot de passe incorrect");
      if (loginBtnRef.current) {
        loginBtnRef.current.disabled = false;
      }
    });
    
  }

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-md px-4 py-8 mx-3 mt-8 space-y-6 bg-gray-100 rounded shadow-md md:px-8">
        <h2 className="text-lg font-bold text-center md:text-2x">Connexion</h2>
        <form className="space-y-4">
          { message !== "" && 
            (
              <div className="text-lg text-red-500">{message}</div>
            )
          }
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 mt-1 border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 mt-1 border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember_me"
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="remember_me" className="block ml-2 text-sm text-gray-900">Se rappeler de moi</label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Mot de passe oublié ?</a>
            </div>
          </div> */}
          
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md cursor-pointer disabled:cursor-wait disabled:bg-gray-400 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onClick={(e) => handleLogin(e)}
            ref={loginBtnRef}
          >
            Connexion
          </button>

          <div className="text-sm">
              <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Je n&apos;ai pas de compte</a>
          </div>
          
          <div className="hidden text-sm">
              <a href="/home" ref={goToHome}  className="font-medium text-indigo-600 hover:text-indigo-500">J&apos;ai déjà un compte</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
// Compare this snippet from src/components/partials/Header.jsx: