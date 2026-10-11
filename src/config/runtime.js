const normalizeBaseUrl = (value) => {
    let url = String(value || "").trim();
    // Strip any accidental spaces or comments pasted at the end
    url = url.split(/\s+/)[0] || "";
    return url.replace(/\/+$/, "");
};

export const getApiBaseUrl = () => {
    const runtimeConfig = globalThis.window?.__APP_CONFIG__ || {};
    return normalizeBaseUrl(runtimeConfig.API_URL || import.meta.env.VITE_API_URL || "http://localhost:5000");
};
