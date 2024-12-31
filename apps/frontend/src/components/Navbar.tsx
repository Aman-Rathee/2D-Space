import { Link } from "react-router";

const Navbar = () => {
    return (
        <header className="flex items-center justify-between px-4 sm:px-14 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center space-x-8">
                <Link to="/" className="text-xl font-bold">2D-Space</Link>
                <nav className="space-x-6">
                    <Link to="/#" className="text-gray-600 hover:text-gray-900">About us</Link>
                    <Link to="/#" className="text-gray-600 hover:text-gray-900">Blog</Link>
                </nav>
            </div>
            <div className="flex-1 mx-8 hidden sm:block h-px bg-black"></div>
            <Link
                to="/#"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-full hover:bg-gray-800"
            >
                Sign in
            </Link>
        </header>
    );
};

export default Navbar;