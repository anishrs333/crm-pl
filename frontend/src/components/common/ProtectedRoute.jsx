import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({children}){

    const{user, loading } = useAuth();

    if(loading){
        return (
            <div className="route-loading">
                Loading CRM.... 
            </div>
        );
    }

    if(!user){
        return(
            <Navigate 
                to="/login"
                replace
            />
        );
    }

    return children;

}

export default ProtectedRoute;