import React, { useState } from "react"
import styled from "styled-components"
import { useAuth } from "../contexts/AuthContext"

const LoginContainer = styled.div`
	width: 100%;
	max-width: 400px;
	background-color: #1a1a1a;
	border-radius: 12px;
	padding: 30px;
	margin: 0 auto;
	color: white;
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	transition: transform 0.3s ease;

	&:hover {
		transform: translateY(-2px);
	}
`

const LoginHeader = styled.h2`
	color: #646cff;
	margin-bottom: 20px;
	text-align: center;
`

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 15px;
`

const Input = styled.input`
	padding: 15px;
	background-color: #242424;
	border: 2px solid #333;
	border-radius: 8px;
	color: white;
	font-size: 16px;
	width: 100%;
	transition: all 0.3s ease;

	&:focus {
		border-color: #646cff;
		outline: none;
		box-shadow: 0 0 0 2px rgba(100, 108, 255, 0.2);
	}

	&::placeholder {
		color: #666;
	}
`

const Button = styled.button`
	background-color: ${(props) => props.theme.primary};
	color: ${(props) => props.theme.text};
	border: none;
	border-radius: 8px;
	padding: 15px;
	cursor: pointer;
	font-size: 16px;
	font-weight: 600;
	transition: all 0.3s ease;
	width: 100%;
	position: relative;
	overflow: hidden;

	&:hover {
		background-color: ${(props) => {
			const r = parseInt(props.theme.primary.slice(1, 3), 16)
			const g = parseInt(props.theme.primary.slice(3, 5), 16)
			const b = parseInt(props.theme.primary.slice(5, 7), 16)
			return `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`
		}};
		transform: translateY(-1px);
		box-shadow: 0 4px 12px ${(props) => props.theme.primary}40;
	}

	&:active {
		transform: translateY(0);
	}

	&:disabled {
		background-color: ${(props) => props.theme.surface};
		cursor: not-allowed;
		transform: none;
		box-shadow: none;
		opacity: 0.6;
	}
`

const GoogleButton = styled(Button)`
	background-color: ${(props) => props.theme.error};
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 10px;

	&:hover {
		background-color: ${(props) => {
			const r = parseInt(props.theme.error.slice(1, 3), 16)
			const g = parseInt(props.theme.error.slice(3, 5), 16)
			const b = parseInt(props.theme.error.slice(5, 7), 16)
			return `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`
		}};
	}
`

const ErrorMessage = styled.div`
	color: #f44336;
	margin-top: 10px;
	text-align: center;
	font-size: 14px;
`

const ToggleText = styled.p`
	text-align: center;
	margin-top: 15px;
	color: #888;

	span {
		color: #646cff;
		cursor: pointer;

		&:hover {
			text-decoration: underline;
		}
	}
`

const Login = () => {
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [isLogin, setIsLogin] = useState(true)
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)

	const { login, signup, loginWithGoogle } = useAuth()

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError("")

		if (!email || !password) {
			return setError("Please fill in all fields")
		}

		try {
			setLoading(true)
			if (isLogin) {
				await login(email, password)
			} else {
				await signup(email, password)
			}
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleLogin = async () => {
		try {
			setLoading(true)
			setError("")
			await loginWithGoogle()
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<LoginContainer>
			<LoginHeader>{isLogin ? "Login" : "Sign Up"}</LoginHeader>

			{error && <ErrorMessage>{error}</ErrorMessage>}

			<Form onSubmit={handleSubmit}>
				<Input
					type="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
				/>
				<Input
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>

				<Button type="submit" disabled={loading}>
					{isLogin ? "Login" : "Sign Up"}
				</Button>
			</Form>

			<ToggleText>
				{isLogin ? "Don't have an account? " : "Already have an account? "}
				<span onClick={() => setIsLogin(!isLogin)}>
					{isLogin ? "Sign Up" : "Login"}
				</span>
			</ToggleText>

			<div style={{ margin: "20px 0", textAlign: "center" }}>or</div>

			<GoogleButton
				type="button"
				onClick={handleGoogleLogin}
				disabled={loading}>
				<svg
					width="18"
					height="18"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 48 48">
					<path
						fill="#FFF"
						d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
					/>
					<path
						fill="#FFF"
						d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
					/>
					<path
						fill="#FFF"
						d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
					/>
					<path
						fill="#FFF"
						d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
					/>
				</svg>
				Continue with Google
			</GoogleButton>
		</LoginContainer>
	)
}

export default Login
