import React, { useState } from "react"
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

const InfoButton = styled.button`
	position: fixed;
	bottom: 20px;
	right: 20px;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	background: ${(props) => `${props.theme.surface}CC`};
	border: 1px solid ${(props) => `${props.theme.border}40`};
	color: ${(props) => props.theme.primary};
	font-size: 18px;
	font-weight: bold;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(12px);
	box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	transition: all 0.2s ease;

	&:hover {
		transform: scale(1.1);
		background: ${(props) => props.theme.primary};
		color: ${(props) => props.theme.surface};
	}
`

const Modal = styled.div`
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%) scale(0.95);
	opacity: 0;
	background: ${(props) => `${props.theme.surface}F0`};
	padding: 32px;
	border-radius: 20px;
	box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
	border: 1px solid ${(props) => `${props.theme.border}40`};
	backdrop-filter: blur(16px);
	z-index: 1000;
	max-width: 560px;
	width: 90%;
	animation: modalEnter 0.3s ease-out forwards;

	@keyframes modalEnter {
		to {
			transform: translate(-50%, -50%) scale(1);
			opacity: 1;
		}
	}
`

const ModalOverlay = styled.div`
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(4px);
	z-index: 999;
	opacity: 0;
	animation: overlayFade 0.2s ease-out forwards;

	@keyframes overlayFade {
		to {
			opacity: 1;
		}
	}
`

const ModalTitle = styled.h2`
	color: ${(props) => props.theme.primary};
	margin-bottom: 24px;
	font-size: 1.75rem;
	font-weight: 700;
	letter-spacing: -0.02em;
	line-height: 1.2;
`

const ModalContent = styled.div`
	color: ${(props) => props.theme.text};
	font-size: 1rem;
	line-height: 1.7;

	p {
		margin-bottom: 20px;
		opacity: 0.9;
	}

	h3 {
		color: ${(props) => props.theme.primary};
		margin: 28px 0 12px;
		font-size: 1.2rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	li {
		position: relative;
		padding-left: 24px;
		margin-bottom: 12px;

		&:before {
			content: "•";
			position: absolute;
			left: 8px;
			color: ${(props) => props.theme.primary};
		}
	}
`

const CloseButton = styled.button`
	position: absolute;
	top: 20px;
	right: 20px;
	background: ${(props) => `${props.theme.surface}80`};
	border: 1px solid ${(props) => `${props.theme.border}40`};
	color: ${(props) => props.theme.text};
	font-size: 22px;
	width: 36px;
	height: 36px;
	border-radius: 50%;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;

	&:hover {
		background: ${(props) => props.theme.primary};
		color: ${(props) => props.theme.surface};
		transform: rotate(90deg);
	}
`

const Footer = () => {
	const [showModal, setShowModal] = useState(false)

	return (
		<>
			<FooterWrapper>
				<FooterContent>
					<KeyCommand>
						<KeyCombo>
							<KeyCap>Shift</KeyCap>
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

			<InfoButton onClick={() => setShowModal(true)}>i</InfoButton>

			{showModal && (
				<>
					<ModalOverlay onClick={() => setShowModal(false)} />
					<Modal>
						<CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
						<ModalTitle>About Typing Speed Test</ModalTitle>
						<ModalContent>
							<p>
								Welcome to my Typing Speed Test application! This tool helps you
								measure and improve your typing speed and accuracy in a clean,
								distraction-free environment.
							</p>

							<h3>Features</h3>
							<ul>
								<li>Real-time WPM (Words Per Minute) calculation</li>
								<li>Accuracy tracking with detailed statistics</li>
								<li>Multiple beautiful theme options</li>
								<li>Customizable text content for varied practice</li>
							</ul>

							<h3>Keyboard Shortcuts</h3>
							<ul>
								<li>
									Press <strong>Shift + Enter</strong> to restart the test
								</li>
								<li>
									Double-tap <strong>Tab</strong> to open the theme menu
								</li>
							</ul>
							<h3>
								brought to you by{" "}
								<a
									href="https://prashportfolio.vercel.app/"
									target="_blank"
									style={{ color: "inherit", textDecoration: "underline" }}
									rel="noreferrer">
									Prashant Verma
								</a>
							</h3>
						</ModalContent>
					</Modal>
				</>
			)}
		</>
	)
}

export default Footer
