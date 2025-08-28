import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@costao.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      nav("/admin");
    } catch (e) {
      alert(e?.response?.data?.error || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded-xl border w-[360px] shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Login Admin</h1>
        <label className="text-sm">E-mail</label>
        <input className="border rounded w-full p-2 mb-4" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="text-sm">Senha</label>
        <input className="border rounded w-full p-2 mb-6" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button disabled={loading} className="w-full h-10 rounded bg-blue-600 hover:bg-blue-700 text-white">{loading?"Entrando...":"Entrar"}</button>
      </form>
    </div>
  );
}
