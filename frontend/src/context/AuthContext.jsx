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

                const parsedUser =
                   JSON.parse(savedUser);

                   setUser(parsedUser);
            }
            catch(error){

                console.error(
                       "Invalid saved user",
                       error
                );

                localStorage.removeItem("user");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
            }
        }

        setLoading(false);
    }, []);

    const login = ({
        user,
        accessToken,
        refreshToken
    }) => {
        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        localStorage.setItem(
            "access_token",
            accessToken
        );

        if(refreshToken){
            localStorage.setItem(
                "refresh_token",
                refreshToken
            );
        }

        setUser(user);
    };
       

    const logout = ()=>{
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };


    return(
        <AuthContext.Provider
              value={value}>
            {children}
         </AuthContext.Provider>
    );
}

export function useAuth(){
    return useContext(AuthContext); 
}