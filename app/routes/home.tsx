import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowRight, ArrowUpRight, Clock, Layers, Sofa} from "lucide-react";
import Upload from "../../components/Upload";
import {useNavigate, useOutletContext} from "react-router";
import {useEffect, useRef, useState} from "react";
import {createProject, getProjects} from "../../lib/api";
import {APP_NAME, type ProjectKind} from "../../lib/constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${APP_NAME} | Vizualizace půdorysů a návrhy interiérů` },
    { name: "description", content: "Z 2D půdorysu 3D vizualizace, z fotky místnosti nový interiér. Za necelou minutu." },
  ];
}

export default function Home() {
    const navigate = useNavigate();
    const { isSignedIn } = useOutletContext<AuthContext>();
    const [projects, setProjects] = useState<DesignItem[]>([]);
    const isCreatingProjectRef = useRef(false);
    const [mode, setMode] = useState<ProjectKind>("room");

    const handleUploadComplete = async (base64Image: string) => {
        try {

            if(isCreatingProjectRef.current) return false;
            isCreatingProjectRef.current = true;
            const name = `${mode === "room" ? "Místnost" : "Byt"} ${new Date().toLocaleDateString('cs-CZ')}`;

            const saved = await createProject({ name, kind: mode, sourceImage: base64Image });

            if(!saved) {
                console.error("Failed to create project");
                return false;
            }

            setProjects((prev) => [saved, ...prev]);

            navigate(`/visualizer/${saved.id}`, {
                state: {
                    initialImage: saved.sourceImage,
                    initialRendered: saved.renderedImage || null,
                    name
                }
            });

            return true;
        } finally {
            isCreatingProjectRef.current = false;
        }
    }

    useEffect(() => {
        if (!isSignedIn) {
            setProjects([]);
            return;
        }

        const fetchProjects = async () => {
            const items = await getProjects();

            setProjects(items)
        }

        fetchProjects();
    }, [isSignedIn]);

  return (
      <div className="home">
          <Navbar />

          <section className="hero">
              <div className="announce">
                  <div className="dot" />
                  <p>AI návrhy interiérů</p>
              </div>

              <h1>Uvidíte, jak <em>to bude vypadat</em></h1>

              <p className="subtitle">
                  Vyfoťte místnost, vyberte styl a AI ji za necelou minutu zařídí. Nebo nahrajte 2D půdorys a dostanete 3D pohled shora.
              </p>

              <div className="actions">
                  <a href="#upload" className="cta">
                      Začít <ArrowRight className="icon" />
                  </a>

                  <a href="#projects" className="btn btn--outline btn--lg">
                      Moje projekty
                  </a>
              </div>

              <div id="upload" className="upload-shell">
                <div className="grid-overlay" />

                  <div className="upload-card">
                      <div className="mode-switch" role="tablist">
                          <button type="button" role="tab" aria-selected={mode === "room"}
                                  className={mode === "room" ? "is-active" : ""} onClick={() => setMode("room")}>
                              <Sofa size={16} /> Fotka místnosti
                          </button>
                          <button type="button" role="tab" aria-selected={mode === "floorplan"}
                                  className={mode === "floorplan" ? "is-active" : ""} onClick={() => setMode("floorplan")}>
                              <Layers size={16} /> Půdorys
                          </button>
                      </div>

                      <div className="upload-head">
                          <div className="upload-icon">
                              {mode === "room" ? <Sofa className="icon" /> : <Layers className="icon" />}
                          </div>

                          <h3>{mode === "room" ? "Nahrajte fotku místnosti" : "Nahrajte půdorys"}</h3>
                          <p>
                              {mode === "room"
                                  ? "Prázdná i zařízená místnost. Styl vyberete v dalším kroku."
                                  : "Z 2D plánu vznikne 3D pohled shora."}
                          </p>
                      </div>

                      <Upload onComplete={handleUploadComplete} />
                  </div>
              </div>
          </section>

          <section id="projects" className="projects">
              <div className="section-inner">
                  <div className="section-head">
                      <div className="copy">
                          <h2>Projekty</h2>
                          <p>Všechny vaše vizualizace na jednom místě.</p>
                      </div>
                  </div>

                  <div className="projects-grid">
                      {projects.map(({id, name, renderedImage, sourceImage, timestamp, isPublic, kind}) => (
                          <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`)}>
                              <div className="preview">
                                  <img  src={renderedImage || sourceImage} alt="Projekt"
                                  />

                                  <div className="badge">
                                      <span>{isPublic ? 'Veřejný' : 'Soukromý'}</span>
                                  </div>
                              </div>

                              <div className="card-body">
                                  <div>
                                      <h3>{name}</h3>

                                      <div className="meta">
                                          <span>{kind === 'room' ? 'Návrh interiéru' : 'Půdorys'}</span>
                                          <span aria-hidden>·</span>
                                          <Clock size={12} />
                                          <span>{new Date(timestamp).toLocaleDateString('cs-CZ')}</span>
                                      </div>
                                  </div>
                                  <div className="arrow">
                                      <ArrowUpRight size={18} />
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </section>
      </div>
  )
}
