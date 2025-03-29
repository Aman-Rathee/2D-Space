import { useState } from 'react';
import { Plus, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import axios from 'axios';
import { backendUrl } from './Signup';

interface FormData {
    [key: string]: string
}

interface CreateSpaceModalProps {
    isOpen: boolean;
    onClose: () => void;
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

const CreateSpace = ({ isOpen, onClose }: CreateSpaceModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${backendUrl}api/v1/space/create`, {
                name: data.name,
                dimensions: '960x640',
                //Todo: get the mapId from the database
                mapId: 'cm7tjmhzc0003wmk8i94ragri'
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            console.log(response);
            if (response.status === 200) {
                onClose()
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex pt-10 items-start justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="w-full max-w-2xl mx-auto p-8 relative">
                <div className="backdrop-blur-lg bg-orange-200 rounded-2xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-7">
                        <div className="p-2 bg-amber-500 rounded-lg">
                            <Plus className="h-6 w-6 text-orange-200" />
                        </div>
                        <h1 className="text-3xl font-bold">Create New Space</h1>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {formFields.map((field) => (
                            field.required ? (<div key={field.name}>
                                <label className="block text-sm font-medium mb-2">{field.label}</label>
                                <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-0.5">
                                    <input
                                        {...register(field.name, field.validation)}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        className="w-full px-4 py-3 rounded-xl focus:outline-none"
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
                            className="w-full bg-gradient-to-r bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 group hover:opacity-90 transition-opacity">
                            <span>{isLoading ? 'Creating...' : 'Create Space'}</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>
                    <p className="mt-8 text-center text-zinc-700">
                        Launch an existing?{' '}
                        <Link to="/spaces" className="text-orange-500 font-semibold hover:text-orange-600">
                            Launch Space
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreateSpace;