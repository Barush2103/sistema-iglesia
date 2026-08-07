import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const alumno = await prisma.alumno.findUnique({
      where: { id: Number(params.id) },
      include: { documentos: true, pagos: true, aportaciones: true },
    });
    if (!alumno) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    return NextResponse.json(alumno);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { nombre, catequista, dia, responsable, telefonoCasa, telefonoCelular } = body;
    const alumno = await prisma.alumno.update({
      where: { id: Number(params.id) },
      data: {
        nombre: nombre?.trim(),
        catequista: catequista?.trim() || null,
        dia: dia?.trim() || null,
        responsable: responsable?.trim() || null,
        telefonoCasa: telefonoCasa?.trim() || null,
        telefonoCelular: telefonoCelular?.trim() || null,
      },
      include: { documentos: true, pagos: true },
    });
    return NextResponse.json(alumno);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.alumno.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
