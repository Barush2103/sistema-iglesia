import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Nivel } from "@prisma/client";

const DOCS_POR_NIVEL: Record<string, string[]> = {
  PRECOMUNION: ["acta_nacimiento", "fe_bautizo"],
  COMUNION: ["acta_nacimiento", "fe_bautizo", "constancia_precomunion"],
  PRECONFIRMACION: ["acta_nacimiento", "fe_bautizo", "acta_comunion"],
  CONFIRMACION: ["acta_nacimiento", "fe_bautizo", "acta_comunion", "constancia_preconfirmacion"],
};

const PAGOS_CIERRE: Record<string, string[]> = {
  COMUNION: ["doc_padrino", "sacramento", "retiro", "ofrenda"],
  CONFIRMACION: ["doc_padrino", "sacramento", "retiro", "ofrenda"],
};

export async function GET(req: NextRequest) {
  try {
    const nivel = req.nextUrl.searchParams.get("nivel") as Nivel | null;
    const alumnos = await prisma.alumno.findMany({
      where: nivel ? { nivel } : undefined,
      orderBy: [{ nombre: "asc" }],
      include: { documentos: true, pagos: true },
    });
    return NextResponse.json(alumnos);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, nivel, catequista, dia, responsable, telefonoCasa, telefonoCelular } = body;
    if (!nombre?.trim() || !nivel) return NextResponse.json({ error: "Nombre y nivel requeridos" }, { status: 400 });

    const alumno = await prisma.alumno.create({
      data: {
        nombre: nombre.trim(),
        nivel: nivel as Nivel,
        catequista: catequista?.trim() || null,
        dia: dia?.trim() || null,
        responsable: responsable?.trim() || null,
        telefonoCasa: telefonoCasa?.trim() || null,
        telefonoCelular: telefonoCelular?.trim() || null,
        documentos: {
          create: (DOCS_POR_NIVEL[nivel] || []).map((tipo) => ({ tipo, entregado: false })),
        },
        pagos: {
          create: (PAGOS_CIERRE[nivel] || []).map((tipo) => ({
            tipo,
            monto: tipo === "sacramento" ? 500 : tipo === "retiro" ? 250 : null,
            pagado: false,
          })),
        },
      },
      include: { documentos: true, pagos: true },
    });
    return NextResponse.json(alumno, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
