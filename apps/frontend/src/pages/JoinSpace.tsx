import { ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { backendUrl } from './Signup';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface FormData {
    [key: string]: string
}

const JoinSpace = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${backendUrl}api/v1/space/${data.Id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.status == 200) {
                navigate(`/space/${data.Id}`)
            }
            console.log(response);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-60px)] overflow-hidden relative flex">
            <div className="w-full max-w-2xl mx-auto p-8 relative">
                <div className="backdrop-blur-lg bg-foreground-300/30 rounded-2xl shadow-2xl transition-shadow p-8">
                    <div className="flex items-center justify-center gap-3 mb-7">
                        <h1 className="text-3xl font-bold">Join Space</h1>
                    </div>

                    <form autoComplete='off' onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-foreground-100">
                        <div>
                            <label className="block text-sm font-medium mb-2">Space Id</label>
                            <input
                                {...register('Id', { required: true })}
                                type='text'
                                autoFocus
                                placeholder={'Enter space Id'}
                                className="w-full px-4 py-3 bg-foreground-300/50 rounded-lg focus:outline-hidden"
                            />
                            <div className="text-sm text-red-500 mt-1 ml-3">
                                {errors.Id && <span>Id is required.</span>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full text-foreground-900 bg-primary-400 hover:bg-primary-500 rounded-lg py-3 font-medium flex items-center justify-center gap-2 group transition-colors">
                            <span>{isLoading ? 'Joining...' : 'Join Space'}</span>
                            <ArrowRight strokeWidth={3} className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>
                    <p className="mt-8 text-center">
                        Create your own space?{' '}
                        <Link to="/spaces" className="text-primary-300 cursor-pointer transition-colors font-semibold hover:text-primary-400">
                            Launch Space
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JoinSpace;