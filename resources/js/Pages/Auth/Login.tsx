import Checkbox from "@/Components/Checkbox";
import PrimaryButton from "@/Components/PrimaryButton";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import { FloatingInput } from "@/Components/UI/FloatingInput";
import toast from "react-hot-toast";
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
    Eye,
    EyeOff,
} from "lucide-react";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword?: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<"email" | "password">("email");

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.email) {
            setStep("password");
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
            onError: (errors) => {
                if (errors.email) {
                    toast.error(errors.email);
                } else if (errors.password) {
                    toast.error(errors.password);
                } else {
                    toast.error("Login failed. Please check your credentials.");
                }
            },
        });
    };

    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen flex">
                {/* Left side - HR Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary relative overflow-hidden">
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
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                                            <span className="text-white opacity-90">
                                                Leave Tracking
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center space-x-2 text-sm">
                                            <div className="w-2 h-2 bg-primary rounded-full"></div>
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
                                <p className="text-gray-500 font-medium">
                                    Enter your email to continue
                                </p>
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

                            <form onSubmit={step === "email" ? handleNext : submit} className="space-y-6">
                                {step === "email" ? (
                                    <>
                                        {/* Step 1: Email Address */}
                                        <div className="space-y-4">
                                            <FloatingInput
                                                id="email"
                                                type="email"
                                                label="Email"
                                                value={data.email}
                                                icon={<Mail className="h-5 w-5" />}
                                                error={errors.email}
                                                autoComplete="username"
                                                isFocused={true}
                                                onChange={(e) =>
                                                    setData("email", e.target.value)
                                                }
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <PrimaryButton
                                                className="w-full justify-center py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all duration-200 active:transform active:scale-[0.98]"
                                                type="submit"
                                            >
                                                Next
                                            </PrimaryButton>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Step 2: Password */}
                                        <div className="mb-6 flex items-center justify-between px-4 py-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                                            <div className="flex items-center space-x-3 overflow-hidden">
                                                <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                <div className="w-[1px] h-6 bg-gray-200" />
                                                <span className="text-base font-medium text-gray-500 truncate">
                                                    {data.email}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setStep("email")}
                                                className="text-sm font-bold text-primary hover:text-primary transition-colors px-2"
                                            >
                                                Edit
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative">
                                                <FloatingInput
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    label="Password"
                                                    value={data.password}
                                                    icon={<Lock className="h-5 w-5" />}
                                                    error={errors.password}
                                                    autoComplete="current-password"
                                                    isFocused={true}
                                                    onChange={(e) =>
                                                        setData("password", e.target.value)
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-5 text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <Checkbox
                                                name="remember"
                                                checked={data.remember}
                                                onChange={(e) =>
                                                    setData(
                                                        "remember",
                                                        e.target.checked
                                                    )
                                                }
                                                className="rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                                            />
                                            <span className="ml-2 text-sm text-gray-600 font-medium">
                                                Keep me signed in
                                            </span>
                                        </div>

                                        <div className="pt-2">
                                            <PrimaryButton
                                                className="w-full justify-center py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all duration-200 active:transform active:scale-[0.98] disabled:opacity-70"
                                                disabled={processing}
                                                type="submit"
                                            >
                                                {processing ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                        Logging in...
                                                    </>
                                                ) : (
                                                    <>
                                                        <LogIn className="w-5 h-5 mr-2" />
                                                        Sign In
                                                    </>
                                                )}
                                            </PrimaryButton>
                                        </div>
                                    </>
                                )}
                            </form>
                        </div>

                        {/* Security trust badge */}
                        <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                Secure Enterprise Authentication
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
