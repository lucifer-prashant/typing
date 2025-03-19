import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { db } from "../firebase"
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore"
import { FaTrophy, FaMedal } from "react-icons/fa"
import { getUserProfile } from "../utils/userUtils"

const LeaderboardContainer = styled.div`
	width: 100%;
	max-width: 900px;
	margin: 0 auto;
	padding: 8px;
	background: rgba(26, 26, 26, 0.8);
	border-radius: 15px;
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
	backdrop-filter: blur(4px);
	border: 1px solid rgba(255, 255, 255, 0.18);
	display: flex;
	flex-direction: column;
	height: 90vh;
	min-height: unset;
`

const LeaderboardHeader = styled.div`
	text-align: center;
	margin-bottom: 10px;
`

const Title = styled.h2`
	color: ${(props) => props.theme.primary};
	font-size: 1.8rem;
	margin-bottom: 2px;
	text-shadow: 0 0 10px ${(props) => props.theme.primary}40;
`

const Subtitle = styled.p`
	color: ${(props) => props.theme.text};
	font-size: 0.9rem;
	opacity: 0.8;
`

const LeaderboardTable = styled.div`
	width: 100%;
	flex: 1;
	display: flex;
	flex-direction: column;
`

const LeaderboardRow = styled.div`
	display: grid;
	grid-template-columns: 60px 1fr 100px 100px;
	padding: 6px;
	margin-bottom: 2px;
	background: ${(props) =>
		props.$rank <= 3 ? "rgba(100, 108, 255, 0.1)" : "rgba(26, 26, 26, 0.5)"};
	border-radius: 8px;
	transition: transform 0.2s ease;

	&:hover {
		transform: translateX(5px);
	}
`

const RankCell = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1rem;
	font-weight: bold;
	color: ${(props) => {
		if (props.rank === 1) return "#FFD700"
		if (props.rank === 2) return "#C0C0C0"
		if (props.rank === 3) return "#CD7F32"
		return "#888"
	}};
`

const UserCell = styled.div`
	display: flex;
	align-items: center;
	gap: 10px;
	padding-left: 10px;
	font-size: 0.95rem;
	color: ${(props) => props.theme.text};
`

const UserAvatar = styled.div`
	width: 28px;
	height: 28px;
	border-radius: 50%;
	background-color: #646cff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 12px;
	font-weight: bold;
	color: white;
`

const StatCell = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.95rem;
	color: #fff;
`

const HeaderRow = styled(LeaderboardRow)`
	background: ${(props) => props.theme.surface};
	font-weight: bold;
	color: ${(props) => props.theme.primary};
	margin-bottom: 10px;

	&:hover {
		transform: none;
	}
`

const NavigationContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 15px;
	margin-top: 10px;
	padding: 5px 0;
`

const PageButton = styled.button`
	background: ${(props) =>
		props.disabled ? "rgba(100, 108, 255, 0.3)" : "rgba(100, 108, 255, 0.8)"};
	color: white;
	border: none;
	border-radius: 5px;
	padding: 6px 12px;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	transition: all 0.2s ease;

	&:hover {
		background: ${(props) =>
			props.disabled ? "rgba(100, 108, 255, 0.3)" : "rgba(100, 108, 255, 1)"};
	}
`

const PageInfo = styled.span`
	color: ${(props) => props.theme.text};
	font-size: 1.1rem;
`

function Leaderboard() {
	const [leaderboardData, setLeaderboardData] = useState([])
	const [loading, setLoading] = useState(true)
	const [currentPage, setCurrentPage] = useState(1)
	const usersPerPage = 10

	useEffect(() => {
		const fetchLeaderboardData = async () => {
			try {
				setLoading(true)

				// First, get all test results
				const testResultsRef = collection(db, "tests")
				const q = query(testResultsRef, orderBy("wpm", "desc"))
				const querySnapshot = await getDocs(q)

				// Use a map to track the best score for each user
				const userBestScores = new Map()

				for (const doc of querySnapshot.docs) {
					const data = doc.data()
					const userId = data.userId

					// Skip entries without userId
					if (!userId) continue

					// If we haven't seen this user, or if this score is better than their previous best
					if (
						!userBestScores.has(userId) ||
						data.wpm > userBestScores.get(userId).wpm
					) {
						// Get user profile to get the username
						const userProfile = await getUserProfile(userId)
						userBestScores.set(userId, {
							id: doc.id,
							userId: userId,
							wpm: data.wpm,
							accuracy: data.accuracy,
							username: userProfile?.username || "Anonymous",
						})
					}
				}

				// Convert map to array and sort by WPM
				const data = Array.from(userBestScores.values()).sort(
					(a, b) => b.wpm - a.wpm
				)

				// Set all leaderboard data
				setLeaderboardData(data)
			} catch (error) {
				console.error("Error fetching leaderboard data:", error)
			} finally {
				setLoading(false)
			}
		}

		fetchLeaderboardData()
	}, [])

	const getRankIcon = (rank) => {
		if (rank === 1) return <FaTrophy style={{ color: "#FFD700" }} />
		if (rank === 2) return <FaMedal style={{ color: "#C0C0C0" }} />
		if (rank === 3) return <FaMedal style={{ color: "#CD7F32" }} />
		return rank
	}

	const totalPages = Math.ceil(leaderboardData.length / usersPerPage)
	const startIndex = (currentPage - 1) * usersPerPage
	const endIndex = startIndex + usersPerPage
	const currentUsers = leaderboardData.slice(startIndex, endIndex)

	const handlePageChange = (newPage) => {
		setCurrentPage(newPage)
	}

	if (loading) {
		return <LeaderboardContainer>Loading...</LeaderboardContainer>
	}

	return (
		<LeaderboardContainer>
			<LeaderboardHeader>
				<Title>Global Leaderboard</Title>
				<Subtitle>All Speed Typers Worldwide</Subtitle>
			</LeaderboardHeader>

			<LeaderboardTable>
				<HeaderRow>
					<RankCell>Rank</RankCell>
					<UserCell>&nbsp;&nbsp;&nbsp;&nbsp;User</UserCell>
					<StatCell>WPM</StatCell>
					<StatCell>Accuracy</StatCell>
				</HeaderRow>

				{currentUsers.map((user, index) => (
					<LeaderboardRow key={user.id} $rank={startIndex + index + 1}>
						<RankCell $rank={startIndex + index + 1}>
							{getRankIcon(startIndex + index + 1)}
						</RankCell>
						<UserCell>
							<UserAvatar>
								{user.username?.[0]?.toUpperCase() || "?"}
							</UserAvatar>
							<span>{user.username || "Anonymous"}</span>
						</UserCell>
						<StatCell>{Math.round(user.wpm)} WPM</StatCell>
						<StatCell>{Math.round(user.accuracy)}%</StatCell>
					</LeaderboardRow>
				))}
			</LeaderboardTable>

			<NavigationContainer>
				<PageButton
					onClick={() => handlePageChange(currentPage - 1)}
					disabled={currentPage === 1}>
					← Previous
				</PageButton>
				<PageInfo>
					Page {currentPage} of {totalPages}
				</PageInfo>
				<PageButton
					onClick={() => handlePageChange(currentPage + 1)}
					disabled={currentPage === totalPages}>
					Next →
				</PageButton>
			</NavigationContainer>
		</LeaderboardContainer>
	)
}

export default Leaderboard
