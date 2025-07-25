import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import {
    Users,
    Mail,
    Lock,
    LogIn,
    Shield,
    CheckCircle,
    Loader2,
    FileText,
    TrendingUp,
} from "lucide-react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen flex">
                {/* Left side - HR Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-purple-600 to-primary relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0">
                        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-white bg-opacity-10 rounded-full animate-pulse"></div>
                        <div
                            className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-indigo-300 bg-opacity-20 rounded-full animate-bounce"
                            style={{ animationDuration: "3s" }}
                        ></div>
                        <div
                            className="absolute top-1/2 left-1/2 w-24 h-24 bg-purple-300 bg-opacity-15 rounded-full animate-ping"
                            style={{ animationDuration: "4s" }}
                        ></div>
                        <div className="absolute top-20 right-20 w-16 h-16 bg-blue-300 bg-opacity-25 rounded-full"></div>
                    </div>

                    <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
                        {/* Company Logo/Brand */}
                        <div className="mb-12">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                    <Users className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">
                                        HRConnect
                                    </h1>
                                    <p className="text-indigo-200 text-sm">
                                        Human Resource Management
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* HR Illustration */}
                        <div className="mb-12">
                            <div className="w-80 h-56 bg-white bg-opacity-10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-20">
                                <div className="text-center space-y-6">
                                    {/* Employee icons */}
                                    <div className="flex justify-center space-x-4">
                                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                            <Users className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="w-12 h-12 bg-white bg-opacity-30 rounded-full flex items-center justify-center">
                                            <FileText className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {/* HR Features */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center space-x-2 text-sm">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span className="text-white opacity-90">
                                                Employee Management
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center space-x-2 text-sm">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span className="text-white opacity-90">
                                                Leave Tracking
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center space-x-2 text-sm">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span className="text-white opacity-90">
                                                Performance Reviews
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Welcome message */}
                        <div className="text-center max-w-lg">
                            <h2 className="text-4xl font-bold mb-6">
                                Welcome Back!
                            </h2>
                            <p className="text-indigo-100 text-lg leading-relaxed mb-2">
                                Manage your workforce efficiently with our
                                comprehensive HR platform.
                            </p>
                            <p className="text-indigo-200 text-base">
                                Streamline processes, boost productivity, and
                                enhance employee experience.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side - Login form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                            {/* Mobile logo */}
                            <div className="lg:hidden text-center mb-8">
                                <div className="flex items-center justify-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">
                                        HRConnect
                                    </span>
                                </div>
                            </div>

                            {/* Header */}
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                    Sign In
                                </h2>
                            </div>

                            {status && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-success mr-2" />
                                        <p className="text-sm text-green-800">
                                            {status}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                {/* Email field */}
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email Address"
                                        className="text-gray-700 font-semibold mb-2"
                                    />
                                    <div className="relative">
                                        <TextInput
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="block w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            placeholder="Enter your work email"
                                            autoComplete="username"
                                            isFocused={true}
                                            onChange={(e) =>
                                                setData("email", e.target.value)
                                            }
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Password field */}
                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                        className="text-gray-700 font-semibold mb-2"
                                    />
                                    <div className="relative">
                                        <TextInput
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="block w-full px-4 py-4 pl-12 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            onChange={(e) =>
                                                setData(
                                                    "password",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </div>
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                {/* Remember me & Forgot password */}
                                <div className="flex items-center justify-between pt-2">
                                    <label className="flex items-center group cursor-pointer">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData(
                                                    "remember",
                                                    (e.target.checked ||
                                                        false) as false
                                                )
                                            }
                                            className="rounded-md border-gray-300 text-primary shadow-sm focus:ring-primary transition-colors"
                                        />
                                        <span className="ml-3 text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                                            Keep me signed in
                                        </span>
                                    </label>
                                </div>

                                {/* Submit button */}
                                <div className="pt-4">
                                    <PrimaryButton
                                        className="w-full justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                                Signing you in...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="w-5 h-5 mr-2" />
                                                Access Dashboard
                                            </>
                                        )}
                                    </PrimaryButton>
                                </div>
                            </form>

                            {/* Security notice */}
                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <div className="flex items-center justify-center text-xs text-gray-500">
                                    <Shield className="w-4 h-4 mr-2" />
                                    <span>
                                        Your data is protected with
                                        enterprise-grade security
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
