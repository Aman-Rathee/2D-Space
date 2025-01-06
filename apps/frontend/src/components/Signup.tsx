import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

export const baseUrl = 'http://localhost:3001/'

const formFields = [
    {
        name: 'email',
        placeholder: 'Enter your email',
        type: 'email',
        validation: {
            required: 'Email is required',
            pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
            }
        }
    },
    {
        name: 'password',
        placeholder: 'Create a password',
        type: 'password',
        validation: {
            required: 'Password is required',
            minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
            }
        }
    }
];

interface FormData {
    [key: string]: string
}

const SignupPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${baseUrl}api/v1/auth/signup`, {
                email: data.email,
                password: data.password
            })
            console.log(response);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex bg-gray-200 justify-center overflow-hidden">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 " />
            <div className="absolute top-20 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 " />
            <div className="absolute -bottom-8 left-80 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 " />

            <div className="w-full flex items-center justify-center p-8">
                <div className="w-full max-w-md relative backdrop-blur-2xl rounded-3xl shadow-2xl p-8 bg-purple-500/30 ">
                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-bold">Create Account</h2>
                        <p className="text-zinc-600 mt-2">Please enter your details to Sign up</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {formFields.map((field) => (
                            <div key={field.name} className="relative group">
                                <div className="relative bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl overflow-hidden p-0.5">
                                    <div className="flex items-center bg-white rounded-xl">
                                        <input
                                            {...register(field.name, field.validation)}
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            className="w-full bg-transparent px-4 py-4 rounded-xl text-black placeholder-zinc-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                                {errors[field.name] && (
                                    <div className="text-sm text-red-500 mt-1 -mb-5 ml-2">
                                        {String(errors[field.name]?.message)}
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-violet-400 hover:bg-violet-500 text-white rounded-xl py-4 font-medium flex items-center justify-center gap-2 group transition-all">
                            <span>{isLoading ? 'Sign Up...' : 'Sign Up'}</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-zinc-700">
                        Already have an account?{' '}
                        <Link to="/login" className="text-violet-600 font-semibold hover:text-violet-700">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;