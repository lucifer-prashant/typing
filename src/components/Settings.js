import React, { useRef, useEffect, useState } from "react"
import styled, { keyframes } from "styled-components"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import { useUser } from "../contexts/UserContext"
import {
	FaPalette,
	FaVolumeMute,
	FaVolumeUp,
	FaKeyboard,
	FaArrowLeft,
	FaUser,
	FaCheck,
	FaInfoCircle,
} from "react-icons/fa"
import { updateUserProfile, getUserProfile } from "../utils/userUtils"

const SettingsContainer = styled.div`
	background: ${(props) => props.theme.surface};
	border-radius: 20px;
	padding: 30px;
	width: 100%;
	max-width: 800px;
	box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
	backdrop-filter: blur(4px);
	border: 1px solid ${(props) => props.theme.border};
	position: relative;
	color: ${(props) => props.theme.text};
	transition: all 0.3s ease;
	padding-bottom: 40px;
	margin-bottom: 20px;
`

const BackButton = styled.button`
	position: absolute;
	top: 36px;
	left: 20px;
	background: transparent;
	border: none;
	color: ${(props) => props.theme.primary};
	cursor: pointer;
	font-size: 1.5rem;
	display: flex;
	align-items: center;
	transition: transform 0.3s ease;

	&:hover {
		transform: translateX(-5px);
	}
`

const SettingsTitle = styled.h2`
	color: ${(props) => props.theme.primary};
	margin-bottom: 25px;
	font-size: 2rem;
	display: flex;
	align-items: center;
	gap: 10px;
	padding-left: 40px;
`

const SettingsSection = styled.div`
	margin-bottom: 30px;
`

const SectionTitle = styled.h3`
	color: ${(props) => props.theme.text};
	margin-bottom: 15px;
	font-size: 1.2rem;
	display: flex;
	align-items: center;
	gap: 8px;
`

const ThemeGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
	gap: 15px;
	margin-top: 15px;
`

const glow = keyframes`
	0% {
		box-shadow: 0 0 5px 0px rgba(255, 255, 255, 0.5);
	}
	50% {
		box-shadow: 0 0 15px 2px rgba(255, 255, 255, 0.7);
	}
	100% {
		box-shadow: 0 0 5px 0px rgba(255, 255, 255, 0.5);
	}
`

const ThemeButton = styled.button`
	background: ${(props) =>
		props.$themeColor?.background || props.theme.background};
	color: ${(props) => props.$themeColor?.text || props.theme.text};
	border: 2px solid
		${(props) =>
			props.$active
				? props.$themeColor?.primary || props.theme.primary
				: "transparent"};
	border-radius: 12px;
	padding: 15px;
	cursor: pointer;
	transition: all 0.3s ease;
	font-weight: ${(props) => (props.$active ? "bold" : "normal")};
	position: relative;
	overflow: hidden;
	animation: ${(props) => (props.$active ? glow : "none")} 2s infinite;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: ${(props) =>
			props.$themeColor?.primary || props.theme.primary}20;
		opacity: ${(props) => (props.$active ? 0.5 : 0)};
		transition: opacity 0.3s ease;
	}

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px
			${(props) => props.$themeColor?.primary || props.theme.primary}40;

		&::before {
			opacity: 0.3;
		}
	}

	// Preview elements
	.theme-preview {
		width: 100%;
		margin-top: 5px;
		opacity: 0.7;
		font-size: 0.8rem;
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.preview-item {
		height: 5px;
		border-radius: 3px;
	}

	.preview-bg {
		background-color: ${(props) =>
			props.$themeColor?.background || props.theme.background};
	}

	.preview-primary {
		background-color: ${(props) =>
			props.$themeColor?.primary || props.theme.primary};
	}

	.preview-border {
		background-color: ${(props) =>
			props.$themeColor?.border || props.theme.border};
	}

	.active-indicator {
		position: absolute;
		top: 8px;
		right: 8px;
		color: ${(props) => props.$themeColor?.primary || props.theme.primary};
		font-size: 1rem;
	}
`

const ToggleButton = styled.button`
	background: ${(props) =>
		props.$active ? props.theme.primary : props.theme.surface};
	color: ${(props) => (props.$active ? "#ffffff" : props.theme.text)};
	border: 1px solid
		${(props) => (props.$active ? props.theme.primary : props.theme.border)};
	border-radius: 12px;
	padding: 12px 24px;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	gap: 8px;

	&:hover {
		background: ${(props) => props.theme.primary};
		color: #ffffff;
		border-color: ${(props) => props.theme.primary};
	}
`

const Input = styled.input`
	width: 70%;
	padding: 12px;
	border: 1px solid ${(props) => props.theme.border};
	border-radius: 8px;
	background: ${(props) => props.theme.surface};
	color: ${(props) => props.theme.text};
	margin-top: 10px;
	font-size: 1rem;

	&:focus {
		outline: none;
		border-color: ${(props) => props.theme.primary};
		box-shadow: 0 0 0 2px ${(props) => props.theme.primary}40;
	}
`

const ErrorMessage = styled.p`
	color: ${(props) => props.theme.error};
	margin-top: 8px;
	font-size: 0.9rem;
`

const SuccessMessage = styled.p`
	color: ${(props) => props.theme.success};
	margin-top: 8px;
	font-size: 0.9rem;
	opacity: ${(props) => (props.$visible ? 1 : 0)};
	transition: opacity 0.3s ease-in-out;
	display: flex;
	align-items: center;
	gap: 5px;
`

const ThemePreview = styled.div`
	display: flex;
	flex-direction: column;
	margin-top: 20px;
	padding: 15px;
	border-radius: 12px;
	background: ${(props) => props.theme.surface};
	border: 1px solid ${(props) => props.theme.border};
	transition: all 0.3s ease;
`

const PreviewText = styled.div`
	color: ${(props) => props.theme.text};
	margin-bottom: 10px;
`

const PreviewAccent = styled.span`
	color: ${(props) => props.theme.primary};
	font-weight: bold;
`

const PreviewColorGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 10px;
	margin-top: 10px;
`

const ColorSwatch = styled.div`
	height: 30px;
	border-radius: 4px;
	background: ${(props) => props.color};
	position: relative;
	overflow: hidden;

	&:after {
		content: "${(props) => props.label}";
		position: absolute;
		bottom: 2px;
		left: 5px;
		font-size: 0.6rem;
		color: ${(props) => {
			// Calculate contrast
			const r = parseInt(props.color.slice(1, 3), 16)
			const g = parseInt(props.color.slice(3, 5), 16)
			const b = parseInt(props.color.slice(5, 7), 16)
			const brightness = (r * 299 + g * 587 + b * 114) / 1000
			return brightness > 128 ? "#000000" : "#ffffff"
		}};
		font-weight: bold;
	}
`

const bufferAnimation = keyframes`
	0% { transform: rotate(0deg); }
	100% { transform: rotate(360deg); }
`

const Button = styled.button`
	background: ${(props) => props.theme.primary};
	color: #ffffff;
	border: none;
	border-radius: 8px;
	padding: 10px 15px;
	cursor: pointer;
	font-size: 0.9rem;
	transition: all 0.2s ease;
	display: inline-flex;
	align-items: center;
	gap: 5px;
	margin-top: 10px;
	margin-left: 10px;
	position: relative;
	${(props) =>
		props.$loading &&
		`
		pointer-events: none;
		opacity: 0.7;
	`}

	&:hover {
		background: ${(props) => {
			const r = parseInt(props.theme.primary.slice(1, 3), 16)
			const g = parseInt(props.theme.primary.slice(3, 5), 16)
			const b = parseInt(props.theme.primary.slice(5, 7), 16)
			return `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`
		}};
		transform: translateY(-2px);
	}

	&:active {
		transform: translateY(0);
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid #ffffff;
		border-top: 2px solid transparent;
		border-radius: 50%;
		animation: ${bufferAnimation} 0.8s linear infinite;
		margin-left: 8px;
	}
`

const Tooltip = styled.div`
	position: relative;
	display: inline-block;
	margin-left: 5px;

	.tooltip-text {
		visibility: hidden;
		width: 200px;
		background-color: ${(props) => props.theme.surface};
		color: ${(props) => props.theme.text};
		text-align: center;
		border-radius: 6px;
		padding: 5px;
		position: absolute;
		z-index: 1;
		bottom: 125%;
		left: 50%;
		margin-left: -100px;
		opacity: 0;
		transition: opacity 0.3s;
		border: 1px solid ${(props) => props.theme.border};
		font-size: 0.8rem;
	}

	&:hover .tooltip-text {
		visibility: visible;
		opacity: 1;
	}
`

const Settings = ({ onClose }) => {
	const { theme, setTheme, availableThemes } = useTheme()
	const { currentUser } = useAuth()
	const { updateProfile } = useUser()
	const [soundEnabled, setSoundEnabled] = useState(() => {
		const savedSound = localStorage.getItem("soundEnabled")
		return savedSound !== null ? savedSound === "true" : false
	})
	const [username, setUsername] = useState("")
	const [error, setError] = useState("")
	const [showSuccess, setShowSuccess] = useState(false)
	const [isUpdating, setIsUpdating] = useState(false)
	const containerRef = useRef(null)
	const [currentThemeIndex, setCurrentThemeIndex] = useState(() => {
		const index = availableThemes.findIndex((t) => t.name === theme?.name)
		return index >= 0 ? index : 0
	})

	// Function to apply theme throughout the application
	const handleThemeSelect = (selectedTheme, index) => {
		// Apply theme to styled-components context
		setTheme(selectedTheme)
		setCurrentThemeIndex(index)

		// Play a sound effect if sound is enabled
		if (soundEnabled) {
			// You could implement a sound effect here
		}
	}

	useEffect(() => {
		const loadUserProfile = async () => {
			if (currentUser) {
				const profile = await getUserProfile(currentUser.uid)
				if (profile && profile.username) {
					setUsername(profile.username)
				}
			}
		}
		loadUserProfile()
	}, [currentUser])

	useEffect(() => {
		// Apply current theme to body when component mounts
		if (theme) {
			document.body.style.background = theme.background
			document.body.style.color = theme.text
		}
	}, [theme])

	const handleUsernameChange = async () => {
		try {
			setError("")
			setShowSuccess(false)
			setIsUpdating(true)

			if (!username.trim()) {
				setError("Username cannot be empty")
				setIsUpdating(false)
				return
			}

			const updatedUsername = await updateUserProfile(
				currentUser.uid,
				username.trim()
			)

			// Update the profile with an object containing the username
			updateProfile({ username: updatedUsername })

			setShowSuccess(true)
			setTimeout(() => setShowSuccess(false), 3000)
		} catch (error) {
			setError(error.message)
		} finally {
			setIsUpdating(false)
		}
	}

	const handleSoundToggle = () => {
		const newSoundState = !soundEnabled
		setSoundEnabled(newSoundState)
		localStorage.setItem("soundEnabled", newSoundState.toString())
	}

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target)
			) {
				onClose()
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [onClose])

	return (
		<SettingsContainer ref={containerRef}>
			<BackButton onClick={onClose}>
				<FaArrowLeft />
			</BackButton>
			<SettingsTitle>
				<FaKeyboard /> Settings
			</SettingsTitle>

			<SettingsSection>
				<SectionTitle>
					<FaPalette /> Theme
				</SectionTitle>
				<ThemeGrid>
					{availableThemes.map((themeOption) => (
						<ThemeButton
							key={themeOption.name}
							$themeColor={themeOption}
							$active={theme?.name === themeOption.name}
							onClick={() => handleThemeSelect(themeOption)}>
							{themeOption.name}
							<div className="theme-preview">
								<div className="preview-item preview-bg"></div>
								<div className="preview-item preview-primary"></div>
								<div className="preview-item preview-border"></div>
							</div>
						</ThemeButton>
					))}
				</ThemeGrid>

				<ThemePreview>
					<PreviewText>
						Current theme: <PreviewAccent>{theme?.name}</PreviewAccent>
					</PreviewText>
				</ThemePreview>
			</SettingsSection>

			<SettingsSection>
				<SectionTitle>
					{soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />} Sound
				</SectionTitle>
				<ToggleButton $active={soundEnabled} onClick={handleSoundToggle}>
					{soundEnabled ? "Enabled" : "Disabled"}
				</ToggleButton>
			</SettingsSection>

			{currentUser && (
				<SettingsSection>
					<SectionTitle>
						<FaUser /> Username
					</SectionTitle>
					<div style={{ display: "flex", alignItems: "flex-start" }}>
						<Input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							onKeyPress={(e) => e.key === "Enter" && handleUsernameChange()}
							placeholder="Enter your username"
						/>
						<Button onClick={handleUsernameChange} $loading={isUpdating}>
							Update
							{isUpdating && <div className="loading-spinner" />}
						</Button>
					</div>
					{error && <ErrorMessage>{error}</ErrorMessage>}
					<SuccessMessage $visible={showSuccess}>
						Username updated successfully!
					</SuccessMessage>
				</SettingsSection>
			)}
		</SettingsContainer>
	)
}

export default Settings
