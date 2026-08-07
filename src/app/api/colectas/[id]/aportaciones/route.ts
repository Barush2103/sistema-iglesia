import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nombre, monto, alumnoId, notas } = await req.json();
    if (!nombre?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    if (!monto || isNaN(Number(monto))) return NextResponse.json({ error: "Monto inválido" }, { status: 400 });

    const aportacion = await prisma.aportacion.create({
      data: {
        colectaId: Number(params.id),
        nombre: nombre.trim(),
        monto: Number(monto),
        alumnoId: alumnoId ? Number(alumnoId) : null,
        notas: notas?.trim() || null,
      },
    });
    return NextResponse.json(aportacion, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { aportacionId } = await req.json();
    await prisma.aportacion.delete({ where: { id: Number(aportacionId) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
