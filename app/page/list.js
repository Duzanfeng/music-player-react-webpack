import React from 'react';
import MusicListItem from '../components/listitem';
import PubSub from 'pubsub-js';

class MusicList extends React.Component {
	constructor(props) {
	  	super(props);
	
	  	this.state = {

	  	};
	}

	componentDidMount() {
		$.lrc.stop();
	    $('#player').unbind($.jPlayer.event.timeupdate);
	}

	render() {
		let listEle = null;
		listEle = this.props.musicList.map((item) => {
			return (
				<MusicListItem 
					focus={item === this.props.currentMusicItem} 
					key={item.id} 
					musicItem={item}>
					{item.title}
				</MusicListItem>
			);
		});

		return (
			<ul>
				{ listEle }
			</ul>
		);
	};
}

export default MusicList;