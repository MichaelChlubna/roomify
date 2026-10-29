import { useNavigate, useOutletContext, useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import {Check, Copy, Download, RefreshCcw, Share2, Sparkles, X} from "lucide-react";
import Button from "../../components/ui/Button";
import {getProjectById, renderProject, setProjectVisibility} from "../../lib/api";
import {APP_NAME, findRoomStyle, MAX_ROOM_INSTRUCTIONS_LENGTH, ROOM_STYLES, SHARE_STATUS_RESET_DELAY_MS} from "../../lib/constants";
import {ReactCompareSlider, ReactCompareSliderImage} from "react-compare-slider";

const VisualizerId = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userId } = useOutletContext<AuthContext>()

    const hasInitialGenerated = useRef(false);

    const [project, setProject] = useState<DesignItem | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);
    const isOwner = !!project && project.ownerId === userId;
    const isRoom = project?.kind === "room";

    // Room photos: the style and request for the next render, prefilled from the last one.
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [instructions, setInstructions] = useState("");
    const canDesign = !!selectedStyle || !!instructions.trim();
    const appliedStyle = findRoomStyle(project?.style);

    const [isProcessing, setIsProcessing] = useState(false);
    const [renderError, setRenderError] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
    // Width/height of the floor plan; the comparison box takes this shape so neither image is cropped.
    const [sourceRatio, setSourceRatio] = useState<number | null>(null);

    useEffect(() => {
        if (!project?.sourceImage) return;

        const img = new Image();
        img.onload = () => setSourceRatio(img.naturalWidth / img.naturalHeight || null);
        img.src = project.sourceImage;
    }, [project?.sourceImage]);

    const shareUrl = typeof window !== "undefined" && id ? `${window.location.origin}/visualizer/${id}` : "";

    const copyShareUrl = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setShareStatus("done");
            setTimeout(() => setShareStatus("idle"), SHARE_STATUS_RESET_DELAY_MS);
        } catch {
            setShareStatus("idle");
        }
    }

    const handleShare = async () => {
        if (!project) return;

        try {
            if (!project.isPublic) {
                setShareStatus("saving");
                setProject(await setProjectVisibility({ id: project.id, isPublic: true }));
            }
            await copyShareUrl();
        } catch (error) {
            console.error('Share failed: ', error);
            setShareStatus("idle");
        }
    }

    const handleUnshare = async () => {
        if (!project) return;

        try {
            setProject(await setProjectVisibility({ id: project.id, isPublic: false }));
        } catch (error) {
            console.error('Unshare failed: ', error);
        }
    }

    const handleBack = () => navigate('/');
    const handleExport = () => {
        if (!currentImage) return;

        const link = document.createElement('a');
        link.href = currentImage;
        link.download = `${isRoom ? 'navrh' : 'vizualizace'}-${id || 'projekt'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const runGeneration = async (item: DesignItem) => {
        if(!id || !item.sourceImage) return;

        try {
            setIsProcessing(true);
            setRenderError(null);
            const updated = item.kind === "room"
                ? await renderProject({ id: item.id, style: selectedStyle, instructions: instructions.trim() })
                : await renderProject({ id: item.id });

            setProject(updated);
            setCurrentImage(updated.renderedImage || null);
        } catch (error) {
            console.error('Generation failed: ', error)
            setRenderError(error instanceof Error ? error.message : 'Vizualizaci se nepodařilo vytvořit.');
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        let isMounted = true;

        const loadProject = async () => {
            if (!id) {
                setIsProjectLoading(false);
                return;
            }

            setIsProjectLoading(true);

            const fetchedProject = await getProjectById({ id });

            if (!isMounted) return;

            setProject(fetchedProject);
            setCurrentImage(fetchedProject?.renderedImage || null);
            setSelectedStyle(fetchedProject?.style ?? null);
            setInstructions(fetchedProject?.instructions ?? "");
            setIsProjectLoading(false);
            hasInitialGenerated.current = false;
        };

        loadProject();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (
            isProjectLoading ||
            hasInitialGenerated.current ||
            !project?.sourceImage
        )
            return;

        if (project.renderedImage) {
            setCurrentImage(project.renderedImage);
            hasInitialGenerated.current = true;
            return;
        }

        // Room photos wait for the owner to pick a style first.
        if (!isOwner || project.kind === "room") return;

        hasInitialGenerated.current = true;
        void runGeneration(project);
    }, [project, isProjectLoading, isOwner]);

    return (
        <div className="visualizer">
            <nav className="topbar">
                <div className="topbar-inner">
                    <div className="brand" onClick={handleBack}>
                        <span className="logo-mark">{APP_NAME[0]}</span>
                        <span className="name">{APP_NAME}</span>
                    </div>
                    <Button variant="ghost" size="md" onClick={handleBack} className="exit">
                        <X className="icon" /> Zavřít
                    </Button>
                </div>
            </nav>

            {!isProjectLoading && !project && (
                <section className="content">
                    <div className="panel not-found">
                        <h2>Projekt nenalezen</h2>
                        <p>Projekt neexistuje, nebo ho autor přestal sdílet.</p>
                    </div>
                </section>
            )}

            {project && (
            <section className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>{isRoom ? 'Návrh interiéru' : 'Projekt'}</p>
                            <h2>{project?.name || 'Projekt'}</h2>
                            <p className="note">
                                {isOwner ? 'Vytvořeno vámi' : `Sdíleno přes ${APP_NAME}`}
                                {isRoom && project.renderedImage && appliedStyle && ` · Styl ${appliedStyle.label.toLowerCase()}`}
                            </p>
                        </div>

                        <div className="panel-actions">
                            <Button
                                size="sm"
                                onClick={handleExport}
                                disabled={!currentImage}
                            >
                                <Download className="w-4 h-4" /> Stáhnout
                            </Button>
                            {isOwner && (
                                <Button variant="outline" size="sm" onClick={handleShare}
                                        disabled={!currentImage || shareStatus === "saving"}>
                                    {shareStatus === "done" ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                    {shareStatus === "done" ? 'Odkaz zkopírován' : 'Sdílet'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {isOwner && project?.isPublic && (
                        <div className="share-bar">
                            <span className="share-label">Sdíleno odkazem</span>
                            <input className="share-url" value={shareUrl} readOnly onFocus={(e) => e.target.select()} />
                            <Button variant="outline" size="sm" onClick={copyShareUrl}>
                                <Copy className="w-4 h-4" /> Kopírovat
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleUnshare}>
                                Zrušit sdílení
                            </Button>
                        </div>
                    )}

                    {isRoom && isOwner && (
                        <div className="design-controls">
                            <div className="design-label">
                                <span>Styl</span>
                                <span className="hint">Vyberte jeden, nebo jen napište, co chcete</span>
                            </div>
                            <div className="style-grid">
                                {ROOM_STYLES.map((style) => (
                                    <button
                                        key={style.id}
                                        type="button"
                                        className={`style-chip ${selectedStyle === style.id ? 'is-active' : ''}`}
                                        aria-pressed={selectedStyle === style.id}
                                        disabled={isProcessing}
                                        onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id)}
                                    >
                                        <span className="label">{style.label}</span>
                                        <span className="hint">{style.hint}</span>
                                    </button>
                                ))}
                            </div>

                            <label className="design-label" htmlFor="design-instructions">
                                <span>Vlastní zadání</span>
                                <span className="hint">Nepovinné</span>
                            </label>
                            <textarea
                                id="design-instructions"
                                className="design-input"
                                rows={2}
                                maxLength={MAX_ROOM_INSTRUCTIONS_LENGTH}
                                placeholder="Např. zelená pohovka, dřevěná podlaha, víc rostlin, pracovní kout u okna"
                                value={instructions}
                                disabled={isProcessing}
                                onChange={(e) => setInstructions(e.target.value)}
                            />

                            <div className="design-submit">
                                <Button onClick={() => runGeneration(project)} disabled={!canDesign || isProcessing}>
                                    <Sparkles className="w-4 h-4" />
                                    {currentImage ? 'Vytvořit nový návrh' : 'Vytvořit návrh'}
                                </Button>
                                {currentImage && <span className="hint">Nový návrh nahradí ten současný.</span>}
                            </div>
                        </div>
                    )}

                    <div className={`render-area ${isProcessing ? 'is-processing': ''}`}>
                        {currentImage ? (
                            <img src={currentImage} alt={isRoom ? 'AI návrh interiéru' : 'AI vizualizace'} className="render-img" />
                        ) : (
                            <div className="render-placeholder">
                                {project?.sourceImage && (
                                    <img src={project?.sourceImage} alt={isRoom ? 'Původní fotka' : 'Původní půdorys'}
                                         className={`render-fallback ${isRoom && !isProcessing ? 'is-photo' : ''}`} />
                                )}
                            </div>
                        )}

                        {isProcessing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCcw className="spinner" />
                                    <span className="title">{isRoom ? 'Navrhuji interiér…' : 'Vytvářím vizualizaci…'}</span>
                                    <span className="subtitle">Obvykle to trvá do minuty</span>
                                </div>
                            </div>
                        )}

                        {!isProcessing && renderError && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <span className="title">{isRoom ? 'Návrh se nepovedl' : 'Vizualizace se nepovedla'}</span>
                                    <span className="subtitle">{renderError}</span>
                                    {project && isOwner && (!isRoom || canDesign) && (
                                        <Button size="sm" className="mt-3" onClick={() => runGeneration(project)}>
                                            <RefreshCcw className="w-4 h-4" /> Zkusit znovu
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                <div className="panel compare">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Porovnání</p>
                            <h3>Před a po</h3>
                        </div>
                        <div className="hint">Táhněte pro porovnání</div>
                    </div>

                    <div className="compare-stage">
                        {project?.sourceImage && currentImage ? (
                            <ReactCompareSlider
                                defaultValue={50}
                                style={{ width: '100%', aspectRatio: sourceRatio ?? 1 }}
                                itemOne={
                                    <ReactCompareSliderImage src={project?.sourceImage} alt="před" style={{ objectFit: 'contain' }} />
                                }
                                itemTwo={
                                    <ReactCompareSliderImage src={currentImage || project?.renderedImage || ''} alt="po" style={{ objectFit: 'contain' }} />
                                }
                            />
                        ) : (
                            <div className="compare-fallback">
                                {project?.sourceImage && (
                                    <img src={project.sourceImage} alt="Před" className="compare-img" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
            )}
        </div>
    )
}
export default VisualizerId
