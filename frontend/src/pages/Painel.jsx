import React, { useEffect, useRef, useState } from "react";
import { api } from "../services/api";

export default function Painel() {
  const [chamando, setChamando] = useState([]);
  const [proximas, setProximas] = useState([]);
  const prevIdsRef = useRef([]);

  // pequeno beep com WebAudio (sem arquivos externos)
  const beep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = "sine"; o.frequency.value = 880; // A5
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.start(); o.stop(ctx.currentTime + 0.6);
    } catch {}
  };

  async function carregar() {
    try {
      const { data } = await api.get("/senhas/estado");
      // detectar novas senhas chamando
      const newIds = data.chamando.map(s => s._id).sort();
      const prevIds = prevIdsRef.current;
      const hasNew = newIds.some(id => !prevIds.includes(id));
      setChamando(data.chamando);
      const aguardando = [...data.aguardando_preferencial, ...data.aguardando_normal].slice(0, 8);
      setProximas(aguardando);
      if (prevIds.length && hasNew) beep();
      prevIdsRef.current = newIds;
    } catch {}
  }

  useEffect(() => { carregar(); const t=setInterval(carregar,3000); return ()=>clearInterval(t); }, []);

  const numero = (s) => (s.tipo==="preferencial"?"P":"N")+String(s.numero).padStart(3,"0");
  const hora = (d) => d ? new Date(d).toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"}) : "-";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white p-8">
      <div className="text-center mb-10">
        <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9ede071ef_costao_logo.jpeg" alt="Logo" className="w-20 h-20 mx-auto mb-4"/>
        <h1 className="text-5xl font-bold">Costão do Santinho</h1>
        <p className="text-xl text-slate-300">Painel de Chamadas</p>
        <div className="text-lg text-slate-400 mt-2">
          {new Date().toLocaleString("pt-BR", { weekday:"long", year:"numeric", month:"long", day:"numeric", hour:"2-digit", minute:"2-digit" })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Senhas Chamadas</h2>
        {chamando.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
            {chamando.map((s) => (
              <div key={s._id} className={`p-8 rounded-2xl shadow-2xl bg-gradient-to-br ${s.tipo==="preferencial"?"from-amber-400 to-orange-500":"from-blue-400 to-cyan-500"}`}>
                <div className="text-6xl font-bold">{numero(s)}</div>
                <div className="text-lg opacity-90">{s.tipo==="preferencial"?"Preferencial":"Normal"}</div>
                <div className="text-2xl font-semibold mt-4 mb-2">{s.guiche || "Guichê 1"}</div>
                <div className="opacity-90">{hora(s.hora_chamada)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 bg-white/5 rounded-2xl border border-slate-700 text-center mb-10">
            <p className="text-2xl text-slate-300">Nenhuma senha sendo chamada.</p>
          </div>
        )}

        <h3 className="text-2xl font-bold mb-4 text-center">Próximas Senhas</h3>
        {proximas.length ? (
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {proximas.map((s) => (
                <div key={s._id} className={`p-4 rounded-xl border text-center ${s.tipo==="preferencial"?"bg-amber-400/20 border-amber-400":"bg-white/10 border-slate-600"}`}>
                  <div className="text-3xl font-bold">{numero(s)}</div>
                  <div className="text-sm text-slate-300 mt-1">{hora(s.hora_retirada)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-white/5 rounded-2xl border border-slate-700 text-center">
            <p className="text-xl text-slate-300">Nenhuma senha aguardando.</p>
          </div>
        )}
      </div>
    </div>
  );
}
