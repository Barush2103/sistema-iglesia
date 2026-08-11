import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  const pinAdmin = process.env.PIN_ADMIN || "1234";
  const pinConsulta = process.env.PIN_CONSULTA || "0000";

  if (pin === pinAdmin) return NextResponse.json({ rol: "admin" });
  if (pin === pinConsulta) return NextResponse.json({ rol: "consulta" });
  return NextResponse.json({ error: "PIN incorrecto" }, { status: 401 });
}
