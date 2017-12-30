//@ts-check

import React from 'react';

export function Header({
	userName = '',
	nickName = '',
	steamID = '',
	avatar = '',
	needLogin = false
}) {
	let link = userName ? ("https://steamcommunity.com/id/"+userName) :
		"https://steamcommunity.com/my";
		
	return <div className="profile_small_header_bg">
			<div className="profile_small_header_texture">
				<div className="profile_small_header_text">
					<span className="profile_small_header_name" style={{ marginRight: '1rem' }}>
						<a className="whiteLink" target="_blank" href={link}>
							{nickName}
						</a>
					</span>
					{userName 
						? <span>(username: <b className="profile_small_header_location">{userName}</b>)</span> 
						: ''}
					{steamID 
						? <span>(steamID: <b className="profile_small_header_location">{steamID}</b>)</span>
						: ''}
					{needLogin 
						? <a className="btn_green_white_innerfade btn_medium" 
							target="_blank" href="https://steamcommunity.com/login/home"
							id="SteamLogin" style={{
								width: '128px',
								lineHeight: '24px',
								textAlign: 'center'}}>
							Steam登录页面</a>
						: ''}
				</div>
				{avatar ? <a target="_blank"  href={link}>
					<div className="profile_small_header_avatar">
						<div className="playerAvatar medium offline">
							<img src={avatar} />
						</div>
					</div>
				</a>: ''}
			</div>
		</div>;
}