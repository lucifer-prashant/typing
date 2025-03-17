import React, { useState, useEffect } from "react"
import styled, { keyframes, createGlobalStyle } from "styled-components"
import "./App.css"
import TypingTest from "./components/TypingTest"
import TestResults from "./components/TestResults"
import Login from "./components/Login"
import UserProfile from "./components/UserProfile"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { FaKeyboard, FaUser, FaTrophy, FaCog } from "react-icons/fa"
import Leaderboard from "./components/Leaderboard"
import Settings from "./components/Settings"
import { ThemeProvider } from "./contexts/ThemeContext"
import { UserProvider, useUser } from "./contexts/UserContext"
import CapsLockIndicator from "./components/CapsLockIndicator"
import ThemeSelector from "./components/ThemeSelector"
import Footer from "./components/Footer"

// Global style to ensure theme consistency throughout the app
const GlobalStyle = createGlobalStyle`
  :root {
    --transition-standard: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', 'Roboto', sans-serif;
    transition: background-color 0.5s ease, color 0.5s ease;
  }
  
  button {
    font-family: 'Inter', 'Roboto', sans-serif;
  }
`

const gradientAnimation = keyframes`
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
`

const AppContainer = styled.div`
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	background: ${(props) => props.theme.background};
	background-image: linear-gradient(
		135deg,
		${(props) => props.theme.gradientStart} 0%,
		${(props) => props.theme.gradientEnd} 100%
	);
	background-size: 400% 400%;
	animation: ${gradientAnimation} 15s ease infinite;
	color: ${(props) => props.theme.text};
	padding: 20px;
	position: relative;
	overflow: ${({ $isLeaderboard }) => ($isLeaderboard ? "auto" : "hidden")};
	box-sizing: border-box;

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
			circle at center,
			transparent 0%,
			rgba(0, 0, 0, 0.3) 100%
		);
		pointer-events: none;
	}
`

const AppHeader = styled.header`
	margin-bottom: 40px;
	text-align: center;
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
`

const glowAnimation = keyframes`
	0% { text-shadow: 0 0 10px ${(props) => props.theme.headerGlow}, 0 0 20px ${(props) => props.theme.headerGlow}, 0 0 30px ${(props) => props.theme.headerGlow}; }
	50% { text-shadow: 0 0 20px ${(props) => props.theme.headerGlow}, 0 0 30px ${(props) => props.theme.headerGlow}, 0 0 40px ${(props) => props.theme.headerGlow}; }
	100% { text-shadow: 0 0 10px ${(props) => props.theme.headerGlow}, 0 0 20px ${(props) => props.theme.headerGlow}, 0 0 30px ${(props) => props.theme.headerGlow}; }
`

const Title = styled.h1`
	font-size: 4rem;
	color: ${(props) => props.theme.text};
	margin-bottom: 10px;
	font-weight: 800;
	letter-spacing: 2px;
	align-self: flex-start; // Add this to left-align within the flex container
	// Remove width: 100%

	// text-align: left; // This is redundant with align-self: flex-start

	font-family: "JetBrains Mono";

	transform: perspective(500px) translateZ(0);
	transition: all 0.3s ease;

	&:hover {
		transform: perspective(500px) translateZ(10px);
	}
`
const Subtitle = styled.p`
	font-size: 1.2rem;
	color: ${(props) => props.theme.text};
	opacity: 0.8;
`

const NavBar = styled.nav`
	display: flex;
	justify-content: center;
	gap: 20px;
	margin-top: 5px;
	margin-left: 10px;

	// background: ${(props) => props.theme.surface}CC; /* CC adds 80% opacity */
	// padding: 15px;
	// border-radius: 15px;
	// box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
	// backdrop-filter: blur(4px);
	// border: 1px solid ${(props) =>
		props.theme.border}40; /* 40 adds 25% opacity */
`

const NavButton = styled.button`
	background-color: transparent; // Remove background
	color: ${(props) => (props.$active ? props.theme.primary : props.theme.text)};
	border: none; // Remove border
	padding: 8px; // Reduce padding to just give some clickable area
	cursor: pointer;
	font-size: 16px;
	transition: var(--transition-standard);
	display: flex;
	align-items: center;
	gap: 8px;

	&:hover {
		color: ${(props) => props.theme.primary};
		transform: translateY(-2px);
		// Remove box-shadow for cleaner look
	}

	&:active {
		transform: translateY(0);
	}

	svg {
		font-size: 24px; // Make icon slightly larger for better visibility
	}
`
const TopRightControls = styled.div`
	position: absolute;
	top: 20px;
	right: 20px;
	display: flex;
	gap: 10px;
`

const TopButton = styled.button`
	background-color: ${(props) => props.theme.surface}CC;
	color: ${(props) => props.theme.text};
	border: 1px solid ${(props) => props.theme.border}40;
	border-radius: 50px;
	padding: 12px 24px;
	cursor: pointer;
	font-size: 16px;
	transition: var(--transition-standard);
	display: flex;
	align-items: center;
	gap: 8px;
	backdrop-filter: blur(4px);
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	position: relative;

	&:hover {
		background-color: ${(props) => props.theme.primary};
		color: ${(props) => props.theme.text};
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
	}

	&:active {
		transform: translateY(0);
	}

	svg {
		font-size: 18px;
	}
`

const DropdownMenu = styled.div`
	position: absolute;
	top: 100%;
	right: 0;
	margin-top: 8px;
	background-color: ${(props) => props.theme.surface}CC;
	border: 1px solid ${(props) => props.theme.border}40;
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	backdrop-filter: blur(4px);
	transform-origin: top right;
	transform: ${(props) => (props.$show ? "scale(1)" : "scale(0.9)")};
	opacity: ${(props) => (props.$show ? "1" : "0")};
	visibility: ${(props) => (props.$show ? "visible" : "hidden")};
	transition: all 0.2s ease;
	z-index: 1000;
`

const DropdownItem = styled.button`
	width: 100%;
	padding: 12px 24px;
	background: none;
	border: none;
	color: ${(props) => props.theme.text};
	font-size: 14px;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 8px;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) => props.theme.primary};
		color: ${(props) => props.theme.text};
	}

	&:not(:last-child) {
		border-bottom: 1px solid ${(props) => props.theme.border}40;
	}
`
function AppContent() {
	const [testResults, setTestResults] = useState(null)
	const [currentView, setCurrentView] = useState("test")
	const [showSettings, setShowSettings] = useState(false)
	const [showDropdown, setShowDropdown] = useState(false)
	const { currentUser, logout } = useAuth()
	const { userProfile } = useUser()

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest(".profile-dropdown")) {
				setShowDropdown(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	useEffect(() => {
		if (!currentUser) {
			setCurrentView("login")
		}
	}, [currentUser])

	useEffect(() => {
		if (currentUser) {
			setCurrentView("test")
		}
	}, [currentUser])

	const handleResetTest = () => {
		window.location.reload()
	}
	const handleTestComplete = (results) => {
		setTestResults(results)

		// If user is logged in, save results to Firebase
		if (currentUser) {
			// This will be implemented in the TypingTest component
		}
	}

	const handleRestart = () => {
		setTestResults(null)
		restartTrigger.current += 1
	}

	const restartTrigger = React.useRef(0)

	React.useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Enter" && e.shiftKey) {
				window.location.reload()
			}
			if (e.key === "Enter" && e.key === "Tab") {
				handleRestart()
			}
			if (e.key === "Escape" && showSettings) {
				setShowSettings(false)
			}
		}
		window.addEventListener("keydown", handleKeyDown)
		return () => window.removeEventListener("keydown", handleKeyDown)
	}, [])

	const renderContent = () => {
		if (currentView === "login") {
			return <Login />
		} else if (currentView === "profile") {
			return <UserProfile />
		} else if (currentView === "leaderboard") {
			return <Leaderboard />
		} else {
			// Test view
			return !testResults ? (
				<TypingTest
					onTestComplete={handleTestComplete}
					restartTrigger={restartTrigger.current}
				/>
			) : (
				<TestResults
					wpm={testResults.wpm}
					rawWpm={testResults.rawWpm}
					accuracy={testResults.accuracy}
					charactersTyped={testResults.charactersTyped}
					errorCount={testResults.errorCount}
					errorMap={testResults.errorMap}
					testDuration={testResults.testDuration}
					onRestart={handleRestart}
				/>
			)
		}
	}

	return (
		<AppContainer>
			<CapsLockIndicator />
			{showSettings ? (
				<Settings onClose={() => setShowSettings(false)} />
			) : (
				<>
					<AppHeader>
						<Title>Speed Typer</Title>
						{/* <Subtitle>
							Test and improve your typing speed with common English words
						</Subtitle> */}

						<NavBar>
							<NavButton
								$active={currentView === "test"}
								onClick={() => {
									setCurrentView("test")
									if (testResults) {
										setTestResults(null)
									}
								}}>
								<FaKeyboard />
							</NavButton>
							<NavButton
								$active={currentView === "leaderboard"}
								onClick={() => setCurrentView("leaderboard")}>
								<FaTrophy />
							</NavButton>
							{currentUser && (
								<NavButton
									$active={currentView === "profile"}
									onClick={() => setCurrentView("profile")}>
									<FaUser />
								</NavButton>
							)}
						</NavBar>
					</AppHeader>

					<TopRightControls>
						{currentUser ? (
							<div
								style={{ position: "relative" }}
								className="profile-dropdown">
								<TopButton onClick={() => setShowDropdown(!showDropdown)}>
									<FaUser />
									{userProfile?.username || currentUser.email.split("@")[0]}
								</TopButton>
								<DropdownMenu $show={showDropdown}>
									<DropdownItem
										onClick={() => {
											setShowSettings(true)
											setShowDropdown(false)
										}}>
										<FaCog /> Settings
									</DropdownItem>
									<DropdownItem
										onClick={async () => {
											try {
												await logout()
												setShowDropdown(false)
											} catch (error) {
												console.error("Failed to log out", error)
											}
										}}>
										<FaUser /> Logout
									</DropdownItem>
								</DropdownMenu>
							</div>
						) : (
							<TopButton onClick={() => setCurrentView("login")}>
								<FaUser /> Login
							</TopButton>
						)}
					</TopRightControls>

					{renderContent()}
				</>
			)}
			<Footer />
		</AppContainer>
	)
}

function App() {
	const tabPressed = React.useRef(false)

	const handleResetTest = () => {
		window.location.reload()
	}

	React.useEffect(() => {
		const handleTabDown = (e) => {
			if (e.key === "Tab") {
				e.preventDefault() // Prevent tab from leaving the website
				tabPressed.current = true
			}
		}
		const handleTabUp = (e) => {
			if (e.key === "Tab") {
				e.preventDefault() // Prevent tab from leaving the website
				tabPressed.current = false
			}
		}
		document.addEventListener("keydown", handleTabDown)
		document.addEventListener("keyup", handleTabUp)
		return () => {
			document.removeEventListener("keydown", handleTabDown)
			document.removeEventListener("keyup", handleTabUp)
		}
	}, [])

	useEffect(() => {
		const handleRestartShortcut = (e) => {
			if (e.key === "Enter" && tabPressed.current) {
				handleResetTest()
				e.preventDefault()
			}
		}

		document.addEventListener("keydown", handleRestartShortcut)
		return () => document.removeEventListener("keydown", handleRestartShortcut)
	}, [])

	return (
		<>
			<AuthProvider>
				<ThemeProvider>
					<UserProvider>
						<GlobalStyle />
						<ThemeSelector />
						<AppContent />
					</UserProvider>
				</ThemeProvider>
			</AuthProvider>
		</>
	)
}

export default App
