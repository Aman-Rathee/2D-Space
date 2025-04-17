import { ArrowRight, Gamepad2, Sparkles, Users } from "lucide-react";
import { Link } from "react-router";

const Home = () => {
    return (
        <div className="relative min-h-[calc(100vh-60px)] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative z-10">
                        <div className="inline-flex items-center text-black space-x-2 bg-foreground-300 rounded-full px-3 py-1 mb-6">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-medium">Join the Space</span>
                        </div>
                        <h1 className="text-6xl font-bold leading-tight mb-6">
                            Your <span className="bg-linear-to-r from-primary-300 to-primary-600 bg-clip-text text-transparent">Virtual</span> <span style={{ WebkitTextStroke: '1px var(--color-foreground-50)' }} className="italic text-transparent">Universe</span> Awaits
                        </h1>
                        <p className="text-xl text-foreground-100 mb-8 max-w-xl">
                            Connect, collaborate, and create in a vibrant 2D space. Transform your virtual interactions into extraordinary experiences.
                        </p>
                        <div className="flex flex-wrap gap-8 mb-12">
                            <div className="flex items-center space-x-2 opacity-65">
                                <Users className="h-5 w-5 text-emerald-500" />
                                <span>1000+ active spaces</span>
                            </div>
                            <div className="flex items-center space-x-2 opacity-65">
                                <Gamepad2 className="h-5 w-5 text-pink-400" />
                                <span>Custom games</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link to='/spaces'>
                                <button className="px-5 py-3 bg-primary-300 text-foreground-950 rounded-lg cursor-pointer transition-transform hover:-translate-y-1">
                                    <span className="relative flex items-center">
                                        Launch Space
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                </button>
                            </Link>
                            <Link to='/join'>
                                <button className="px-5 py-3 cursor-pointer bg-primary-400/50 rounded-lg transition-transform hover:-translate-y-1">
                                    Join Space
                                </button>
                            </Link>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="rounded-4xl border-[18px] border-foreground-300/50 overflow-hidden h-5/6">
                            <img
                                id="game-image"
                                alt="Game"
                                src="./maps/map1/photo.png"
                                className="w-full h-full object-cover rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;