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
import { Analytics } from "@vercel/analytics/react"
import Clarity from "@microsoft/clarity"

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
	align-self: flex-start;
	font-family: "JetBrains Mono";
	transform: perspective(500px) translateZ(0);
	transition: all 0.3s ease;
	cursor: pointer;

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
const AppContent = React.forwardRef((props, ref) => {
	const [testResults, setTestResults] = useState(null)
	const [currentView, setCurrentView] = useState("test")
	const [showSettings, setShowSettings] = useState(false)
	const [showDropdown, setShowDropdown] = useState(false)
	const { currentUser, logout } = useAuth()
	const { userProfile } = useUser()
	const restartTrigger = React.useRef(0)

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

	const handleTestComplete = (results) => {
		setTestResults(results)

		// If user is logged in, save results to Firebase
		if (currentUser) {
			// This will be implemented in the TypingTest component
		}
	}

	const handleRestart = () => {
		console.log("Restarting test...")
		setTestResults(null)
		restartTrigger.current += 1
	}

	// Expose the restart function to parent components
	React.useImperativeHandle(ref, () => ({
		handleRestart,
	}))

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
		<AppContainer $isLeaderboard={currentView === "leaderboard"}>
			<CapsLockIndicator />
			{showSettings ? (
				<Settings onClose={() => setShowSettings(false)} />
			) : (
				<>
					<AppHeader>
						<Title
							onClick={() => {
								if (testResults) {
									setTestResults(null)
								}
								if (currentView !== "test") {
									setCurrentView("test")
								}
								handleRestart()
							}}>
							Speed Typer
						</Title>
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
							<NavButton
								$active={currentView === "settings"}
								onClick={() => setShowSettings(true)}>
								<FaCog />
							</NavButton>
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
			{currentView === "test" && !showSettings && <Footer />}
		</AppContainer>
	)
})

function App() {
	;<Analytics />
	const projectId = "qqpfanzza1"
	Clarity.init(projectId)
	const appContentRef = React.useRef(null)
	const [isTabPressed, setIsTabPressed] = React.useState(false)

	// Setup a direct key event handler for the Tab+Enter combination
	React.useEffect(() => {
		const handleKeyDown = (e) => {
			// Track Tab key state
			if (e.key === "Tab") {
				e.preventDefault() // Prevent default Tab behavior
				setIsTabPressed(true)
			}

			// Handle Tab+Enter combination
			if (e.key === "Enter" && isTabPressed) {
				e.preventDefault()
				console.log("Tab+Enter detected, restarting test")
				if (appContentRef.current) {
					appContentRef.current.handleRestart()
				}
			}

			// Handle Escape key for settings
			if (e.key === "Escape") {
				// Any escape handling can go here
			}
		}

		const handleKeyUp = (e) => {
			// Reset Tab key state
			if (e.key === "Tab") {
				setIsTabPressed(false)
			}
		}

		// Add global event listeners
		document.addEventListener("keydown", handleKeyDown)
		document.addEventListener("keyup", handleKeyUp)

		// Cleanup when component unmounts
		return () => {
			document.removeEventListener("keydown", handleKeyDown)
			document.removeEventListener("keyup", handleKeyUp)
		}
	}, [isTabPressed]) // Make sure this effect runs whenever isTabPressed changes

	return (
		<>
			<AuthProvider>
				<ThemeProvider>
					<UserProvider>
						<GlobalStyle />
						<ThemeSelector />
						<AppContent ref={appContentRef} />
					</UserProvider>
				</ThemeProvider>
			</AuthProvider>
		</>
	)
}

export default App
