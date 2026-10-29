import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowRight, ArrowUpRight, Clock, Layers} from "lucide-react";
import Upload from "../../components/Upload";
import {useNavigate, useOutletContext} from "react-router";
import {useEffect, useRef, useState} from "react";
import {createProject, getProjects} from "../../lib/api";
import {APP_NAME} from "../../lib/constants";

export function meta({}: Route.MetaArgs) {
  return [
    { title: `${APP_NAME} | Vizualizace půdorysů` },
    { name: "description", content: "Z 2D půdorysu fotorealistická 3D vizualizace za necelou minutu." },
  ];
}

export default function Home() {
    const navigate = useNavigate();
    const { isSignedIn } = useOutletContext<AuthContext>();
    const [projects, setProjects] = useState<DesignItem[]>([]);
    const isCreatingProjectRef = useRef(false);

    const handleUploadComplete = async (base64Image: string) => {
        try {

            if(isCreatingProjectRef.current) return false;
            isCreatingProjectRef.current = true;
            const name = `Byt ${new Date().toLocaleDateString('cs-CZ')}`;

            const saved = await createProject({ name, sourceImage: base64Image });

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
                  <p>AI vizualizace půdorysů</p>
              </div>

              <h1>Z půdorysu <em>3D vizualizace</em></h1>

              <p className="subtitle">
                  Nahrajte 2D půdorys a za necelou minutu dostanete fotorealistický pohled shora se stěnami, dveřmi, okny i nábytkem.
              </p>

              <div className="actions">
                  <a href="#upload" className="cta">
                      Nahrát půdorys <ArrowRight className="icon" />
                  </a>

                  <a href="#projects" className="btn btn--outline btn--lg">
                      Moje projekty
                  </a>
              </div>

              <div id="upload" className="upload-shell">
                <div className="grid-overlay" />

                  <div className="upload-card">
                      <div className="upload-head">
                          <div className="upload-icon">
                              <Layers className="icon" />
                          </div>

                          <h3>Nahrajte půdorys</h3>
                          <p>Formáty JPG, PNG a WebP do 10 MB</p>
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
                      {projects.map(({id, name, renderedImage, sourceImage, timestamp, isPublic}) => (
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
