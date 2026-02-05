import React from 'react';

const CloudBaudLogo = ({ className }) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#d946ef', stopOpacity: 1 }} />
                </linearGradient>

                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
                    <feOffset dx="0" dy="0.5" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode in="offsetblur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C14.56 22 16.91 21.03 18.73 19.42L17.26 18.06C15.86 19.27 14.02 20 12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C14.02 4 15.86 4.73 17.26 5.94L18.73 4.58C16.91 2.97 14.56 2 12 2ZM12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17C13.28 17 14.45 16.51 15.34 15.71L13.88 14.34C13.38 14.75 12.73 15 12 15C10.34 15 9 13.66 9 12C9 10.34 10.34 9 12 9C12.73 9 13.38 9.25 13.88 9.66L15.34 8.29C14.45 7.49 13.28 7 12 7ZM19.22 8.5C18.68 7.63 17.97 6.89 17.13 6.33L18.47 4.9C19.52 5.64 20.41 6.57 21.09 7.66L19.22 8.5ZM17.13 17.67C17.97 17.11 18.68 16.37 19.22 15.5L21.09 16.34C20.41 17.43 19.52 18.36 18.47 19.1L17.13 17.67Z"
                fill="url(#logoGradient)"
                filter="url(#shadow)"
                transform="rotate(-45 12 12)"
            />
        </svg>
    );
};

export default CloudBaudLogo;
