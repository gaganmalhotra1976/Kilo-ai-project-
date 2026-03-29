import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { temp_docs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documentId = parseInt(id, 10);

    const [doc] = await db
      .select()
      .from(temp_docs)
      .where(eq(temp_docs.id, documentId));

    if (!doc || doc.documentType !== "vaccination_certificate") {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    const certData = doc.metadata ? JSON.parse(doc.metadata) : null;

    return NextResponse.json(certData);
  } catch (err) {
    console.error("Certificate fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch certificate" }, { status: 500 });
  }
}
