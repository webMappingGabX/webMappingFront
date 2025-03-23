import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from './Home'
import Header from './components/partials/Header';
import Login from './Login';
import Register from './Register';

function App() {
  return (
    <BrowserRouter>
            <div className="flex flex-col h-screen">

                {/* En tete */}
                <Header />
                
                {/* Contenu dynamique */}
                <main className='flex flex-col flex-1 flex-grow'>
                    <Routes>
                        <Route path="/" element={<Login />}/>
                        <Route path="/home" element={<Home />}/>
                        <Route path="/register" element={<Register />}/>
                    </Routes>
                </main>

                
            </div>
              
        </BrowserRouter>
  )
}

export default App
