import React, { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { isAuthenticated } from "../lib/auth";

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    const [authStatus, setAuthStatus] = useState<null | boolean>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const isValid = await isAuthenticated();
            setAuthStatus(isValid);
        };
        checkAuth();
    }, []);

    if (authStatus === null) return <p>Loading...</p>;

    return authStatus ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
