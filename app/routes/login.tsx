import type { Route } from "./+types/login";
import {useEffect, useState} from "react";
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

    const [allowRegistration, setAllowRegistration] = useState(false);

    useEffect(() => {
        fetch("/api/auth")
            .then((res) => res.json())
            .then((data) => setAllowRegistration(!!data?.allowRegistration))
            .catch(() => setAllowRegistration(false));
    }, []);

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

    const inputClass = "auth-input";

    return (
        <div className="auth-page">
            <div className="auth-card">
                <Link to="/" className="flex items-center gap-2.5 mb-7">
                    <span className="logo-mark">R</span>
                    <span className="text-lg font-bold">Roomify</span>
                </Link>

                <h1 className="text-[28px] font-bold mb-1.5">{isRegister ? "Create an account" : "Welcome back"}</h1>
                <p className="text-[15px] text-subtle-foreground mb-6">
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

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
                    </Button>
                </form>

                {(allowRegistration || isRegister) && (
                    <p className="text-sm text-muted-foreground mt-6 text-center">
                        {isRegister ? "Already have an account?" : "No account yet?"}{" "}
                        <button type="button" className="text-primary font-semibold"
                                onClick={() => { setMode(isRegister ? "login" : "register"); setError(null); }}>
                            {isRegister ? "Sign in" : "Create one"}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
