// import api from "./api"

// const getUsers = async () => {
//     const response = await api.get("/users/");
//     return response.data;
// };

// const getUser = async (id) =>{
//     const response = await api.get(`/users/${id}/`);
//     return response.data;
// };

// const createUser = async (userData) => {
//     const response = await api.post("/users/", userData);
//     return response.data;
// };

// const updateUser = async (id, userData) =>{
//     const response = await api.put(
//         `/users/${id}`,
//         userData
//     );

//     return response.data;
// };

// const deleteUser = async (id) =>{
//     const response = await api.delete(`/users/${id}/`);
//     return response.data;
// };

// const userService = {
//     getUsers,
//     getUser,
//     createUser,
//     updateUser,
//     deleteUser,
// };

// export default userService; 