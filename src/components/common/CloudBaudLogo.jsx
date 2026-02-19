import React from 'react';
import cbLogo from '../../assets/images/CB_logo.png';

const CloudBaudLogo = ({ className }) => {
    return (
        <img
            src={cbLogo}
            alt="CloudBaud Logo"
            className={className}
            style={{ objectFit: 'contain' }}
        />
    );
};

export default CloudBaudLogo;
