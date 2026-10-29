// Brand name shown across the UI; change it here to rename the service.
export const APP_NAME = "Interio";

// Timing Constants (in milliseconds)
export const SHARE_STATUS_RESET_DELAY_MS = 1500;
export const PROGRESS_INCREMENT = 15;
export const REDIRECT_DELAY_MS = 600;
export const PROGRESS_INTERVAL_MS = 100;
export const PROGRESS_STEP = 5;

// UI Constants
export const GRID_OVERLAY_SIZE = "60px 60px";
export const GRID_COLOR = "#3B82F6";

// HTTP Status Codes
export const UNAUTHORIZED_STATUSES = [401, 403];

// Image Dimensions
export const IMAGE_RENDER_DIMENSION = 1024;

export const ROOMIFY_RENDER_PROMPT = `
TASK: Convert the input 2D floor plan into a **photorealistic, top‑down 3D architectural render**.

STRICT REQUIREMENTS (do not violate):
1) **REMOVE ALL TEXT**: Do not render any letters, numbers, labels, dimensions, or annotations. Floors must be continuous where text used to be.
2) **GEOMETRY MUST MATCH**: Walls, rooms, doors, and windows must follow the exact lines and positions in the plan. Do not shift or resize.
3) **TOP‑DOWN ONLY**: Orthographic top‑down view. No perspective tilt.
4) **CLEAN, REALISTIC OUTPUT**: Crisp edges, balanced lighting, and realistic materials. No sketch/hand‑drawn look.
5) **NO EXTRA CONTENT**: Do not add rooms, furniture, or objects that are not clearly indicated by the plan.

STRUCTURE & DETAILS:
- **Walls**: Extrude precisely from the plan lines. Consistent wall height and thickness.
- **Doors**: Convert door swing arcs into open doors, aligned to the plan.
- **Windows**: Convert thin perimeter lines into realistic glass windows.

FURNITURE & ROOM MAPPING (only where icons/fixtures are clearly shown):
- Bed icon → realistic bed with duvet and pillows.
- Sofa icon → modern sectional or sofa.
- Dining table icon → table with chairs.
- Kitchen icon → counters with sink and stove.
- Bathroom icon → toilet, sink, and tub/shower.
- Office/study icon → desk, chair, and minimal shelving.
- Porch/patio/balcony icon → outdoor seating or simple furniture (keep minimal).
- Utility/laundry icon → washer/dryer and minimal cabinetry.

STYLE & LIGHTING:
- Lighting: bright, neutral daylight. High clarity and balanced contrast.
- Materials: realistic wood/tile floors, clean walls, subtle shadows.
- Finish: professional architectural visualization; no text, no watermarks, no logos.
`.trim();

// Project types: a floor plan turned into a 3D view, or a room photo restyled by AI.
export const PROJECT_KINDS = ["floorplan", "room"] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

export const MAX_ROOM_INSTRUCTIONS_LENGTH = 500;

// Interior styles offered for room photos; `prompt` is what the image model gets.
export const ROOM_STYLES = [
    { id: "modern", label: "Moderní", hint: "Čisté linie, neutrální barvy", prompt: "contemporary modern: clean lines, neutral palette with warm accents, sleek low-profile furniture, matte finishes, integrated lighting" },
    { id: "scandinavian", label: "Skandinávský", hint: "Světlé dřevo, bílá, útulno", prompt: "Scandinavian: light oak wood, white and soft grey walls, cozy wool and linen textiles, simple functional furniture, plants, lots of daylight" },
    { id: "japandi", label: "Japandi", hint: "Klid, přírodní materiály", prompt: "Japandi: calm minimal Japanese-Scandinavian blend, natural wood, rattan and linen, earthy muted tones, low furniture, uncluttered surfaces" },
    { id: "industrial", label: "Industriální", hint: "Beton, kov, cihla", prompt: "industrial loft: exposed brick or concrete, black metal frames, leather and reclaimed wood, Edison-style pendant lights" },
    { id: "minimalist", label: "Minimalistický", hint: "Jen to podstatné", prompt: "minimalist: very few carefully chosen pieces, monochrome palette, hidden storage, empty surfaces, soft diffuse light" },
    { id: "boho", label: "Boho", hint: "Vzory, rostliny, textil", prompt: "bohemian: layered patterned rugs and textiles, macrame, rattan, many plants, warm terracotta and ochre tones" },
    { id: "classic", label: "Klasický", hint: "Elegance, lišty, teplé tóny", prompt: "classic elegant: wall moulding, herringbone parquet, upholstered furniture, brass details, warm creamy palette" },
    { id: "rustic", label: "Venkovský", hint: "Masivní dřevo, přírodní kámen", prompt: "rustic farmhouse: solid reclaimed wood, natural stone, beams, cosy textiles, warm earthy colours" },
] as const;

export type RoomStyleId = (typeof ROOM_STYLES)[number]["id"];

export const findRoomStyle = (id: string | null | undefined) => ROOM_STYLES.find((style) => style.id === id) ?? null;

// Prompt for redesigning a room photo; the room's shape and the camera stay, the interior changes.
export const buildRoomRedesignPrompt = ({ style, instructions }: { style?: string | null; instructions?: string | null }) => {
    const preset = findRoomStyle(style);
    const request = instructions?.trim();

    return `
TASK: Redesign the interior shown in the input photo and return a **photorealistic photo of the same room** after the redesign.

KEEP EXACTLY (do not violate):
1) Same room: walls, ceiling, floor area, windows, doors, radiators and built-in architecture stay where they are, with the same proportions.
2) Same camera: identical viewpoint, angle, lens and framing as the input photo. Do not crop, zoom or rotate.
3) Photorealism: it must look like a real photograph taken by an interior photographer, not a 3D render or illustration.
4) No text, watermarks, logos or labels anywhere in the image.

CHANGE:
- Furniture, decor, textiles, lighting fixtures, wall colours, wall coverings and floor finishes, so the room matches the requested design.
- If the room is empty, unfinished or under construction, finish it (walls, floor, ceiling) and furnish it in a way that fits the room's likely purpose and size.
- Remove clutter, mess and construction materials.
${preset ? `\nSTYLE: ${preset.prompt}.` : ""}${request ? `\nCLIENT REQUEST (follow it closely; it may be written in Czech): "${request}"` : ""}

LIGHTING & FINISH: natural daylight from the existing windows, balanced exposure, realistic shadows and reflections, sharp detail.
`.trim();
};
