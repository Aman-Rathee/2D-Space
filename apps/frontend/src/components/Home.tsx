import { ArrowRight, Gamepad2, Sparkles, Users } from "lucide-react";
import { Link } from "react-router";

const Home = () => {
    return (
        <div className="relative min-h-[calc(100vh-60px)] overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,220,100,1),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(100,200,255,1),transparent_50%)]" />

            <div className="max-w-7xl mx-auto px-4 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <div className="inline-flex items-center space-x-2 bg-black/5 rounded-full px-4 py-2 mb-6">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">Join the Space</span>
                        </div>

                        <h1 className="text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                            Your Virtual Universe Awaits
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-xl">
                            Connect, collaborate, and create in a vibrant 2D space. Transform your virtual interactions into extraordinary experiences.
                        </p>
                        <div className="flex flex-wrap gap-8 mb-12">
                            <div className="flex items-center space-x-2 text-gray-400">
                                <Users className="h-5 w-5 text-purple-400" />
                                <span>1000+ active spaces</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-400">
                                <Gamepad2 className="h-5 w-5 text-pink-400" />
                                <span>Custom games</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-6">
                            <Link to='/spaces'>
                                <button className="group relative px-8 py-3 border-2 border-gray-400 hover:text-gray-800 text-black rounded-3xl overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative flex items-center">
                                        Launch Space
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                </button>
                            </Link>
                            <Link to='/join'>
                                <button className="text-gray-600 hover:text-gray-900 font-medium">
                                    Join Space →
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-2xl border-4 border-white overflow-hidden h-5/6 bg-black">
                            <img
                                id="game-image"
                                alt="Game"
                                src="./game.png"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;