import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // Разрешает отправлять cookies и другие credentials (например, HTTP Basic Auth) вместе с кросс-доменным запросом
  // Без этого браузер НЕ отправит cookies (включая сессионные), даже если они есть
  // Это нужно, когда аутентификация основана на cookies (например, session-based auth с Express + express-session, или с Clerk, Supabase и т.д.)
  withCredentials: true,
});

export default axiosInstance;
