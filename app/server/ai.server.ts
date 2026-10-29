import { ROOMIFY_RENDER_PROMPT } from "../../lib/constants";
import { closestAspect } from "./image-size.server";

// Output shapes each provider supports; the render keeps the floor plan's proportions.
const GEMINI_ASPECTS = {
    "1:1": 1, "4:3": 4 / 3, "3:4": 3 / 4, "3:2": 3 / 2, "2:3": 2 / 3,
    "5:4": 5 / 4, "4:5": 4 / 5, "16:9": 16 / 9, "9:16": 9 / 16, "21:9": 21 / 9,
};
const OPENAI_SIZES = { "1024x1024": 1, "1536x1024": 1.5, "1024x1536": 2 / 3 };

type RenderInput = { image: Buffer; mimeType: string };
type RenderOutput = { image: Buffer; mimeType: string };

export type AiProvider = "gemini" | "openai";

export const getAiProvider = (): AiProvider =>
    process.env.AI_PROVIDER?.toLowerCase() === "openai" ? "openai" : "gemini";

const requireEnv = (name: string) => {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not set`);
    return value;
};

// Gemini image model (aka "Nano Banana"): edits the floor plan image directly.
const renderWithGemini = async ({ image, mimeType }: RenderInput): Promise<RenderOutput> => {
    const apiKey = requireEnv("GEMINI_API_KEY");
    const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite-image";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: ROOMIFY_RENDER_PROMPT },
                    { inline_data: { mime_type: mimeType, data: image.toString("base64") } },
                ],
            }],
            generationConfig: {
                responseModalities: ["IMAGE"],
                imageConfig: { aspectRatio: closestAspect(image, GEMINI_ASPECTS, "1:1") },
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini request failed (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((part) => part.inlineData?.data || part.inline_data?.data);
    const inline = imagePart?.inlineData ?? imagePart?.inline_data;

    if (!inline?.data) throw new Error("Gemini returned no image");

    return {
        image: Buffer.from(inline.data, "base64"),
        mimeType: inline.mimeType ?? inline.mime_type ?? "image/png",
    };
};

// OpenAI image edit endpoint (gpt-image-1 family).
const renderWithOpenAI = async ({ image, mimeType }: RenderInput): Promise<RenderOutput> => {
    const apiKey = requireEnv("OPENAI_API_KEY");
    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
    const ext = mimeType.split("/")[1] ?? "png";

    const form = new FormData();
    form.append("model", model);
    form.append("prompt", ROOMIFY_RENDER_PROMPT);
    form.append("size", closestAspect(image, OPENAI_SIZES, "1024x1024"));
    form.append("image", new Blob([new Uint8Array(image)], { type: mimeType }), `floorplan.${ext}`);

    const response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
    });

    if (!response.ok) {
        throw new Error(`OpenAI request failed (${response.status}): ${await response.text()}`);
    }

    const data = await response.json();
    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image");

    return { image: Buffer.from(b64, "base64"), mimeType: "image/png" };
};

export const renderFloorPlan = (input: RenderInput) =>
    getAiProvider() === "openai" ? renderWithOpenAI(input) : renderWithGemini(input);
