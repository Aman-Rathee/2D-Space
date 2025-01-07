import { Plus, Search, Layout, ArrowUpRight, Users } from 'lucide-react';
import { Link } from 'react-router';
import { backendUrl } from './Signup';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Space {
    id: string;
    name: string;
    dimensions: string;
    thumbnail: string;
}

const MySpaces = () => {
    const [mockSpaces, setMockSpaces] = useState<Space[]>([])
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const response = await axios.get(`${backendUrl}api/v1/space/all`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                console.log(response.data.spaces);
                setMockSpaces(response.data.spaces);
            } catch (error) {
                console.log("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        }

        fetchSpaces()
    }, [])

    const filteredSpaces = mockSpaces.filter(space =>
        space.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen relative overflow-hidden bg-slate-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(35,233,190,0.4),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(100,200,255,0.7),transparent_50%)]" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
            <div className="max-w-7xl relative mx-auto p-8">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Your Spaces</h1>
                        <p className="text-slate-600 mt-1">Manage and monitor your virtual spaces</p>
                    </div>
                    <Link
                        to="/space/create"
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:opacity-80 transition-opacity"
                    >
                        <Plus className="h-5 w-5" />
                        Create Space
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                        placeholder="Search spaces..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Spaces Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSpaces.map(space => (
                        <div key={space.id} className="bg-white rounded-xl shadow-sm hover:shadow-2xl transition-shadow p-6 border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Layout className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <h3 className="font-semibold text-lg">{space.name}</h3>
                                </div>
                                <div className="p-2">
                                    <ArrowUpRight className="h-4 w-4 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Dimensions:</span>
                                    <span className="font-medium">{space.dimensions}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Map ID:</span>
                                    <span className="font-medium">{space.id}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">Users:</span>
                                    </div>
                                    <Link
                                        to={`/space/${space.id}`}>
                                        <button className="bg-blue-500 text-indigo-100 px-2 py-1 rounded-lg">
                                            Join
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MySpaces;