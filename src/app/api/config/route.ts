import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getPin(clave: string, fallback: string): Promise<string> {
  try {
    const row = await prisma.config.findUnique({ where: { clave } });
    return row?.valor || fallback;
  } catch { return fallback; }
}

export async function GET() {
  try {
    const [pinSuperAdmin, pinAdmin, pinConsulta] = await Promise.all([
      getPin("PIN_SUPERADMIN", process.env.PIN_SUPERADMIN || "9999"),
      getPin("PIN_ADMIN", process.env.PIN_ADMIN || "1234"),
      getPin("PIN_CONSULTA", process.env.PIN_CONSULTA || "5678"),
    ]);
    return NextResponse.json({ pinSuperAdmin, pinAdmin, pinConsulta });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { pinSuperAdmin, pinAdmin, pinConsulta } = await req.json();
    const pines = [pinSuperAdmin, pinAdmin, pinConsulta];
    if (pines.some((p: string) => !p?.trim())) return NextResponse.json({ error: "Todos los PINs son requeridos" }, { status: 400 });
    if (pines.some((p: string) => p.length < 4)) return NextResponse.json({ error: "Mínimo 4 caracteres por PIN" }, { status: 400 });
    if (new Set(pines).size !== 3) return NextResponse.json({ error: "Los 3 PINs deben ser diferentes entre sí" }, { status: 400 });

    await prisma.$transaction([
      prisma.config.upsert({ where: { clave:"PIN_SUPERADMIN" }, update: { valor:pinSuperAdmin }, create: { clave:"PIN_SUPERADMIN", valor:pinSuperAdmin } }),
      prisma.config.upsert({ where: { clave:"PIN_ADMIN" }, update: { valor:pinAdmin }, create: { clave:"PIN_ADMIN", valor:pinAdmin } }),
      prisma.config.upsert({ where: { clave:"PIN_CONSULTA" }, update: { valor:pinConsulta }, create: { clave:"PIN_CONSULTA", valor:pinConsulta } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
