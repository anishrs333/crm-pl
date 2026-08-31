import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({children}){
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const savedUser = localStorage.getItem("user");

        const accessToken = localStorage.getItem("access_token");

        if(savedUser && accessToken){
            try{
                setUser(JSON.parse(savedUser));
            }
            catch(error){
                localStorage.removeItem("user");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
            }
        }

        setLoading(false);
    }, []);

    const login = (data)=>{
        if(data.access){
            localStorage.setItem(
                "access_token",
                data.access
            );
        }

        if(data.refresh){
            localStorage.setItem(
                "refresh_token",
                data.refresh
            );
        }

        if(data.user){
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            setUser(data.user);
        }
    };

    const logout = ()=>{
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        setUser(null);
    };

    const isAuthenticated = !!localStorage.getItem("access_token");

    return(
        <AuthContext.Provider
         value={{
            user,
            loading,
            login,
            logout,
            isAuthenticated,
         }}>
            {children}
         </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext); 
}