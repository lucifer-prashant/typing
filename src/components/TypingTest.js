import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { useAuth } from "../contexts/AuthContext"
import { db } from "../firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

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
`

const TestOptions = styled.div`
	display: flex;
	gap: 10px;
`

const OptionButton = styled.button`
	background-color: ${(props) => (props.active ? "#646cff" : "#1a1a1a")};
	color: white;
	border: 1px solid ${(props) => (props.active ? "#646cff" : "#333")};
	border-radius: 4px;
	padding: 8px 12px;
	cursor: pointer;
	transition: all 0.2s ease;
	font-size: 14px;

	&:hover {
		background-color: #646cff;
		border-color: #646cff;
	}
`

const Timer = styled.div`
	font-size: 24px;
	font-weight: bold;
	color: #646cff;
`

const TextDisplay = styled.div`
	width: 100%;
	background-color: #1a1a1a;
	border-radius: 8px;
	padding: 20px;
	margin-bottom: 20px;
	font-family: "Roboto Mono", monospace;
	font-size: 20px;
	line-height: 1.6;
	height: 150px;
	overflow: hidden;
	position: relative;
`

const Word = styled.span`
	margin-right: 8px;
`

const Character = styled.span`
	color: ${(props) => {
		if (props.status === "correct") return "#4caf50"
		if (props.status === "incorrect") return "#f44336"
		if (props.status === "current") return "#646cff"
		return "#888"
	}};
	text-decoration: ${(props) =>
		props.status === "incorrect" ? "underline" : "none"};
	font-weight: ${(props) => (props.status === "current" ? "bold" : "normal")};
	animation: ${(props) =>
		props.status === "current" ? "blink 1s infinite" : "none"};

	@keyframes blink {
		50% {
			opacity: 0.5;
		}
	}
`

const InputField = styled.input`
	width: 100%;
	padding: 15px;
	background-color: #1a1a1a;
	border: 2px solid #333;
	border-radius: 8px;
	color: white;
	font-size: 18px;
	font-family: "Roboto Mono", monospace;
	outline: none;

	&:focus {
		border-color: #646cff;
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

// List of common English words for typing test
const commonWords = [
	"the",
	"be",
	"to",
	"of",
	"and",
	"a",
	"in",
	"that",
	"have",
	"I",
	"it",
	"for",
	"not",
	"on",
	"with",
	"he",
	"as",
	"you",
	"do",
	"at",
	"this",
	"but",
	"his",
	"by",
	"from",
	"they",
	"we",
	"say",
	"her",
	"she",
	"or",
	"an",
	"will",
	"my",
	"one",
	"all",
	"would",
	"there",
	"their",
	"what",
	"so",
	"up",
	"out",
	"if",
	"about",
	"who",
	"get",
	"which",
	"go",
	"me",
	"when",
	"make",
	"can",
	"like",
	"time",
	"no",
	"just",
	"him",
	"know",
	"take",
	"people",
	"into",
	"year",
	"your",
	"good",
	"some",
	"could",
	"them",
	"see",
	"other",
	"than",
	"then",
	"now",
	"look",
	"only",
	"come",
	"its",
	"over",
	"think",
	"also",
	"back",
	"after",
	"use",
	"two",
	"how",
	"our",
	"work",
	"first",
	"well",
	"way",
	"even",
	"new",
	"want",
	"because",
	"any",
	"these",
	"give",
	"day",
	"most",
	"us",
]

// Generate a list of random English words
const generateWordList = (count) => {
	const result = []
	for (let i = 0; i < count; i++) {
		const randomIndex = Math.floor(Math.random() * commonWords.length)
		result.push(commonWords[randomIndex])
	}
	return result
}

const TypingTest = ({ onTestComplete }) => {
	const [testType, setTestType] = useState("time") // 'time' or 'words'
	const [testDuration, setTestDuration] = useState(30) // seconds
	const [wordCount, setWordCount] = useState(25) // number of words
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

	const inputRef = useRef(null)
	const { currentUser } = useAuth()

	// Initialize test
	useEffect(() => {
		resetTest()
	}, [testType, testDuration, wordCount])

	// Timer and progress logic
	useEffect(() => {
		let interval
		if (testActive && testType === "time" && timeLeft > 0) {
			interval = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						clearInterval(interval)
						endTest()
						return 0
					}
					return prev - 1
				})
			}, 1000)
		}
		return () => clearInterval(interval)
	}, [testActive, timeLeft, testType, testDuration])

	const resetTest = () => {
		// Generate more words than needed to ensure we don't run out
		const generatedWords = generateWordList(
			testType === "words" ? wordCount * 2 : 100
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

		// Start the test on first input
		if (!testActive && !testComplete) {
			startTest()
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

	const calculateWPM = () => {
		if (!startTime) return 0

		const timeInMinutes = (Date.now() - startTime) / 1000 / 60
		// Use the number of completed words (currentWordIndex)
		const wordsTyped = currentWordIndex

		return Math.round(wordsTyped / timeInMinutes)
	}

	const calculateAccuracy = () => {
		if (typedCharacters.length === 0) return 100

		const correctChars = typedCharacters.filter((char) => char.correct).length
		return Math.round((correctChars / typedCharacters.length) * 100)
	}

	const calculateRawWPM = () => {
		if (!startTime) return 0

		const timeInMinutes = (Date.now() - startTime) / 1000 / 60
		const charsTyped = typedCharacters.length / 5 // Standard: 5 chars = 1 word

		return Math.round(charsTyped / timeInMinutes)
	}

	const renderWords = () => {
		return words
			.slice(currentWordIndex, currentWordIndex + 15)
			.map((word, wordIndex) => {
				const isCurrentWord = wordIndex === 0

				if (!isCurrentWord) {
					return <Word key={wordIndex}>{word}</Word>
				}

				// Render current word with character highlighting
				return (
					<Word key={wordIndex}>
						{word.split("").map((char, charIndex) => {
							let status = "inactive"

							if (charIndex < currentInput.length) {
								status =
									currentInput[charIndex] === char ? "correct" : "incorrect"
							} else if (charIndex === currentInput.length) {
								status = "current"
							}

							return (
								<Character key={charIndex} status={status}>
									{char}
								</Character>
							)
						})}
					</Word>
				)
			})
	}

	const handleTimeOptionClick = (seconds) => {
		setTestType("time")
		setTestDuration(seconds)
	}

	const handleWordOptionClick = (count) => {
		setTestType("words")
		setWordCount(count)
	}

	return (
		<TypingTestContainer>
			<TestHeader>
				<TestOptions>
					<div>
						<span>Time: </span>
						<OptionButton
							$active={testType === "time" && testDuration === 10}
							onClick={() => handleTimeOptionClick(10)}>
							10s
						</OptionButton>
						<OptionButton
							$active={testType === "time" && testDuration === 30}
							onClick={() => handleTimeOptionClick(30)}>
							30s
						</OptionButton>
						<OptionButton
							$active={testType === "time" && testDuration === 60}
							onClick={() => handleTimeOptionClick(60)}>
							60s
						</OptionButton>
					</div>
					<div>
						<span>Words: </span>
						<OptionButton
							$active={testType === "words" && wordCount === 10}
							onClick={() => handleWordOptionClick(10)}>
							10
						</OptionButton>
						<OptionButton
							$active={testType === "words" && wordCount === 25}
							onClick={() => handleWordOptionClick(25)}>
							25
						</OptionButton>
						<OptionButton
							$active={testType === "words" && wordCount === 50}
							onClick={() => handleWordOptionClick(50)}>
							50
						</OptionButton>
						<OptionButton
							$active={testType === "words" && wordCount === 100}
							onClick={() => handleWordOptionClick(100)}>
							100
						</OptionButton>
					</div>
				</TestOptions>
				<Timer>
					{testType === "time"
						? `${timeLeft || testDuration}s`
						: `${currentWordIndex}/${wordCount} words`}
				</Timer>
			</TestHeader>

			<TextDisplay onClick={() => inputRef.current.focus()}>
				{renderWords()}
			</TextDisplay>

			<InputField
				ref={inputRef}
				type="text"
				value={currentInput}
				onChange={handleInputChange}
				placeholder={
					testActive ? "Type here..." : "Click or press any key to start..."
				}
				disabled={testComplete}
			/>

			{testComplete && (
				<RestartButton onClick={resetTest}>Start New Test</RestartButton>
			)}
		</TypingTestContainer>
	)
}

export default TypingTest
