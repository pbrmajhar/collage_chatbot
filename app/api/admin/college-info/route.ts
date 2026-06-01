import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDatabaseConfigured } from "@/lib/database";
import { toAdminCollegeInfo, toContentLanguage } from "@/lib/college-info";
import { getPrisma } from "@/lib/prisma";

type CreateCollegeInfoBody = {
  content?: unknown;
  isActive?: unknown;
  language?: unknown;
  sortOrder?: unknown;
  title?: unknown;
};

function parseBody(body: CreateCollegeInfoBody) {
  const language = typeof body.language === "string" ? body.language : "ja";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const sortOrder =
    typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)
      ? body.sortOrder
      : 0;
  const isActive =
    typeof body.isActive === "boolean" ? body.isActive : true;

  return {
    content,
    isActive,
    language,
    sortOrder,
    title,
  };
}

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ items: [] });
  }

  const prisma = getPrisma();

  if (!prisma.collegeInfo) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.collegeInfo.findMany({
    orderBy: [{ language: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({
    items: items.map(toAdminCollegeInfo),
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 },
    );
  }

  const parsed = parseBody((await request.json()) as CreateCollegeInfoBody);

  if (!parsed.title || !parsed.content) {
    return NextResponse.json(
      { error: "Title and content are required." },
      { status: 400 },
    );
  }

  const prisma = getPrisma();

  if (!prisma.collegeInfo) {
    return NextResponse.json(
      { error: "Prisma Client is not generated for CollegeInfo yet." },
      { status: 500 },
    );
  }

  const item = await prisma.collegeInfo.create({
    data: {
      content: parsed.content,
      isActive: parsed.isActive,
      language: toContentLanguage(parsed.language),
      sortOrder: parsed.sortOrder,
      title: parsed.title,
    },
  });

  return NextResponse.json(
    { item: toAdminCollegeInfo(item) },
    { status: 201 },
  );
}
