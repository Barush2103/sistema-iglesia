"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const rol = sessionStorage.getItem("rol");
    if (rol === "admin" || rol === "consulta") router.replace("/dashboard");
  }, [router]);

  async function ingresar() {
    if (!pin) return;
    setLoading(true); setError("");
    const res = await fetch("/api/auth", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ pin }) });
    const data = await res.json();
    if (data.rol) {
      sessionStorage.setItem("rol", data.rol);
      router.replace("/dashboard");
    } else {
      setError("PIN incorrecto");
      setPin("");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f5f4f0" }}>
      <div style={{ background:"#fff",borderRadius:16,padding:"36px 32px",width:"100%",maxWidth:360,boxShadow:"0 4px 24px rgba(0,0,0,0.08)",textAlign:"center" }}>
        <div style={{ fontSize:36,marginBottom:8 }}>✝</div>
        <div style={{ fontWeight:700,fontSize:18,color:"#1c1c1a",marginBottom:4 }}>Parroquia María Madre de Dios</div>
        <div style={{ fontSize:13,color:"#9b9890",marginBottom:28 }}>Sistema de Catequesis 2026-2027</div>

        <div style={{ marginBottom:16 }}>
          <input
            type="password"
            value={pin}
            onChange={e=>setPin(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&ingresar()}
            placeholder="Ingresa tu PIN"
            autoFocus
            style={{ width:"100%",padding:"12px 14px",border:`1.5px solid ${error?"#dc2626":"#e8e6e0"}`,borderRadius:9,fontSize:18,textAlign:"center",letterSpacing:6,outline:"none",color:"#1c1c1a",background:"#fafaf9" }}
          />
          {error && <div style={{ fontSize:12,color:"#dc2626",marginTop:6 }}>{error}</div>}
        </div>

        <button
          onClick={ingresar}
          disabled={!pin||loading}
          style={{ width:"100%",background:"#1c1c1a",color:"#fff",border:"none",borderRadius:9,padding:"12px",fontSize:14,fontWeight:500,cursor:"pointer",opacity:(!pin||loading)?0.5:1 }}
        >
          {loading ? "Verificando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
