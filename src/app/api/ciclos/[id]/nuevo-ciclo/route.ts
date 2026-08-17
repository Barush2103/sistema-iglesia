import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Nivel } from "@prisma/client";

const PROMOCION: Record<string, Nivel | null> = {
  PRECOMUNION: "COMUNION",
  COMUNION: "PRECONFIRMACION",
  PRECONFIRMACION: "CONFIRMACION",
  CONFIRMACION: null, // egresan
};

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

// POST /api/ciclos/[id]/nuevo-ciclo
// Body: { nombreNuevoCiclo, alumnosPromover: number[], alumnosEgresar: number[] }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nombreNuevoCiclo, alumnosPromover } = await req.json();
    if (!nombreNuevoCiclo?.trim()) return NextResponse.json({ error: "Nombre del nuevo ciclo requerido" }, { status: 400 });

    const cicloActualId = Number(params.id);

    // 1. Obtener alumnos a promover
    const alumnos = await prisma.alumno.findMany({
      where: { cicloId: cicloActualId, id: { in: alumnosPromover } },
    });

    // 2. Archivar ciclo actual
    await prisma.ciclo.update({ where: { id: cicloActualId }, data: { activo: false } });

    // 3. Crear nuevo ciclo activo
    const nuevoCiclo = await prisma.ciclo.create({
      data: { nombre: nombreNuevoCiclo.trim(), activo: true },
    });

    // 4. Promover alumnos al nuevo ciclo con nuevo nivel
    for (const alumno of alumnos) {
      const nuevoNivel = PROMOCION[alumno.nivel];
      if (!nuevoNivel) continue; // egresan, no se pasan

      await prisma.alumno.create({
        data: {
          nombre: alumno.nombre,
          nivel: nuevoNivel,
          catequista: alumno.catequista,
          dia: alumno.dia,
          responsable: alumno.responsable,
          telefonoCasa: alumno.telefonoCasa,
          telefonoCelular: alumno.telefonoCelular,
          cicloId: nuevoCiclo.id,
          documentos: {
            create: (DOCS_POR_NIVEL[nuevoNivel] || []).map((tipo) => ({ tipo, entregado: false })),
          },
          pagos: {
            create: (PAGOS_CIERRE[nuevoNivel] || []).map((tipo) => ({
              tipo,
              monto: tipo === "sacramento" ? 500 : tipo === "retiro" ? 250 : null,
              pagado: false,
            })),
          },
        },
      });
    }

    return NextResponse.json({
      ok: true,
      nuevoCicloId: nuevoCiclo.id,
      promovidos: alumnos.filter(a => PROMOCION[a.nivel] !== null).length,
      egresados: alumnos.filter(a => PROMOCION[a.nivel] === null).length,
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
