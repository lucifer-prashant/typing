import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { FaLock } from "react-icons/fa"

const IndicatorModal = styled.div`
	position: fixed;
	top: 20px;
	left: 50%;
	transform: translateX(-50%);
	background: ${(props) => props.theme.surface}CC;
	padding: 16px 32px;
	border-radius: 12px;
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
	backdrop-filter: blur(8px);
	border: 1px solid ${(props) => props.theme.border}40;
	z-index: 1000;
	display: flex;
	align-items: center;
	gap: 12px;
	animation: slideDown 0.3s ease;

	@keyframes slideDown {
		from {
			transform: translateX(-50%) translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateX(-50%) translateY(0);
			opacity: 1;
		}
	}
`

const IndicatorText = styled.span`
	color: ${(props) => props.theme.text};
	font-size: 18px;
	font-weight: 600;
`

const LockIcon = styled(FaLock)`
	color: ${(props) => props.theme.text};
	font-size: 20px;
`

const CapsLockIndicator = () => {
	const [capsLockOn, setCapsLockOn] = useState(false)

	useEffect(() => {
		const handleKeyEvent = (event) => {
			setCapsLockOn(event.getModifierState("CapsLock"))
		}

		// Add listeners for both keydown and keyup to ensure we catch all state changes
		window.addEventListener("keydown", handleKeyEvent)
		window.addEventListener("keyup", handleKeyEvent)

		// Check initial caps lock state
		if (typeof window !== "undefined") {
			const initialEvent = new KeyboardEvent("keydown")
			setCapsLockOn(initialEvent.getModifierState("CapsLock"))
		}

		return () => {
			window.removeEventListener("keydown", handleKeyEvent)
			window.removeEventListener("keyup", handleKeyEvent)
		}
	}, [])

	if (!capsLockOn) return null

	return (
		<IndicatorModal>
			<LockIcon />
			<IndicatorText>Caps Lock is ON</IndicatorText>
		</IndicatorModal>
	)
}

export default CapsLockIndicator
