import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nombre, descripcion, meta, activa } = await req.json();
    const colecta = await prisma.colecta.update({
      where: { id: Number(params.id) },
      data: { nombre: nombre?.trim(), descripcion: descripcion?.trim() || null, meta: meta ? Number(meta) : null, activa },
    });
    return NextResponse.json(colecta);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.colecta.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
