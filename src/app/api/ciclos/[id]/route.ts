import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Activar un ciclo específico (para consultar histórico)
export async function PUT(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.ciclo.updateMany({ data: { activo: false } });
    const ciclo = await prisma.ciclo.update({
      where: { id: Number(params.id) },
      data: { activo: true },
    });
    return NextResponse.json(ciclo);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
