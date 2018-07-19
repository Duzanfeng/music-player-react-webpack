import React from 'react';
import { Link } from 'react-router-dom';
import './listitem.less';
import Pubsub from 'pubsub-js';

let musicItem = null;
class MusicListItem extends React.Component {
	constructor(props) {
	  	super(props);
	
	  	this.state = {
			
	  	};
	}

	playMusic(musicItem) {
		Pubsub.publish('PLAY_MUSIC', musicItem);
	}

	detailMusic(musicItem, e) {
		e.stopPropagation();
		Pubsub.publish('DETAIL', musicItem);
	}

	deleteMusic(musicItem, e) {
		e.stopPropagation();
		Pubsub.publish('DELETE_MUSIC', musicItem);
	}

	render() {
		musicItem = this.props.musicItem;
		return (
			<li className={`components-listitem row${this.props.focus ? ' focus' : ''}`} onClick={this.playMusic.bind(this, musicItem)}>
				<p><strong>{musicItem.title} - {musicItem.artist}</strong></p>
				<p className="-col-auto detail" onClick={this.detailMusic.bind(this, musicItem)}>更多详情</p>
				<p className="-col-auto delete" onClick={this.deleteMusic.bind(this, musicItem)}></p>
			</li>
		);
	};
}

export default MusicListItem;