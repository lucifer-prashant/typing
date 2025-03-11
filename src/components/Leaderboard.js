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
	padding: 20px;
	background: rgba(26, 26, 26, 0.8);
	border-radius: 15px;
	box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
	backdrop-filter: blur(4px);
	border: 1px solid rgba(255, 255, 255, 0.18);
`

const LeaderboardHeader = styled.div`
	text-align: center;
	margin-bottom: 30px;
`

const Title = styled.h2`
	color: #646cff;
	font-size: 2.5rem;
	margin-bottom: 10px;
`

const Subtitle = styled.p`
	color: #888;
	font-size: 1.1rem;
`

const LeaderboardTable = styled.div`
	width: 100%;
`

const LeaderboardRow = styled.div`
	display: grid;
	grid-template-columns: 80px 1fr 120px 120px;
	padding: 15px;
	margin-bottom: 10px;
	background: ${(props) =>
		props.$rank <= 3 ? "rgba(100, 108, 255, 0.1)" : "rgba(26, 26, 26, 0.5)"};
	border-radius: 10px;
	transition: transform 0.2s ease;

	&:hover {
		transform: translateX(5px);
	}
`

const RankCell = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.2rem;
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
`

const UserAvatar = styled.div`
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background-color: #646cff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	font-weight: bold;
	color: white;
`

const StatCell = styled.div`
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.1rem;
	color: #fff;
`

const HeaderRow = styled(LeaderboardRow)`
	background: rgba(26, 26, 26, 0.9);
	font-weight: bold;
	color: #646cff;
	margin-bottom: 20px;

	&:hover {
		transform: none;
	}
`

function Leaderboard() {
	const [leaderboardData, setLeaderboardData] = useState([])
	const [loading, setLoading] = useState(true)

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

				// Limit to top 50
				setLeaderboardData(data.slice(0, 50))
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

	if (loading) {
		return <LeaderboardContainer>Loading...</LeaderboardContainer>
	}

	return (
		<LeaderboardContainer>
			<LeaderboardHeader>
				<Title>Global Leaderboard</Title>
				<Subtitle>Top 50 Speed Typers Worldwide</Subtitle>
			</LeaderboardHeader>

			<LeaderboardTable>
				<HeaderRow>
					<RankCell>Rank</RankCell>
					<UserCell>User</UserCell>
					<StatCell>WPM</StatCell>
					<StatCell>Accuracy</StatCell>
				</HeaderRow>

				{leaderboardData.map((user, index) => (
					<LeaderboardRow key={user.id} $rank={index + 1}>
						<RankCell $rank={index + 1}>{getRankIcon(index + 1)}</RankCell>
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
		</LeaderboardContainer>
	)
}

export default Leaderboard
