import { useRef, useState } from "react";
import axios from "./components/api/axios";

const Register = () => {
  const [ username, setUsername ] = useState("");
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ confirmPassword, setConfirmPassword ] = useState("");
  
  const [ message, setMessage ] = useState("");

  const goToLogin = useRef(null);
  
  const handleRegister = (e) => {
      e.preventDefault();
      
      if(confirmPassword !== password) {
          setMessage("Les mots de passe ne correspondent pas");
          return;
      }
      
      const results = axios.post('auth/register', {
        username: username,
        email: email,
        password: password
      });
      results.then(response => {
        if (response.status === 201 || response.status === 200) {
          //setMessage("Enregistrement réussi !");
          goToLogin.current.click();
        } else {
          setMessage(response.data.message);
        }
      }).catch(error => {
        console.log("error", error)
        // .response.data.error.errors[0].message
        const finalMsg = error.response.data.error.original == undefined ? "Adresse email incorrecte" : "email ou nom d'utilisateur déjà utilisé";//error.response.data.error.original.detail;
        setMessage(finalMsg);
      });
  }

  return (
    <div className="flex items-start justify-center min-h-screen bg-gray-200">
      <div className="w-full max-w-md p-8 mt-8 space-y-6 bg-gray-100 rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Enregistrement</h2>
        <form className="space-y-4">
          { message !== "" && 
            (
              <div className="text-lg text-red-500">{message}</div>
            )
          }
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom d&apos;utilisateur</label>
            <input
              type="text"
              className="w-full px-3 py-2 mt-1 border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Entrer votre nom d'utilisateur"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 mt-1 border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Entrer votre email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              className="w-full px-3 py-2 mt-1 border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Entrer votre mot de passe"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
            <input
              type="password"
              className="w-full px-3 py-2 mt-1 border border-gray-500 rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
              placeholder="Confirmer votre mot de passe"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-200"
            onClick={(e) => handleRegister(e)}
          >
            S&apos;enregistrer
          </button>

          <div className="text-sm">
              <a href="/" ref={goToLogin}  className="font-medium text-indigo-600 hover:text-indigo-500">J&apos;ai déjà un compte</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
// Compare this snippet from src/components/partials/Header.jsx: