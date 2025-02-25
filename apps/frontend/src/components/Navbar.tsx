import { Link } from "react-router";

const Navbar = () => {
    return (
        <header className="flex items-center justify-between px-4 sm:px-20 py-3 bg-white border-b border-gray-300">
            <div className="flex items-center space-x-8">
                <Link to="/" className="text-xl font-bold">2D-Space</Link>
                <nav className="space-x-6">
                    <Link to="/spaces" className="text-gray-600 hover:text-gray-900">My Spaces</Link>
                </nav>
            </div>
            <div className="flex-1 mx-8 hidden sm:block h-px bg-black"></div>
            <div className="flex gap-4">
                <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium border-2 border-gray-600 rounded-lg hover:bg-gray-200"
                >
                    Log in
                </Link>
                <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
                >
                    Sign up
                </Link>
            </div>
        </header>
    );
};

export default Navbar;