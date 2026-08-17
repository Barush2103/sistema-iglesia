import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const ciclos = await prisma.ciclo.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { alumnos: true, colectas: true } },
      },
    });
    return NextResponse.json(ciclos);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre } = await req.json();
    if (!nombre?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });

    // Desactivar todos los ciclos anteriores
    await prisma.ciclo.updateMany({ data: { activo: false } });

    // Crear nuevo ciclo activo
    const ciclo = await prisma.ciclo.create({
      data: { nombre: nombre.trim(), activo: true },
    });
    return NextResponse.json(ciclo, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
