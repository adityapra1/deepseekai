// Aap isko ek config.js ya constants.js file mein rakh sakte hain
export const BACKEND_URL = import.meta.env.MODE === "development" 
  ? "http://localhost:4002/api/v1" // Aapka Local URL
  : "https://deepseek-backend-app.onrender.com/api/v1"; // Aapka Render URL