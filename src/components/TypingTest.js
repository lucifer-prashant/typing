import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { useAuth } from "../contexts/AuthContext"
import { db } from "../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { generate } from "random-words"

// Import audio file
const typewriterSound = new Audio("/sounds/mixkit-typewriter-soft-hit-1366.wav")
const backspaceSound = new Audio("/sounds/mixkit-typewriter-soft-hit-1125.wav")
const wrongCharSound = new Audio("/sounds/wrong-char-placeholder.wav")

const TypingTestContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	max-width: 100%;
	height: calc(100vh - 200px);
	margin: 0 auto;
	padding: 20px;
`

const TestHeader = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 20px;
	padding: 0;
	position: relative;
`
const createAudioPool = (soundUrl, poolSize = 10) => {
	const audioPool = Array(poolSize)
		.fill()
		.map(() => {
			const audio = new Audio(soundUrl)
			audio.volume = 0.5 // Adjust volume if needed
			return audio
		})
	let currentIndex = 0

	return () => {
		// Find an audio object that's not currently playing
		let attempts = 0
		let sound = audioPool[currentIndex]

		// Try to find an audio that's not currently playing
		while (attempts < poolSize && !sound.paused && !sound.ended) {
			currentIndex = (currentIndex + 1) % poolSize
			sound = audioPool[currentIndex]
			attempts++
		}

		// If all sounds are playing, just use the next one
		if (attempts >= poolSize) {
			currentIndex = (currentIndex + 1) % poolSize
			sound = audioPool[currentIndex]
		}

		// Reset the audio to start
		sound.currentTime = 0

		// Use Promise to handle playback errors silently
		const playPromise = sound.play()
		if (playPromise !== undefined) {
			playPromise.catch((err) => {
				// Silence the error - this happens when sounds overlap too quickly
			})
		}

		// Move to the next sound in the pool for next time
		currentIndex = (currentIndex + 1) % poolSize
		return sound
	}
}
const TestOptions = styled.div`
	display: flex;
	gap: 10px;
	flex-wrap: nowrap;
	width: 80%;
	margin-bottom: 20px;
	position: absolute;
	left: 50%;
	transform: translateX(-50%) translateY(-30%);
	justify-content: center;
	z-index: 10;
	background: ${(props) => props.theme.surface}CC;
	padding: 12px 20px;
	border-radius: 16px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
	backdrop-filter: blur(8px);
	border: 1px solid ${(props) => props.theme.border}40;

	@media (max-width: 768px) {
		gap: 12px;
		padding: 10px 16px;
	}
`

const OptionGroup = styled.div`
	display: flex;
	gap: 10px;
	align-items: center;
	flex-wrap: ${(props) => (props.noWrap ? "nowrap" : "wrap")};
	overflow-x: ${(props) => (props.noWrap ? "auto" : "visible")};
	max-width: ${(props) => (props.expanded ? "calc(100% - 150px)" : "auto")};
	flex-shrink: ${(props) => (props.expanded ? 1 : 0)};
	justify-content: center;
	position: relative;
	padding: 4px;
	border-radius: 12px;
	transition: all 0.3s ease;

	&:not(:last-child) {
		border-right: 1px solid ${(props) => props.theme.border}20;
		padding-right: 16px;
		margin-right: 6px;
	}

	@media (max-width: 768px) {
		gap: 8px;
		padding: 3px;
	}
`

const OptionLabel = styled.span`
	color: ${(props) => props.theme.text}CC;
	font-size: 14px;
	font-weight: 500;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-right: 4px;
	transition: color 0.3s ease;
`

const OptionButton = styled.button`
	background-color: ${(props) =>
		props.active ? props.theme.primary + "CC" : "transparent"};
	color: ${(props) =>
		props.active ? props.theme.text : props.theme.text + "CC"};
	border: 1px solid
		${(props) => (props.active ? props.theme.primary : "transparent")};
	border-radius: 10px;
	padding: 8px 16px;
	cursor: pointer;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	font-size: 13px;
	font-weight: ${(props) => (props.active ? "600" : "400")};
	text-decoration: none;
	position: relative;
	overflow: hidden;

	&:hover {
		background-color: ${(props) =>
			props.active ? props.theme.primary + "CC" : props.theme.surface};
		border-color: ${(props) => props.theme.primary};
		color: ${(props) => props.theme.text};
		transform: translateY(-1px);
		box-shadow: 0 4px 12px ${(props) => props.theme.primary}30;
	}

	&:active {
		transform: translateY(0);
	}

	&::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: ${(props) => props.theme.primary};
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	&:hover::before {
		opacity: 0.1;
	}

	@media (max-width: 768px) {
		padding: 6px 12px;
		font-size: 12px;
	}
`

const Modal = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
`

const ModalContent = styled.div`
	background-color: ${(props) => props.theme.surface};
	padding: 30px;
	border-radius: 15px;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	width: 300px;
	display: flex;
	flex-direction: column;
	gap: 20px;
`

const ModalTitle = styled.h3`
	margin: 0;
	color: ${(props) => props.theme.text};
`

const ModalInput = styled.input`
	background-color: ${(props) => props.theme.background};
	color: ${(props) => props.theme.text};
	border: 1px solid ${(props) => props.theme.border};
	border-radius: 8px;
	padding: 12px;
	font-size: 16px;
	width: 100%;

	&:focus {
		border-color: ${(props) => props.theme.primary};
		outline: none;
	}
`

const ButtonGroup = styled.div`
	display: flex;
	justify-content: flex-end;
	gap: 10px;
`

const ModalButton = styled.button`
	background-color: ${(props) =>
		props.primary ? props.theme.primary : props.theme.surface};
	color: ${(props) => props.theme.text};
	border: 1px solid
		${(props) => (props.primary ? props.theme.primary : props.theme.border)};
	border-radius: 8px;
	padding: 8px 16px;
	cursor: pointer;
	font-size: 14px;

	&:hover {
		background-color: ${(props) =>
			props.primary ? props.theme.primary + "CC" : props.theme.surface + "CC"};
	}
`

const Timer = styled.div`
	font-size: 24px;
	font-weight: bold;
	color: ${(props) => props.theme.primary};
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-right: 0;
	margin-right: 0;
	text-align: right;
	width: auto;
	min-width: 100px;
	margin-left: auto; // This pushes it to the right
	position: relative; // Keep it in the normal flow
	z-index: 5;
`
const TextDisplayContainer = styled.div`
	width: 100%;
	height: 150px; /* Exactly 3 lines high */
	position: relative;
	overflow: hidden;
	margin-top: 50px;
	margin-bottom: 20px;
	filter: ${(props) => (props.$isFocused ? "none" : "blur(8px)")};
	opacity: ${(props) => (props.$isFocused ? 1 : 0.3)};
	transition:
		filter 0.3s ease,
		opacity 0.3s ease;
	cursor: text;
`

const TextDisplay = styled.div`
	width: 100%;
	background-color: transparent;
	font-family: "JetBrains Mono", monospace;
	font-size: 24px;
	line-height: 1.6;
	position: absolute;
	top: 0;
	left: 0;
	display: flex;
	flex-wrap: wrap;
	align-content: flex-start;
	gap: 8px;
	transition: top 0.2s ease;
`

const EnhancedOptionButton = styled.button`
	background-color: ${(props) =>
		props.active ? props.theme.primary : props.theme.surface};
	color: ${(props) => (props.active ? props.theme.text : props.theme.text)};
	border: 1px solid
		${(props) => (props.active ? props.theme.primary : props.theme.border)};
	border-radius: 8px;
	padding: 8px 16px;
	cursor: pointer;
	transition: all 0.3s ease;
	font-size: 13px;
	text-decoration: none;

	&:hover {
		background-color: ${(props) =>
			props.active ? props.theme.surface : props.theme.primary};
		border-color: ${(props) => props.theme.primary};
		color: ${(props) =>
			props.active ? props.theme.primary : props.theme.text};
		transform: translateY(-1px);
		box-shadow: 0 3px 8px ${(props) => props.theme.primary}30;
	}

	&:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		padding: 6px 12px;
		font-size: 12px;
	}
`

const RestartButton = styled.button`
	background-color: ${(props) => props.theme.primary};
	color: ${(props) => props.theme.text};
	border: 1px solid ${(props) => props.theme.primary};
	border-radius: 12px;
	padding: 12px 24px;
	margin-top: 20px;
	cursor: pointer;
	font-size: 16px;
	transition: all 0.3s ease;

	&:hover {
		background-color: ${(props) => props.theme.surface};
		color: ${(props) => props.theme.primary};
		border-color: ${(props) => props.theme.primary};
		transform: translateY(-2px);
		box-shadow: 0 5px 15px ${(props) => props.theme.primary}40;
	}

	&:active {
		transform: translateY(0);
	}
`

const FocusMessage = styled.div`
	color: ${(props) => props.theme.text}80;
	font-size: 16px;
	margin-top: 10px;
	text-align: center;
	opacity: ${(props) => (props.$show ? 1 : 0)};
	transition: opacity 0.3s ease;
`

const Word = styled.span`
	display: inline-flex;
	position: relative;
	margin-right: 12px;
	height: 42px;
	align-items: center;
	transition: opacity 0.3s ease;

	${(props) =>
		props.isCurrentWord &&
		`
		&::after {
			content: '';
			position: absolute;
			right: -8px;
			bottom: 0;
			width: 12px;
			height: 3px;
			background-color: ${props.theme.primary};
			animation: blink 1s infinite;
			opacity: ${props.showSpaceCursor ? 1 : 0};
		}
	`}
`

const getCharacterStatus = (
	wordIndex,
	charIndex,
	currentWordIndex,
	currentInput,
	errorMap
) => {
	// If this is a character in a previous word
	if (wordIndex < currentWordIndex) {
		// Check if this character had an error
		return errorMap[wordIndex]?.[charIndex]?.isError ? "incorrect" : "correct"
	}

	// If this is the current word
	if (wordIndex === currentWordIndex) {
		// If we haven't typed this character yet
		if (charIndex >= currentInput.length) {
			return "untyped"
		}
		// If this character has an error
		if (errorMap[wordIndex]?.[charIndex]?.isError) {
			return "incorrect"
		}
		// If we've typed this character correctly
		return "correct"
	}

	// Future words
	return "untyped"
}

const Character = styled.span`
	color: ${(props) => {
		if (props.status === "correct") return props.theme.success + "CC"
		if (props.status === "incorrect" || props.hasError)
			return props.theme.error + "CC"
		if (props.status === "current") return props.theme.text
		return props.theme.text + "40"
	}};
	position: relative;
	font-weight: ${(props) => (props.status === "current" ? "bold" : "normal")};

	&::after {
		content: "";
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 3px;
		background-color: ${(props) =>
			props.isCursor || props.isSpaceCursor
				? props.theme.primary
				: "transparent"};
		animation: ${(props) =>
			props.isCursor || props.isSpaceCursor ? "blink 1s infinite" : "none"};
	}

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
`

const HiddenInput = styled.input`
	position: absolute;
	left: -9999px;
	width: 1px;
	height: 1px;
	overflow: hidden;
`

const generateWords = (
	count = 50,
	difficulty = "medium",
	includePunctuation = false
) => {
	const options = {
		exactly: count,
		maxLength: difficulty === "easy" ? 5 : difficulty === "medium" ? 8 : 12,
		minLength: difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 6,
	}
	let words = generate(options)
	if (includePunctuation) {
		words = words.map((word, index) => {
			const shouldCapitalize = Math.random() < 0.3
			const capitalizedWord = shouldCapitalize
				? word.charAt(0).toUpperCase() + word.slice(1)
				: word
			const shouldAddComma = Math.random() < 0.2 && index < words.length - 1
			const shouldAddPeriod = Math.random() < 0.15 && index < words.length - 1
			if (shouldAddPeriod) {
				return capitalizedWord + "."
			}
			return shouldAddComma ? capitalizedWord + "," : capitalizedWord
		})
	}
	return words
}
const SpaceCursor = styled.span`
	position: absolute;
	right: -16px;
	bottom: 0;
	width: 12px;
	height: 3px;
	background-color: ${(props) => props.theme.primary};
	animation: blink 1s infinite;

	@keyframes blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}
`
const TypingTest = ({ onTestComplete }) => {
	const [backspacedFromNewWord, setBackspacedFromNewWord] = useState(false)
	const [playWrongSound, setPlayWrongSound] = useState(null)
	const [playSoundFn, setPlaySoundFn] = useState(null)
	const [playBackspaceSound, setPlayBackspaceSound] = useState(null)
	const [showCustomModal, setShowCustomModal] = useState(false)
	const [modalType, setModalType] = useState("")
	const [modalValue, setModalValue] = useState("")
	const [testType, setTestType] = useState("time")
	const [testDuration, setTestDuration] = useState(30)
	const [wordCount, setWordCount] = useState(25)
	const [difficulty, setDifficulty] = useState("medium")
	const [activeOptionGroup, setActiveOptionGroup] = useState("difficulty")
	const [includePunctuation, setIncludePunctuation] = useState(false)
	const [words, setWords] = useState([])
	const [currentWordIndex, setCurrentWordIndex] = useState(0)
	const [currentInput, setCurrentInput] = useState("")
	const [startTime, setStartTime] = useState(null)
	const [timeLeft, setTimeLeft] = useState(null)
	const [testActive, setTestActive] = useState(false)
	const [testComplete, setTestComplete] = useState(false)
	const [typedCharacters, setTypedCharacters] = useState([])
	const [errorCount, setErrorCount] = useState(0)
	const [errorMap, setErrorMap] = useState({})
	const [isFocused, setIsFocused] = useState(true)
	const [textOffset, setTextOffset] = useState(0)
	const [customInputFocused, setCustomInputFocused] = useState(false)
	const [soundEnabled, setSoundEnabled] = useState(() => {
		const savedSound = localStorage.getItem("soundEnabled")
		return savedSound !== null ? savedSound === "true" : true
	})

	const [currentWPM, setCurrentWPM] = useState(0)
	const [currentAccuracy, setCurrentAccuracy] = useState(0)
	const [currentTimePerChar, setCurrentTimePerChar] = useState(0)

	const inputRef = useRef(null)
	const textDisplayRef = useRef(null)
	const textContainerRef = useRef(null)
	const { currentUser } = useAuth()
	useEffect(() => {
		// Initialize audio pools
		setPlaySoundFn(() =>
			createAudioPool("/sounds/mixkit-typewriter-soft-click-1125.wav")
		)
		setPlayBackspaceSound(() =>
			createAudioPool("/sounds/mixkit-typewriter-soft-hit-1366.wav")
		)

		setPlayWrongSound(() => createAudioPool("/sounds/punch-140236.mp3")) // Ensure this path is correct

		// Clean up function
		return () => {
			setPlaySoundFn(null)
			setPlayBackspaceSound(null)
			setPlayWrongSound(null)
		}
	}, [])

	useEffect(() => {
		resetTest()
	}, [testType, testDuration, wordCount, difficulty, includePunctuation])
	// Add this useEffect to update stats during typing
	useEffect(() => {
		if (testActive && startTime) {
			const updateStats = () => {
				setCurrentWPM(calculateWPM())
				setCurrentAccuracy(calculateAccuracy())
				setCurrentTimePerChar(calculateTimePerChar())
			}

			const statsInterval = setInterval(updateStats, 200) // Update 5 times per second
			updateStats() // Initial update

			return () => clearInterval(statsInterval)
		}
	}, [
		testActive,
		startTime,
		typedCharacters.length,
		currentInput,
		currentWordIndex,
	])

	useEffect(() => {
		let timerInterval
		if (testActive && testType === "time" && timeLeft > 0) {
			timerInterval = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						endTest()
						return 0
					}
					return prev - 1
				})
			}, 1000)
		}
		return () => clearInterval(timerInterval)
	}, [testActive, testType, timeLeft])

	const [lineMap, setLineMap] = useState([])
	const lastLineIndexRef = useRef(0)

	// Replace the existing scrolling useEffect with this precise implementation
	useEffect(() => {
		if (!textDisplayRef.current || !textContainerRef.current || !testActive)
			return

		const lineHeight = 42 // Height of each word line
		const containerHeight = textContainerRef.current.clientHeight
		const maxVisibleLines = Math.floor(containerHeight / lineHeight)

		// Only run this once we have words to analyze
		const words = Array.from(textDisplayRef.current.children)
		if (words.length === 0 || currentWordIndex >= words.length) return

		// Calculate the current line map (which words belong to which lines)
		const calcLineMap = () => {
			const lineMap = []
			const containerRect = textContainerRef.current.getBoundingClientRect()

			// Create an absolute position mapping ignoring current scroll position
			words.forEach((word, index) => {
				const rect = word.getBoundingClientRect()
				// Calculate absolute position (add back the current scroll offset)
				const absTop = rect.top - containerRect.top + textOffset
				const lineIndex = Math.floor(absTop / lineHeight)

				// Expand array if needed
				while (lineMap.length <= lineIndex) {
					lineMap.push([])
				}

				// Add word to appropriate line
				lineMap[lineIndex].push(index)
			})

			return lineMap
		}

		// Get updated line mapping
		const newLineMap = calcLineMap()
		setLineMap(newLineMap)

		// Find which line contains our current word
		let currentLineIndex = -1
		for (let i = 0; i < newLineMap.length; i++) {
			if (newLineMap[i].includes(currentWordIndex)) {
				currentLineIndex = i
				break
			}
		}

		if (currentLineIndex < 0) return

		// Check if we've moved to a new line
		if (currentLineIndex > lastLineIndexRef.current) {
			// We've moved to a new line

			// If we're moving to the third line (index 2) or beyond
			if (currentLineIndex >= 2) {
				// Scroll exactly one line so the current line becomes the second visible line
				// This ensures we're always typing on the second line
				setTextOffset((currentLineIndex - 1) * lineHeight)
			}
		} else if (
			currentLineIndex < lastLineIndexRef.current &&
			currentLineIndex <= 1
		) {
			// We've moved back to the first or second line, reset scrolling
			setTextOffset(0)
		}

		// Update our reference to the current line
		lastLineIndexRef.current = currentLineIndex
	}, [currentWordIndex, testActive])

	const resetTest = () => {
		const generatedWords = generateWords(
			testType === "words" ? wordCount : 100,
			difficulty,
			includePunctuation
		)
		setWords(generatedWords)
		setCurrentWordIndex(0)
		setCurrentInput("")
		setStartTime(null)
		setTimeLeft(testType === "time" ? testDuration : null)
		setTestActive(false)
		setTestComplete(false)
		setTypedCharacters([])
		setErrorCount(0)
		setErrorMap({})
		setTextOffset(0)
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}

	const startTest = () => {
		if (!testActive && !testComplete) {
			setStartTime(Date.now())
			setTestActive(true)
			setTimeLeft(testType === "time" ? testDuration : null)
			inputRef.current.focus()
			setIsFocused(true)
		}
	}

	const endTest = () => {
		setTestActive(false)
		setTestComplete(true)
		analyzeErrors()
		const testDurationInSeconds = (Date.now() - startTime) / 1000

		const results = {
			wpm: calculateWPM(),
			rawWpm: calculateRawWPM(),
			accuracy: calculateAccuracy(),
			timePerChar: calculateTimePerChar(),
			charactersTyped: typedCharacters.length,
			errorCount,
			errorMap,
			testDuration: testDurationInSeconds,
		}

		if (currentUser) {
			saveResultsToFirebase(results)
		}

		onTestComplete(results)
	}

	const saveResultsToFirebase = async (results) => {
		try {
			await addDoc(collection(db, "tests"), {
				username:
					currentUser.displayName ||
					(currentUser.email ? currentUser.email.split("@")[0] : "Anonymous"),
				displayName: currentUser.displayName,
				email: currentUser.email,
				userId: currentUser.uid,
				timestamp: serverTimestamp(),
				...results,
			})
		} catch (error) {
			console.error("Error saving test results:", error)
		}
	}

	const [lastSpaceTime, setLastSpaceTime] = useState(0)
	const SPACE_DELAY = 100 // Minimum delay between space presses in milliseconds

	// Modify the handleInputChange function to allow backspacing to previous words
	const handleInputChange = (e) => {
		const value = e.target.value

		// Handle character addition
		if (value.length > currentInput.length) {
			const newChar = value[value.length - 1]
			const expectedChar = words[currentWordIndex]?.[currentInput.length]

			// Determine if the character is correct or incorrect
			const isCorrect = newChar === expectedChar

			// Update error map for the current character
			setErrorMap((prev) => {
				const updated = { ...prev }
				if (!updated[currentWordIndex]) {
					updated[currentWordIndex] = {}
				}
				// Clear error state if character is now correct
				if (isCorrect) {
					delete updated[currentWordIndex][currentInput.length]
				} else {
					// Store both the incorrect character and its position
					updated[currentWordIndex][currentInput.length] = {
						isError: true,
						typed: newChar,
						expected: expectedChar,
					}
				}
				return updated
			})

			// Play appropriate sound if enabled
			if (soundEnabled && testActive) {
				if (isCorrect && playSoundFn) {
					playSoundFn() // Play correct character sound
				} else if (!isCorrect && playWrongSound) {
					playWrongSound() // Play wrong character sound for all incorrect characters
				}
			}
		}

		// Prevent space as first character when starting test
		if (!testActive && !testComplete) {
			// Don't start test if first character is a space
			if (value.trim() === "") {
				return
			}
			startTest()
			setCurrentInput(value)
			return
		}

		if (testActive) {
			// If we're typing a character after backspacing from a new word
			// and the input equals the current word, automatically advance to next word
			if (
				backspacedFromNewWord &&
				value === words[currentWordIndex] &&
				value.length === words[currentWordIndex].length
			) {
				// Auto-advance to next word
				const currentWord = words[currentWordIndex]

				// Record typed characters for the current word
				for (let i = 0; i < currentWord.length; i++) {
					const typed = currentWord[i]
					const actual = currentWord[i]

					setTypedCharacters((prev) => [
						...prev,
						{
							typed,
							actual,
							correct: typed === actual,
							wordIndex: currentWordIndex,
							charIndex: i,
						},
					])
				}

				setCurrentWordIndex(currentWordIndex + 1)
				setCurrentInput("")
				setBackspacedFromNewWord(false)

				if (testType === "words" && currentWordIndex + 1 >= wordCount) {
					endTest()
				}

				return
			}

			// Handle space key for skipping words
			if (value.endsWith(" ")) {
				const currentTime = Date.now()
				if (currentTime - lastSpaceTime < SPACE_DELAY) {
					return // Keep anti-spam protection
				}

				// Reset backspaced flag if we're advancing with space
				setBackspacedFromNewWord(false)

				// Get the typed word without the trailing space
				const typedWord = value.trim()
				const currentWord = words[currentWordIndex]

				// Only allow skipping if at least one character has been typed
				if (typedWord.length === 0) {
					setCurrentInput(typedWord) // Remove the space if no characters typed
					return
				}

				setLastSpaceTime(currentTime)

				// Record typed characters for the current word
				for (
					let i = 0;
					i < Math.max(typedWord.length, currentWord.length);
					i++
				) {
					const typed = typedWord[i] || ""
					const actual = currentWord[i] || ""

					setTypedCharacters((prev) => [
						...prev,
						{
							typed,
							actual,
							correct: typed === actual,
							wordIndex: currentWordIndex,
							charIndex: i,
						},
					])

					if (typed !== actual) {
						setErrorCount((prev) => prev + 1)
						if (typed) {
							setErrorMap((prev) => ({
								...prev,
								[typed]: (prev[typed] || 0) + 1,
							}))
						}
					}
				}

				setCurrentWordIndex((prev) => {
					const nextIndex = prev + 1
					// Only generate more words if we're in "time" mode
					if (testType === "time" && nextIndex >= words.length - 10) {
						// Generate more words when approaching the end
						const newWords = generateWords(50, difficulty, includePunctuation)
						setWords((words) => [...words, ...newWords])
					}
					return nextIndex
				})
				setCurrentInput("")

				if (testType === "words" && currentWordIndex + 1 >= wordCount) {
					endTest()
				}

				return
			}

			setCurrentInput(value)
		}
	}

	const [wordCompletionState, setWordCompletionState] = useState({})
	useEffect(() => {
		if (
			testActive &&
			backspacedFromNewWord &&
			currentInput === words[currentWordIndex]
		) {
			// If we're editing a word after backspacing and complete it perfectly, be ready to auto-advance
			// The actual advancing happens in handleInputChange when the next character is typed
			// This is just preparing the state
		}
	}, [currentInput, currentWordIndex, words, testActive, backspacedFromNewWord])
	useEffect(() => {
		if (testActive && currentInput.length === words[currentWordIndex]?.length) {
			// Mark this word as completed
			setWordCompletionState((prev) => ({
				...prev,
				[currentWordIndex]: true,
			}))
		}
	}, [currentInput, currentWordIndex, words, testActive])
	const handleKeyDown = (e) => {
		// Handle Shift+Enter to restart test
		if (e.key === "Enter" && e.shiftKey) {
			e.preventDefault()
			resetTest()
			return
		}

		// Handle backspace key
		if (e.key === "Backspace") {
			if (soundEnabled && playBackspaceSound) {
				playBackspaceSound()
			}
			// If we're not at the start of the input, just let the normal backspace behavior happen
			if (currentInput.length > 0) {
				return // Allow normal backspace behavior within the word
			}

			// If we're at the start of the input and not at the first word, move to the previous word
			if (currentWordIndex > 0) {
				e.preventDefault() // Prevent default backspace behavior

				// Get the previous word
				const previousWord = words[currentWordIndex - 1]

				// Flag that we backspaced from a new word
				setBackspacedFromNewWord(true)

				// Move back to the previous word
				setCurrentWordIndex(currentWordIndex - 1)
				setCurrentInput(previousWord)

				// Keep the error map for the previous word
				setErrorMap((prev) => {
					const updated = { ...prev }
					// Ensure we maintain the error state for the previous word
					if (!updated[currentWordIndex - 1]) {
						updated[currentWordIndex - 1] = {}
					}
					return updated
				})

				// Remove the characters from the typed characters array
				setTypedCharacters((chars) => {
					// Find where the previous word starts in the array
					const wordStartIndex = chars.findIndex(
						(char) => char.wordIndex === currentWordIndex - 1
					)

					// If found, remove all characters from that word
					if (wordStartIndex !== -1) {
						return chars.slice(0, wordStartIndex)
					}
					return chars
				})
			}
		}

		// Handle space key for skipping words
		if (e.key === " ") {
			const currentTime = Date.now()
			if (currentTime - lastSpaceTime < SPACE_DELAY) {
				return // Keep anti-spam protection
			}

			// Reset backspaced flag if we're advancing with space
			setBackspacedFromNewWord(false)

			// Get the typed word without the trailing space
			const typedWord = currentInput.trim()
			const currentWord = words[currentWordIndex]

			// Only allow skipping if at least one character has been typed
			if (typedWord.length === 0) {
				setCurrentInput(typedWord) // Remove the space if no characters typed
				return
			}

			setLastSpaceTime(currentTime)

			// Record typed characters for the current word
			for (let i = 0; i < Math.max(typedWord.length, currentWord.length); i++) {
				const typed = typedWord[i] || ""
				const actual = currentWord[i] || ""

				setTypedCharacters((prev) => [
					...prev,
					{
						typed,
						actual,
						correct: typed === actual,
						wordIndex: currentWordIndex,
						charIndex: i,
					},
				])

				if (typed !== actual) {
					setErrorCount((prev) => prev + 1)
					if (typed) {
						setErrorMap((prev) => ({
							...prev,
							[typed]: (prev[typed] || 0) + 1,
						}))
					}
				}
			}

			setCurrentWordIndex((prev) => {
				const nextIndex = prev + 1
				// Only generate more words if we're in "time" mode
				if (testType === "time" && nextIndex >= words.length - 10) {
					// Generate more words when approaching the end
					const newWords = generateWords(50, difficulty, includePunctuation)
					setWords((words) => [...words, ...newWords])
				}
				return nextIndex
			})
			setCurrentInput("")

			if (testType === "words" && currentWordIndex + 1 >= wordCount) {
				endTest()
			}

			return
		}
	}
	const analyzeErrors = () => {
		// Error analysis is already being done during typing
	}

	const calculateWPM = () => {
		if (!startTime) return 0

		// Get the time elapsed in milliseconds and minutes
		const elapsedMs = Date.now() - startTime
		const elapsedMinutes = elapsedMs / 60000

		// Count all correctly typed characters
		const correctChars = typedCharacters.filter((char) => char.correct).length

		// Add the correct characters in the current word
		const currentWordCorrect = currentInput.split("").filter((char, i) => {
			return char === (words[currentWordIndex] || "")[i]
		}).length

		// Calculate WPM using the standard 5 characters = 1 word formula
		const totalCorrectChars = correctChars + currentWordCorrect

		// Add spaces between words (one for each completed word)
		const spacesCount = currentWordIndex
		const totalWithSpaces = totalCorrectChars + spacesCount

		// Use actual time, even for very short tests
		return Math.round(totalWithSpaces / 5 / Math.max(elapsedMinutes, 0.00001))
	}

	const calculateRawWPM = () => {
		if (!startTime) return 0

		// Get the time elapsed in milliseconds and minutes
		const elapsedMs = Date.now() - startTime
		const elapsedMinutes = elapsedMs / 60000

		// Count all typed characters (correct or not)
		const totalChars = typedCharacters.length

		// Add the characters in the current word
		const currentWordChars = currentInput.length

		// Calculate raw WPM including all characters
		const totalCharacters = totalChars + currentWordChars

		// Add spaces between words (one for each completed word)
		const spacesCount = currentWordIndex
		const totalWithSpaces = totalCharacters + spacesCount

		// Use actual time, even for very short tests
		return Math.round(totalWithSpaces / 5 / Math.max(elapsedMinutes, 0.00001))
	}

	const calculateAccuracy = () => {
		// Total characters typed (including current word)
		const typedTotal = typedCharacters.length + currentInput.length

		if (typedTotal === 0) return 0

		// Count correct characters
		const correctChars = typedCharacters.filter((char) => char.correct).length

		// Add correct characters from current word
		const currentWordCorrect = currentInput.split("").filter((char, i) => {
			return char === (words[currentWordIndex] || "")[i]
		}).length

		const totalCorrect = correctChars + currentWordCorrect

		return Math.round((totalCorrect / typedTotal) * 100)
	}

	// Add this function to calculate time per character
	const calculateTimePerChar = () => {
		if (!startTime) return 0

		const elapsedMs = Date.now() - startTime

		// Ensure minimum elapsed time (at least 500ms to avoid near-instant results)
		const effectiveElapsed = Math.max(elapsedMs, 500)

		// Ensure at least 1 valid character counted
		const totalChars = typedCharacters.length + currentInput.length
		const spacesCount = currentWordIndex
		const totalWithSpaces = Math.max(totalChars + spacesCount, 1) // At least 1

		return Math.min(effectiveElapsed / totalWithSpaces, 9999) // Cap extreme values
	}

	const handleButtonClick = (e) => {
		e.preventDefault()
		e.stopPropagation()
		inputRef.current.focus()
		setIsFocused(true)
	}

	const handleTextDisplayClick = (e) => {
		e.preventDefault()
		if (!customInputFocused) {
			inputRef.current.focus()
			setIsFocused(true)
		}
	}
	const handleModalInputFocus = () => {
		setCustomInputFocused(true)
	}

	const handleModalInputBlur = () => {
		setCustomInputFocused(false)
	}

	const openCustomModal = (type) => {
		setModalType(type)
		setModalValue(
			type === "time" ? testDuration.toString() : wordCount.toString()
		)
		setShowCustomModal(true)
	}

	const handleModalInputKeyDown = (e) => {
		if (e.key === "Enter") {
			saveCustomValue()
		}
	}
	const saveCustomValue = () => {
		const numValue = parseInt(modalValue)
		if (!isNaN(numValue) && numValue > 0) {
			if (modalType === "time") {
				setTestDuration(numValue)
				setTestType("time")
			} else {
				setWordCount(numValue)
				setTestType("words")
			}
		}
		setShowCustomModal(false)
		inputRef.current.focus()
	}

	useEffect(() => {
		if (inputRef.current && !customInputFocused) {
			inputRef.current.focus()
		}

		const handleWindowFocus = () => {
			if (inputRef.current && !customInputFocused) {
				inputRef.current.focus()
				setIsFocused(true)
			}
		}

		const handleWindowBlur = () => {
			if (!customInputFocused) {
				setIsFocused(false)
			}
		}

		window.addEventListener("focus", handleWindowFocus)
		window.addEventListener("blur", handleWindowBlur)

		return () => {
			window.removeEventListener("focus", handleWindowFocus)
			window.removeEventListener("blur", handleWindowBlur)
		}
	}, [customInputFocused])

	const handleRestart = () => {
		resetTest()
	}

	const handleInputBlur = () => {
		setIsFocused(false)
	}

	const handleInputFocus = () => {
		setIsFocused(true)
	}

	const renderWord = (word, index) => {
		return (
			<Word key={`${index}-${word}`}>
				{word.split("").map((char, charIndex) => {
					const status = getCharacterStatus(
						index,
						charIndex,
						currentWordIndex,
						currentInput,
						errorMap
					)
					return (
						<Character
							key={charIndex}
							status={status}
							isCursor={
								index === currentWordIndex && charIndex === currentInput.length
							}>
							{char}
						</Character>
					)
				})}
				{index === currentWordIndex && (
					<SpaceCursor
						style={{
							visibility:
								currentInput.length === word.length ? "visible" : "hidden",
						}}
					/>
				)}
			</Word>
		)
	}

	return (
		<TypingTestContainer className="typing-test-container">
			<TestHeader>
				<TestOptions>
					<OptionGroup>
						<EnhancedOptionButton
							active={includePunctuation}
							onClick={(e) => {
								handleButtonClick(e)
								setIncludePunctuation(!includePunctuation)
							}}>
							Punctuation {includePunctuation ? "On" : "Off"}
						</EnhancedOptionButton>
						<EnhancedOptionButton
							active={activeOptionGroup === "difficulty"}
							onClick={(e) => {
								handleButtonClick(e)
								setActiveOptionGroup("difficulty")
							}}>
							{activeOptionGroup === "difficulty"
								? "Difficulty"
								: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
						</EnhancedOptionButton>
						{activeOptionGroup === "difficulty" && (
							<>
								<EnhancedOptionButton
									active={difficulty === "easy"}
									onClick={(e) => {
										handleButtonClick(e)
										setDifficulty("easy")
									}}>
									Easy
								</EnhancedOptionButton>
								<EnhancedOptionButton
									active={difficulty === "medium"}
									onClick={(e) => {
										handleButtonClick(e)
										setDifficulty("medium")
									}}>
									Medium
								</EnhancedOptionButton>
								<EnhancedOptionButton
									active={difficulty === "hard"}
									onClick={(e) => {
										handleButtonClick(e)
										setDifficulty("hard")
									}}>
									Hard
								</EnhancedOptionButton>
							</>
						)}
					</OptionGroup>
					<OptionGroup>
						<EnhancedOptionButton
							active={activeOptionGroup === "time"}
							onClick={(e) => {
								handleButtonClick(e)
								setActiveOptionGroup("time")
								setTestType("time")
							}}>
							Time
						</EnhancedOptionButton>
						<EnhancedOptionButton
							active={activeOptionGroup === "words"}
							onClick={(e) => {
								handleButtonClick(e)
								setActiveOptionGroup("words")
								setTestType("words")
							}}>
							Words
						</EnhancedOptionButton>
					</OptionGroup>

					{activeOptionGroup === "time" && (
						<OptionGroup noWrap expanded>
							<OptionLabel>Duration:</OptionLabel>
							<EnhancedOptionButton
								active={testDuration === 15}
								onClick={(e) => {
									handleButtonClick(e)
									setTestDuration(15)
								}}>
								15s
							</EnhancedOptionButton>
							<EnhancedOptionButton
								active={testDuration === 30}
								onClick={(e) => {
									handleButtonClick(e)
									setTestDuration(30)
								}}>
								30s
							</EnhancedOptionButton>
							<EnhancedOptionButton
								active={testDuration === 60}
								onClick={(e) => {
									handleButtonClick(e)
									setTestDuration(60)
								}}>
								60s
							</EnhancedOptionButton>
							<EnhancedOptionButton
								onClick={(e) => {
									handleButtonClick(e)
									openCustomModal("time")
								}}>
								Custom
							</EnhancedOptionButton>
						</OptionGroup>
					)}

					{activeOptionGroup === "words" && (
						<OptionGroup noWrap expanded>
							<OptionLabel>Words:</OptionLabel>
							<EnhancedOptionButton
								active={wordCount === 10}
								onClick={(e) => {
									handleButtonClick(e)
									setWordCount(10)
								}}>
								10
							</EnhancedOptionButton>
							<EnhancedOptionButton
								active={wordCount === 25}
								onClick={(e) => {
									handleButtonClick(e)
									setWordCount(25)
								}}>
								25
							</EnhancedOptionButton>
							<EnhancedOptionButton
								active={wordCount === 50}
								onClick={(e) => {
									handleButtonClick(e)
									setWordCount(50)
								}}>
								50
							</EnhancedOptionButton>
							<EnhancedOptionButton
								onClick={(e) => {
									handleButtonClick(e)
									openCustomModal("words")
								}}>
								Custom
							</EnhancedOptionButton>
						</OptionGroup>
					)}
				</TestOptions>
				<Timer>
					{testType === "time"
						? timeLeft !== null && `${timeLeft}s`
						: `${currentWordIndex}/${wordCount} words`}
				</Timer>
			</TestHeader>

			<TextDisplayContainer
				ref={textContainerRef}
				className="text-display-container"
				onClick={handleTextDisplayClick}
				$isFocused={isFocused}>
				<TextDisplay
					ref={textDisplayRef}
					className="text-display"
					style={{ transform: `translateY(-${textOffset}px)` }}>
					{words.map((word, index) => renderWord(word, index))}
				</TextDisplay>
			</TextDisplayContainer>

			<FocusMessage $show={!isFocused}>
				Click back in the text area to continue typing
			</FocusMessage>

			<HiddenInput
				ref={inputRef}
				type="text"
				value={currentInput}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onBlur={handleInputBlur}
				onFocus={handleInputFocus}
				disabled={testComplete}
				autoFocus
			/>

			{(testComplete || testActive) && (
				<RestartButton onClick={handleRestart}>Restart Test</RestartButton>
			)}

			{showCustomModal && (
				<Modal onClick={() => setShowCustomModal(false)}>
					<ModalContent onClick={(e) => e.stopPropagation()}>
						<ModalTitle>
							Enter custom{" "}
							{modalType === "time" ? "duration (seconds)" : "word count"}
						</ModalTitle>
						<ModalInput
							type="number"
							value={modalValue}
							onChange={(e) => setModalValue(e.target.value)}
							onFocus={handleModalInputFocus}
							onBlur={handleModalInputBlur}
							onKeyDown={handleModalInputKeyDown}
							autoFocus
						/>
						<ButtonGroup>
							<ModalButton onClick={() => setShowCustomModal(false)}>
								Cancel
							</ModalButton>
							<ModalButton primary onClick={saveCustomValue}>
								Save
							</ModalButton>
						</ButtonGroup>
					</ModalContent>
				</Modal>
			)}
		</TypingTestContainer>
	)
}

export default TypingTest
