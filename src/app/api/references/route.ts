import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/references: Retrieve all references/citations for the authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const references = await prisma.reference.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    const mapped = references.map((r) => ({
      id: r.id,
      type: r.type,
      authors: typeof r.authors === "string" ? r.authors : Array.isArray(r.authors) ? r.authors.join(", ") : "",
      year: r.year || "",
      title: r.title,
      source: r.source || "",
      doi_url: r.doi_url || "",
    }));

    return NextResponse.json({ success: true, citations: mapped });
  } catch (error: any) {
    console.error("[References GET Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/references: Create or batch sync references for authenticated user
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();

    // If batch sync array provided
    if (Array.isArray(body.citations)) {
      for (const cit of body.citations) {
        if (!cit.title) continue;
        await prisma.reference.upsert({
          where: { id: cit.id },
          create: {
            id: cit.id,
            user_id: user.id,
            type: cit.type || "journal",
            title: cit.title,
            authors: cit.authors || "",
            year: cit.year || "",
            source: cit.source || "",
            doi_url: cit.doi_url || "",
          },
          update: {
            type: cit.type || "journal",
            title: cit.title,
            authors: cit.authors || "",
            year: cit.year || "",
            source: cit.source || "",
            doi_url: cit.doi_url || "",
          },
        });
      }
      return NextResponse.json({ success: true, count: body.citations.length });
    }

    // Single reference creation
    const { id, type, title, authors, year, source, doi_url } = body;
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const newRef = await prisma.reference.create({
      data: {
        id: id || undefined,
        user_id: user.id,
        type: type || "journal",
        title,
        authors: authors || "",
        year: year || "",
        source: source || "",
        doi_url: doi_url || "",
      },
    });

    return NextResponse.json({ success: true, reference: newRef });
  } catch (error: any) {
    console.error("[References POST Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/references: Delete a reference belonging to the authenticated user
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Delete strictly ensuring user_id matches
    await prisma.reference.deleteMany({
      where: {
        id,
        user_id: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[References DELETE Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
