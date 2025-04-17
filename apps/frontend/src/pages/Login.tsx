import axios from 'axios';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { backendUrl } from './Signup';

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
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, setError } = useForm();

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${backendUrl}api/v1/auth/login`, {
                email: data.email,
                password: data.password
            })
            if (response.status == 200) {
                navigate('/')
            }
            localStorage.setItem('token', response.data.token)
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
        <div className="min-h-screen relative flex justify-center overflow-hidden">
            <div className="w-full flex items-center justify-center">
                <div className="w-full max-w-md rounded-lg shadow-2xl px-8 py-5 bg-foreground-300/30">
                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-bold">Welcome Back</h2>
                        <p className="text-foreground-100">Please enter your details to sign in</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {formFields.map((field) => (
                            <div key={field.name}>
                                <div className="p-0.5">
                                    <input
                                        {...register(field.name, field.validation)}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        className="w-full bg-foreground-300/30 p-3.5 rounded-lg border border-foreground-300/40 focus:ring-2 focus:ring-foreground-300/60 focus:outline-hidden"
                                    />
                                </div>
                                {errors[field.name] && (
                                    <div className="text-sm text-red-500 mt-1 -mb-3 ml-2">
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
                            <Link to="#" className="text-foreground-100 hover:text-foreground-200 transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-400 text-foreground-900 hover:bg-primary-600 rounded-lg py-4 font-bold transition-colors cursor-pointer"
                        >
                            <span>{isLoading ? 'Log in...' : 'Log In'}</span>
                        </button>
                    </form>

                    <p className="mt-2 text-center text-sm text-foreground-100">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary-400 hover:text-primary-500 font-semibold transition-colors">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;