import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getPin(clave: string, fallback: string): Promise<string> {
  try {
    const row = await prisma.config.findUnique({ where: { clave } });
    return row?.valor || fallback;
  } catch {
    return fallback;
  }
}

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  const pinAdmin = await getPin("PIN_ADMIN", process.env.PIN_ADMIN || "1234");
  const pinConsulta = await getPin("PIN_CONSULTA", process.env.PIN_CONSULTA || "5678");

  if (pin === pinAdmin) return NextResponse.json({ rol: "admin" });
  if (pin === pinConsulta) return NextResponse.json({ rol: "consulta" });
  return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
}
