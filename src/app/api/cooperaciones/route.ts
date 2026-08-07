import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/cooperaciones — toggle documento o pago
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipo, id, valor, monto, fecha, notas } = body;

    if (tipo === "documento") {
      const doc = await prisma.documento.update({
        where: { id: Number(id) },
        data: { entregado: valor, fecha: valor ? (fecha ? new Date(fecha) : new Date()) : null, notas: notas || null },
      });
      return NextResponse.json(doc);
    }

    if (tipo === "pago") {
      const pago = await prisma.pago.update({
        where: { id: Number(id) },
        data: { pagado: valor, monto: monto ? Number(monto) : undefined, fecha: valor ? (fecha ? new Date(fecha) : new Date()) : null, notas: notas || null },
      });
      return NextResponse.json(pago);
    }

    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
