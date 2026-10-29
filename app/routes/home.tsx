import type { Route } from "./+types/home";
import Navbar from "../../components/Navbar";
import {ArrowRight, ArrowUpRight, Clock, Layers} from "lucide-react";
import Upload from "../../components/Upload";
import {useNavigate, useOutletContext} from "react-router";
import {useEffect, useRef, useState} from "react";
import {createProject, getProjects} from "../../lib/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Roomify" },
    { name: "description", content: "Turn 2D floor plans into photorealistic 3D renders." },
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
            const name = `Residence ${new Date().toLocaleDateString()}`;

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
                  <p>AI floor plan visualization</p>
              </div>

              <h1>Turn a floor plan into a <em>3D render</em></h1>

              <p className="subtitle">
                  Upload a 2D floor plan and get a photorealistic top-down render with walls, doors, windows and furniture in under a minute.
              </p>

              <div className="actions">
                  <a href="#upload" className="cta">
                      Start Building <ArrowRight className="icon" />
                  </a>

                  <a href="#projects" className="btn btn--outline btn--lg">
                      My projects
                  </a>
              </div>

              <div id="upload" className="upload-shell">
                <div className="grid-overlay" />

                  <div className="upload-card">
                      <div className="upload-head">
                          <div className="upload-icon">
                              <Layers className="icon" />
                          </div>

                          <h3>Upload your floor plan</h3>
                          <p>Supports JPG, PNG, formats up to 10MB</p>
                      </div>

                      <Upload onComplete={handleUploadComplete} />
                  </div>
              </div>
          </section>

          <section id="projects" className="projects">
              <div className="section-inner">
                  <div className="section-head">
                      <div className="copy">
                          <h2>Projects</h2>
                          <p>Your latest work, all in one place.</p>
                      </div>
                  </div>

                  <div className="projects-grid">
                      {projects.map(({id, name, renderedImage, sourceImage, timestamp, isPublic}) => (
                          <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`)}>
                              <div className="preview">
                                  <img  src={renderedImage || sourceImage} alt="Project"
                                  />

                                  <div className="badge">
                                      <span>{isPublic ? 'Public' : 'Private'}</span>
                                  </div>
                              </div>

                              <div className="card-body">
                                  <div>
                                      <h3>{name}</h3>

                                      <div className="meta">
                                          <Clock size={12} />
                                          <span>{new Date(timestamp).toLocaleDateString()}</span>
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
