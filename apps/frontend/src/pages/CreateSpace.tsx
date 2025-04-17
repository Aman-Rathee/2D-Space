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
            <div className="fixed inset-0 backdrop-blur-xs bg-background-700/70" onClick={() => { if (!isLoading) onClose() }}></div>
            <div className="w-full max-w-2xl overflow-auto [scrollbar-width:none]">
                <div className="relative bg-foreground-300/40 rounded-2xl shadow-xl p-8">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <div className="p-1.5 bg-primary-400 rounded">
                            <Plus strokeWidth={4} className="h-5 w-5 text-primary-700" />
                        </div>
                        <h1 className="text-2xl font-bold">Create New Space</h1>
                    </div>
                    <SelectMap mapId={mapId} setMapId={setMapId} />
                    <form autoComplete='off' onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-foreground-100">
                        {formFields.map((field) => (
                            field.required ? (<div key={field.name}>
                                <label className="block text-sm font-medium mb-2">{field.label}</label>
                                <div className="relative bg-foreground-300/50 rounded-lg p-0.5">
                                    <input autoFocus
                                        {...register(field.name, field.validation)}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-2.5 focus:outline-hidden"
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
                            className={`w-full bg-primary-400 text-foreground-900 cursor-pointer rounded-lg py-3 font-medium flex items-center justify-center gap-2 group transition-opacity ${isLoading && 'bg-primary-600 cursor-not-allowed'}`}>
                            <span>{isLoading ? 'Creating...' : 'Create Space'}</span>
                            {isLoading ?
                                <Loader className="h-4 w-4 transition-transform animate-spin" />
                                : <ArrowRight strokeWidth={3} className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            }
                        </button>
                    </form>
                    <p className="mt-8 text-center">
                        Launch an existing?{' '}
                        <span onClick={() => { if (!isLoading) onClose() }} className="text-primary-400 cursor-pointer transition-colors font-semibold hover:text-primary-500">
                            Launch Space
                        </span>
                    </p>
                </div>
            </div>
        </div >
    );
};

export default CreateSpace;