import React from "react"
import styled, { keyframes } from "styled-components"

// Keyframe Animation for subtle floating effect
const floatAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
`

const FooterWrapper = styled.footer`
	position: fixed;
	bottom: 20px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	justify-content: center;
	z-index: 200;
	pointer-events: none;
`

const FooterContent = styled.div`
	display: flex;
	gap: 24px;
	padding: 12px 24px;
	border-radius: 12px;
	background: ${(props) => `${props.theme.surface}CC`};
	backdrop-filter: blur(12px);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	border: 1px solid ${(props) => `${props.theme.border}40`};
	opacity: 0.9;
	transform: translateY(10px);
	transition: all 0.3s ease-in-out;
	pointer-events: auto;
	animation: ${floatAnimation} 6s ease-in-out infinite;
`

const KeyCommand = styled.div`
	display: flex;
	align-items: center;
	font-size: 0.95rem;
	color: ${(props) => props.theme.text}DD;
	font-weight: 500;
	letter-spacing: 0.02em;
`

const KeyCombo = styled.span`
	display: inline-flex;
	margin-right: 8px;
	font-family: "JetBrains Mono", monospace;
`

const KeyCap = styled.span`
	padding: 4px 8px;
	margin: 0 2px;
	border-radius: 6px;
	font-size: 0.8rem;
	background: ${(props) => `${props.theme.primary}20`};
	color: ${(props) => props.theme.primary};
	border: 1px solid ${(props) => `${props.theme.primary}40`};
	font-weight: 600;
	text-transform: uppercase;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.2s ease;
`

const PlusSign = styled.span`
	margin: 0 4px;
	opacity: 0.7;
	font-size: 0.9rem;
`

const Footer = () => (
	<FooterWrapper>
		<FooterContent>
			<KeyCommand>
				<KeyCombo>
					<KeyCap>Tab</KeyCap>
					<PlusSign>+</PlusSign>
					<KeyCap>Enter</KeyCap>
				</KeyCombo>
				Restart
			</KeyCommand>

			<KeyCommand>
				<KeyCombo>
					<KeyCap>Tab</KeyCap>
					<PlusSign>+</PlusSign>
					<KeyCap>Tab</KeyCap>
				</KeyCombo>
				Theme Menu
			</KeyCommand>
		</FooterContent>
	</FooterWrapper>
)

export default Footer
