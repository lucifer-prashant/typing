import React, { useRef, useEffect, useState } from "react"
import styled, { keyframes } from "styled-components"
import { useTheme } from "../contexts/ThemeContext"
import { useAuth } from "../contexts/AuthContext"
import {
	FaPalette,
	FaVolumeMute,
	FaVolumeUp,
	FaKeyboard,
	FaArrowLeft,
	FaUser,
} from "react-icons/fa"
import { updateUserProfile, getUserProfile } from "../utils/userUtils"

const SettingsContainer = styled.div`
	background: ${(props) => props.theme.surface};
	border-radius: 20px;
	padding: 30px;
	width: 100%;
	max-width: 600px;
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
	backdrop-filter: blur(4px);
	border: 1px solid ${(props) => props.theme.border};
	position: relative;
	color: ${(props) => props.theme.text};
`

const BackButton = styled.button`
	position: absolute;
	top: 20px;
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

const gradientAnimation = keyframes`
	0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`

const ThemeButton = styled.button`
	background: ${(props) => props.theme.background};
	color: ${(props) => props.theme.text};
	border-color: ${(props) => props.theme.primary};
	&:hover {
		background: ${(props) => props.theme.surface};
	}
	border: 2px solid
		${(props) => (props.$active ? props.theme.primary : "transparent")};
	border-radius: 12px;
	padding: 15px;
	cursor: pointer;
	transition: all 0.3s ease;
	font-weight: ${(props) => (props.$active ? "bold" : "normal")};
	background-size: 400% 400%;
	animation: ${gradientAnimation} 15s ease infinite;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 5px 15px ${(props) => props.theme.primary}40;
	}
`

const ToggleButton = styled.button`
	background: ${(props) =>
		props.$active ? props.theme.primary : props.theme.surface};
	color: ${(props) => (props.$active ? props.theme.text : props.theme.text)};
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
		color: ${(props) => props.theme.text};
		border-color: ${(props) => props.theme.primary};
	}
`

const Input = styled.input`
	width: 100%;
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
	}
`

const ErrorMessage = styled.p`
	color: #ff4444;
	margin-top: 8px;
	font-size: 0.9rem;
`

const SuccessMessage = styled.p`
	color: #4caf50;
	margin-top: 8px;
	font-size: 0.9rem;
	opacity: ${(props) => (props.$visible ? 1 : 0)};
	transition: opacity 0.3s ease-in-out;
`

const Settings = ({ onClose }) => {
	const { theme, setTheme, availableThemes } = useTheme()

	const handleThemeSelect = (themeName) => {
		setTheme(availableThemes.find((t) => t.name === themeName))
	}
	const { currentUser } = useAuth()
	const [soundEnabled, setSoundEnabled] = useState(true)
	const [keyboardSoundsEnabled, setKeyboardSoundsEnabled] = useState(true)
	const [username, setUsername] = useState("")
	const [error, setError] = useState("")
	const [showSuccess, setShowSuccess] = useState(false)
	const containerRef = useRef(null)

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

	const handleUsernameChange = async () => {
		try {
			setError("")
			setShowSuccess(false)
			if (!username.trim()) {
				setError("Username cannot be empty")
				return
			}
			await updateUserProfile(currentUser.uid, username.trim())
			setShowSuccess(true)
			setTimeout(() => setShowSuccess(false), 3000) // Hide success message after 3 seconds
		} catch (error) {
			setError(error.message)
		}
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
					{availableThemes.map((themeName) => (
						<ThemeButton
							key={themeName.name}
							$themeColor={theme ? theme.primary : "#000000"}
							$active={theme ? themeName === theme.name : false}
							onClick={() => handleThemeSelect(themeName)}>
							{themeName.name}
						</ThemeButton>
					))}
				</ThemeGrid>
			</SettingsSection>

			<SettingsSection>
				<SectionTitle>
					{soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />} Sound
				</SectionTitle>
				<ToggleButton
					$active={soundEnabled}
					onClick={() => setSoundEnabled(!soundEnabled)}>
					{soundEnabled ? "Enabled" : "Disabled"}
				</ToggleButton>
			</SettingsSection>

			{currentUser && (
				<SettingsSection>
					<SectionTitle>
						<FaUser /> Username
					</SectionTitle>
					<Input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						onKeyPress={(e) => e.key === "Enter" && handleUsernameChange()}
						placeholder="Enter your username"
					/>
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