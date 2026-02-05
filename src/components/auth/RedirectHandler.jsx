import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const RedirectHandler = ({ to }) => {
    useEffect(() => {
        // Here you could add logging or analytic events
    }, [to]);

    return <Navigate to={to} replace />;
};

export default RedirectHandler;
