"use client";
import { useState, useEffect, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Nivel = "PRECOMUNION"|"COMUNION"|"PRECONFIRMACION"|"CONFIRMACION";
type Documento = { id: number; tipo: string; entregado: boolean; fecha?: string; notas?: string };
type Pago = { id: number; tipo: string; monto?: number; pagado: boolean; fecha?: string; notas?: string };
type Alumno = { id: number; nombre: string; nivel: Nivel; catequista?: string; dia?: string; responsable?: string; telefonoCasa?: string; telefonoCelular?: string; documentos: Documento[]; pagos: Pago[] };
type Aportacion = { id: number; nombre: string; monto: number; notas?: string; fecha: string; alumnoId?: number };
type Colecta = { id: number; nombre: string; descripcion?: string; meta?: number; activa: boolean; aportaciones: Aportacion[]; _count: { aportaciones: number } };

// ── Constants ─────────────────────────────────────────────────────────────────
const NIVEL_LABEL: Record<Nivel, string> = { PRECOMUNION: "Pre-Comunión", COMUNION: "Comunión", PRECONFIRMACION: "Pre-Confirmación", CONFIRMACION: "Confirmación" };
const NIVEL_LABEL_PRINT: Record<string, string> = { PRECOMUNION: "Pre-Comunión", COMUNION: "Comunión", PRECONFIRMACION: "Pre-Confirmación", CONFIRMACION: "Confirmación" };
const NIVEL_COLOR: Record<Nivel, string> = { PRECOMUNION: "#7c3aed", COMUNION: "#2563eb", PRECONFIRMACION: "#d97706", CONFIRMACION: "#16a34a" };
const NIVEL_BG: Record<Nivel, string> = { PRECOMUNION: "#f5f3ff", COMUNION: "#eff6ff", PRECONFIRMACION: "#fffbeb", CONFIRMACION: "#f0fdf4" };
const DOC_LABEL: Record<string,string> = { acta_nacimiento: "Acta de nacimiento", fe_bautizo: "Fe de bautizo", constancia_precomunion: "Constancia de Pre-Comunión", acta_comunion: "Acta de Comunión", constancia_preconfirmacion: "Constancia de Pre-Confirmación" };
const PAGO_LABEL: Record<string,string> = { doc_padrino: "Documentos padrino", sacramento: "Sacramento ($500)", retiro: "Retiro ($250)", ofrenda: "Ofrenda", silla: "Silla" };
const DIAS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];

// ── Styles ────────────────────────────────────────────────────────────────────
const inputSt: React.CSSProperties = { width:"100%",padding:"8px 11px",border:"1px solid #e8e6e0",borderRadius:7,fontSize:14,outline:"none",background:"#fafaf9",color:"#1c1c1a" };
const btnPri: React.CSSProperties = { background:"#1c1c1a",color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:500,cursor:"pointer" };
const btnSec: React.CSSProperties = { background:"transparent",color:"#6b6860",border:"1px solid #e8e6e0",borderRadius:8,padding:"9px 18px",fontSize:13,cursor:"pointer" };
const btnGold: React.CSSProperties = { background:"#b5883a",color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",fontSize:13,fontWeight:500,cursor:"pointer" };

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:14,padding:24,width:"100%",maxWidth:wide?700:520,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.18)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
          <span style={{ fontWeight:600,fontSize:16 }}>{title}</span>
          <button onClick={onClose} style={{ background:"none",border:"none",fontSize:22,color:"#9b9890",lineHeight:1,cursor:"pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return <div style={{ marginBottom:12,gridColumn:half?"span 1":"span 2" }}><label style={{ display:"block",fontSize:12,fontWeight:500,color:"#6b6860",marginBottom:5 }}>{label}</label>{children}</div>;
}

// ── Alumno Form ───────────────────────────────────────────────────────────────
function AlumnoForm({ initial, onSave, onClose }: { initial?: Alumno; onSave: () => void; onClose: () => void }) {
  const [f, setF] = useState({ nombre: initial?.nombre||"", nivel: initial?.nivel||"COMUNION", catequista: initial?.catequista||"", dia: initial?.dia||"", responsable: initial?.responsable||"", telefonoCasa: initial?.telefonoCasa||"", telefonoCelular: initial?.telefonoCelular||"" });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setF(p=>({...p,[k]:v}));

  async function submit() {
    if (!f.nombre.trim()) return;
    setLoading(true);
    const url = initial ? `/api/alumnos/${initial.id}` : "/api/alumnos";
    await fetch(url, { method: initial?"PUT":"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(f) });
    setLoading(false); onSave();
  }

  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
      <Field label="Nombre completo del niño/niña"><input style={inputSt} value={f.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Apellido Apellido Nombre" /></Field>
      {!initial && <Field label="Nivel" half><select style={inputSt} value={f.nivel} onChange={e=>set("nivel",e.target.value)}>{Object.entries(NIVEL_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></Field>}
      <Field label="Día de clase" half><select style={inputSt} value={f.dia} onChange={e=>set("dia",e.target.value)}><option value="">-- Sin asignar --</option>{DIAS.map(d=><option key={d} value={d}>{d}</option>)}</select></Field>
      <Field label="Catequista" half><input style={inputSt} value={f.catequista} onChange={e=>set("catequista",e.target.value)} placeholder="Nombre catequista" /></Field>
      <Field label="Nombre del responsable"><input style={inputSt} value={f.responsable} onChange={e=>set("responsable",e.target.value)} placeholder="Papá/Mamá o tutor" /></Field>
      <Field label="Teléfono casa" half><input style={inputSt} value={f.telefonoCasa} onChange={e=>set("telefonoCasa",e.target.value)} placeholder="777-000-00-00" /></Field>
      <Field label="Teléfono celular" half><input style={inputSt} value={f.telefonoCelular} onChange={e=>set("telefonoCelular",e.target.value)} placeholder="777-000-00-00" /></Field>
      <div style={{ gridColumn:"span 2",display:"flex",gap:8,justifyContent:"flex-end",marginTop:4 }}>
        <button style={btnSec} onClick={onClose}>Cancelar</button>
        <button style={btnPri} onClick={submit} disabled={loading}>{loading?"Guardando...":"Guardar"}</button>
      </div>
    </div>
  );
}

// ── Alumno Detail Modal ───────────────────────────────────────────────────────
function AlumnoDetalle({ alumno, onClose, onRefresh }: { alumno: Alumno; onClose: () => void; onRefresh: () => void }) {
  async function toggleDoc(doc: Documento) {
    await fetch("/api/cooperaciones", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ tipo:"documento", id: doc.id, valor: !doc.entregado }) });
    onRefresh();
  }
  async function togglePago(pago: Pago) {
    await fetch("/api/cooperaciones", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ tipo:"pago", id: pago.id, valor: !pago.pagado }) });
    onRefresh();
  }

  const docsOk = alumno.documentos.filter(d=>d.entregado).length;
  const pagosOk = alumno.pagos.filter(p=>p.pagado).length;

  return (
    <div>
      {/* Header alumno */}
      <div style={{ background:`${NIVEL_BG[alumno.nivel]}`,border:`1px solid`,borderColor:NIVEL_COLOR[alumno.nivel]+"33",borderRadius:10,padding:"14px 16px",marginBottom:18 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
          <div>
            <div style={{ fontWeight:600,fontSize:16 }}>{alumno.nombre}</div>
            <div style={{ fontSize:12,color:NIVEL_COLOR[alumno.nivel],fontWeight:500,marginTop:2 }}>{NIVEL_LABEL[alumno.nivel]}{alumno.dia ? ` · ${alumno.dia}` : ""}{alumno.catequista ? ` · Cat. ${alumno.catequista}` : ""}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            {alumno.responsable && <div style={{ fontSize:12,color:"#6b6860" }}>👤 {alumno.responsable}</div>}
            {alumno.telefonoCelular && <div style={{ fontSize:12,color:"#6b6860" }}>📱 {alumno.telefonoCelular}</div>}
            {alumno.telefonoCasa && <div style={{ fontSize:12,color:"#6b6860" }}>📞 {alumno.telefonoCasa}</div>}
          </div>
        </div>
        <div style={{ display:"flex",gap:16,marginTop:10 }}>
          <div style={{ fontSize:12 }}><span style={{ fontWeight:600 }}>{docsOk}/{alumno.documentos.length}</span> <span style={{ color:"#6b6860" }}>documentos entregados</span></div>
          {alumno.pagos.length > 0 && <div style={{ fontSize:12 }}><span style={{ fontWeight:600 }}>{pagosOk}/{alumno.pagos.length}</span> <span style={{ color:"#6b6860" }}>pagos realizados</span></div>}
        </div>
      </div>

      {/* Documentos */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:12,fontWeight:600,color:"#9b9890",letterSpacing:"0.05em",marginBottom:10 }}>DOCUMENTOS REQUERIDOS</div>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {alumno.documentos.map(doc => (
            <div key={doc.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:8,border:"1px solid",borderColor:doc.entregado?"#16a34a33":"#e8e6e0",background:doc.entregado?"#f0fdf4":"#fafaf9",cursor:"pointer" }} onClick={()=>toggleDoc(doc)}>
              <div style={{ width:22,height:22,borderRadius:"50%",border:"2px solid",borderColor:doc.entregado?"#16a34a":"#d1cfc8",background:doc.entregado?"#16a34a":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                {doc.entregado && <span style={{ color:"#fff",fontSize:12,fontWeight:700 }}>✓</span>}
              </div>
              <span style={{ flex:1,fontSize:13,color:doc.entregado?"#16a34a":"#1c1c1a",fontWeight:doc.entregado?500:400 }}>{DOC_LABEL[doc.tipo]||doc.tipo}</span>
              {doc.entregado && doc.fecha && <span style={{ fontSize:11,color:"#9b9890" }}>{new Date(doc.fecha).toLocaleDateString("es-MX",{day:"numeric",month:"short"})}</span>}
              <span style={{ fontSize:12,color:doc.entregado?"#16a34a":"#9b9890" }}>{doc.entregado?"Entregado":"Pendiente"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pagos cierre */}
      {alumno.pagos.length > 0 && (
        <div>
          <div style={{ fontSize:12,fontWeight:600,color:"#9b9890",letterSpacing:"0.05em",marginBottom:10 }}>PAGOS CIERRE DE CICLO</div>
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {alumno.pagos.map(pago => (
              <div key={pago.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:8,border:"1px solid",borderColor:pago.pagado?"#b5883a33":"#e8e6e0",background:pago.pagado?"#fdf8f0":"#fafaf9",cursor:"pointer" }} onClick={()=>togglePago(pago)}>
                <div style={{ width:22,height:22,borderRadius:"50%",border:"2px solid",borderColor:pago.pagado?"#b5883a":"#d1cfc8",background:pago.pagado?"#b5883a":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  {pago.pagado && <span style={{ color:"#fff",fontSize:12,fontWeight:700 }}>✓</span>}
                </div>
                <span style={{ flex:1,fontSize:13,color:pago.pagado?"#b5883a":"#1c1c1a",fontWeight:pago.pagado?500:400 }}>{PAGO_LABEL[pago.tipo]||pago.tipo}</span>
                {pago.monto && <span style={{ fontSize:12,color:"#6b6860",fontWeight:500 }}>${pago.monto}</span>}
                {pago.pagado && pago.fecha && <span style={{ fontSize:11,color:"#9b9890" }}>{new Date(pago.fecha).toLocaleDateString("es-MX",{day:"numeric",month:"short"})}</span>}
                <span style={{ fontSize:12,color:pago.pagado?"#b5883a":"#9b9890" }}>{pago.pagado?"Pagado":"Pendiente"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop:18,display:"flex",justifyContent:"flex-end" }}>
        <button style={btnSec} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

// ── Mini modal para capturar monto ───────────────────────────────────────────
function MontoModal({ alumno, onConfirm, onClose }: { alumno: Alumno; onConfirm: (monto: number, notas: string) => void; onClose: () => void }) {
  const [monto, setMonto] = useState("");
  const [notas, setNotas] = useState("");
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }} onClick={onClose}>
      <div style={{ background:"#fff",borderRadius:12,padding:22,width:"100%",maxWidth:340,boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontWeight:600,fontSize:15,marginBottom:4 }}>Registrar aportación</div>
        <div style={{ fontSize:13,color:"#6b6860",marginBottom:16 }}>{alumno.nombre}</div>
        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:12,color:"#6b6860",display:"block",marginBottom:5 }}>Monto *</label>
          <input autoFocus style={{...inputSt,fontSize:18,fontWeight:600,textAlign:"center"}} type="number" value={monto} onChange={e=>setMonto(e.target.value)} placeholder="$0" onKeyDown={e=>e.key==="Enter"&&monto&&onConfirm(Number(monto),notas)} />
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12,color:"#6b6860",display:"block",marginBottom:5 }}>Notas (opcional)</label>
          <input style={inputSt} value={notas} onChange={e=>setNotas(e.target.value)} placeholder="Abono, observación..." />
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button style={{...btnSec,flex:1}} onClick={onClose}>Cancelar</button>
          <button style={{...btnGold,flex:1}} onClick={()=>monto&&onConfirm(Number(monto),notas)} disabled={!monto}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

// ── Colecta Modal ─────────────────────────────────────────────────────────────
function ColectaDetalle({ colecta, alumnos, onClose, onRefresh }: { colecta: Colecta; alumnos: Alumno[]; onClose: () => void; onRefresh: () => void }) {
  const [vista, setVista] = useState<"grupos"|"lista">("grupos");
  const [filtroNivel, setFiltroNivel] = useState<Nivel|"TODOS">("TODOS");
  const [filtroDia, setFiltroDia] = useState<string>("TODOS");
  const [alumnoSel, setAlumnoSel] = useState<Alumno|undefined>();
  const total = colecta.aportaciones.reduce((s, a) => s + a.monto, 0);

  const alumnosQueAportaron = new Set(colecta.aportaciones.filter(a=>a.alumnoId).map(a=>a.alumnoId!));
  const alumnosFiltrados = alumnos
    .filter(a => filtroNivel === "TODOS" || a.nivel === filtroNivel)
    .filter(a => filtroDia === "TODOS" || a.dia === filtroDia)
    .sort((a,b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
  const pagaron = alumnosFiltrados.filter(a => alumnosQueAportaron.has(a.id));
  const noPagaron = alumnosFiltrados.filter(a => !alumnosQueAportaron.has(a.id));
  const diasDisponibles = [...new Set(
    alumnos.filter(a => filtroNivel === "TODOS" || a.nivel === filtroNivel)
      .map(a => a.dia).filter(Boolean)
  )].sort() as string[];

  async function registrar(alumno: Alumno, monto: number, notas: string) {
    await fetch(`/api/colectas/${colecta.id}/aportaciones`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ nombre: alumno.nombre, monto, alumnoId: alumno.id, notas })
    });
    setAlumnoSel(undefined); onRefresh();
  }

  async function quitar(alumnoId: number) {
    const ap = colecta.aportaciones.find(a => a.alumnoId === alumnoId);
    if (!ap || !confirm("¿Quitar esta aportación?")) return;
    await fetch(`/api/colectas/${colecta.id}/aportaciones`, { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ aportacionId: ap.id }) });
    onRefresh();
  }

  async function eliminar(aportacionId: number) {
    if (!confirm("¿Eliminar esta aportación?")) return;
    await fetch(`/api/colectas/${colecta.id}/aportaciones`, { method:"DELETE", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ aportacionId }) });
    onRefresh();
  }

  const printFn = () => {
    const w = window.open("","_blank","width=800,height=600");
    if (!w) return;

    // Filtrar aportaciones según el grupo visible actualmente
    const idsDelGrupo = new Set(alumnosFiltrados.map(a => a.id));
    const aportacionesFiltradas = filtroNivel === "TODOS" && filtroDia === "TODOS"
      ? colecta.aportaciones
      : colecta.aportaciones.filter(a => a.alumnoId ? idsDelGrupo.has(a.alumnoId) : true);

    const totalFiltrado = aportacionesFiltradas.reduce((s,a) => s + a.monto, 0);

    const subtituloFiltro = filtroNivel !== "TODOS" || filtroDia !== "TODOS"
      ? `${filtroNivel !== "TODOS" ? NIVEL_LABEL_PRINT[filtroNivel] : "Todos los niveles"}${filtroDia !== "TODOS" ? ` · ${filtroDia}` : ""}`
      : "Todos los grupos";

    // Mapa de alumnoId → datos del alumno para mostrar nivel y día
    const alumnoMap: Record<number, Alumno> = {};
    alumnos.forEach(a => { alumnoMap[a.id] = a; });

    const filas = aportacionesFiltradas.map((a,i)=>{
      const alu = a.alumnoId ? alumnoMap[a.alumnoId] : null;
      const nivelDia = alu ? `<div style="font-size:10px;color:#888;margin-top:2px;">${NIVEL_LABEL_PRINT[alu.nivel]}${alu.dia ? ` · ${alu.dia}` : ""}</div>` : "";
      return `
      <tr style="border-bottom:1px solid #ddd;">
        <td style="padding:7px 10px;text-align:center;">${i+1}</td>
        <td style="padding:7px 10px;font-weight:500;">${a.nombre}${nivelDia}</td>
        <td style="padding:7px 10px;text-align:right;font-weight:600;">$${a.monto.toLocaleString("es-MX",{minimumFractionDigits:2})}</td>
        <td style="padding:7px 10px;text-align:center;">${new Date(a.fecha).toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}</td>
        <td style="padding:7px 10px;color:#666;">${a.notas||""}</td>
      </tr>`;
    }).join("");
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${colecta.nombre}</title>
    <style>body{font-family:Arial,sans-serif;margin:30px;color:#1c1c1a;font-size:13px;}.header{text-align:center;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #1c1c1a;}.cruz{font-size:22px;margin-bottom:4px;}table{width:100%;border-collapse:collapse;margin-top:4px;}thead tr{background:#1c1c1a;color:#fff;}thead th{padding:9px 10px;text-align:left;font-size:12px;font-weight:600;}tbody tr:nth-child(even){background:#f9f8f6;}.total-row{background:#b5883a!important;color:#fff;font-weight:700;}.total-row td{padding:9px 10px;font-size:13px;}.footer{margin-top:16px;font-size:11px;color:#888;display:flex;justify-content:space-between;}@media print{body{margin:15px;}}</style>
    </head><body>
    <div class="header"><div class="cruz"><img src="/logo.png" style="width:70px;height:auto;" alt="Logo"/></div><h1 style="font-size:16px;font-weight:700;margin:0;">PARROQUIA MARÍA MADRE DE DIOS</h1><h2 style="font-size:13px;font-weight:400;margin:4px 0 0;">${colecta.nombre}</h2><div style="font-size:12px;color:#555;margin-top:4px;">${subtituloFiltro}</div>${colecta.descripcion?`<div style="font-size:12px;color:#555;margin-top:4px;">${colecta.descripcion}</div>`:""}${colecta.meta?`<div style="font-size:12px;color:#555;margin-top:4px;">Meta: $${colecta.meta.toLocaleString("es-MX",{minimumFractionDigits:2})}</div>`:""}</div>
    <table><thead><tr><th style="width:40px;text-align:center;">No.</th><th>Nombre</th><th style="width:120px;text-align:right;">Monto</th><th style="width:130px;text-align:center;">Fecha</th><th style="width:180px;">Notas</th></tr></thead>
    <tbody>${filas}<tr class="total-row"><td colspan="2" style="text-align:right;">TOTAL</td><td style="text-align:right;">$${totalFiltrado.toLocaleString("es-MX",{minimumFractionDigits:2})}</td><td colspan="2">${aportacionesFiltradas.length} aportaciones</td></tr></tbody></table>
    <div class="footer"><span>Generado: ${new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}</span>${colecta.meta?`<span>Avance: ${Math.round(totalFiltrado/colecta.meta*100)}% de la meta</span>`:""}</div>
    <script>window.onload=()=>{window.print();}<\/script></body></html>`);
    w.document.close();
  };

  return (
    <div>
      {alumnoSel && <MontoModal alumno={alumnoSel} onConfirm={(m,n)=>registrar(alumnoSel,m,n)} onClose={()=>setAlumnoSel(undefined)} />}

      {/* Resumen */}
      <div style={{ background:"#fdf8f0",border:"1px solid #b5883a33",borderRadius:10,padding:"14px 18px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div>
          <div style={{ fontSize:12,color:"#6b6860" }}>{colecta.descripcion||"Cooperación espontánea"}</div>
          <div style={{ fontSize:26,fontWeight:700,color:"#b5883a",marginTop:2 }}>${total.toLocaleString("es-MX",{minimumFractionDigits:2})}</div>
          <div style={{ fontSize:12,color:"#9b9890" }}>{colecta.aportaciones.length} aportaciones · {pagaron.length}/{alumnosFiltrados.length} en grupo seleccionado</div>
        </div>
        {colecta.meta && (
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:12,color:"#6b6860" }}>Meta: ${colecta.meta.toLocaleString()}</div>
            <div style={{ fontSize:18,fontWeight:600,color:total>=colecta.meta?"#16a34a":"#b5883a" }}>{Math.round(total/colecta.meta*100)}%</div>
            <div style={{ width:100,height:6,background:"#e8e6e0",borderRadius:3,marginTop:4 }}><div style={{ height:"100%",background:total>=colecta.meta?"#16a34a":"#b5883a",borderRadius:3,width:`${Math.min(100,Math.round(total/colecta.meta*100))}%` }} /></div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display:"flex",gap:4,background:"#f5f4f0",borderRadius:8,padding:4,marginBottom:14 }}>
        {([["grupos","👥 Por grupo"],["lista","📋 Lista completa"]] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setVista(id)} style={{ flex:1,padding:"7px 12px",borderRadius:6,border:"none",background:vista===id?"#fff":"transparent",color:vista===id?"#1c1c1a":"#6b6860",fontSize:13,fontWeight:vista===id?500:400,cursor:"pointer",boxShadow:vista===id?"0 1px 3px rgba(0,0,0,0.08)":"none" }}>{label}</button>
        ))}
      </div>

      {/* Vista por grupo */}
      {vista === "grupos" && (
        <>
          <div style={{ display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center" }}>
            <select style={{...inputSt,maxWidth:170}} value={filtroNivel} onChange={e=>{setFiltroNivel(e.target.value as Nivel|"TODOS");setFiltroDia("TODOS");}}>
              <option value="TODOS">Todos los niveles</option>
              {(Object.entries(NIVEL_LABEL) as [Nivel,string][]).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
            <select style={{...inputSt,maxWidth:140}} value={filtroDia} onChange={e=>setFiltroDia(e.target.value)}>
              <option value="TODOS">Todos los días</option>
              {diasDisponibles.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <span style={{ fontSize:12 }}><span style={{ color:"#16a34a",fontWeight:600 }}>{pagaron.length} pagaron</span> · <span style={{ color:"#dc2626",fontWeight:600 }}>{noPagaron.length} pendientes</span></span>
          </div>

          {noPagaron.length > 0 && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11,fontWeight:600,color:"#dc2626",letterSpacing:"0.05em",marginBottom:8 }}>PENDIENTES — {noPagaron.length}</div>
              <div style={{ display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto" }}>
                {noPagaron.map(a=>(
                  <div key={a.id} onClick={()=>setAlumnoSel(a)} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:9,border:"1px solid #e8e6e0",background:"#fafaf9",cursor:"pointer" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="#b5883a";e.currentTarget.style.background="#fdf8f0";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="#e8e6e0";e.currentTarget.style.background="#fafaf9";}}>
                    <div style={{ width:32,height:32,borderRadius:"50%",background:NIVEL_BG[a.nivel],border:`1.5px dashed ${NIVEL_COLOR[a.nivel]}88`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,color:NIVEL_COLOR[a.nivel],flexShrink:0 }}>{a.nombre.charAt(0)}</div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:13,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.nombre}</div>
                      <div style={{ fontSize:11,color:"#9b9890" }}>{NIVEL_LABEL[a.nivel]}{a.dia?` · ${a.dia}`:""}</div>
                    </div>
                    <span style={{ fontSize:12,color:"#b5883a",fontWeight:500,flexShrink:0 }}>Registrar →</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pagaron.length > 0 && (
            <div>
              <div style={{ fontSize:11,fontWeight:600,color:"#16a34a",letterSpacing:"0.05em",marginBottom:8 }}>YA PAGARON — {pagaron.length}</div>
              <div style={{ display:"flex",flexDirection:"column",gap:6,maxHeight:200,overflowY:"auto" }}>
                {pagaron.map(a=>{
                  const ap = colecta.aportaciones.find(x=>x.alumnoId===a.id);
                  return (
                    <div key={a.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",borderRadius:9,border:"1px solid #16a34a33",background:"#f0fdf4" }}>
                      <div style={{ width:32,height:32,borderRadius:"50%",background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#fff",flexShrink:0 }}>✓</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:13,fontWeight:500,color:"#15803d",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.nombre}</div>
                        <div style={{ fontSize:11,color:"#6b9e78" }}>{NIVEL_LABEL[a.nivel]}{a.dia?` · ${a.dia}`:""}{ap?.notas?` · ${ap.notas}`:""}</div>
                      </div>
                      <span style={{ fontSize:14,fontWeight:700,color:"#16a34a",flexShrink:0 }}>${ap?.monto.toLocaleString()}</span>
                      <button onClick={()=>quitar(a.id)} style={{ background:"none",border:"none",color:"#d1cfc8",fontSize:14,cursor:"pointer",padding:"3px",flexShrink:0 }}>✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {alumnosFiltrados.length === 0 && <div style={{ textAlign:"center",padding:"2rem",color:"#9b9890",background:"#fafaf9",borderRadius:10,border:"1px dashed #e8e6e0" }}>No hay alumnos en este grupo</div>}
        </>
      )}

      {/* Vista lista completa */}
      {vista === "lista" && (
        <>
          <div style={{ fontSize:11,fontWeight:600,color:"#9b9890",letterSpacing:"0.05em",marginBottom:10 }}>TODAS LAS APORTACIONES ({colecta.aportaciones.length})</div>
          {colecta.aportaciones.length === 0 ? (
            <div style={{ textAlign:"center",padding:"2rem",color:"#9b9890",background:"#fafaf9",borderRadius:10,border:"1px dashed #e8e6e0" }}>Aún no hay aportaciones</div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",gap:6,maxHeight:300,overflowY:"auto" }}>
              {colecta.aportaciones.map((a,i)=>(
                <div key={a.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:8,background:"#fafaf9",border:"1px solid #e8e6e0" }}>
                  <span style={{ fontSize:12,color:"#9b9890",width:22,flexShrink:0 }}>{i+1}</span>
                  <span style={{ flex:1,fontSize:13,fontWeight:500 }}>{a.nombre}</span>
                  {a.notas && <span style={{ fontSize:11,color:"#9b9890" }}>{a.notas}</span>}
                  <span style={{ fontSize:13,fontWeight:600,color:"#b5883a",flexShrink:0 }}>${a.monto.toLocaleString()}</span>
                  <span style={{ fontSize:11,color:"#9b9890",flexShrink:0 }}>{new Date(a.fecha).toLocaleDateString("es-MX",{day:"numeric",month:"short"})}</span>
                  <button onClick={()=>eliminar(a.id)} style={{ background:"none",border:"none",color:"#d1cfc8",fontSize:14,cursor:"pointer",padding:"2px" }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Acciones */}
      <div style={{ marginTop:18,display:"flex",gap:8,justifyContent:"space-between",alignItems:"center" }}>
        <button style={{...btnGold,fontSize:12}} onClick={printFn}>🖨️ Imprimir lista</button>
        <button style={btnSec} onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

// ── Lista Imprimible ──────────────────────────────────────────────────────────
function ListaImprimible({ alumnos, nivel, dia, filtro }: { alumnos: Alumno[]; nivel: Nivel|"TODOS"; dia: string; filtro: "documentos"|"pagos"|"contacto" }) {
  const lista = (nivel === "TODOS" ? alumnos : alumnos.filter(a=>a.nivel===nivel))
    .filter(a => dia === "TODOS" || a.dia === dia)
    .sort((a,b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

  const subtitulo = `${nivel==="TODOS"?"Todos los niveles":NIVEL_LABEL[nivel as Nivel]}${dia!=="TODOS" ? ` · ${dia}` : ""}`;
  if (filtro === "contacto") {
    return (
      <div>
        <div style={{ marginBottom:16,display:"flex",gap:8,justifyContent:"flex-end" }} className="no-print">
          <button style={btnGold} onClick={()=>window.print()}>🖨️ Imprimir</button>
        </div>
        <div style={{ fontFamily:"serif",fontSize:13,lineHeight:1.6 }}>
          <div style={{ textAlign:"center",marginBottom:16 }}>
            <img src="/logo.png" alt="Logo" style={{ width:80,height:"auto",marginBottom:6 }} />
            <div style={{ fontSize:16,fontWeight:700 }}>PARROQUIA MARÍA MADRE DE DIOS</div>
            <div style={{ fontSize:14 }}>Catequesis 2026-2027 · {subtitulo}</div>
          </div>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #000" }}>
                <th style={{ padding:"6px 8px",textAlign:"left" }}>No.</th>
                <th style={{ padding:"6px 8px",textAlign:"left" }}>Nombre del niño/niña</th>
                <th style={{ padding:"6px 8px",textAlign:"left" }}>Nivel</th>
                <th style={{ padding:"6px 8px",textAlign:"left" }}>Responsable</th>
                <th style={{ padding:"6px 8px",textAlign:"left" }}>Casa</th>
                <th style={{ padding:"6px 8px",textAlign:"left" }}>Celular</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((a,i)=>(
                <tr key={a.id} style={{ borderBottom:"1px solid #ccc" }}>
                  <td style={{ padding:"6px 8px" }}>{i+1}</td>
                  <td style={{ padding:"6px 8px",fontWeight:500 }}>{a.nombre}</td>
                  <td style={{ padding:"6px 8px" }}>{NIVEL_LABEL[a.nivel]}</td>
                  <td style={{ padding:"6px 8px" }}>{a.responsable||""}</td>
                  <td style={{ padding:"6px 8px" }}>{a.telefonoCasa||""}</td>
                  <td style={{ padding:"6px 8px" }}>{a.telefonoCelular||""}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop:8,fontSize:11,color:"#666" }}>Total: {lista.length} alumnos · Generado: {new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
      </div>
    );
  }

  if (filtro === "documentos") {
    return (
      <div>
        <div style={{ marginBottom:16,display:"flex",gap:8,justifyContent:"flex-end" }} className="no-print">
          <button style={btnGold} onClick={()=>window.print()}>🖨️ Imprimir</button>
        </div>
        <div style={{ fontFamily:"serif",fontSize:13 }}>
          <div style={{ textAlign:"center",marginBottom:16 }}>
            <img src="/logo.png" alt="Logo" style={{ width:80,height:"auto",marginBottom:6 }} />
            <div style={{ fontSize:16,fontWeight:700 }}>PARROQUIA MARÍA MADRE DE DIOS</div>
            <div style={{ fontSize:14 }}>Control de Documentos · {subtitulo}</div>
          </div>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:"2px solid #000" }}>
                <th style={{ padding:"5px 6px",textAlign:"left" }}>No.</th>
                <th style={{ padding:"5px 6px",textAlign:"left" }}>Nombre</th>
                <th style={{ padding:"5px 6px",textAlign:"center" }}>Acta nac.</th>
                <th style={{ padding:"5px 6px",textAlign:"center" }}>Fe bautizo</th>
                <th style={{ padding:"5px 6px",textAlign:"center" }}>Constancia/Acta ant.</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((a,i)=>{
                const docMap: Record<string,Documento> = {};
                a.documentos.forEach(d=>docMap[d.tipo]=d);
                return (
                  <tr key={a.id} style={{ borderBottom:"1px solid #ddd" }}>
                    <td style={{ padding:"5px 6px" }}>{i+1}</td>
                    <td style={{ padding:"5px 6px",fontWeight:500 }}>{a.nombre}</td>
                    <td style={{ padding:"5px 6px",textAlign:"center" }}>{docMap.acta_nacimiento?.entregado?"✓":"☐"}</td>
                    <td style={{ padding:"5px 6px",textAlign:"center" }}>{docMap.fe_bautizo?.entregado?"✓":"☐"}</td>
                    <td style={{ padding:"5px 6px",textAlign:"center" }}>{(docMap.constancia_precomunion||docMap.acta_comunion||docMap.constancia_preconfirmacion)?.entregado?"✓":"☐"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop:8,fontSize:11,color:"#666" }}>Total: {lista.length} · ✓ Entregado · ☐ Pendiente</div>
        </div>
      </div>
    );
  }

  // pagos
  return (
    <div>
      <div style={{ marginBottom:16,display:"flex",gap:8,justifyContent:"flex-end" }} className="no-print">
        <button style={btnGold} onClick={()=>window.print()}>🖨️ Imprimir</button>
      </div>
      <div style={{ fontFamily:"serif",fontSize:13 }}>
        <div style={{ textAlign:"center",marginBottom:16 }}>
          <img src="/logo.png" alt="Logo" style={{ width:80,height:"auto",marginBottom:6 }} />
          <div style={{ fontSize:16,fontWeight:700 }}>PARROQUIA MARÍA MADRE DE DIOS</div>
          <div style={{ fontSize:14 }}>Control de Pagos · {subtitulo}</div>
        </div>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:11 }}>
          <thead>
            <tr style={{ borderBottom:"2px solid #000" }}>
              <th style={{ padding:"5px 6px",textAlign:"left" }}>No.</th>
              <th style={{ padding:"5px 6px",textAlign:"left" }}>Nombre</th>
              <th style={{ padding:"5px 6px",textAlign:"center" }}>Doc. Padrino</th>
              <th style={{ padding:"5px 6px",textAlign:"center" }}>Sacramento $500</th>
              <th style={{ padding:"5px 6px",textAlign:"center" }}>Retiro $250</th>
              <th style={{ padding:"5px 6px",textAlign:"center" }}>Ofrenda</th>
            </tr>
          </thead>
          <tbody>
            {lista.filter(a=>a.pagos.length>0).map((a,i)=>{
              const pm: Record<string,Pago> = {};
              a.pagos.forEach(p=>pm[p.tipo]=p);
              return (
                <tr key={a.id} style={{ borderBottom:"1px solid #ddd" }}>
                  <td style={{ padding:"5px 6px" }}>{i+1}</td>
                  <td style={{ padding:"5px 6px",fontWeight:500 }}>{a.nombre}</td>
                  <td style={{ padding:"5px 6px",textAlign:"center" }}>{pm.doc_padrino?.pagado?"✓":"☐"}</td>
                  <td style={{ padding:"5px 6px",textAlign:"center" }}>{pm.sacramento?.pagado?"✓":"☐"}</td>
                  <td style={{ padding:"5px 6px",textAlign:"center" }}>{pm.retiro?.pagado?"✓":"☐"}</td>
                  <td style={{ padding:"5px 6px",textAlign:"center" }}>{pm.ofrenda?.pagado?"✓":"☐"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ marginTop:8,fontSize:11,color:"#666" }}>✓ Pagado · ☐ Pendiente</div>
      </div>
    </div>
  );
}

// ── Config Pines ──────────────────────────────────────────────────────────────
function ConfigPines() {
  const [pinSuperAdmin, setPinSuperAdmin] = useState("");
  const [pinAdmin, setPinAdmin] = useState("");
  const [pinConsulta, setPinConsulta] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{type:"ok"|"err", text:string}|null>(null);
  const [show, setShow] = useState({ sa:false, a:false, c:false });

  useEffect(()=>{
    fetch("/api/config").then(r=>r.json()).then(d=>{
      setPinSuperAdmin(d.pinSuperAdmin||""); setPinAdmin(d.pinAdmin||""); setPinConsulta(d.pinConsulta||""); setLoading(false);
    });
  },[]);

  async function guardar() {
    const pines = [pinSuperAdmin, pinAdmin, pinConsulta];
    if (pines.some(p=>!p.trim())) { setMsg({type:"err",text:"Todos los PINs son requeridos"}); return; }
    if (pines.some(p=>p.length < 4)) { setMsg({type:"err",text:"Mínimo 4 caracteres por PIN"}); return; }
    if (new Set(pines).size !== 3) { setMsg({type:"err",text:"Los 3 PINs deben ser diferentes entre sí"}); return; }
    setSaving(true); setMsg(null);
    const res = await fetch("/api/config", { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ pinSuperAdmin, pinAdmin, pinConsulta }) });
    const data = await res.json();
    setSaving(false);
    setMsg(data.ok ? {type:"ok",text:"✓ PINs actualizados. Aplican en el próximo inicio de sesión."} : {type:"err",text:data.error||"Error al guardar"});
  }

  if (loading) return <div style={{ color:"#9b9890",padding:"2rem" }}>Cargando...</div>;

  const campos = [
    { label:"PIN de Super Administrador", value:pinSuperAdmin, set:setPinSuperAdmin, showKey:"sa" as const, desc:"Acceso total + cambiar PINs" },
    { label:"PIN de Administrador", value:pinAdmin, set:setPinAdmin, showKey:"a" as const, desc:"Catequesis, cooperaciones y listas — sin Config" },
    { label:"PIN de Solo Lectura", value:pinConsulta, set:setPinConsulta, showKey:"c" as const, desc:"Solo puede ver e imprimir listas" },
  ];

  return (
    <div style={{ maxWidth:440 }}>
      <div style={{ background:"#fff",border:"1px solid #e8e6e0",borderRadius:12,padding:"24px" }}>
        <div style={{ fontSize:15,fontWeight:600,marginBottom:4 }}>⚙️ Cambiar PINs de acceso</div>
        <div style={{ fontSize:13,color:"#9b9890",marginBottom:24 }}>Los cambios aplican en el próximo inicio de sesión.</div>

        {campos.map(({label,value,set,showKey,desc})=>(
          <div key={showKey} style={{ marginBottom:18 }}>
            <label style={{ fontSize:12,fontWeight:500,color:"#6b6860",display:"block",marginBottom:6 }}>{label}</label>
            <div style={{ position:"relative" }}>
              <input
                type={show[showKey]?"text":"password"}
                value={value}
                onChange={e=>set(e.target.value)}
                style={{...inputSt,paddingRight:44,letterSpacing:show[showKey]?0:4}}
                placeholder="Mínimo 4 caracteres"
              />
              <button onClick={()=>setShow(s=>({...s,[showKey]:!s[showKey]}))} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#9b9890",fontSize:16 }}>{show[showKey]?"🙈":"👁️"}</button>
            </div>
            <div style={{ fontSize:11,color:"#9b9890",marginTop:4 }}>{desc}</div>
          </div>
        ))}

        {msg && (
          <div style={{ padding:"10px 14px",borderRadius:8,marginBottom:16,fontSize:13,background:msg.type==="ok"?"#f0fdf4":"#fef2f2",color:msg.type==="ok"?"#16a34a":"#dc2626",border:`1px solid ${msg.type==="ok"?"#bbf7d0":"#fecaca"}` }}>
            {msg.text}
          </div>
        )}

        <button onClick={guardar} disabled={saving} style={{...btnPri,width:"100%",padding:"11px",fontSize:14,opacity:saving?0.5:1}}>
          {saving ? "Guardando..." : "Guardar PINs"}
        </button>
      </div>

      <div style={{ background:"#fdf8f0",border:"1px solid #b5883a33",borderRadius:10,padding:"14px 16px",marginTop:14 }}>
        <div style={{ fontSize:12,fontWeight:500,color:"#b5883a",marginBottom:6 }}>💡 Recomendaciones</div>
        <div style={{ fontSize:12,color:"#6b6860",lineHeight:1.7 }}>
          • Usa PINs de 4 a 8 dígitos numéricos para facilidad en tablet<br/>
          • Los 3 PINs deben ser distintos entre sí<br/>
          • No compartas el PIN de Super Admin ni el de Admin<br/>
          • Si olvidas el PIN de Super Admin, contacta al desarrollador
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [colectas, setColectas] = useState<Colecta[]>([]);
  const [seccion, setSeccion] = useState<"catequesis"|"colectas"|"listas"|"config">("listas");
  const [filtroNivel, setFiltroNivel] = useState<Nivel|"TODOS">("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState<null|"alumno"|"alumnoDetalle"|"colecta"|"colectaDetalle"|"imprimir">(null);
  const [selAlumno, setSelAlumno] = useState<Alumno|undefined>();
  const [selColecta, setSelColecta] = useState<Colecta|undefined>();
  const [editAlumno, setEditAlumno] = useState<Alumno|undefined>();
  const [impNivel, setImpNivel] = useState<Nivel|"TODOS">("TODOS");
  const [impDia, setImpDia] = useState<"TODOS"|"Miércoles"|"Sábado">("TODOS");
  const [impFiltro, setImpFiltro] = useState<"documentos"|"pagos"|"contacto">("contacto");
  const [impMostrar, setImpMostrar] = useState(false);
  const [newColecta, setNewColecta] = useState({ nombre:"", descripcion:"", meta:"" });
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState<"superadmin"|"admin"|"consulta"|null>(null);

  const load = useCallback(async () => {
    const [a,c] = await Promise.all([fetch("/api/alumnos").then(r=>r.json()), fetch("/api/colectas").then(r=>r.json())]);
    setAlumnos(Array.isArray(a)?a:[]); setColectas(Array.isArray(c)?c:[]); setLoading(false);
  }, []);

  const reload = useCallback(async () => {
    const [a,c] = await Promise.all([fetch("/api/alumnos").then(r=>r.json()), fetch("/api/colectas").then(r=>r.json())]);
    setAlumnos(Array.isArray(a)?a:[]);
    setColectas(Array.isArray(c)?c:[]);
    // refresh selected
    if (selAlumno) { const updated = (Array.isArray(a)?a:[]).find((x:Alumno)=>x.id===selAlumno.id); if(updated) setSelAlumno(updated); }
    if (selColecta) { const updated = (Array.isArray(c)?c:[]).find((x:Colecta)=>x.id===selColecta.id); if(updated) setSelColecta(updated); }
  }, [selAlumno, selColecta]);

  useEffect(()=>{
    const r = sessionStorage.getItem("rol") as "superadmin"|"admin"|"consulta"|null;
    if (!r) { window.location.href = "/"; return; }
    setRol(r);
    if (r === "consulta") setSeccion("listas");
    load();
  }, [load]);

  async function deleteAlumno(id: number) {
    if (!confirm("¿Eliminar este alumno y todos sus registros?")) return;
    await fetch(`/api/alumnos/${id}`, { method:"DELETE" });
    load();
  }

  async function crearColecta() {
    if (!newColecta.nombre.trim()) return;
    await fetch("/api/colectas", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(newColecta) });
    setNewColecta({ nombre:"", descripcion:"", meta:"" }); load();
  }

  async function toggleColecta(c: Colecta) {
    await fetch(`/api/colectas/${c.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({...c, activa: !c.activa}) });
    load();
  }

  async function deleteColecta(id: number) {
    if (!confirm("¿Eliminar esta colecta y todas sus aportaciones?")) return;
    await fetch(`/api/colectas/${id}`, { method:"DELETE" });
    load();
  }

  const alumnosFiltrados = alumnos
    .filter(a => filtroNivel === "TODOS" || a.nivel === filtroNivel)
    .filter(a => !busqueda || a.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (a.responsable||"").toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a,b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));

  const stats = {
    total: alumnos.length,
    precomunion: alumnos.filter(a=>a.nivel==="PRECOMUNION").length,
    comunion: alumnos.filter(a=>a.nivel==="COMUNION").length,
    preconfirmacion: alumnos.filter(a=>a.nivel==="PRECONFIRMACION").length,
    confirmacion: alumnos.filter(a=>a.nivel==="CONFIRMACION").length,
    docsPendientes: alumnos.reduce((s,a)=>s+a.documentos.filter(d=>!d.entregado).length,0),
    pagosPendientes: alumnos.reduce((s,a)=>s+a.pagos.filter(p=>!p.pagado).length,0),
  };

  if (loading || !rol) return <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",flexDirection:"column",gap:8 }}><div style={{ fontSize:32 }}>✝</div><div style={{ color:"#9b9890" }}>Cargando sistema...</div></div>;

  return (
    <div style={{ minHeight:"100vh",background:"var(--bg)" }}>
      {/* Header */}
      <header style={{ background:"#1c1c1a",color:"#fff",padding:"0 20px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }} className="no-print">
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <img src="/logo.png" alt="Logo" style={{ width:38,height:38,objectFit:"contain",filter:"brightness(0) invert(1)" }} />
          <div>
            <div style={{ fontWeight:600,fontSize:14,lineHeight:1.2 }}>Parroquia María Madre de Dios</div>
            <div style={{ fontSize:11,color:"#9b9890" }}>Sistema de Control · Catequesis 2026-2027</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <nav style={{ display:"flex",gap:4 }}>
            {(rol === "superadmin"
              ? [["catequesis","📚 Catequesis"],["colectas","💰 Cooperaciones"],["listas","🖨️ Listas"],["config","⚙️ Config"]]
              : rol === "admin"
              ? [["catequesis","📚 Catequesis"],["colectas","💰 Cooperaciones"],["listas","🖨️ Listas"]]
              : [["listas","🖨️ Listas"]]
            ).map(([id,label])=>(
              <button key={id} onClick={()=>setSeccion(id as typeof seccion)} style={{ padding:"7px 14px",borderRadius:7,border:"none",background:seccion===id?"rgba(255,255,255,0.15)":"transparent",color:seccion===id?"#fff":"#9b9890",fontSize:13,cursor:"pointer",fontWeight:seccion===id?500:400 }}>{label}</button>
            ))}
          </nav>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginLeft:8,paddingLeft:8,borderLeft:"1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ fontSize:11,padding:"3px 8px",borderRadius:20,background:rol==="superadmin"?"#7c3aed":rol==="admin"?"#b5883a":"#3b5bdb",color:"#fff",fontWeight:500 }}>{rol==="superadmin"?"Super Admin":rol==="admin"?"Admin":"Solo lectura"}</span>
            <button onClick={()=>{sessionStorage.clear();window.location.href="/";}} style={{ background:"none",border:"1px solid rgba(255,255,255,0.2)",borderRadius:6,color:"#9b9890",fontSize:12,padding:"5px 10px",cursor:"pointer" }}>Salir</button>
          </div>
        </div>
      </header>

      <main style={{ padding:20,maxWidth:1100,margin:"0 auto" }}>

        {/* ── CATEQUESIS ── */}
        {seccion === "catequesis" && (
          <>
            {/* Stats */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10,marginBottom:20 }}>
              {[
                { label:"Total alumnos", value:stats.total, color:"#1c1c1a", bg:"#fff" },
                { label:"Documentos pendientes", value:stats.docsPendientes, color:"#dc2626", bg:"#fef2f2" },
                { label:"Pagos pendientes", value:stats.pagosPendientes, color:"#b5883a", bg:"#fdf8f0" },
              ].map(s=>(
                <div key={s.label} style={{ background:s.bg,border:"1px solid #e8e6e0",borderRadius:10,padding:"14px 16px",boxShadow:"0 1px 2px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize:28,fontWeight:700,color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:12,color:"#6b6860" }}>{s.label}</div>
                </div>
              ))}
              {(Object.entries(NIVEL_LABEL) as [Nivel,string][]).map(([k,v])=>(
                <div key={k} style={{ background:NIVEL_BG[k],border:`1px solid ${NIVEL_COLOR[k]}22`,borderRadius:10,padding:"14px 16px" }}>
                  <div style={{ fontSize:24,fontWeight:700,color:NIVEL_COLOR[k] }}>{stats[k.toLowerCase() as keyof typeof stats]||0}</div>
                  <div style={{ fontSize:12,color:"#6b6860" }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Toolbar */}
            <div style={{ display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center" }} className="no-print">
              <input style={{...inputSt,maxWidth:240}} value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="🔍 Buscar alumno o responsable..." />
              <select style={{...inputSt,maxWidth:180}} value={filtroNivel} onChange={e=>setFiltroNivel(e.target.value as Nivel|"TODOS")}>
                <option value="TODOS">Todos los niveles</option>
                {(Object.entries(NIVEL_LABEL) as [Nivel,string][]).map(([k,v])=><option key={k} value={k}>{v}</option>)}
              </select>
              {(rol==="admin" || rol==="superadmin") && <button style={btnPri} onClick={()=>{setEditAlumno(undefined);setModal("alumno");}}>+ Agregar alumno</button>}
            </div>

            {/* Lista alumnos */}
            {alumnosFiltrados.length === 0 ? (
              <div style={{ textAlign:"center",padding:"3rem",background:"#fff",borderRadius:12,border:"1px dashed #e8e6e0",color:"#9b9890" }}>
                <div style={{ fontSize:40,marginBottom:8 }}>✝</div>
                <div>No hay alumnos registrados</div>
                <button style={{...btnPri,marginTop:12}} onClick={()=>setModal("alumno")}>Registrar primer alumno</button>
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {alumnosFiltrados.map(a=>{
                  const docsOk = a.documentos.filter(d=>d.entregado).length;
                  const pagosOk = a.pagos.filter(p=>p.pagado).length;
                  const docsPend = a.documentos.length - docsOk;
                  const pagosPend = a.pagos.length - pagosOk;
                  return (
                    <div key={a.id} style={{ background:"#fff",border:"1px solid #e8e6e0",borderRadius:10,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 2px rgba(0,0,0,0.03)",cursor:"pointer" }} onClick={()=>{setSelAlumno(a);setModal("alumnoDetalle");}}>
                      <div style={{ width:38,height:38,borderRadius:"50%",background:NIVEL_BG[a.nivel],border:`2px solid ${NIVEL_COLOR[a.nivel]}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:NIVEL_COLOR[a.nivel],flexShrink:0 }}>{a.nombre.charAt(0)}</div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontWeight:500,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{a.nombre}</div>
                        <div style={{ fontSize:12,color:"#9b9890",marginTop:1 }}>
                          <span style={{ color:NIVEL_COLOR[a.nivel],fontWeight:500 }}>{NIVEL_LABEL[a.nivel]}</span>
                          {a.dia && <span> · {a.dia}</span>}
                          {a.catequista && <span> · Cat. {a.catequista}</span>}
                        </div>
                      </div>
                      {a.responsable && <div style={{ fontSize:12,color:"#6b6860",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end" }}><span>{a.responsable}</span>{a.telefonoCelular&&<span style={{color:"#9b9890"}}>{a.telefonoCelular}</span>}</div>}
                      <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                        {docsPend > 0 && <span style={{ fontSize:11,padding:"3px 8px",borderRadius:20,background:"#fef2f2",color:"#dc2626",fontWeight:500 }}>Docs {docsOk}/{a.documentos.length}</span>}
                        {docsPend === 0 && a.documentos.length > 0 && <span style={{ fontSize:11,padding:"3px 8px",borderRadius:20,background:"#f0fdf4",color:"#16a34a",fontWeight:500 }}>✓ Docs</span>}
                        {pagosPend > 0 && <span style={{ fontSize:11,padding:"3px 8px",borderRadius:20,background:"#fdf8f0",color:"#b5883a",fontWeight:500 }}>Pagos {pagosOk}/{a.pagos.length}</span>}
                        {pagosPend === 0 && a.pagos.length > 0 && <span style={{ fontSize:11,padding:"3px 8px",borderRadius:20,background:"#f0fdf4",color:"#16a34a",fontWeight:500 }}>✓ Pagos</span>}
                      </div>
                      <div style={{ display:"flex",gap:4,flexShrink:0 }} onClick={e=>e.stopPropagation()}>
                        {(rol==="admin" || rol==="superadmin") && <>
                          <button onClick={()=>{setEditAlumno(a);setModal("alumno");}} style={{ background:"none",border:"none",color:"#9b9890",fontSize:16,cursor:"pointer",padding:"4px" }}>✏️</button>
                          <button onClick={()=>deleteAlumno(a.id)} style={{ background:"none",border:"none",color:"#9b9890",fontSize:16,cursor:"pointer",padding:"4px" }}>🗑️</button>
                        </>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── COLECTAS ── */}
        {seccion === "colectas" && (rol === "admin" || rol === "superadmin") && (
          <>
            <div style={{ background:"#fff",border:"1px solid #e8e6e0",borderRadius:12,padding:"18px 20px",marginBottom:20 }}>
              <div style={{ fontSize:13,fontWeight:600,color:"#1c1c1a",marginBottom:14 }}>Nueva cooperación / colecta</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr auto",gap:10,alignItems:"end" }}>
                <div><label style={{ fontSize:12,color:"#6b6860",display:"block",marginBottom:4 }}>Nombre *</label><input style={inputSt} value={newColecta.nombre} onChange={e=>setNewColecta(p=>({...p,nombre:e.target.value}))} placeholder="Ej. Cooperación viaje de confirmación" /></div>
                <div><label style={{ fontSize:12,color:"#6b6860",display:"block",marginBottom:4 }}>Meta (opcional $)</label><input type="number" style={inputSt} value={newColecta.meta} onChange={e=>setNewColecta(p=>({...p,meta:e.target.value}))} placeholder="0" /></div>
                <button style={btnGold} onClick={crearColecta}>+ Crear colecta</button>
              </div>
              <div style={{ marginTop:10 }}><label style={{ fontSize:12,color:"#6b6860",display:"block",marginBottom:4 }}>Descripción (opcional)</label><input style={inputSt} value={newColecta.descripcion} onChange={e=>setNewColecta(p=>({...p,descripcion:e.target.value}))} placeholder="Descripción corta..." /></div>
            </div>

            {colectas.length === 0 ? (
              <div style={{ textAlign:"center",padding:"3rem",background:"#fff",borderRadius:12,border:"1px dashed #e8e6e0",color:"#9b9890" }}>
                <div style={{ fontSize:32,marginBottom:8 }}>💰</div>
                <div>No hay cooperaciones registradas</div>
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {colectas.map(c=>{
                  const total = c.aportaciones.reduce((s,a)=>s+a.monto,0);
                  return (
                    <div key={c.id} style={{ background:"#fff",border:"1px solid",borderColor:c.activa?"#b5883a33":"#e8e6e0",borderRadius:10,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 2px rgba(0,0,0,0.03)",cursor:"pointer",opacity:c.activa?1:0.7 }} onClick={()=>{setSelColecta(c);setModal("colectaDetalle");}}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                          <span style={{ fontWeight:600,fontSize:14 }}>{c.nombre}</span>
                          <span style={{ fontSize:11,padding:"2px 8px",borderRadius:20,background:c.activa?"#fdf8f0":"#f5f4f0",color:c.activa?"#b5883a":"#9b9890",fontWeight:500 }}>{c.activa?"Activa":"Cerrada"}</span>
                        </div>
                        {c.descripcion && <div style={{ fontSize:12,color:"#9b9890",marginTop:2 }}>{c.descripcion}</div>}
                        <div style={{ fontSize:12,color:"#6b6860",marginTop:4 }}>{c._count.aportaciones} aportaciones</div>
                      </div>
                      <div style={{ textAlign:"right",flexShrink:0 }}>
                        <div style={{ fontSize:22,fontWeight:700,color:"#b5883a" }}>${total.toLocaleString("es-MX",{minimumFractionDigits:2})}</div>
                        {c.meta && <div style={{ fontSize:12,color:"#9b9890" }}>de ${c.meta.toLocaleString()} meta</div>}
                      </div>
                      <div style={{ display:"flex",flexDirection:"column",gap:6,flexShrink:0 }} onClick={e=>e.stopPropagation()}>
                        {(rol==="admin" || rol==="superadmin") && <>
                          <button onClick={()=>toggleColecta(c)} style={{ fontSize:11,padding:"4px 10px",borderRadius:6,border:"1px solid #e8e6e0",background:"transparent",color:"#6b6860",cursor:"pointer" }}>{c.activa?"Cerrar":"Reabrir"}</button>
                          <button onClick={()=>deleteColecta(c.id)} style={{ background:"none",border:"none",color:"#d1cfc8",fontSize:14,cursor:"pointer",textAlign:"right" }}>🗑️</button>
                        </>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── LISTAS ── */}
        {seccion === "listas" && (
          <>
            {!impMostrar ? (
              <div style={{ background:"#fff",border:"1px solid #e8e6e0",borderRadius:12,padding:"24px",maxWidth:480 }}>
                <div style={{ fontSize:15,fontWeight:600,marginBottom:18 }}>Generar lista para imprimir</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14 }}>
                  <div>
                    <label style={{ fontSize:12,color:"#6b6860",display:"block",marginBottom:6 }}>Nivel</label>
                    <select style={inputSt} value={impNivel} onChange={e=>setImpNivel(e.target.value as Nivel|"TODOS")}>
                      <option value="TODOS">Todos los niveles</option>
                      {(Object.entries(NIVEL_LABEL) as [Nivel,string][]).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12,color:"#6b6860",display:"block",marginBottom:6 }}>Día</label>
                    <select style={inputSt} value={impDia} onChange={e=>setImpDia(e.target.value as typeof impDia)}>
                      <option value="TODOS">Todos los días</option>
                      <option value="Miércoles">Miércoles</option>
                      <option value="Sábado">Sábado</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:20 }}>
                  <label style={{ fontSize:12,color:"#6b6860",display:"block",marginBottom:6 }}>Tipo de lista</label>
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {[["contacto","📋 Lista de contactos (nombre, responsable, teléfonos)"],["documentos","📄 Control de documentos"],["pagos","💰 Control de pagos de cierre"]].map(([k,v])=>(
                      <label key={k} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:8,border:"1px solid",borderColor:impFiltro===k?"#1c1c1a":"#e8e6e0",cursor:"pointer",background:impFiltro===k?"#f5f4f0":"#fafaf9" }}>
                        <input type="radio" checked={impFiltro===k} onChange={()=>setImpFiltro(k as typeof impFiltro)} style={{ accentColor:"#1c1c1a" }} />
                        <span style={{ fontSize:13 }}>{v}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  <button style={btnGold} onClick={()=>setImpMostrar(true)}>Ver lista</button>
                  {impDia !== "TODOS" && impNivel !== "TODOS" && (
                    <span style={{ fontSize:12,color:"#b5883a" }}>📋 {NIVEL_LABEL[impNivel as Nivel]} · {impDia}</span>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom:16,display:"flex",gap:8,alignItems:"center" }} className="no-print">
                  <button style={btnSec} onClick={()=>setImpMostrar(false)}>← Volver</button>
                  <button style={btnGold} onClick={()=>window.print()}>🖨️ Imprimir</button>
                </div>
                <div style={{ background:"#fff",border:"1px solid #e8e6e0",borderRadius:12,padding:24 }}>
                  <ListaImprimible alumnos={alumnos} nivel={impNivel} dia={impDia} filtro={impFiltro} />
                </div>
              </div>
            )}
          </>
        )}

        {/* ── CONFIG ── */}
        {seccion === "config" && rol === "superadmin" && (
          <ConfigPines />
        )}
      </main>

      {/* Modals */}
      {modal==="alumno" && (
        <Modal title={editAlumno?"Editar alumno":"Registrar alumno"} onClose={()=>setModal(null)}>
          <AlumnoForm initial={editAlumno} onSave={()=>{setModal(null);load();}} onClose={()=>setModal(null)} />
        </Modal>
      )}
      {modal==="alumnoDetalle" && selAlumno && (
        <Modal title="Ficha del alumno" onClose={()=>setModal(null)} wide>
          <AlumnoDetalle alumno={selAlumno} onClose={()=>setModal(null)} onRefresh={reload} />
        </Modal>
      )}
      {modal==="colectaDetalle" && selColecta && (
        <Modal title={selColecta.nombre} onClose={()=>setModal(null)} wide>
          <ColectaDetalle colecta={selColecta} alumnos={alumnos} onClose={()=>setModal(null)} onRefresh={reload} />
        </Modal>
      )}
    </div>
  );
}
