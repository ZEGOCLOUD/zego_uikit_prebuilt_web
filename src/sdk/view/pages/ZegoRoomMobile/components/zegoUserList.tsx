import React from "react";
import zegoUserListCss from "./zegoUserList.module.scss";
import { debounce, getNameFirstLetter, userNameColor, memberSearch } from "../../../../util"
import { ZegoCloudRTCCore } from "../../../../modules"
import { ZegoCloudUser, ZegoCloudUserList } from "../../../../modules/tools/UserListManager"
import { ScenarioModel, UserListMenuItemType } from "../../../../model"
import ShowManageContext, { ShowManageType } from "../../context/showManage"
import { FormattedMessage } from "react-intl";
export class ZegoUserList extends React.Component<{
	userList: ZegoCloudUserList
	core: ZegoCloudRTCCore
	closeCallBack: (user?: ZegoCloudUser) => void
	handleMenuItem: (type: UserListMenuItemType, user: ZegoCloudUser) => void
}> {
	state: {
		message: string
		searchList: ZegoCloudUser[]
		searchText: string
	} = {
		message: "",
		searchList: [],
		searchText: "",
	}

	static contextType?: React.Context<ShowManageType> = ShowManageContext
	context!: React.ContextType<typeof ShowManageContext>

	componentDidUpdate(
		prevProps: Readonly<{
			userList: ZegoCloudUserList
			core: ZegoCloudRTCCore
			closeCallBack: (user?: ZegoCloudUser) => void
			handleMenuItem: (type: UserListMenuItemType, user: ZegoCloudUser) => void
		}>,
		prevState: Readonly<{}>,
		snapshot?: any
	): void {
		if (prevProps.userList.length !== this.props.userList.length) {
			this.debounceMemberSearch()
		}
	}
	get hostAndCohostList() {
		const list = this.state.searchText.length ? this.state.searchList : this.props.userList
		return list.filter((u) => u.streamList.length > 0)
	}
	get audienceList() {
		const list = this.state.searchText.length ? this.state.searchList : this.props.userList
		return list
			.filter((u) => u.streamList.length === 0)
			.sort((a, b) => (b.requestCohost || 0) - (a.requestCohost || 0))
	}
	debounceMemberSearch = debounce(() => {
		const result = memberSearch(this.props.userList, this.state.searchText)
		this.setState({
			searchList: result.map((_) => _.item),
		})
		console.warn(result)
	}, 300)
	onInput(e: React.FormEvent<HTMLInputElement>) {
		this.setState({
			// @ts-ignore
			searchText: e.target.value,
		})
		this.debounceMemberSearch()
	}
	clearSearch() {
		this.setState({
			searchList: [],
			searchText: "",
		})
	}
	isShownPin(user: ZegoCloudUser): boolean {
		if (this.props.core._config.scenario?.mode === ScenarioModel.OneONoneCall) {
			return false
		}
		let { showPinButton } = this.context
		return (
			showPinButton &&
			(this.props.core._config.showNonVideoUser ||
				(user.streamList && user.streamList[0] && user.streamList[0].cameraStatus === "OPEN") ||
				(user.streamList &&
					user.streamList[0] &&
					user.streamList[0].micStatus === "OPEN" &&
					!!this.props.core._config.showOnlyAudioUser))
		)
	}
	render(): React.ReactNode {
		const { formatMessage } = this.props.core.intl
		return (
			<div className={zegoUserListCss.memberList}>
				<div className={zegoUserListCss.memberListHeader}>
					<div
						className={zegoUserListCss.memberHide}
						onClick={(ev) => {
							ev.stopPropagation()
							this.props.closeCallBack()
						}}></div>
					<FormattedMessage id="mobileRoom.member" />
				</div>
				<div className={zegoUserListCss.memberListContent}>
					{this.props.core._config.enableUserSearch && (
						<div className={zegoUserListCss.memberSearch}>
							<span className={zegoUserListCss.memberSearchPrefix}></span>
							<input
								type="text"
								placeholder={formatMessage({ id: "global.search" })}
								onInput={(e) => {
									this.onInput(e)
								}}
								value={this.state.searchText}
							/>
							{this.state.searchText.length > 0 && (
								<span
									className={zegoUserListCss.memberSearchSuffix}
									onClick={() => this.clearSearch()}></span>
							)}
						</div>
					)}
					{
						this.hostAndCohostList.map((user) => {
							return (
								<div
									key={user.userID}
									className={zegoUserListCss.member}
									onClick={(ev) => {
										ev.stopPropagation()
										this.props.closeCallBack(user)
									}}>
									<div className={zegoUserListCss.memberName}>
										<i style={{ color: userNameColor(user.userName!) }}>
											{getNameFirstLetter(user.userName || "")}
											{user.avatar && (
												<img
													src={user.avatar}
													onError={(e: any) => {
														e.target.style.display = "none"
													}}
													alt=""
												/>
											)}
										</i>
										<span
											key={user.userID}
											style={{
												maxWidth:
													this.props.core._expressConfig.userID === user.userID
														? "30vw"
														: "45vw",
											}}>
											{user.userName}
										</span>
										{this.props.core._expressConfig.userID === user.userID && (
											<span key={user.userID + "_me"}> (<FormattedMessage id="global.you" />) </span>
										)}
									</div>
									{(user.streamList[0].media ||
										(this.context.liveStatus === "1" && user.streamList[0].streamID)) && (
											<div className={zegoUserListCss.memberHandlers}>
												{this.isShownPin(user) && user.pin && (
													<i className={zegoUserListCss.memberUnPin}></i>
												)}
												<i
													className={
														user.streamList &&
															user.streamList[0] &&
															user.streamList[0].micStatus === "OPEN"
															? zegoUserListCss.memberMicOpen
															: zegoUserListCss.memberMicMute
													}></i>
												<i
													className={
														user.streamList &&
															user.streamList[0] &&
															user.streamList[0].cameraStatus === "OPEN"
															? zegoUserListCss.memberCameraOpen
															: zegoUserListCss.memberCameraMute
													}></i>
											</div>
										)}
								</div>
							)
						})
					}
					{
						this.audienceList.map((user) => {
							return (
								<div
									key={user.userID}
									className={zegoUserListCss.member}
									onClick={(ev) => {
										ev.stopPropagation()
										this.props.closeCallBack(user)
									}}>
									<div className={zegoUserListCss.memberName}>
										<i style={{ color: userNameColor(user.userName!) }}>
											{getNameFirstLetter(user.userName || "")}
											{user.avatar && (
												<img
													src={user.avatar}
													onError={(e: any) => {
														e.target.style.display = "none"
													}}
													alt=""
												/>
											)}
										</i>
										<span
											key={user.userID}
											style={{
												maxWidth:
													this.props.core._expressConfig.userID === user.userID ||
														user.requestCohost
														? "30vw"
														: "45vw",
											}}>
											{user.userName}
										</span>
										{this.props.core._expressConfig.userID === user.userID && (
											<span key={user.userID + "_me"}> (<FormattedMessage id="global.you" />) </span>
										)}
									</div>
									{!user.streamList?.[0]?.media && user.invited && !user.requestCohost && (
										<div className={zegoUserListCss.invitedState}>Invited</div>
									)}
									{user.requestCohost && (
										<div className={zegoUserListCss.requestCohostWrapper}>
											<div
												className={zegoUserListCss.disagreeBtn}
												onClick={(ev) => {
													this.props.handleMenuItem(
														UserListMenuItemType.DisagreeRequestCohost,
														user
													)
													ev.stopPropagation()
												}}>
												Disagree
											</div>
											<div
												className={zegoUserListCss.agreeBtn}
												onClick={(ev) => {
													this.props.handleMenuItem(
														UserListMenuItemType.AgreeRequestCohost,
														user
													)
													ev.stopPropagation()
												}}>
												Agree
											</div>
										</div>
									)}
								</div>
							)
						})
					}
					{this.state.searchText.length > 0 && this.state.searchList.length === 0 && (
						<div className={zegoUserListCss.noResult}>
							<div></div>
							<p>No search results</p>
						</div>
					)}
				</div>
			</div>
		)
	}
}
