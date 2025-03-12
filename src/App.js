import React, { useState, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import "./App.css"
import TypingTest from "./components/TypingTest"
import TestResults from "./components/TestResults"
import Login from "./components/Login"
import UserProfile from "./components/UserProfile"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import {
	FaKeyboard,
	FaUser,
	FaTrophy,
	FaCog,
	FaKeyboard as FaKeyboardPractice,
} from "react-icons/fa"
import Leaderboard from "./components/Leaderboard"
import Settings from "./components/Settings"
import { ThemeProvider } from "./contexts/ThemeContext"
import { generate } from "random-words"
import {
	getUserProfile,
	generatePracticeWords,
	generateWords,
} from "./utils/userUtils"

const gradientAnimation = keyframes`
	0% { background-position: 0% 50%; }
	50% { background-position: 100% 50%; }
	100% { background-position: 0% 50%; }
`

const AppContainer = styled.div`
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	background: ${(props) => props.theme.background};
	background-size: 400% 400%;
	animation: ${gradientAnimation} 15s ease infinite;
	color: ${(props) => props.theme.text};
	padding: 20px;
	position: relative;
	overflow: hidden;

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
	flex-direction: column;
	align-items: center;
`

const glowAnimation = keyframes`
	0% { text-shadow: 0 0 10px #646cff, 0 0 20px #646cff, 0 0 30px #646cff; }
	50% { text-shadow: 0 0 20px #646cff, 0 0 30px #646cff, 0 0 40px #646cff; }
	100% { text-shadow: 0 0 10px #646cff, 0 0 20px #646cff, 0 0 30px #646cff; }
`

const Title = styled.h1`
	font-size: 4rem;
	color: #646cff;
	margin-bottom: 10px;
	font-weight: 800;
	letter-spacing: 2px;
	animation: ${glowAnimation} 3s ease-in-out infinite;
	background: linear-gradient(45deg, #646cff, #a78bfa);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
`

const Subtitle = styled.p`
	font-size: 1.2rem;
	color: #888;
`

const NavBar = styled.nav`
	display: flex;
	justify-content: center;
	gap: 20px;
	margin-top: 20px;
	width: 100%;
	max-width: 600px;
	background: rgba(26, 26, 26, 0.8);
	padding: 15px;
	border-radius: 15px;
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
	backdrop-filter: blur(4px);
	border: 1px solid rgba(255, 255, 255, 0.18);
`

const NavButton = styled.button`
	background-color: ${(props) =>
		props.$active ? "#646cff" : "rgba(26, 26, 26, 0.5)"};
	color: white;
	border: 1px solid
		${(props) => (props.$active ? "#646cff" : "rgba(255, 255, 255, 0.1)")};
	border-radius: 12px;
	padding: 12px 24px;
	cursor: pointer;
	font-size: 16px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	display: flex;
	align-items: center;
	gap: 8px;

	&:hover {
		background-color: #646cff;
		border-color: #646cff;
		transform: translateY(-2px);
		box-shadow: 0 5px 15px rgba(100, 108, 255, 0.4);
	}

	&:active {
		transform: translateY(0);
	}

	svg {
		font-size: 18px;
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
	background-color: rgba(26, 26, 26, 0.8);
	color: white;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 50px;
	padding: 12px 24px;
	cursor: pointer;
	font-size: 16px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	display: flex;
	align-items: center;
	gap: 8px;
	backdrop-filter: blur(4px);
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

	&:hover {
		background-color: rgba(51, 51, 51, 0.9);
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

function AppContent() {
	const [testResults, setTestResults] = useState(null)
	const [currentView, setCurrentView] = useState("test")
	const [showSettings, setShowSettings] = useState(false)
	const [isPracticeMode, setIsPracticeMode] = useState(false)
	const [words, setWords] = useState([])
	const { currentUser } = useAuth()
	const restartTrigger = React.useRef(0)

	const handlePracticeMode = () => {
		setIsPracticeMode(!isPracticeMode)
		if (!isPracticeMode) {
			setTestResults(null)
			restartTrigger.current += 1
		}
	}

	useEffect(() => {
		if (isPracticeMode && currentUser) {
			const loadErrorChars = async () => {
				const profile = await getUserProfile(currentUser.uid)
				const errors = profile?.errorCharacters || []
				setWords(generatePracticeWords(50, errors))
			}
			loadErrorChars()
		} else {
			setWords(generateWords(50))
		}
	}, [isPracticeMode, currentUser])

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
					isPracticeMode={isPracticeMode}
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
			<AppHeader>
				<Title>TypeMaster</Title>
				<Subtitle>Improve your typing speed and accuracy</Subtitle>
				{currentUser && (
					<NavBar>
						<NavButton
							$active={currentView === "test"}
							onClick={() => setCurrentView("test")}>
							<FaKeyboard /> Test
						</NavButton>
						<NavButton
							$active={currentView === "profile"}
							onClick={() => setCurrentView("profile")}>
							<FaUser /> Profile
						</NavButton>
						<NavButton
							$active={currentView === "leaderboard"}
							onClick={() => setCurrentView("leaderboard")}>
							<FaTrophy /> Leaderboard
						</NavButton>
					</NavBar>
				)}
			</AppHeader>

			{currentUser && (
				<TopRightControls>
					<TopButton
						$active={isPracticeMode}
						onClick={() => setIsPracticeMode(!isPracticeMode)}>
						<FaKeyboardPractice />
						{isPracticeMode ? "Normal Mode" : "Practice Errors"}
					</TopButton>
					<TopButton onClick={() => setShowSettings(true)}>
						<FaCog /> Settings
					</TopButton>
				</TopRightControls>
			)}

			{renderContent()}
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
				tabPressed.current = true
			}
		}
		const handleTabUp = (e) => {
			if (e.key === "Tab") {
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
					<AppContent />
				</ThemeProvider>
			</AuthProvider>
		</>
	)
}

export default App
