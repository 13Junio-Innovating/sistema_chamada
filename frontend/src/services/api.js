import axios from "axios";

// Criando instância do Axios
export const api = axios.create({
  baseURL: "http://localhost:5000/api", // ajuste se seu backend estiver em outra porta
});

// Interceptor para enviar o token em todas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("🔹 Enviando token no header:", token); // log para debug

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  console.error("Erro no interceptor de requisição:", error);
  return Promise.reject(error);
});

// Interceptor para respostas (opcional, útil para 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ 401 Unauthorized! Talvez o token expirou ou não foi enviado corretamente.");
      // Aqui você pode adicionar logout automático se quiser:
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
