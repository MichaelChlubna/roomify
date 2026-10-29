import type { Route } from "./+types/login";
import {Box} from "lucide-react";
import {useState} from "react";
import {Link, useNavigate, useOutletContext} from "react-router";
import Button from "../../components/ui/Button";
import {register, signIn} from "../../lib/api";

export function meta({}: Route.MetaArgs) {
    return [{ title: "Sign in | Roomify" }];
}

export default function Login() {
    const navigate = useNavigate();
    const { refreshAuth } = useOutletContext<AuthContext>();

    const [mode, setMode] = useState<"login" | "register">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isRegister = mode === "register";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (isRegister) {
                await register({ name, email, password });
            } else {
                await signIn({ email, password });
            }

            await refreshAuth();
            navigate("/");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
                <Link to="/" className="flex items-center gap-2 mb-6">
                    <Box className="w-6 h-6 text-primary" />
                    <span className="font-serif text-2xl">Roomify</span>
                </Link>

                <h1 className="text-3xl mb-1">{isRegister ? "Create an account" : "Welcome back"}</h1>
                <p className="text-sm text-zinc-500 mb-6">
                    {isRegister ? "Start turning floor plans into 3D renders." : "Sign in to your projects."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {isRegister && (
                        <input className={inputClass} placeholder="Name" value={name}
                               onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    )}
                    <input className={inputClass} type="email" placeholder="Email" value={email} required
                           onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                    <input className={inputClass} type="password" placeholder="Password" value={password} required
                           minLength={isRegister ? 8 : undefined}
                           onChange={(e) => setPassword(e.target.value)}
                           autoComplete={isRegister ? "new-password" : "current-password"} />

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <Button type="submit" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
                    </Button>
                </form>

                <p className="text-sm text-zinc-500 mt-6 text-center">
                    {isRegister ? "Already have an account?" : "No account yet?"}{" "}
                    <button type="button" className="text-primary font-medium"
                            onClick={() => { setMode(isRegister ? "login" : "register"); setError(null); }}>
                        {isRegister ? "Sign in" : "Create one"}
                    </button>
                </p>
            </div>
        </div>
    );
}
