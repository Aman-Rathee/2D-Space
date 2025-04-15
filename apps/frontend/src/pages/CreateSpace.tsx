import { useState } from 'react';
import { Plus, ArrowRight, Loader } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { backendUrl } from './Signup';
import { Space } from './MySpaces';
import { SelectMap } from '../components/SelectMap';

interface FormData {
    [key: string]: string
}

interface CreateSpaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    setMockSpaces: React.Dispatch<React.SetStateAction<Space[]>>
}

const formFields = [
    {
        label: 'Space Name',
        name: 'name',
        placeholder: 'Enter space name',
        type: 'text',
        validation: {
            required: 'Name is required',
        },
        required: true
    },
    {
        label: 'Dimensions',
        name: 'dimensions',
        placeholder: 'e.g., 20x30',
        type: 'text',
        required: false
    },
    {
        label: 'Map ID',
        name: 'mapId',
        placeholder: 'Enter map ID',
        type: 'text',
        required: false
    }
];

const CreateSpace = ({ isOpen, onClose, setMockSpaces }: CreateSpaceModalProps) => {
    const [mapId, setMapId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        if (mapId === null) return alert("Please select the Map.")
        setIsLoading(true);
        try {
            const response = await axios.post(`${backendUrl}api/v1/space/create`, {
                name: data.name,
                dimensions: '960x640',
                //Todo: get the mapId from the database
                mapId: 'cm8y7jmhf0003wmp0hrjinn09'
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.status === 200) {
                setMockSpaces(data => [...data, { id: response.data.space.id, name: response.data.space.name, dimensions: `${response.data.space.width}x${response.data.space.height}`, thumbnail: response.data.space.thumbnail }])
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            onClose()
            setIsLoading(false);
            setMapId(null)
            reset()
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex py-3 justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-60" onClick={() => { if (!isLoading) onClose() }}></div>
            <div className="w-full max-w-2xl overflow-auto [scrollbar-width:none]">
                <div className="backdrop-blur-lg bg-orange-200 rounded-2xl shadow-xl p-8">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-500 rounded-lg">
                            <Plus className="h-4 w-4 text-orange-200" />
                        </div>
                        <h1 className="text-2xl text-amber-800 font-bold">Create New Space</h1>
                    </div>
                    <SelectMap mapId={mapId} setMapId={setMapId} />
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {formFields.map((field) => (
                            field.required ? (<div key={field.name}>
                                <label className="block text-sm font-medium mb-2">{field.label}</label>
                                <div className="relative bg-linear-to-r from-amber-500 to-orange-500 rounded-xl p-0.5">
                                    <input autoFocus
                                        {...register(field.name, field.validation)}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-3 rounded-xl focus:outline-hidden"
                                    />
                                </div>
                                {errors[field.name] && (
                                    <div className="text-sm text-red-500 mt-1 ml-2">
                                        {String(errors[field.name]?.message)}
                                    </div>
                                )}
                            </div>) : null
                        ))}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-linear-to-r bg-amber-500 ${!isLoading && 'hover:bg-amber-600'} text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 group transition-opacity ${isLoading && 'bg-amber-700 cursor-not-allowed'}`}>
                            <span>{isLoading ? 'Creating...' : 'Create Space'}</span>
                            {isLoading ?
                                <Loader className="h-4 w-4 transition-transform animate-spin" />
                                : <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                            }
                        </button>
                    </form>
                    <p className="mt-8 text-center text-zinc-700">
                        Launch an existing?{' '}
                        <span onClick={() => { if (!isLoading) onClose() }} className="text-orange-500 cursor-pointer font-semibold hover:text-orange-600">
                            Launch Space
                        </span>
                    </p>
                </div>
            </div>
        </div >
    );
};

export default CreateSpace;