import Button from "./ui/Button";
import {useOutletContext} from "react-router";
import {APP_NAME} from "../lib/constants";

const Navbar = () => {
    const { isSignedIn, userName, signIn, signOut } = useOutletContext<AuthContext>()

    const handleAuthClick = async () => {
        if(isSignedIn) {
            try {
                await signOut();
            } catch (e) {
                console.error(`Sign out failed: ${e}`);
            }

            return;
        }

        try {
            await signIn();
        } catch (e) {
            console.error(`Sign in failed: ${e}`);
        }
    };

    return (
        <header className="navbar">
            <nav className="inner">
                <div className="left">
                    <div className="brand">
                        <span className="logo-mark">{APP_NAME[0]}</span>

                        <span className="name">
                            {APP_NAME}
                        </span>
                    </div>

                    <div className="links">
                        <a href="/#upload">Nová vizualizace</a>
                        <a href="/#projects">Projekty</a>
                    </div>
                </div>

                <div className="actions">
                    {isSignedIn ? (
                        <>
                            <span className="greeting">
                                {userName ? `Ahoj, ${userName}` : 'Přihlášen'}
                            </span>

                            <Button variant="outline" size="md" onClick={handleAuthClick}>
                                Odhlásit
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleAuthClick} size="md" variant="ghost">
                                Přihlásit
                            </Button>

                            <a href="#upload" className="cta">Začít</a>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}

export default Navbar
