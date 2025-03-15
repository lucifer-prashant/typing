import React, { createContext, useContext, useState } from "react"

const ThemeContext = createContext()

export function useTheme() {
	return useContext(ThemeContext)
}

export const ThemeProvider = ({ children }) => {
	const availableThemes = [
		{
			name: "Coral",
			background: "#FF7F50",
			surface: "#FF6347",
			text: "#ffffff",
			primary: "#FFA07A",
			border: "#FF4500",
		},
		{
			name: "Synthwave",
			background: "#2b1055",
			surface: "#4c2885",
			text: "#ff71ce",
			primary: "#b967ff",
			border: "#01cdfe",
		},
		{
			name: "Cyberpunk",
			background: "#000000",
			surface: "#1a1a1a",
			text: "#00ff00",
			primary: "#ff00ff",
			border: "#00ffff",
		},
		{
			name: "Neon",
			background: "#0c0c0c",
			surface: "#1f1f1f",
			text: "#00ff99",
			primary: "#ff00ff",
			border: "#00ffff",
		},
	]
	const [theme, setTheme] = useState(availableThemes[0])

	const value = {
		theme: theme,
		setTheme: setTheme,
		availableThemes: availableThemes,
	}

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
