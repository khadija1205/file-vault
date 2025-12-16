import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegister } from '../hooks/useAuth';
import { registerSchema, type RegisterInput } from '../schemas/auth';
import { Link } from 'react-router-dom';

export const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema)
    });

    const { mutate, isPending } = useRegister();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
                <h2 className="text-3xl font-bold mb-6 text-center">File Sharing</h2>

                <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
                    <div>
                        <input
                            {...register('username')}
                            placeholder="Username"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                        />
                        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                    </div>

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

                    <div>
                        <input
                            {...register('confirmPassword')}
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isPending ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <p>
                    Already have an account?
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};
