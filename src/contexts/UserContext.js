import React, { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { getUserProfile } from "../utils/userUtils"

const UserContext = createContext()

export function useUser() {
	return useContext(UserContext)
}

export function UserProvider({ children }) {
	const { currentUser } = useAuth()
	const [userProfile, setUserProfile] = useState(null)

	useEffect(() => {
		const loadUserProfile = async () => {
			if (currentUser) {
				const profile = await getUserProfile(currentUser.uid)
				setUserProfile(profile)
			} else {
				setUserProfile(null)
			}
		}
		loadUserProfile()
	}, [currentUser])

	const updateProfile = (newProfile) => {
		if (newProfile) {
			setUserProfile((prev) => ({
				...prev,
				...newProfile,
			}))
		}
	}

	const value = {
		userProfile,
		updateProfile,
	}

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}
