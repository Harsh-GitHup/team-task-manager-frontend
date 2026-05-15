const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/$/, "");

export const getApiBaseUrl = () => {
    const runtimeConfig = globalThis.window?.__APP_CONFIG__ || {};
    return normalizeBaseUrl(runtimeConfig.API_URL || import.meta.env.VITE_API_URL || "http://localhost:5000");
};
