import { useAuth } from "../../context/AuthContext";

function RoleRoute({
    children,
    allowedRoles
}) {

    const {user, loading } = useAuth();

    if(loading) {
        return(
            <div className="route-loading">
                Loading CRM... 
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

    if(!allowedRoles.includes(user.role)){

        return(
            <Navigate 
               to="/dashboard"
               replace
            />
        );
    }

    return children;
}

export default RoleRoute;