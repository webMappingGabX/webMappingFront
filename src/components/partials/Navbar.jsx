import { FaInfoCircle } from "react-icons/fa";
import { FaHouse, FaKey, FaLock, FaPhone, FaShop, FaUnlock } from "react-icons/fa6";

const Navbar = () => {
    return (
        <div className="flex justify-between w-full px-8">
            <div className="py-0 mr-auto navbar-nav">
                <a href="index.html" className="mx-4"><FaHouse /> Accueil</a>
                <a href="shop.html" className="mx-4"><FaShop /> Boutique</a>
                <a href="detail.html" className="mx-4"><FaInfoCircle /> Détails boutique</a>
                <a href="contact.html" className="mx-4"><FaPhone /> Contact</a>
            </div>
            <div className="py-0 ml-auto navbar-nav">
                <a href="#" className="mx-4"><FaLock /> Connexion</a>
                <a href="#" className="mx-4"><FaKey /> Inscription</a>
                <a href="#" className="mx-4"><FaUnlock /> Déconnexion</a>;
            </div>
        </div>
    );
}

export default Navbar;