import { db } from "../firebase"
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"

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