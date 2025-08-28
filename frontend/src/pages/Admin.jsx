import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import SenhaCard from "../components/SenhaCard";
import { Phone, CheckCircle, Star, Users } from "lucide-react";
import Layout from "../components/Layout";

export default function Admin() {
  const [estado, setEstado] = useState({ aguardando_normal: [], aguardando_preferencial: [], chamando: [] });
  const [stats, setStats] = useState({ total: 0, aguardando: 0, chamando: 0, atendidas: 0, canceladas: 0, tempoMedio: 0 });
  const [guiche, setGuiche] = useState("");
  const [atendente, setAtendente] = useState("");

  async function carregar() {
    try {
      const [{ data: est }, { data: st }] = await Promise.all([
        api.get("/senhas/estado"),
        api.get("/senhas/stats?period=hoje")
      ]);
      setEstado(est);
      setStats(st);
    } catch {}
  }
  useEffect(() => { carregar(); const t = setInterval(carregar, 5000); return () => clearInterval(t); }, []);

  const chamarProxima = async () => {
    if (!guiche || !atendente) return alert("Informe guichê e atendente.");
    try {
      await api.post("/senhas/chamar-proxima", { guiche, atendente });
      carregar();
    } catch (e) {
      alert(e?.response?.data?.error || "Erro ao chamar próxima");
    }
  };

  const finalizar = async (id) => { await api.patch(`/senhas/${id}/finalizar`); carregar(); };
  const voltar = async (id) => { await api.patch(`/senhas/${id}/voltar`); carregar(); };
  const cancelar = async (id) => { await api.patch(`/senhas/${id}/cancelar`); carregar(); };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <CardKPI title="Total (hoje)" value={stats.total}/>
          <CardKPI title="Aguardando" value={stats.aguardando}/>
          <CardKPI title="Chamando" value={stats.chamando}/>
          <CardKPI title="Atendidas" value={stats.atendidas}/>
          <CardKPI title="Canceladas" value={stats.canceladas}/>
        </div>
        <div className="bg-white rounded-xl border p-3">
          <div className="text-sm text-slate-700">Tempo médio de atendimento (min): <b>{stats.tempoMedio}</b></div>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-xl border p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm">Guichê</label>
              <select className="w-full border rounded p-2" value={guiche} onChange={e=>setGuiche(e.target.value)}>
                <option value="">Selecione</option>
                <option>Guichê 1</option><option>Guichê 2</option><option>Guichê 3</option><option>Recepção</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Atendente</label>
              <input className="w-full border rounded p-2" placeholder="Nome do atendente" value={atendente} onChange={e=>setAtendente(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button onClick={chamarProxima} className="w-full h-10 rounded bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600">
                <Phone className="w-4 h-4 inline mr-2"/> Chamar Próxima Senha
              </button>
            </div>
          </div>
        </div>

        {/* Filas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="text-xl font-bold mb-3">Em Atendimento</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {estado.chamando.length ? estado.chamando.map(s => (
                <SenhaCard key={s._id} senha={s} onFinalizar={finalizar} onVoltar={voltar} onCancelar={cancelar}/>
              )) : <p className="text-slate-500 text-center py-4">Nenhuma senha em atendimento.</p>}
            </div>
          </div>
          <div className="grid grid-rows-2 gap-8">
            <div className="bg-white rounded-xl border p-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Star className="w-5 h-5 text-amber-600"/> Fila Preferencial</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {estado.aguardando_preferencial.length ? estado.aguardando_preferencial.map(s => (
                  <SenhaCard key={s._id} senha={s} onFinalizar={finalizar} onVoltar={voltar} onCancelar={cancelar}/>
                )) : <p className="text-slate-500 text-center py-4">Fila preferencial vazia.</p>}
              </div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Users className="w-5 h-5 text-blue-600"/> Fila Normal</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {estado.aguardando_normal.length ? estado.aguardando_normal.map(s => (
                  <SenhaCard key={s._id} senha={s} onFinalizar={finalizar} onVoltar={voltar} onCancelar={cancelar}/>
                )) : <p className="text-slate-500 text-center py-4">Fila normal vazia.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function CardKPI({ title, value }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="text-sm opacity-80">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
