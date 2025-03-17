import React, { useState, useEffect, useCallback, useRef } from "react"
import styled from "styled-components"
import { useTheme } from "../contexts/ThemeContext"

const ThemeOverlay = styled.div`
	position: fixed;
	top: 0;
	right: 0;
	width: 300px;
	height: 100vh;
	background: ${(props) => props.theme.surface}CC;
	backdrop-filter: blur(8px);
	border-left: 1px solid ${(props) => props.theme.border}40;
	transform: translateX(${(props) => (props.isOpen ? "0" : "100%")});
	transition: transform 0.3s ease;
	z-index: 1000;
	display: flex;
	flex-direction: column;
	overflow: hidden;
`

const ThemeList = styled.div`
	padding: 20px;
	overflow-y: auto;
	flex: 1;

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-track {
		background: ${(props) => props.theme.background}40;
	}

	&::-webkit-scrollbar-thumb {
		background: ${(props) => props.theme.primary}40;
		border-radius: 4px;
	}
`

// Completely revised ThemeOption to always use theme-specific colors
const ThemeOption = styled.div`
	padding: 12px;
	margin-bottom: 12px;
	border-radius: 8px;
	cursor: pointer;
	background: ${(props) => props.$themeColor}CC; // Always show theme color
	color: ${(props) => props.$themeTextColor}; // Always use theme text color
	border: 1px solid ${(props) => props.$themeBorderColor};
	box-shadow: ${(props) =>
		props.$isSelected
			? `0 0 0 2px ${props.$themeBorderColor}, 0 0 10px 0 ${props.$themeColor}80`
			: "none"};
	transition: all 0.2s ease;
	position: relative;

	// Add indicator for selected theme
	${(props) =>
		props.$isSelected &&
		`
		&:before {
			content: '✓';
			position: absolute;
			right: 12px;
			font-weight: bold;
		}
	`}

	&:hover {
		transform: translateX(-4px);
		box-shadow: 0 0 10px 0 ${(props) => props.$themeColor}80;
	}

	&:focus {
		outline: none;
		box-shadow:
			0 0 0 2px ${(props) => props.$themeBorderColor},
			0 0 10px 0 ${(props) => props.$themeColor}80;
	}
`

const Header = styled.div`
	padding: 20px;
	border-bottom: 1px solid ${(props) => props.theme.border}40;
	color: ${(props) => props.theme.text};
	font-size: 1.2em;
	font-weight: 600;
`

let tabTimer = null

const ThemeSelector = () => {
	const { theme, setTheme, availableThemes } = useTheme()
	const [isOpen, setIsOpen] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(0)
	const listRef = useRef(null)
	const overlayRef = useRef(null)

	const handleTabPress = useCallback(() => {
		if (tabTimer) {
			clearTimeout(tabTimer)
			tabTimer = null
			setIsOpen((prev) => !prev)
		} else {
			tabTimer = setTimeout(() => {
				tabTimer = null
			}, 300)
		}
	}, [])

	const handleKeyNavigation = useCallback(
		(e) => {
			if (!isOpen) return

			switch (e.key) {
				case "ArrowUp":
					e.preventDefault()
					setSelectedIndex((prev) => {
						const newIndex = Math.max(0, prev - 1)
						setTheme(availableThemes[newIndex])
						return newIndex
					})
					break
				case "ArrowDown":
					e.preventDefault()
					setSelectedIndex((prev) => {
						const newIndex = Math.min(availableThemes.length - 1, prev + 1)
						setTheme(availableThemes[newIndex])
						return newIndex
					})
					break
				case "Enter":
					e.preventDefault()
					setIsOpen(false)
					break
				case "Escape":
					setIsOpen(false)
					break
				default:
					break
			}
		},
		[isOpen, availableThemes, selectedIndex, setTheme]
	)

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Tab") {
				e.preventDefault()
				handleTabPress()
			}
			handleKeyNavigation(e)
		}

		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [handleTabPress, handleKeyNavigation])

	useEffect(() => {
		if (isOpen && listRef.current) {
			const selectedElement = listRef.current.children[selectedIndex]
			if (selectedElement) {
				selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" })
			}
		}
	}, [selectedIndex, isOpen])

	useEffect(() => {
		if (isOpen) {
			const currentIndex = availableThemes.findIndex(
				(t) => t.name === theme.name
			)
			setSelectedIndex(currentIndex >= 0 ? currentIndex : 0)

			const handleClickOutside = (event) => {
				if (overlayRef.current && !overlayRef.current.contains(event.target)) {
					setIsOpen(false)
				}
			}

			document.addEventListener("mousedown", handleClickOutside)
			return () => document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isOpen, theme, availableThemes])

	return (
		<ThemeOverlay ref={overlayRef} isOpen={isOpen}>
			<Header>Theme Selection</Header>
			<ThemeList ref={listRef}>
				{availableThemes.map((themeOption, index) => (
					<ThemeOption
						key={themeOption.name}
						$isSelected={index === selectedIndex}
						$themeColor={themeOption.primary}
						$themeBorderColor={themeOption.border}
						$themeTextColor={themeOption.text}
						$themeBackground={themeOption.background}
						onMouseEnter={() => {
							setSelectedIndex(index)
							setTheme(themeOption)
						}}
						onClick={() => {
							setTheme(themeOption)
							setIsOpen(false)
						}}
						tabIndex={isOpen ? 0 : -1}>
						{themeOption.name}
					</ThemeOption>
				))}
			</ThemeList>
		</ThemeOverlay>
	)
}

export default ThemeSelector
