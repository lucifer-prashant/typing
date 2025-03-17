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
			background: "#1A0806", // Darker background for better contrast
			surface: "#2D1410", // Slightly lighter than background
			text: "#FFFFFF", // Bright white for better readability
			primary: "#FF7F50", // Original coral kept as primary
			border: "#FF4500", // Kept original border
			success: "#4CAF50", // Kept original success
			error: "#F44336", // Kept original error
			headerGlow: "#FF4500", // Kept original glow
			gradientStart: "#1A0806", // Matches background
			gradientEnd: "#592B25", // Deeper shade for gradient
		},
		{
			name: "Nebula",
			background: "#0F1128", // Darker for better contrast
			surface: "#1E2347", // Adjusted for better distinction
			text: "#FFFFFF", // Pure white for better readability
			primary: "#8A97FF", // Slightly brighter primary
			border: "#5A64E2", // More vibrant border
			success: "#50E3C2", // Original success
			error: "#FF5677", // Original error
			headerGlow: "#8A97FF", // Matches primary
			gradientStart: "#0F1128", // Matches background
			gradientEnd: "#2E325A", // Original gradient end
		},
		{
			name: "Dracula",
			background: "#191A21", // Slightly darker background
			surface: "#282A36", // Original background as surface
			text: "#F8F8F2", // Original text color
			primary: "#BD93F9", // Original primary
			border: "#6272A4", // Original border
			success: "#50FA7B", // Original success
			error: "#FF5555", // Original error
			headerGlow: "#BD93F9", // Original glow
			gradientStart: "#191A21", // Matches new background
			gradientEnd: "#383A59", // Slightly deeper for gradient
		},
		{
			name: "Synthwave",
			background: "#16082A", // Darker background for better contrast
			surface: "#2D0F5A", // Adjusted for better contrast
			text: "#FFFFFF", // White for better readability
			primary: "#D467FF", // Brighter primary for contrast
			border: "#01DFFF", // Brighter border
			success: "#05FFA1", // Original success
			error: "#FF3366", // Original error
			headerGlow: "#D467FF", // Matches primary
			gradientStart: "#16082A", // Matches background
			gradientEnd: "#7303C0", // Original gradient end
		},
		{
			name: "Cyberpunk",
			background: "#0A0A0A", // Slightly lighter than true black
			surface: "#1A1A1A", // Original surface
			text: "#00FF66", // Adjusted green for better readability
			primary: "#FF00FF", // Original primary
			border: "#00FFFF", // Original border
			success: "#FFFFFF", // Original success
			error: "#FF0000", // Original error
			headerGlow: "#FF00FF", // Original glow
			gradientStart: "#0A0A0A", // Matches background
			gradientEnd: "#250052", // Deeper purple end
		},
		{
			name: "Neon",
			background: "#080808", // Slightly lighter black
			surface: "#1A1A1A", // Slightly adjusted surface
			text: "#00FFBB", // Brighter green-cyan text
			primary: "#FF00FF", // Original primary
			border: "#00FFFF", // Original border
			success: "#FFFFFF", // Original success
			error: "#FF3366", // Original error
			headerGlow: "#00FFFF", // Original glow
			gradientStart: "#080808", // Matches background
			gradientEnd: "#1F1F1F", // Original gradient end
		},
		{
			name: "Sunset",
			background: "#1C0800", // Dark background for contrast
			surface: "#2D1200", // Darker surface
			text: "#FFFFFF", // White for readability
			primary: "#FF8C42", // Original primary
			border: "#FF512F", // Original border
			success: "#4CAF50", // Original success
			error: "#F44336", // Original error
			headerGlow: "#FF8C42", // Original glow
			gradientStart: "#1C0800", // Matches background
			gradientEnd: "#803300", // Deeper end for gradient
		},
		{
			name: "Ocean",
			background: "#141E30", // Untouched as requested
			surface: "#243B55", // Untouched as requested
			text: "#E0E0E0", // Untouched as requested
			primary: "#00B4DB", // Untouched as requested
			border: "#0083B0", // Untouched as requested
			success: "#4CAF50", // Untouched as requested
			error: "#F44336", // Untouched as requested
			headerGlow: "#00B4DB", // Untouched as requested
			gradientStart: "#141E30", // Untouched as requested
			gradientEnd: "#243B55", // Untouched as requested
		},
		// Additional new themes
		{
			name: "Forest",
			background: "#0B2307", // Dark forest green
			surface: "#1A3A12", // Lighter green
			text: "#E0FFD9", // Light green-white
			primary: "#4CAF50", // Vibrant green
			border: "#2E7D32", // Mid-tone green
			success: "#8BC34A", // Light green
			error: "#F44336", // Standard red
			headerGlow: "#4CAF50", // Matching primary
			gradientStart: "#0B2307", // Matching background
			gradientEnd: "#2E5A1C", // Mid-deep green
		},
		{
			name: "Volcano",
			background: "#1A0000", // Very dark red/black
			surface: "#2D0A0A", // Dark red-brown
			text: "#FFEBEE", // Light red-white
			primary: "#FF5722", // Orange-red
			border: "#BF360C", // Deep orange-red
			success: "#4CAF50", // Standard green
			error: "#D50000", // Bright red
			headerGlow: "#FF5722", // Matching primary
			gradientStart: "#1A0000", // Matching background
			gradientEnd: "#5D1818", // Medium red-brown
		},
		{
			name: "Arctic",
			background: "#0A1929", // Very dark blue
			surface: "#102A43", // Dark blue
			text: "#E3F2FD", // Very light blue
			primary: "#2196F3", // Bright blue
			border: "#0D47A1", // Deep blue
			success: "#4CAF50", // Standard green
			error: "#F44336", // Standard red
			headerGlow: "#2196F3", // Matching primary
			gradientStart: "#0A1929", // Matching background
			gradientEnd: "#1A4A7A", // Medium-dark blue
		},
		{
			name: "Amethyst",
			background: "#12051F", // Very dark purple
			surface: "#2A1052", // Dark purple
			text: "#F3E5F5", // Light purple-white
			primary: "#9C27B0", // Vibrant purple
			border: "#6A1B9A", // Deep purple
			success: "#4CAF50", // Standard green
			error: "#F44336", // Standard red
			headerGlow: "#9C27B0", // Matching primary
			gradientStart: "#12051F", // Matching background
			gradientEnd: "#3D1A73", // Medium-dark purple
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
