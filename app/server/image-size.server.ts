// Reads pixel dimensions from PNG, JPEG and WebP headers without decoding the image.
export const getImageSize = (buf: Buffer): { width: number; height: number } | null => {
    // PNG: IHDR chunk right after the 8-byte signature
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
        return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }

    // JPEG: walk segments until a start-of-frame marker
    if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
        let offset = 2;
        while (offset + 9 < buf.length) {
            if (buf[offset] !== 0xff) return null;
            const marker = buf[offset + 1];
            const length = buf.readUInt16BE(offset + 2);
            const isSof = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
            if (isSof) return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
            offset += 2 + length;
        }
        return null;
    }

    // WebP: RIFF container with VP8 / VP8L / VP8X chunk
    if (buf.length > 30 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
        const chunk = buf.toString("ascii", 12, 16);
        if (chunk === "VP8 ") return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
        if (chunk === "VP8L") {
            const bits = buf.readUInt32LE(21);
            return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
        }
        if (chunk === "VP8X") return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
    }

    return null;
};

/** Picks the option whose width/height ratio is closest to the image's. */
export const closestAspect = <T extends string>(buf: Buffer, options: Record<T, number>, fallback: T): T => {
    const size = getImageSize(buf);
    if (!size || !size.width || !size.height) return fallback;

    const ratio = size.width / size.height;
    let best = fallback;
    for (const key of Object.keys(options) as T[]) {
        if (Math.abs(Math.log(options[key] / ratio)) < Math.abs(Math.log(options[best] / ratio))) best = key;
    }
    return best;
};
