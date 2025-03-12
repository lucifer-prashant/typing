import { db } from "../firebase"
import { generate } from "random-words"
import {
	doc,
	setDoc,
	getDoc,
	collection,
	query,
	where,
	getDocs,
} from "firebase/firestore"

// Generate a default username from email
export const generateDefaultUsername = (email) => {
	return email.split("@")[0]
}

// Check if a username is already taken
export const isUsernameTaken = async (username) => {
	const usersRef = collection(db, "users")
	const q = query(usersRef, where("username", "==", username))
	const querySnapshot = await getDocs(q)
	return !querySnapshot.empty
}

// Generate a unique username by appending a number if necessary
export const generateUniqueUsername = async (baseUsername) => {
	let username = baseUsername
	let counter = 1

	while (await isUsernameTaken(username)) {
		username = `${baseUsername}${counter}`
		counter++
	}

	return username
}

// Update or create user profile with username
export const updateUserProfile = async (userId, username) => {
	try {
		// Check if username is taken by another user
		const usersRef = collection(db, "users")
		const q = query(usersRef, where("username", "==", username))
		const querySnapshot = await getDocs(q)

		if (!querySnapshot.empty) {
			const doc = querySnapshot.docs[0]
			if (doc.id !== userId) {
				throw new Error("Username is already taken")
			}
		}

		// Update or create user profile
		const userRef = doc(db, "users", userId)
		await setDoc(userRef, { username }, { merge: true })
		return username
	} catch (error) {
		console.error("Error updating user profile:", error)
		throw error
	}
}

// Get user profile
export const getUserProfile = async (userId) => {
	try {
		const userRef = doc(db, "users", userId)
		const userDoc = await getDoc(userRef)
		return userDoc.exists() ? userDoc.data() : null
	} catch (error) {
		console.error("Error getting user profile:", error)
		return null
	}
}

export function generateWords(count) {
	return generate(count)
}

export function generatePracticeWords(count, errorChars) {
	// If no error characters provided, return regular words
	if (!errorChars || errorChars.length === 0) {
		return generate(count)
	}

	const words = []
	const alphabet = "abcdefghijklmnopqrstuvwxyz"
	const minLength = 4
	const maxLength = 9

	for (let i = 0; i < count; i++) {
		let wordLength =
			Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength
		let word = ""
		let consecutiveErrors = 0

		for (let j = 0; j < wordLength; j++) {
			// Alternate between error chars and random letters with variable probability
			const useError = Math.random() < 0.7 - consecutiveErrors * 0.3

			if (useError && errorChars.length > 0) {
				const randomIndex = Math.floor(Math.random() * errorChars.length)
				word += errorChars[randomIndex]
				consecutiveErrors++
			} else {
				// Add random letter with occasional duplication
				const randomChar = alphabet[Math.floor(Math.random() * alphabet.length)]
				word += Math.random() < 0.3 ? randomChar.repeat(2) : randomChar
				consecutiveErrors = 0
			}

			// Randomly insert 1-2 extra characters between error sequences
			if (consecutiveErrors > 1 && Math.random() < 0.4) {
				word += alphabet[Math.floor(Math.random() * alphabet.length)]
				wordLength++
				consecutiveErrors = 0
			}
		}

		// Occasionally add suffix/prefix with random chars
		if (Math.random() < 0.3) {
			word = alphabet[Math.floor(Math.random() * alphabet.length)] + word
		}
		if (Math.random() < 0.3) {
			word += alphabet[Math.floor(Math.random() * alphabet.length)]
		}

		words.push(word)
	}

	return words
}
