import React from 'react';
import { Link } from 'react-router-dom';
import Progress from '../components/progress';
import PubSub from 'pubsub-js';
import './player.less';
import '../components/lrc';

let duration = null;
let currentTime = null;
let jump = null;
class Player extends React.Component {
	constructor(props) {
	  	super(props);
	
	  	this.state = {
	  		progress: 0,
	  		volume: 0,
	  		isPlay: true,
	  		isMute: false,
	  		leftTime: '',
	  		rightTime: '',
			coverRotate: true,
			lrcReset: true
	  	};

	  	this.changeProgressHandler = this.changeProgressHandler.bind(this);
	  	this.play = this.play.bind(this);
	  	this.mute = this.mute.bind(this);
	  	this.next = this.next.bind(this);
	  	this.prev = this.prev.bind(this);
	  	this.lrcControl = this.lrcControl.bind(this);
	}

	componentDidMount() {
		
		$('#player').bind($.jPlayer.event.timeupdate, (e) => {
			duration = e.jPlayer.status.duration;
			currentTime = e.jPlayer.status.currentTime;
			this.setState({
				progress: e.jPlayer.status.currentPercentAbsolute,
				volume: e.jPlayer.options.volume * 100,
				leftTime:  this.formatTime(duration * (e.jPlayer.status.currentPercentAbsolute / 100)),
				rightTime:  this.formatTime(duration * (1- e.jPlayer.status.currentPercentAbsolute / 100))
			})
			if(this.props.isUpdate) {
				if(this.state.lrcReset) {
					$('#lrc_list').css('opacity', 0);
					$.lrc.start(this.props.currentMusicItem.words, function() {
						$('#lrc_tishi').hide();
						setTimeout(() => {
							$('#lrc_list').css('opacity', 1).fadeIn();
						},250)
						
						return currentTime;
					});

					$.lrc.jump(duration);
						
					this.setState({
						lrcReset: false
					})
				}
			}
		});

		$('#player').bind($.jPlayer.event.play, (e) => {
			// console.log(this.props.lrcReset);
			if(this.props.lrcReset == true) {
				$('#lrc_list').css('opacity', 0);
				$.lrc.start(this.props.currentMusicItem.words, function() {
					$('#lrc_tishi').hide();
					$('#lrc_list').css('opacity', 1).fadeIn();

					return currentTime;
				});

				PubSub.publish('LRC_RESET', 'false');
			}
		});

		$('#player').bind($.jPlayer.event.ended, (e) => {
			this.setState({
				lrcReset: true
			})
		});
	}

	componentDidUpdate() {
		
	}

	componentWillUnMount() {
		$('#player').unbind($.jPlayer.event.timeupdate);
		$('#player').unbind($.jPlayer.event.play);
		$('#player').unbind($.jPlayer.event.ended);
		$.lrc.stop();
	}

	changeProgressHandler(progress) {
		let toNum = duration * progress;
		$('#player').jPlayer('play', toNum);
		this.setState({
			isPlay: true
		});
	}

	// 改变音量
	changeVolumeHandler(progress) {
		$("#player").jPlayer("volume", progress);
	}

	// 静音
	mute() {
		if (!this.state.isMute) {
			$("#player").jPlayer("mute");
		}else {
			$("#player").jPlayer("unmute");
		}

		this.setState({
			isMute: !this.state.isMute
		});
	}

	play() {
		if (this.state.isPlay) {
			$("#player").jPlayer("pause");
		} else {
			$("#player").jPlayer("play");
		}
		this.setState({
			isPlay: !this.state.isPlay,
			lrcReset: false
		});

		PubSub.publish('LRC_RESET', 'false');
	}

	next() {
			PubSub.publish('PLAY_NEXT');
		this.setState({
			isPlay: true,
			coverRotate: !this.state.coverRotate,
			lrcReset: true
		});
	}

	prev() {
		PubSub.publish('PLAY_PREV');
		this.setState({
			isPlay: true,
			coverRotate: !this.state.coverRotate,
			lrcReset: true
		});
	}

	changeRepeat() {
		PubSub.publish('CHANAGE_REPEAT');
	}

	lrcControl(e) {
		PubSub.publish('LRC_CONTROL');
	}

	formatTime(time) {
		time = Math.floor(time);
		let miniute = Math.floor(time / 60);
		let seconds = Math.floor(time % 60);

		return (miniute < 10 ? '0' + miniute : miniute) + ':' + (seconds < 10 ? '0' + seconds : seconds);
	}

	render() {
		return (
			<div className="player-page">
				<h1 className="caption"><Link to="/list">我的私人音乐坊 &gt;</Link></h1>
                <div className="mt20 row">
                	<div className="controll-wrapper">
                		<h2 className="music-title">{this.props.currentMusicItem.title}</h2>
                		<h3 className="music-artist mt10">{this.props.currentMusicItem.artist}</h3>
                		<div className="row mt20">
                			<div className="left-time -col-auto">{this.state.leftTime}</div>
                			<div className="volume-container">
                				<i className={`icon-volume rt ${this.state.isMute ? 'mute' : 'play'}`} style={{top: 5, left: -5}} onClick={this.mute}></i>
                				<div className="volume-wrapper">
					                <Progress
										progress={this.state.volume}
										onProgressChange={this.changeVolumeHandler}
										barColor='#aaa'
					                >
					                </Progress>
                				</div>
                			</div>
                			<div className="right-time -col-auto">-{this.state.rightTime}</div>
                		</div>
                		<div className="mt20" style={{height: 10, lineHeight: '10px'}}>
			                <Progress
								progress={this.state.progress}
								onProgressChange={this.changeProgressHandler}
			                >
			                </Progress>
                		</div>
                		<div className="mt35 row">
                			<div>
	                			<i className="icon prev" onClick={this.prev}></i>
	                			<i className={`icon ml20 ${this.state.isPlay ? 'pause' : 'play'}`} onClick={this.play}></i>
	                			<i className="icon next ml20" onClick={this.next}></i>
                			</div>
                			<div className={`-col-auto lrc-control ${this.props.isLrc ? 'true' : 'false'}`} onClick={this.lrcControl}>词</div>
                			<div className="-col-auto">
                				<i className={`icon repeat-${this.props.repeatType}`} onClick={this.changeRepeat}></i>
                			</div>
                		</div>
                	</div>
                	<div className="-col-auto cover">
                		<img className={`${this.state.isPlay ? 'play' : 'pause'} ${this.state.coverRotate ? 'play1' : 'play2'}`} src={this.props.currentMusicItem.cover} alt={this.props.currentMusicItem.title}/>
                	</div>
                </div>
	        	<div className={`mt35 music-words ${this.props.isLrc ? 'show' : 'hidden'}`}>
					<ul id="lrc_list"></ul>
					<div id="lrc_tishi">正在查找歌词…</div>
	        	</div>
            </div>
		);
	};
}

class Lrc extends React.Component {
	render() {
		return (
        	<div className={`mt35 music-words ${this.props.isLrc ? 'show' : 'hidden'}`}>
				<ul id="lrc_list"></ul>
				<div id="lrc_tishi">正在查找歌词…</div>
        	</div>
		)
	}
}
export {Lrc};

export default Player;