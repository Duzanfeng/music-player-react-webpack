import React from 'react';
import './detail.less';
import Pubsub from 'pubsub-js';

class Detail extends React.Component {
	constructor(props) {
	  	super(props);
	
	  	this.state = {

	  	};
	}

	componentDidMount() {
	    $('#player').unbind($.jPlayer.event.timeupdate);
	}

	componentWillUnMount() {
		
	}

	render() {
		return (
			<div className="detail-page">
				<h1 className="caption">歌曲详情</h1>
				<div className="mt20 row">
					<div className="info-wrapper">
						<p className="music-words mb35"><span dangerouslySetInnerHTML={{ __html: this.props.currentMusicItem.words ? this.props.currentMusicItem.words.replace(/\[.*?\]/g,'').replace(/\n\n/ig,'').replace(/\n/ig,'<br/>') : '暂无' }}></span></p>
					</div>
					<div className="-col-auto cover">
						<img src={this.props.currentMusicItem.cover} alt={this.props.currentMusicItem.title}/>
					</div>
				</div>
			</div>
		);
	};
}

export default Detail;