import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getCicloActivo() {
  return prisma.ciclo.findFirst({ where: { activo: true } });
}

export async function GET(req: NextRequest) {
  try {
    const cicloId = req.nextUrl.searchParams.get("cicloId");
    let targetCicloId: number;
    if (cicloId) {
      targetCicloId = Number(cicloId);
    } else {
      const ciclo = await getCicloActivo();
      if (!ciclo) return NextResponse.json([]);
      targetCicloId = ciclo.id;
    }
    const colectas = await prisma.colecta.findMany({
      where: { cicloId: targetCicloId },
      orderBy: { createdAt: "desc" },
      include: { aportaciones: { orderBy: { fecha: "desc" } }, _count: { select: { aportaciones: true } } },
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
    const ciclo = await getCicloActivo();
    if (!ciclo) return NextResponse.json({ error: "No hay ciclo activo" }, { status: 400 });
    const colecta = await prisma.colecta.create({
      data: { nombre: nombre.trim(), descripcion: descripcion?.trim() || null, meta: meta ? Number(meta) : null, cicloId: ciclo.id },
    });
    return NextResponse.json(colecta, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
