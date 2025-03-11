import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
    const themes = {
        default: {
            primary: '#646cff',
            secondary: '#a78bfa',
            background: 'linear-gradient(-45deg, #1a1a1a, #2a2a2a, #242424, #1f1f1f)',
            text: '#ffffff',
            accent: '#646cff',
            error: '#ff4444',
            success: '#00c853',
            warning: '#ffa726',
            surface: 'rgba(26, 26, 26, 0.8)',
            border: 'rgba(255, 255, 255, 0.1)'
        },
        cyberpunk: {
            primary: '#00ff9f',
            secondary: '#ff00ff',
            background: 'linear-gradient(-45deg, #120458, #000000, #120458, #000000)',
            text: '#ffffff',
            accent: '#00ff9f',
            error: '#ff0055',
            success: '#00ff9f',
            warning: '#ffff00',
            surface: 'rgba(18, 4, 88, 0.8)',
            border: 'rgba(0, 255, 159, 0.2)'
        },
        synthwave: {
            primary: '#ff2a6d',
            secondary: '#05d9e8',
            background: 'linear-gradient(-45deg, #2b1055, #7597de, #2b1055, #7597de)',
            text: '#ffffff',
            accent: '#ff2a6d',
            error: '#ff0000',
            success: '#05d9e8',
            warning: '#ffd700',
            surface: 'rgba(43, 16, 85, 0.8)',
            border: 'rgba(255, 42, 109, 0.2)'
        },
        forest: {
            primary: '#4caf50',
            secondary: '#81c784',
            background: 'linear-gradient(-45deg, #1b4332, #2d6a4f, #40916c, #52b788)',
            text: '#ffffff',
            accent: '#4caf50',
            error: '#ff5252',
            success: '#69f0ae',
            warning: '#ffd54f',
            surface: 'rgba(27, 67, 50, 0.8)',
            border: 'rgba(76, 175, 80, 0.2)'
        },
        ocean: {
            primary: '#0288d1',
            secondary: '#4fc3f7',
            background: 'linear-gradient(-45deg, #01579b, #0277bd, #0288d1, #039be5)',
            text: '#ffffff',
            accent: '#0288d1',
            error: '#ff5252',
            success: '#00e5ff',
            warning: '#ffd54f',
            surface: 'rgba(1, 87, 155, 0.8)',
            border: 'rgba(2, 136, 209, 0.2)'
        },
        minimal: {
            primary: '#212121',
            secondary: '#757575',
            background: 'linear-gradient(-45deg, #fafafa, #f5f5f5, #eeeeee, #e0e0e0)',
            text: '#212121',
            accent: '#212121',
            error: '#d32f2f',
            success: '#388e3c',
            warning: '#f57c00',
            surface: 'rgba(250, 250, 250, 0.8)',
            border: 'rgba(33, 33, 33, 0.1)'
        }
    };

    const [currentTheme, setCurrentTheme] = useState('default');

    const value = {
        theme: themes[currentTheme],
        setTheme: setCurrentTheme,
        availableThemes: Object.keys(themes)
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}