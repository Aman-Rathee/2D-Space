import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { useState } from 'react';

const formFields = [
    {
        name: 'email',
        placeholder: 'Your email address',
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
        placeholder: 'Enter Your password',
        type: 'password',
        validation: {
            required: 'Password is required'
        }
    }
];

interface FormData {
    [key: string]: string
}

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, setError } = useForm();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`api/v1/auth/login`, {
                email: data.email,
                password: data.password
            })
        } catch (error) {
            setError('root', {
                type: 'manual',
                message: 'Invalid email or password'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex bg-gray-200 justify-center overflow-hidden">
            <div className="absolute top-14 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70" />
            <div className="absolute top-28 left-72 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70" />

            <div className="w-full flex items-center justify-center p-8">
                <div className="w-full max-w-md relative backdrop-blur-2xl rounded-3xl shadow-2xl p-8 bg-blue-500/30">
                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-bold">Welcome Back</h2>
                        <p className="text-zinc-600 mt-2">Please enter your details to sign in</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {formFields.map((field) => (
                            <div key={field.name} className="relative">
                                <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl overflow-hidden p-0.5">
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
                                    <div className="text-sm text-red-500 mt-1 ml-2">
                                        {String(errors[field.name]?.message)}
                                    </div>
                                )}
                            </div>
                        ))}
                        {errors.root && (
                            <div className="text-red-500 text-sm text-center">
                                {errors.root.message}
                            </div>
                        )}

                        <div className="flex items-center justify-end text-sm">
                            <Link to="#" className="text-blue-600 hover:text-blue-700">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-4 font-medium flex items-center justify-center gap-2 group transition-all disabled:opacity-70"
                        >
                            <span>{isLoading ? 'Log in...' : 'Log In'}</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-zinc-700">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;