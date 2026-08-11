import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PIN_ADMIN_DEFAULT = process.env.PIN_ADMIN || "1234";
const PIN_CONSULTA_DEFAULT = process.env.PIN_CONSULTA || "5678";

async function getPin(clave: string, fallback: string): Promise<string> {
  try {
    const row = await prisma.config.findUnique({ where: { clave } });
    return row?.valor || fallback;
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const pinAdmin = await getPin("PIN_ADMIN", PIN_ADMIN_DEFAULT);
    const pinConsulta = await getPin("PIN_CONSULTA", PIN_CONSULTA_DEFAULT);
    return NextResponse.json({ pinAdmin, pinConsulta });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { pinAdmin, pinConsulta } = await req.json();
    if (!pinAdmin?.trim() || !pinConsulta?.trim())
      return NextResponse.json({ error: "Ambos PINs son requeridos" }, { status: 400 });
    if (pinAdmin.length < 4 || pinConsulta.length < 4)
      return NextResponse.json({ error: "Los PINs deben tener al menos 4 caracteres" }, { status: 400 });
    if (pinAdmin === pinConsulta)
      return NextResponse.json({ error: "Los PINs deben ser diferentes" }, { status: 400 });

    await prisma.$transaction([
      prisma.config.upsert({ where: { clave: "PIN_ADMIN" }, update: { valor: pinAdmin }, create: { clave: "PIN_ADMIN", valor: pinAdmin } }),
      prisma.config.upsert({ where: { clave: "PIN_CONSULTA" }, update: { valor: pinConsulta }, create: { clave: "PIN_CONSULTA", valor: pinConsulta } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
