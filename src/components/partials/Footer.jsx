import { FaAngleRight } from "react-icons/fa6";

const Footer = () => {
    return (
        <div className="p-4 mt-5 bg-primary text-primary-light">
            <div className="flex flex-col md:flex-row">
                <div className="flex-1 mr-4">
                    <a href="" className="">
                        <h1 className="flex flex-row items-center text-xl font-bold md:text-3xl text-pri">
                            <span className="px-4 py-2 text-4xl md:text-[50px] mr-1 border rounded-md bg-primary-light text-primary">A</span>utoshop
                        </h1>
                    </a>
                    <p className="flex flex-row items-center mt-4">Dolore erat dolor sit lorem vero amet. Sed sit lorem magna, ipsum no sit erat lorem et magna ipsum dolore amet erat.</p>
                    <p className="flex flex-row items-center mt-4"><FaAngleRight /> 123 Street, New York, USA</p>
                    <p className="flex flex-row items-center mt-4"><FaAngleRight /> info@example.com</p>
                    <p className="flex flex-row items-center mt-4"><FaAngleRight /> +012 345 67890</p>
                </div>
                <div className="flex-grow">
                    <div className="flex flex-col md:flex-row">
                        <div className="flex-1">
                            <h5 className="mb-4 font-bold">Navigation rapide</h5>
                            <div className="flex flex-col justify-start">
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="index.html"><FaAngleRight className="mr-2"/> Accueil</a>
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="shop.html"><FaAngleRight className="mr-2"/> Notre boutique</a>
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="detail.html"><FaAngleRight className="mr-2"/> Shop Detail</a>
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="cart.html"><FaAngleRight className="mr-2"/> Panier</a>
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="checkout.html"><FaAngleRight className="mr-2"/> Caisse</a>
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="contact.html"><FaAngleRight className="mr-2"/> Contactez Nous</a>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h5 className="mb-4 font-bold">Navigation rapide</h5>
                            <div className="flex flex-col justify-start">
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="index.html"><FaAngleRight className="mr-2"/> Accueil</a>
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="shop.html"><FaAngleRight className="mr-2"/> Notre Boutique</a>
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="detail.html"><FaAngleRight className="mr-2"/> Detail Boutique</a>
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="cart.html"><FaAngleRight className="mr-2"/> Panier</a>
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="checkout.html"><FaAngleRight className="mr-2"/> Caisse</a>
                                <a className="flex flex-row items-center mr-2 hover:text-primary-dark" href="contact.html"><FaAngleRight className="mr-2"/> Contactez Nous</a>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h5 className="flex flex-col justify-start">Newsletter</h5>
                            <form action="">
                                <div className="mx-1 my-2">
                                    <input type="text" className="px-2 py-3 border rounded-md" placeholder="Votre Nom" required="required" />
                                </div>
                                <div className="mx-1 my-2">
                                    <input type="email" className="px-2 py-3 border rounded-md" placeholder="Votre Email"
                                        required="required" />
                                </div>
                                <div>
                                    <button className="px-4 py-3 border border-primary-dark bg-primary-dark text-primary-light hover:bg-neutral-800" type="submit">Souscrire maintenant</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-row py-4 mx-5 mt-5 border-t border-primary-light">
                <div className="col-md-6 px-xl-0">
                    <p className="text-center mb-md-0 text-md-left text-dark">
                        &copy; <a className="text-dark font-weight-semi-bold" href="#">Autoshop</a>. Tout droits reservés. Designed
                        by
                        <a className="text-dark font-weight-semi-bold" href="https://htmlcodex.com"> MD </a>
                        Distributed By <a href="https://themewagon.com" target="_blank">UY1</a>
                    </p>
                </div>
                <div className="text-center col-md-6 px-xl-0 text-md-right">
                    <img className="img-fluid" src="../images/payments.png" alt=""/>
                </div>
            </div>
        </div>
    );
}

export default Footer;