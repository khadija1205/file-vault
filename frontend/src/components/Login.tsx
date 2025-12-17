import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLogin } from '../hooks/useAuth';
import { loginSchema, type LoginInput } from '../schemas/auth';
import { Link } from 'react-router-dom';

export const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema)
    });

    const { mutate, isPending } = useLogin();

    const onSubmit = (data: LoginInput) => {
        console.log('Form submitted with data:', data); // Debug log
        mutate(data);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
                <h2 className="text-3xl font-bold mb-6 text-center">File Sharing Login</h2>
                {/* (data) => mutate(data) */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>

                    <div>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isPending ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-4 text-center">
                    Don't have an account?
                    <Link to="/register" className="text-blue-600 hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};
