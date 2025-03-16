import React, { useState, useEffect } from "react"
import styled from "styled-components"
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"
import {
	collection,
	query,
	where,
	getDocs,
	orderBy,
	limit,
} from "firebase/firestore"
import { db } from "../firebase"
import { useAuth } from "../contexts/AuthContext"

ChartJS.register(
	CategoryScale,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend
)

const ResultsContainer = styled.div`
	width: 100%;
	background-color: ${(props) => props.theme.surface};
	border-radius: 8px;
	padding: 20px;
	margin-top: 20px;
	color: ${(props) => props.theme.text};
	overflow-y: hidden;
	display: flex;
	flex-direction: column;
`

const HeaderContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
`

const ResultsHeader = styled.h2`
	color: ${(props) => props.theme.primary};
	text-align: center;
	margin: 0;
`

const ResultsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 20px;
	margin-bottom: 30px;
`

const ResultCard = styled.div`
	background-color: ${(props) => props.theme.surface};
	border-radius: 8px;
	padding: 15px;
	text-align: center;
	border: 1px solid ${(props) => props.theme.border};
`

const ResultLabel = styled.div`
	font-size: 14px;
	color: ${(props) => props.theme.text};
	margin-bottom: 5px;
	opacity: 0.7;
`

const ResultValue = styled.div`
	font-size: 28px;
	font-weight: bold;
	color: ${(props) => props.theme.primary};
`

const ChartContainer = styled.div`
	margin-top: 10px;
	height: 300px;
`

const RestartButton = styled.button`
	background-color: ${(props) => props.theme.primary};
	color: ${(props) => props.theme.text};
	border: 1px solid ${(props) => props.theme.primary};
	border-radius: 12px;
	padding: 12px 24px;
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

const TestResults = ({
	wpm,
	rawWpm,
	accuracy,
	charactersTyped,
	errorCount,
	errorMap,
	testDuration,
	onRestart,
}) => {
	const [testHistory, setTestHistory] = useState([])
	const { currentUser } = useAuth()

	useEffect(() => {
		const fetchTestHistory = async () => {
			if (!currentUser) return

			try {
				const testsRef = collection(db, "tests")
				const q = query(
					testsRef,
					where("userId", "==", currentUser.uid),
					orderBy("timestamp", "desc"),
					limit(10)
				)

				const querySnapshot = await getDocs(q)
				const tests = querySnapshot.docs.map((doc) => ({
					...doc.data(),
					timestamp: doc.data().timestamp?.toDate().getTime(),
				}))

				setTestHistory(tests.reverse())
			} catch (error) {
				console.error("Error fetching test history:", error)
			}
		}

		fetchTestHistory()
	}, [currentUser])

	// Calculate characters per minute
	const cpm = charactersTyped / (testDuration / 60)

	// Calculate time per character (in milliseconds)
	const timePerChar = (testDuration * 1000) / charactersTyped

	return (
		<ResultsContainer>
			<HeaderContainer>
				<ResultsHeader>Test Results</ResultsHeader>
				<RestartButton onClick={onRestart}>Restart Test</RestartButton>
			</HeaderContainer>

			<ResultsGrid>
				<ResultCard>
					<ResultLabel>WPM</ResultLabel>
					<ResultValue>{wpm}</ResultValue>
				</ResultCard>

				<ResultCard>
					<ResultLabel>Raw WPM</ResultLabel>
					<ResultValue>{rawWpm}</ResultValue>
				</ResultCard>

				<ResultCard>
					<ResultLabel>Accuracy</ResultLabel>
					<ResultValue>{accuracy}%</ResultValue>
				</ResultCard>

				<ResultCard>
					<ResultLabel>Characters</ResultLabel>
					<ResultValue>{charactersTyped}</ResultValue>
				</ResultCard>

				<ResultCard>
					<ResultLabel>CPM</ResultLabel>
					<ResultValue>{Math.round(cpm)}</ResultValue>
				</ResultCard>

				<ResultCard>
					<ResultLabel>Time/Char</ResultLabel>
					<ResultValue>{timePerChar.toFixed(1)}ms</ResultValue>
				</ResultCard>
			</ResultsGrid>

			{currentUser && testHistory.length > 0 && (
				<ChartContainer>
					<Line
						data={{
							labels: testHistory.map((test, index) => `Test ${index + 1}`),
							datasets: [
								{
									label: "WPM",
									data: testHistory.map((test) => test.wpm),
									borderColor: "#646cff",
									backgroundColor: "rgba(100, 108, 255, 0.2)",
									tension: 0.3,
								},
								{
									label: "Accuracy %",
									data: testHistory.map((test) => test.accuracy),
									borderColor: "#4caf50",
									backgroundColor: "rgba(76, 175, 80, 0.2)",
									tension: 0.3,
								},
							],
						}}
						options={{
							responsive: true,
							maintainAspectRatio: false,
							plugins: {
								legend: {
									position: "top",
									labels: { color: "#fff" },
								},
								title: {
									display: true,
									text: "Performance History",
									color: "#fff",
									font: { size: 16 },
								},
							},
							scales: {
								y: {
									beginAtZero: true,
									ticks: { color: "#888" },
									grid: { color: "#333" },
								},
								x: {
									ticks: { color: "#888" },
									grid: { color: "#333" },
								},
							},
						}}
					/>
				</ChartContainer>
			)}
		</ResultsContainer>
	)
}

export default TestResults
// Remove Bar chart imports and config
ChartJS.register(
	CategoryScale,
	LinearScale,
	LineElement,
	PointElement,
	Title,
	Tooltip,
	Legend
)

// Remove errorChartData and chartOptions constants
