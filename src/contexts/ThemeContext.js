import React, { createContext, useContext, useState, useEffect } from "react"
import { ThemeProvider as StyledThemeProvider } from "styled-components" // Import styled-components ThemeProvider

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
			success: "#4CAF50",
			error: "#F44336",
			headerGlow: "#FF4500",
			gradientStart: "#FF7F50",
			gradientEnd: "#FF6347",
		},
		{
			name: "Nebula",
			background: "#1B1E3C",
			surface: "#2E325A",
			text: "#E6E8FF",
			primary: "#7B88FF",
			border: "#4A54D2",
			success: "#50E3C2",
			error: "#FF5677",
			headerGlow: "#7B88FF",
			gradientStart: "#1B1E3C",
			gradientEnd: "#2E325A",
		},
		{
			name: "Dracula",
			background: "#282A36",
			surface: "#44475A",
			text: "#F8F8F2",
			primary: "#BD93F9",
			border: "#6272A4",
			success: "#50FA7B",
			error: "#FF5555",
			headerGlow: "#BD93F9",
			gradientStart: "#282A36",
			gradientEnd: "#44475A",
		},
		{
			name: "Synthwave",
			background: "#2b1055",
			surface: "#4c2885",
			text: "#ff71ce",
			primary: "#b967ff",
			border: "#01cdfe",
			success: "#05ffa1",
			error: "#ff3366",
			headerGlow: "#b967ff",
			gradientStart: "#2b1055",
			gradientEnd: "#7303c0",
		},
		{
			name: "Cyberpunk",
			background: "#000000",
			surface: "#1a1a1a",
			text: "#00ff00",
			primary: "#ff00ff",
			border: "#00ffff",
			success: "#ffffff",
			error: "#ff0000",
			headerGlow: "#ff00ff",
			gradientStart: "#000000",
			gradientEnd: "#1a0035",
		},
		{
			name: "Neon",
			background: "#0c0c0c",
			surface: "#1f1f1f",
			text: "#00ff99",
			primary: "#ff00ff",
			border: "#00ffff",
			success: "#ffffff",
			error: "#ff3366",
			headerGlow: "#00ffff",
			gradientStart: "#0c0c0c",
			gradientEnd: "#1f1f1f",
		},
		{
			name: "Sunset",
			background: "#FF512F",
			surface: "#F09819",
			text: "#ffffff",
			primary: "#FF8C42",
			border: "#FF512F",
			success: "#4CAF50",
			error: "#F44336",
			headerGlow: "#FF8C42",
			gradientStart: "#FF512F",
			gradientEnd: "#F09819",
		},
		{
			name: "Ocean",
			background: "#141E30",
			surface: "#243B55",
			text: "#E0E0E0",
			primary: "#00B4DB",
			border: "#0083B0",
			success: "#4CAF50",
			error: "#F44336",
			headerGlow: "#00B4DB",
			gradientStart: "#141E30",
			gradientEnd: "#243B55",
		},
	]

	const [theme, setTheme] = useState(() => {
		const savedTheme = localStorage.getItem("selectedTheme")
		const oceanTheme = availableThemes.find((t) => t.name === "Ocean")
		if (savedTheme) {
			const foundTheme = availableThemes.find((t) => t.name === savedTheme)
			return foundTheme || oceanTheme
		}
		return oceanTheme
	})

	// Apply theme to document body and CSS variables when theme changes
	useEffect(() => {
		if (theme) {
			document.body.style.background = theme.background
			document.body.style.color = theme.text

			// Set CSS variables for global use
			Object.keys(theme).forEach((key) => {
				document.documentElement.style.setProperty(`--theme-${key}`, theme[key])
			})
		}
	}, [theme])

	const handleThemeChange = (newTheme) => {
		setTheme(newTheme)
		localStorage.setItem("selectedTheme", newTheme.name)
	}

	const value = {
		theme: theme,
		setTheme: handleThemeChange,
		availableThemes: availableThemes,
	}

	return (
		<ThemeContext.Provider value={value}>
			<StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>{" "}
			{/* Wrap with styled-components ThemeProvider */}
		</ThemeContext.Provider>
	)
}
