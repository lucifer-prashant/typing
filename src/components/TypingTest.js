import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { useAuth } from "../contexts/AuthContext"
import { db } from "../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { generate } from "random-words"

const TypingTestContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 100%;
	max-width: 900px;
	margin: 0 auto;
	padding: 20px;
`

const TestHeader = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	margin-bottom: 20px;
	padding: 0; /* Remove any padding */
`

const TestOptions = styled.div`
	display: flex;
	gap: 15px;
	flex-wrap: wrap;
	width: 100%;
	margin-bottom: 20px;

	@media (max-width: 768px) {
		gap: 10px;
	}
`

const OptionGroup = styled.div`
	display: flex;
	gap: 8px;
	align-items: center;
	flex-wrap: ${(props) => (props.noWrap ? "nowrap" : "wrap")};
	overflow-x: ${(props) => (props.noWrap ? "auto" : "visible")};
	max-width: ${(props) => (props.expanded ? "100%" : "auto")};

	@media (max-width: 768px) {
		gap: 6px;
	}
`

const OptionLabel = styled.span`
	color: #888;
	font-size: 14px;
`
// gy8ghbmh, h
const CustomInput = styled.input`
	background-color: #1a1a1a;
	color: white;
	border: 1px solid #333;
	border-radius: 4px;
	padding: 8px 12px;
	width: 80px;
	font-size: 14px;

	&:focus {
		border-color: #646cff;
		outline: none;
	}

	&::-webkit-inner-spin-button,
	&::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
`

const Timer = styled.div`
	font-size: 24px;
	font-weight: bold;
	color: #646cff;
	display: flex;
	align-items: center;
	justify-content: flex-end;
	padding-right: 0; /* Remove any right padding */
	margin-right: 0; /* Remove any right margin */
	text-align: right; /* Ensure text is right-aligned */
	width: auto; /* Let it take the space it needs */
	min-width: 100px; /* Ensure consistent width */
`

const TextDisplay = styled.div`
	width: 100%;
	background-color: rgba(26, 26, 26, 0.8);
	border-radius: 12px;
	padding: 20px;
	margin-bottom: 20px;
	font-family: "Roboto Mono", monospace;
	font-size: 20px;
	line-height: 1.6;
	height: 120px;
	overflow: hidden;
	position: relative;
	display: flex;
	flex-wrap: wrap;
	align-content: flex-start;
	gap: 8px;
	transition: all 0.2s ease;
	cursor: text;
	border: 1px solid rgba(255, 255, 255, 0.1);

	filter: ${(props) => (props.$isFocused ? "none" : "blur(3px)")};

	&:focus-within {
		border-color: #646cff;
	}
`

const OptionButton = styled.button`
	background-color: ${(props) =>
		props.active ? "#646cff" : "rgba(26, 26, 26, 0.8)"};
	color: white;
	border: 1px solid
		${(props) => (props.active ? "#646cff" : "rgba(255, 255, 255, 0.1)")};
	border-radius: 8px;
	padding: 8px 16px;
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 14px;

	&:hover {
		background-color: #646cff;
		border-color: #646cff;
		transform: translateY(-1px);
	}

	&:active {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		padding: 6px 12px;
		font-size: 13px;
	}
`

const FocusMessage = styled.div`
	color: #888;
	font-size: 16px;
	margin-top: 10px;
	text-align: center;
	opacity: ${(props) => (props.$show ? 1 : 0)};
	transition: opacity 0.3s ease;
`

const ProgressIndicator = styled.div`
	position: absolute;
	top: 10px;
	right: 10px;
	color: #646cff;
	font-size: 16px;
	font-weight: bold;
`

const Word = styled.span`
	display: inline-flex;
	position: relative;
	margin-right: 8px;
	height: 32px;
	align-items: center;
`

const Character = styled.span`
	color: ${(props) => {
		if (props.status === "correct") return "#4caf50"
		if (props.status === "incorrect") return "#f44336"
		if (props.status === "current") return "#646cff"
		return "#888"
	}};
	position: relative;
	font-weight: ${(props) => (props.status === "current" ? "bold" : "normal")};

	&::after {
		content: "";
		position: absolute;
		left: 0;
		bottom: -2px;
		width: 100%;
		height: 2px;
		background-color: ${(props) =>
			props.status === "current" ? "#646cff" : "transparent"};
		animation: ${(props) =>
			props.status === "current" ? "blink 1s infinite" : "none"};
	}

	@keyframes blink {
		50% {
			opacity: 0.5;
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

const RestartIcon = styled.button`
	background-color: transparent;
	color: #646cff;
	border: none;
	cursor: pointer;
	font-size: 24px;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 20px;
	transition: transform 0.2s ease;

	&:hover {
		transform: rotate(180deg);
	}

	&::before {
		content: "↻";
	}
`

const RestartButton = styled.button`
	background-color: #646cff;
	color: white;
	border: none;
	border-radius: 4px;
	padding: 10px 20px;
	margin-top: 20px;
	cursor: pointer;
	font-size: 16px;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: #535bf2;
	}
`

// Generate random words for typing test based on difficulty
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
			// Capitalize ~30% of words
			const shouldCapitalize = Math.random() < 0.3
			const capitalizedWord = shouldCapitalize
				? word.charAt(0).toUpperCase() + word.slice(1)
				: word
			// Add comma after ~20% of words, and period after ~15% of words, but not at the end of the text
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

const TypingTest = ({ onTestComplete }) => {
	const [testType, setTestType] = useState("time") // 'time' or 'words'
	const [testDuration, setTestDuration] = useState(30) // seconds
	const [wordCount, setWordCount] = useState(25) // number of words
	const [customValue, setCustomValue] = useState("") // custom time/word value
	const [difficulty, setDifficulty] = useState("medium") // 'easy', 'medium', 'hard'
	const [activeOptionGroup, setActiveOptionGroup] = useState("difficulty") // 'difficulty', 'time', 'words'
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

	const inputRef = useRef(null)
	const { currentUser } = useAuth()

	// Initialize test and update words when settings change
	useEffect(() => {
		resetTest()
	}, [testType, testDuration, wordCount, difficulty, includePunctuation])

	// Timer countdown effect
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

	const resetTest = () => {
		// Generate exactly the number of words requested
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
		// setProgress(0)
	}

	const startTest = () => {
		if (!testActive && !testComplete) {
			setStartTime(Date.now())
			setTestActive(true)
			setTimeLeft(testType === "time" ? testDuration : null)
			inputRef.current.focus()
		}
	}

	const endTest = () => {
		setTestActive(false)
		setTestComplete(true)
		analyzeErrors()

		// Calculate test duration in minutes
		const testDurationInSeconds = (Date.now() - startTime) / 1000

		// Create results object
		const results = {
			wpm: calculateWPM(),
			rawWpm: calculateRawWPM(),
			accuracy: calculateAccuracy(),
			charactersTyped: typedCharacters.length,
			errorCount,
			errorMap,
			testDuration: testDurationInSeconds,
		}

		// Save results to Firebase if user is logged in
		if (currentUser) {
			saveResultsToFirebase(results)
		}

		// Send results to parent component
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

	const handleInputChange = (e) => {
		const value = e.target.value

		// Start the test immediately on first keypress
		if (!testActive && !testComplete) {
			startTest()
			// Set the current input to the first character
			setCurrentInput(value)
			return
		}

		// If test is active
		if (testActive) {
			setCurrentInput(value)

			// Check if space was pressed (word completed)
			if (value.endsWith(" ")) {
				const typedWord = value.trim()
				const currentWord = words[currentWordIndex]

				// Record characters typed
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
						},
					])

					if (typed !== actual) {
						setErrorCount((prev) => prev + 1)
						// Track which letters have errors
						if (typed) {
							setErrorMap((prev) => ({
								...prev,
								[typed]: (prev[typed] || 0) + 1,
							}))
						}
					}
				}

				// Move to next word
				setCurrentWordIndex((prev) => {
					const nextIndex = prev + 1

					// Auto-scroll when reaching the end of a line (approximately every 10 words)
					if (nextIndex % 10 === 0) {
						const textDisplay = document.querySelector(TextDisplay)
						if (textDisplay) {
							textDisplay.style.transform = `translateY(-${Math.floor(nextIndex / 10) * 40}px)`
						}
					}

					return nextIndex
				})
				setCurrentInput("")

				// End test if word count reached
				if (testType === "words" && currentWordIndex + 1 >= wordCount) {
					endTest()
				}
			}
		}
	}

	const analyzeErrors = () => {
		// Error analysis is already being done during typing
		// This function can be expanded for more detailed analysis
	}

	const calculateAccuracy = () => {
		if (typedCharacters.length === 0) return 0
		const correctChars = typedCharacters.filter((char) => char.correct).length
		return Math.round((correctChars / typedCharacters.length) * 100)
	}

	const calculateWPM = () => {
		if (!startTime || !testActive) return 0

		// Calculate elapsed time in minutes
		const elapsedMinutes = (Date.now() - startTime) / 60000

		// Count all typed characters including current word
		const completedWordsChars = typedCharacters.length
		const currentWordChars = currentInput.length
		const totalCharacters = completedWordsChars + currentWordChars

		// Add space characters for completed words
		const spacesCount = currentWordIndex > 0 ? currentWordIndex - 1 : 0
		const totalWithSpaces = totalCharacters + spacesCount

		// Use standard WPM formula: (characters / 5) / time
		// Normalize for very short tests (less than 1 second)
		const normalizedMinutes = Math.max(elapsedMinutes, 1 / 60)
		return Math.round(totalWithSpaces / 5 / normalizedMinutes)
	}

	const calculateRawWPM = () => {
		return calculateWPM()
	}

	const handleButtonClick = (e) => {
		e.preventDefault()
		e.stopPropagation()
		inputRef.current.focus()
	}

	const handleTextDisplayClick = (e) => {
		e.preventDefault()
		inputRef.current.focus()
		setIsFocused(true)
	}

	const handleInputFocus = () => {
		setIsFocused(true)
	}

	const handleInputBlur = (e) => {
		// Only update focus state if clicking outside the typing test container
		const container = document.querySelector(".typing-test-container")
		if (!container || !container.contains(e.relatedTarget)) {
			setIsFocused(false)
		}
	}

	const handleCustomValueChange = (e) => {
		const value = e.target.value
		setCustomValue(value)
		const numValue = parseInt(value)
		if (!isNaN(numValue) && numValue > 0) {
			if (activeOptionGroup === "time") {
				setTestDuration(numValue)
				setTestType("time")
			} else if (activeOptionGroup === "words") {
				setWordCount(numValue)
				setTestType("words")
			}
		}
		// Don't refocus on input when changing custom value
		e.stopPropagation()
	}

	useEffect(() => {
		// Auto-focus the input on component mount
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}, [])

	const handleRestart = () => {
		resetTest()
	}

	return (
		<TypingTestContainer className="typing-test-container">
			<TestHeader>
				<TestOptions>
					<OptionGroup>
						<OptionButton
							active={includePunctuation}
							onClick={(e) => {
								handleButtonClick(e)
								setIncludePunctuation(!includePunctuation)
							}}>
							Punctuation {includePunctuation ? "On" : "Off"}
						</OptionButton>
						<OptionButton
							active={activeOptionGroup === "difficulty"}
							onClick={(e) => {
								handleButtonClick(e)
								setActiveOptionGroup("difficulty")
							}}>
							{activeOptionGroup === "difficulty"
								? "Difficulty"
								: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
						</OptionButton>
						{activeOptionGroup === "difficulty" && (
							<>
								<OptionButton
									active={difficulty === "easy"}
									onClick={(e) => {
										handleButtonClick(e)
										setDifficulty("easy")
									}}>
									Easy
								</OptionButton>
								<OptionButton
									active={difficulty === "medium"}
									onClick={(e) => {
										handleButtonClick(e)
										setDifficulty("medium")
									}}>
									Medium
								</OptionButton>
								<OptionButton
									active={difficulty === "hard"}
									onClick={(e) => {
										handleButtonClick(e)
										setDifficulty("hard")
									}}>
									Hard
								</OptionButton>
							</>
						)}
					</OptionGroup>

					<OptionGroup>
						<OptionButton
							active={activeOptionGroup === "time"}
							onClick={(e) => {
								handleButtonClick(e)
								setActiveOptionGroup("time")
								setTestType("time")
							}}>
							Time
						</OptionButton>
						<OptionButton
							active={activeOptionGroup === "words"}
							onClick={(e) => {
								handleButtonClick(e)
								setActiveOptionGroup("words")
								setTestType("words")
							}}>
							Words
						</OptionButton>
					</OptionGroup>

					{activeOptionGroup === "time" && (
						<OptionGroup noWrap expanded>
							<OptionLabel>Duration:</OptionLabel>
							<OptionButton
								active={testDuration === 15}
								onClick={(e) => {
									handleButtonClick(e)
									setTestDuration(15)
								}}>
								15s
							</OptionButton>
							<OptionButton
								active={testDuration === 30}
								onClick={(e) => {
									handleButtonClick(e)
									setTestDuration(30)
								}}>
								30s
							</OptionButton>
							<OptionButton
								active={testDuration === 60}
								onClick={(e) => {
									handleButtonClick(e)
									setTestDuration(60)
								}}>
								60s
							</OptionButton>
							<CustomInput
								type="number"
								placeholder="Custom"
								value={customValue}
								onChange={handleCustomValueChange}
								min="1"
								max="999"
							/>
						</OptionGroup>
					)}

					{activeOptionGroup === "words" && (
						<OptionGroup noWrap expanded>
							<OptionLabel>Words:</OptionLabel>
							<OptionButton
								active={wordCount === 25}
								onClick={(e) => {
									handleButtonClick(e)
									setWordCount(25)
								}}>
								25
							</OptionButton>
							<OptionButton
								active={wordCount === 50}
								onClick={(e) => {
									handleButtonClick(e)
									setWordCount(50)
								}}>
								50
							</OptionButton>
							<OptionButton
								active={wordCount === 100}
								onClick={(e) => {
									handleButtonClick(e)
									setWordCount(100)
								}}>
								100
							</OptionButton>
							<CustomInput
								type="number"
								placeholder="Custom"
								value={customValue}
								onChange={handleCustomValueChange}
								min="1"
								max="999"
							/>
						</OptionGroup>
					)}
				</TestOptions>
				<Timer>
					{testType === "time"
						? timeLeft !== null && `${timeLeft}s`
						: `${currentWordIndex}/${wordCount} words`}
				</Timer>
			</TestHeader>

			<TextDisplay
				className="text-display"
				onClick={handleTextDisplayClick}
				$isFocused={isFocused}>
				{words
					.slice(currentWordIndex, currentWordIndex + 30)
					.map((word, index) => (
						<Word key={index}>
							{word.split("").map((char, charIndex) => {
								let status = "default"
								if (index === 0) {
									if (charIndex < currentInput.length) {
										status =
											currentInput[charIndex] === char ? "correct" : "incorrect"
									} else if (charIndex === currentInput.length) {
										status = "current"
									}
								}
								return (
									<Character key={charIndex} status={status}>
										{char}
									</Character>
								)
							})}
						</Word>
					))}
			</TextDisplay>

			<FocusMessage $show={!isFocused}>
				Click back in the text area to start
			</FocusMessage>

			<HiddenInput
				ref={inputRef}
				type="text"
				value={currentInput}
				onChange={handleInputChange}
				onBlur={handleInputBlur}
				onFocus={handleInputFocus}
				disabled={testComplete}
				autoFocus
			/>

			{(testComplete || testActive) && (
				<RestartButton onClick={handleRestart}>Restart Test</RestartButton>
			)}
		</TypingTestContainer>
	)
}

export default TypingTest
