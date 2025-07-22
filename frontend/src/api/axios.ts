import { useAuthStore } from "@/store/useUserStore";
import axios from "axios"

const api = axios.create({
    baseURL: "https://apayukita.com/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
})

api.interceptors.request.use((config) => {
    const storeToken = useAuthStore.getState().accessToken;
    const token = import.meta.env.VITE_NODE_ENV === 'development' ? import.meta.env.VITE_TOKEN : storeToken;
    
    if(token && config.headers){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api;