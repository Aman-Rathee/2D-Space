import { useEffect, useState } from "react";
import { Link } from "react-router";
import AlertModal from "./Model";

const Navbar = () => {
    const [isLogin, setIsLogin] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        let token = localStorage.getItem('token')
        if (token) {
            setIsLogin(true)
        }
    }, [])

    const logOut = () => {
        localStorage.removeItem('token')
        setIsLogin(false)
    }

    return (
        <header className="flex items-center justify-between px-4 sm:px-32 py-3 border-b">
            <div className="flex items-center space-x-12">
                <Link to="/" className="text-xl font-bold">2D-Space</Link>
                <nav>
                    <Link to="/spaces" className="hover:opacity-50 transition-opacity">My Spaces</Link>
                </nav>
            </div>
            {!isLogin ? <div className="flex gap-4">
                <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium border-2 hover:bg-background-700 hover:-translate-y-0.5 transition-all rounded-lg"
                >
                    Log in
                </Link>
                <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium text-foreground-950 bg-primary-400 hover:opacity-90 hover:-translate-y-0.5 transition-all rounded-lg"
                >
                    Sign up
                </Link>
            </div> :
                <div className="flex gap-4">
                    <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 cursor-pointer text-sm font-medium hover:bg-background-700 hover:-translate-y-0.5 transition-all border rounded-lg">
                        Log Out
                    </button>
                </div>
            }
            <AlertModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Log Out"
                message="Are you sure you want to Log Out?"
                confirmText="Log out"
                onConfirm={logOut}
            />
        </header>
    );
};

export default Navbar;