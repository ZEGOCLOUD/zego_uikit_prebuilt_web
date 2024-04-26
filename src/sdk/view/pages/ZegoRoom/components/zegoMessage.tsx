import React, { ChangeEvent, Fragment, RefObject } from "react"
import ZegoMessageCss from "./zegoMessage.module.scss"
import { DateFormat } from "../../../../util"
import { ZegoBroadcastMessageInfo2 } from "../../../../model"
import { ZegoToast } from "../../../components/zegoToast"
// @ts-ignore
function convertDomNodeToReactElement(domNode: Element) {
	if (!(domNode instanceof Element)) {
		// 如果不是Element类型，可能是文本节点，直接返回其文本内容
		// @ts-ignore
		return domNode.nodeValue
	}

	const tag = domNode.tagName.toLowerCase()
	const attrs = Array.from(domNode.attributes).reduce((props, attr) => {
		// @ts-ignore
		props[attr.name] = attr.value
		return props
	}, {})
	// @ts-ignore
	const children = Array.from(domNode.childNodes).map(convertDomNodeToReactElement)

	return React.createElement(tag, attrs, ...children)
}
export class ZegoMessage extends React.Component<{
	messageList: ZegoBroadcastMessageInfo2[]
	sendMessage: (msg: string) => void
	selfUserID: string
	customMsgUI?: (msg: ZegoBroadcastMessageInfo2) => HTMLElement
}> {
	state: {
		message: string
	} = {
		message: "",
	}
	sendTime = 0
	msgListRef: RefObject<HTMLInputElement> = React.createRef()
	componentDidMount() {
		this.scrollToBottom()
	}
	componentDidUpdate(preProps: { messageList: ZegoBroadcastMessageInfo2[] }) {
		if (preProps.messageList.length !== this.props.messageList.length) {
			this.scrollToBottom()
		}
	}
	handleSend() {
		if (!this.state.message.length) return
		const timestamp = new Date().getTime()
		if (this.sendTime > 0 && this.sendTime + 900 > timestamp) {
			ZegoToast({
				content: "Message sent too fast, please send again later",
			})
			return false
		}
		this.props.sendMessage(this.state.message)
		this.setState({
			message: "",
		})
		this.sendTime = timestamp
	}
	scrollToBottom() {
		this.msgListRef.current!.scrollTop = this.msgListRef.current!.scrollHeight
	}
	messageInput(event: ChangeEvent<HTMLInputElement>) {
		this.setState({
			message: event.target.value.substring(0, 300),
		})
	}
	render(): React.ReactNode {
		return (
			<div className={ZegoMessageCss.msgContentWrapper}>
				<div className={ZegoMessageCss.msgList} ref={this.msgListRef}>
					{this.props.messageList.map((msg) => {
						return this.props.customMsgUI ? (
							<Fragment key={msg.messageID}>
								{convertDomNodeToReactElement(this.props.customMsgUI(msg))}
							</Fragment>
						) : (
							<div
								key={msg.messageID}
								className={msg.fromUser.userID === this.props.selfUserID ? ZegoMessageCss.self : ""}>
								<div className={ZegoMessageCss.msgNameWrapper}>
									<span className={ZegoMessageCss.name}>{msg.fromUser.userName}</span>
									<span className={ZegoMessageCss.sendTime}>
										{`${new Date(msg.sendTime).getHours() >= 12 ? "PM" : "AM"}  ${DateFormat(
											msg.sendTime,
											"hh:mm"
										)}`}
									</span>
								</div>
								<p
									className={`${msg.status === "SENDING" && ZegoMessageCss.loading} ${
										msg.status === "FAILED" && ZegoMessageCss.error
									}`}>
									{msg.message}
								</p>
							</div>
						)
					})}
				</div>
				<div className={ZegoMessageCss.sendWrapper}>
					<input
						value={this.state.message}
						onChange={(event) => {
							this.messageInput(event)
						}}
						placeholder="Send a message to everyone"
						onKeyPress={(event) => {
							if (event.key === "Enter") {
								this.handleSend()
							}
						}}
					/>
					<button
						disabled={!this.state.message.length}
						onClick={() => {
							this.handleSend()
						}}></button>
				</div>
			</div>
		)
	}
}
