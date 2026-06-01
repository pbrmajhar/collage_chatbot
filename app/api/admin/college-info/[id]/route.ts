import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isDatabaseConfigured } from "@/lib/database";
import { toAdminCollegeInfo, toContentLanguage } from "@/lib/college-info";
import { getPrisma } from "@/lib/prisma";

type UpdateCollegeInfoBody = {
  content?: unknown;
  isActive?: unknown;
  language?: unknown;
  sortOrder?: unknown;
  title?: unknown;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  const body = (await request.json()) as UpdateCollegeInfoBody;
  const data: {
    content?: string;
    isActive?: boolean;
    language?: ReturnType<typeof toContentLanguage>;
    sortOrder?: number;
    title?: string;
  } = {};

  if (typeof body.title === "string") {
    data.title = body.title.trim();
  }

  if (typeof body.content === "string") {
    data.content = body.content.trim();
  }

  if (typeof body.language === "string") {
    data.language = toContentLanguage(body.language);
  }

  if (typeof body.isActive === "boolean") {
    data.isActive = body.isActive;
  }

  if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)) {
    data.sortOrder = body.sortOrder;
  }

  if (data.title === "" || data.content === "") {
    return NextResponse.json(
      { error: "Title and content cannot be empty." },
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

  const item = await prisma.collegeInfo.update({
    where: { id },
    data,
  });

  return NextResponse.json({ item: toAdminCollegeInfo(item) });
}

export async function DELETE(_request: Request, context: RouteContext) {
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

  const { id } = await context.params;

  const prisma = getPrisma();

  if (!prisma.collegeInfo) {
    return NextResponse.json(
      { error: "Prisma Client is not generated for CollegeInfo yet." },
      { status: 500 },
    );
  }

  await prisma.collegeInfo.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
