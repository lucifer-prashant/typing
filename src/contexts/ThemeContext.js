import React, { createContext, useContext, useState, useEffect } from "react"

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
			success: "#00ff00",
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
			success: "#00ff99",
			error: "#ff3366",
			headerGlow: "#00ffff",
			gradientStart: "#0c0c0c",
			gradientEnd: "#1f1f1f",
		},
	]
	const [theme, setTheme] = useState(() => {
		// Check if a theme preference exists in localStorage
		const savedTheme = localStorage.getItem("selectedTheme")
		if (savedTheme) {
			const foundTheme = availableThemes.find((t) => t.name === savedTheme)
			return foundTheme || availableThemes[0]
		}
		return availableThemes[0]
	})

	// Apply theme to document body and CSS variables when theme changes
	useEffect(() => {
		if (theme) {
			document.body.style.background = theme.background
			document.body.style.color = theme.text

			// Set CSS variables for global access
			document.documentElement.style.setProperty(
				"--theme-background",
				theme.background
			)
			document.documentElement.style.setProperty(
				"--theme-surface",
				theme.surface
			)
			document.documentElement.style.setProperty("--theme-text", theme.text)
			document.documentElement.style.setProperty(
				"--theme-primary",
				theme.primary
			)
			document.documentElement.style.setProperty("--theme-border", theme.border)
			document.documentElement.style.setProperty(
				"--theme-success",
				theme.success
			)
			document.documentElement.style.setProperty("--theme-error", theme.error)
			document.documentElement.style.setProperty(
				"--theme-header-glow",
				theme.headerGlow
			)
			document.documentElement.style.setProperty(
				"--theme-gradient-start",
				theme.gradientStart
			)
			document.documentElement.style.setProperty(
				"--theme-gradient-end",
				theme.gradientEnd
			)
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

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
