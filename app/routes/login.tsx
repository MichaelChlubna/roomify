import type { Route } from "./+types/login";
import {useEffect, useState} from "react";
import {Link, useNavigate, useOutletContext} from "react-router";
import Button from "../../components/ui/Button";
import {APP_NAME} from "../../lib/constants";
import {register, signIn} from "../../lib/api";

export function meta({}: Route.MetaArgs) {
    return [{ title: `Přihlášení | ${APP_NAME}` }];
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
            setError(err instanceof Error ? err.message : "Něco se pokazilo");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "auth-input";

    return (
        <div className="auth-page">
            <div className="auth-card">
                <Link to="/" className="flex items-center gap-2.5 mb-7">
                    <span className="logo-mark">{APP_NAME[0]}</span>
                    <span className="text-lg font-bold">{APP_NAME}</span>
                </Link>

                <h1 className="text-[28px] font-bold mb-1.5">{isRegister ? "Vytvořit účet" : "Vítejte zpět"}</h1>
                <p className="text-[15px] text-subtle-foreground mb-6">
                    {isRegister ? "Začněte měnit půdorysy na 3D vizualizace." : "Přihlaste se ke svým projektům."}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                    {isRegister && (
                        <input className={inputClass} placeholder="Jméno" value={name}
                               onChange={(e) => setName(e.target.value)} autoComplete="name" />
                    )}
                    <input className={inputClass} type="email" placeholder="E-mail" value={email} required
                           onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                    <input className={inputClass} type="password" placeholder="Heslo" value={password} required
                           minLength={isRegister ? 8 : undefined}
                           onChange={(e) => setPassword(e.target.value)}
                           autoComplete={isRegister ? "new-password" : "current-password"} />

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    <Button type="submit" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? "Chvilku…" : isRegister ? "Vytvořit účet" : "Přihlásit se"}
                    </Button>
                </form>

                {(allowRegistration || isRegister) && (
                    <p className="text-sm text-muted-foreground mt-6 text-center">
                        {isRegister ? "Už máte účet?" : "Ještě nemáte účet?"}{" "}
                        <button type="button" className="text-primary font-semibold"
                                onClick={() => { setMode(isRegister ? "login" : "register"); setError(null); }}>
                            {isRegister ? "Přihlásit se" : "Zaregistrovat"}
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}
