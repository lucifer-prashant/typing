import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { useAuth } from "../contexts/AuthContext"
import { db } from "../firebase"
import {
	collection,
	query,
	where,
	getDocs,
	orderBy,
	limit,
} from "firebase/firestore"
import { Line, Bar } from "react-chartjs-2"
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js"
import Analytics from "./Analytics"

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	BarElement,
	Title,
	Tooltip,
	Legend
)

const ProfileContainer = styled.div`
	width: 100%;
	max-width: 900px;
	margin: 0 auto;
	padding: 20px;
	color: white;
	overflow-y: auto;
	max-height: calc(100vh - 40px);
`

const ProfileHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30px;
`

const UserInfo = styled.div`
	display: flex;
	align-items: center;
	gap: 15px;
`

const UserAvatar = styled.div`
	width: 60px;
	height: 60px;
	border-radius: 50%;
	background-color: #646cff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24px;
	font-weight: bold;
	color: white;
`

const UserName = styled.h2`
	margin: 0;
	color: #646cff;
`

const UserEmail = styled.p`
	margin: 5px 0 0;
	color: #888;
	font-size: 14px;
`

const LogoutButton = styled.button`
	background-color: ${(props) => props.theme.surface};
	color: ${(props) => props.theme.text};
	border: 1px solid ${(props) => props.theme.border}40;
	border-radius: 4px;
	padding: 8px 16px;
	cursor: pointer;
	font-size: 14px;
	transition: all 0.2s ease;

	&:hover {
		background-color: ${(props) => props.theme.primary};
		border-color: ${(props) => props.theme.primary};
		transform: translateY(-1px);
	}

	&:active {
		transform: translateY(0);
	}
`

const StatsGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 20px;
	margin-bottom: 30px;
`

const StatCard = styled.div`
	background-color: #1a1a1a;
	border-radius: 8px;
	padding: 15px;
	text-align: center;
`

const StatLabel = styled.div`
	font-size: 14px;
	color: #888;
	margin-bottom: 5px;
`

const StatValue = styled.div`
	font-size: 28px;
	font-weight: bold;
	color: #646cff;
`

const ChartContainer = styled.div`
	background-color: #1a1a1a;
	border-radius: 8px;
	padding: 20px;
	margin-bottom: 30px;
`

const ChartTitle = styled.h3`
	color: white;
	margin-top: 0;
	margin-bottom: 20px;
	font-size: 18px;
`

const ErrorsContainer = styled.div`
	background-color: #1a1a1a;
	border-radius: 8px;
	padding: 20px;
	margin-bottom: 30px;
`

const ErrorsTitle = styled.h3`
	color: white;
	margin-top: 0;
	margin-bottom: 20px;
	font-size: 18px;
`

const ErrorsList = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
	gap: 15px;
`

const ErrorItem = styled.div`
	background-color: #242424;
	border-radius: 4px;
	padding: 10px;
	display: flex;
	flex-direction: column;
	align-items: center;
`

const ErrorChar = styled.div`
	font-size: 24px;
	font-weight: bold;
	color: #f44336;
	margin-bottom: 5px;
`

const ErrorCount = styled.div`
	font-size: 14px;
	color: #888;
`

const NoDataMessage = styled.div`
	text-align: center;
	color: #888;
	padding: 30px;
	font-size: 16px;
`

const UserProfile = () => {
	const { currentUser, logout } = useAuth()
	const [testHistory, setTestHistory] = useState([])
	const [loading, setLoading] = useState(true)
	const [stats, setStats] = useState({
		averageWpm: 0,
		highestWpm: 0,
		averageAccuracy: 0,
		totalTests: 0,
		totalCharsTyped: 0,
	})
	const [errorMap, setErrorMap] = useState({})

	useEffect(() => {
		const fetchUserData = async () => {
			if (!currentUser) return

			try {
				// Get user's test history
				const testsRef = collection(db, "tests")
				const q = query(
					testsRef,
					where("userId", "==", currentUser.uid),
					orderBy("timestamp", "desc"),
					limit(20)
				)

				const querySnapshot = await getDocs(q)
				const tests = []
				let totalWpm = 0
				let highestWpm = 0
				let totalAccuracy = 0
				let totalCharsTyped = 0
				let combinedErrorMap = {}

				querySnapshot.forEach((doc) => {
					const testData = doc.data()
					tests.push({
						id: doc.id,
						...testData,
						timestamp: testData.timestamp?.toDate() || new Date(),
					})

					// Accumulate stats
					totalWpm += testData.wpm || 0
					highestWpm = Math.max(highestWpm, testData.wpm || 0)
					totalAccuracy += testData.accuracy || 0
					totalCharsTyped += testData.charactersTyped || 0

					// Combine error maps
					if (testData.errorMap) {
						Object.entries(testData.errorMap).forEach(([char, count]) => {
							combinedErrorMap[char] = (combinedErrorMap[char] || 0) + count
						})
					}
				})

				setTestHistory(tests)
				setErrorMap(combinedErrorMap)

				// Calculate average stats
				const testsCount = tests.length
				if (testsCount > 0) {
					setStats({
						averageWpm: Math.round(totalWpm / testsCount),
						highestWpm,
						averageAccuracy: Math.round(totalAccuracy / testsCount),
						totalTests: testsCount,
						totalCharsTyped,
					})
				}
			} catch (error) {
				console.error("Error fetching user data:", error)
			} finally {
				setLoading(false)
			}
		}

		fetchUserData()
	}, [currentUser])

	const handleLogout = async () => {
		try {
			await logout()
		} catch (error) {
			console.error("Failed to log out", error)
		}
	}

	// Prepare WPM progress chart data
	const wpmChartData = {
		labels: testHistory
			.map((test, index) => {
				const date = new Date(test.timestamp)
				return `${date.getMonth() + 1}/${date.getDate()}`
			})
			.reverse(),
		datasets: [
			{
				label: "WPM",
				data: testHistory.map((test) => test.wpm).reverse(),
				borderColor: "#646cff",
				backgroundColor: "rgba(100, 108, 255, 0.2)",
				tension: 0.3,
			},
		],
	}

	// Prepare accuracy progress chart data
	const accuracyChartData = {
		labels: testHistory
			.map((test, index) => {
				const date = new Date(test.timestamp)
				return `${date.getMonth() + 1}/${date.getDate()}`
			})
			.reverse(),
		datasets: [
			{
				label: "Accuracy %",
				data: testHistory.map((test) => test.accuracy).reverse(),
				borderColor: "#4caf50",
				backgroundColor: "rgba(76, 175, 80, 0.2)",
				tension: 0.3,
			},
		],
	}

	// Prepare error chart data
	const sortedErrors = Object.entries(errorMap)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)

	const errorChartData = {
		labels: sortedErrors.map(([char]) => char),
		datasets: [
			{
				label: "Error Count",
				data: sortedErrors.map(([_, count]) => count),
				backgroundColor: "rgba(244, 67, 54, 0.7)",
				borderColor: "rgba(244, 67, 54, 1)",
				borderWidth: 1,
			},
		],
	}

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: "top",
				labels: {
					color: "#fff",
				},
			},
			tooltip: {
				mode: "index",
				intersect: false,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					color: "#888",
				},
				grid: {
					color: "#333",
				},
			},
			x: {
				ticks: {
					color: "#888",
				},
				grid: {
					color: "#333",
				},
			},
		},
	}

	if (loading) {
		return <ProfileContainer>Loading profile data...</ProfileContainer>
	}

	if (!currentUser) {
		return (
			<ProfileContainer>Please log in to view your profile.</ProfileContainer>
		)
	}

	// Get first letter of email for avatar
	const avatarLetter = currentUser.email
		? currentUser.email[0].toUpperCase()
		: "?"

	return (
		<ProfileContainer>
			<ProfileHeader>
				<UserInfo>
					<UserAvatar>{avatarLetter}</UserAvatar>
					<div>
						<UserName>{currentUser.displayName || "User"}</UserName>
						<UserEmail>{currentUser.email}</UserEmail>
					</div>
				</UserInfo>
				<LogoutButton onClick={handleLogout}>Logout</LogoutButton>
			</ProfileHeader>

			{testHistory.length === 0 ? (
				<NoDataMessage>
					You haven't completed any typing tests yet. Take some tests to see
					your statistics and progress!
				</NoDataMessage>
			) : (
				<>
					<StatsGrid>
						<StatCard>
							<StatLabel>Average WPM</StatLabel>
							<StatValue>{stats.averageWpm}</StatValue>
						</StatCard>
						<StatCard>
							<StatLabel>Highest WPM</StatLabel>
							<StatValue>{stats.highestWpm}</StatValue>
						</StatCard>
						<StatCard>
							<StatLabel>Average Accuracy</StatLabel>
							<StatValue>{stats.averageAccuracy}%</StatValue>
						</StatCard>
						<StatCard>
							<StatLabel>Tests Completed</StatLabel>
							<StatValue>{stats.totalTests}</StatValue>
						</StatCard>
						<StatCard>
							<StatLabel>Characters Typed</StatLabel>
							<StatValue>{stats.totalCharsTyped.toLocaleString()}</StatValue>
						</StatCard>
					</StatsGrid>

					{/* Add the new Analytics component here */}
					<Analytics testHistory={testHistory} />

					<ChartContainer style={{ height: "300px" }}>
						<ChartTitle>WPM Progress</ChartTitle>
						<Line data={wpmChartData} options={chartOptions} />
					</ChartContainer>

					<ChartContainer style={{ height: "300px" }}>
						<ChartTitle>Accuracy Progress</ChartTitle>
						<Line data={accuracyChartData} options={chartOptions} />
					</ChartContainer>

					{sortedErrors.length > 0 && (
						<>
							<ChartContainer style={{ height: "300px" }}>
								<ChartTitle>Most Frequent Errors</ChartTitle>
								<Bar data={errorChartData} options={chartOptions} />
							</ChartContainer>

							<ErrorsContainer>
								<ErrorsTitle>Top Error Characters</ErrorsTitle>
								<ErrorsList>
									{sortedErrors.map(([char, count], index) => (
										<ErrorItem key={index}>
											<ErrorChar>"{char}"</ErrorChar>
											<ErrorCount>{count} errors</ErrorCount>
										</ErrorItem>
									))}
								</ErrorsList>
							</ErrorsContainer>
						</>
					)}
				</>
			)}
		</ProfileContainer>
	)
}

export default UserProfile
