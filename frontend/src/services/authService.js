import api from "./api";

const login = async (username, password) => {
    const response = await api.post("/auth/login/", {
        username,
        password,
    });
    return response.data;
};

const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
};

const getCurrentUser = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
};

const authService = {
    login,
    logout,
    getCurrentUser,
};

export default authService;