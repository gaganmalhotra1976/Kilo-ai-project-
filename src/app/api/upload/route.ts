import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const MAX_DESKTOP_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_MOBILE_BYTES = 1 * 1024 * 1024;  // 1 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const variant = (formData.get("variant") as string) ?? "desktop"; // "desktop" | "mobile"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG and PNG files are allowed" },
        { status: 400 }
      );
    }

    const maxBytes = variant === "mobile" ? MAX_MOBILE_BYTES : MAX_DESKTOP_BYTES;
    if (file.size > maxBytes) {
      const limitMB = maxBytes / (1024 * 1024);
      return NextResponse.json(
        { error: `File too large. Maximum size for ${variant} is ${limitMB} MB` },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const ext = file.type === "image/png" ? "png" : "jpg";
    const filename = `${variant}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filepath = join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
