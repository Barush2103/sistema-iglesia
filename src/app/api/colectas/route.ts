import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const colectas = await prisma.colecta.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        aportaciones: { orderBy: { fecha: "desc" } },
        _count: { select: { aportaciones: true } },
      },
    });
    return NextResponse.json(colectas);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, descripcion, meta } = await req.json();
    if (!nombre?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    const colecta = await prisma.colecta.create({
      data: { nombre: nombre.trim(), descripcion: descripcion?.trim() || null, meta: meta ? Number(meta) : null },
    });
    return NextResponse.json(colecta, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
