import React from 'react';
import Header from './components/header';
import Player from './page/player';
import { Lrc } from './page/player';
import MusicList from './page/list';
import Detail from './page/detail';
import { MUSIC_LIST } from './config/config';
import { BrowserRouter, HashRouter, Route, Switch, Link, withRouter } from 'react-router-dom';
import Pubsub from 'pubsub-js';


let currentTime = null;
class App extends React.Component {
	constructor(props) {
	  	super(props);
	
		// 本地存储
		// localStorage.clear();
		if(localStorage.hasOwnProperty('musicList')){
		  	this.state = {
				musicList: JSON.parse(localStorage.getItem('musicList')),
				currentMusicItem: JSON.parse(localStorage.getItem('musicList'))[localStorage.getItem('playIndex')],
				playIndex: 0,
				repeatType: 'cycle',
		  		isLrc: true,
				detailIndex: 0,
				isUpdate: false,
				lrcReset: true,
				isInSearch: false,
				searchData: {}
		  	};
		}else {
		  	this.state = {
				musicList: MUSIC_LIST,
				currentMusicItem: MUSIC_LIST[0],
				playIndex: 0,
				repeatType: 'cycle',
		  		isLrc: true,
				detailIndex: 0,
				isUpdate: false,
				lrcReset: true,
				isInSearch: false,
				searchData: {}
		  	};
		}
		// console.log(localStorage.getItem('playIndex'));
	}

	playMusic(musicItem) {
		$('#player').jPlayer('setMedia', {
			mp3: musicItem.file
		}).jPlayer('play');

		this.setState({
			currentMusicItem: musicItem,
			playIndex: Math.floor(musicItem.id - 1)
		}, function() {
			localStorage.setItem('playIndex', this.state.playIndex);
		})

		$('#lrc_list').hide();
		$('#lrc_tishi').show();
	}

	playNext(type = "next") {
		let index = this.findMusicIndex(this.state.currentMusicItem);
		let newIndex = null;
		let musicListLength = this.state.musicList.length;
		if(type === 'prev') {
			newIndex = (index - 1 + musicListLength) % musicListLength;
		}else {
			newIndex = (index + 1) % musicListLength;
		}

		let repeatType = this.state.repeatType;
		if(repeatType == 'once' && type == 'once') {
			this.playMusic(this.state.currentMusicItem);
		}else if(repeatType == 'random') {
			let randomIndex = Math.floor(Math.random() * musicListLength); 
			while (randomIndex == index) {
				randomIndex = Math.floor(Math.random() * musicListLength);
			}
			this.playMusic(this.state.musicList[randomIndex]);
		}else{
			this.playMusic(this.state.musicList[newIndex]);
		}
	}

	findMusicIndex(musicItem) {
		return Math.floor(musicItem.id-1);
	}

	pageClick(e) {
		// console.log(e.target.className.indexOf('inSearch'));
		if(e.target.className.indexOf('inSearch') != -1) {
			this.setState({
				isInSearch: true
			});
		}else{
			this.setState({
				isInSearch: false
			});
		}
	}

	componentDidMount() {

		let _this = this;
		Pubsub.subscribe('SEARCH_AJAX', (msg, keyword) => {
			$.ajax({
				url: 'http://mobilecdn.kugou.com/api/v3/search/song',
				type: 'POST',
				dataType: 'jsonp',
				data: {
					format: 'jsonp',
					page: 1,
					pagesize: 20,
					showtype: 1,
					keyword: keyword
				}
			}).done(function(e) {
				// console.log(e.data.info);
				_this.setState({
					searchData: e.data.info
				});
			})
		});

		Pubsub.subscribe('ADDDATA_AJAX', (msg, hash) => {
			$.ajax({
				url: 'http://www.kugou.com/yy/index.php?r=play/getdata&hash='+hash,
				type: 'POST',
				dataType: 'jsonp',
				data: {
					format: 'jsonp',
					// hash: hash
				}
			}).done(function(e) {
				// console.log(e.data);
				let data = e.data;
				let matchNum = 0;
				let matchIndex = 0;
				for (let i = 0; i < MUSIC_LIST.length; i++) {
					if(MUSIC_LIST[i].title == data.song_name) {
						matchNum++;
						matchIndex = i;
					}
				}
				if(matchNum == 0) {
					let newLen = Math.floor(MUSIC_LIST.length + 1);
					let addData = {
						id: newLen,
						title: data.song_name,
						artist: data.author_name,
						file: data.play_url,
						cover: data.img,
						words: data.lyrics
					}
					// console.log(addData);
					MUSIC_LIST.push(addData);

					_this.setState({
						musicList: MUSIC_LIST,
						currentMusicItem: addData
					}, function() {
						_this.setState({
							lrcReset: true
						}, function() {
							_this.playMusic(this.state.currentMusicItem);
							localStorage.setItem('musicList', JSON.stringify(this.state.musicList));
						});
					});
				}else {
					_this.setState({
						currentMusicItem: MUSIC_LIST[matchIndex]
					}, function() {
						_this.setState({
							lrcReset: true
						}, function() {
							_this.playMusic(this.state.currentMusicItem);
						});
					});
				}

				
			})
		});
		Pubsub.subscribe('IS_INSEARCH', (msg, flag) => {
			this.setState({
				isInSearch: flag
			})	
		});
		
		$('#player').jPlayer({
			supplied: 'mp3',
			wmode: 'window'
		});
		this.playMusic(this.state.currentMusicItem);

		$('#player').bind($.jPlayer.event.ended, (e) => {
			this.playNext(this.state.repeatType);
			this.setState({
				lrcReset: true
			});
		});

		Pubsub.subscribe('DELETE_MUSIC', (msg, musicItem) => {
			this.setState({
				musicList: this.state.musicList.filter(item => {
					return item !== musicItem;
				})
			})
			if(this.state.currentMusicItem == musicItem){
				this.playMusic(this.state.musicList[0]);
			}	
		});
		Pubsub.subscribe('PLAY_MUSIC', (msg, musicItem) => {
			this.playMusic(musicItem);
		});
		Pubsub.subscribe('PLAY_NEXT', () => {
			this.playNext();
			this.setState({
				lrcReset: true
			});
		});
		Pubsub.subscribe('PLAY_PREV', () => {
			this.playNext('prev');
			this.setState({
				lrcReset: true
			});
		});
		Pubsub.subscribe('LRC_RESET', (msg, lrcReset) => {
			this.setState({
				lrcReset: lrcReset
			});
		});
		let repeatList = [
			'cycle',
			'once',
			'random'
		];
		PubSub.subscribe('CHANAGE_REPEAT', () => {
			let index = repeatList.indexOf(this.state.repeatType);
			index = (index + 1) % repeatList.length;
			this.setState({
				repeatType: repeatList[index]
			});
		});

		PubSub.subscribe('LRC_CONTROL', () => {
			this.setState({
				isLrc: !this.state.isLrc
			});
		});

		Pubsub.subscribe('DETAIL', (msg, musicItem) => {
			this.setState({
				detailIndex: Math.floor(musicItem.id - 1)
			}, function(e){
				this.props.history.push('/detail/' + this.state.detailIndex);
			})
		});
	}

	componentWillReceiveProps() {
		this.setState({
			isUpdate: true
		});
	}

	componentWillUnMount() {
		Pubsub.unsubscribe('DELETE_MUSIC');
		Pubsub.unsubscribe('PLAY_MUSIC');
		Pubsub.unsubscribe('PLAY_NEXT');
		Pubsub.unsubscribe('PLAY_PREV');
		Pubsub.unsubscribe('CHANAGE_REPEAT');
		Pubsub.unsubscribe('DETAIL');
		$('#player').unbind($.jPlayer.event.ended);
	}

	render() {
		let PlayerPath = {
			pathname: '/',
			state: {
				currentMusicItem: this.state.currentMusicItem,
				repeatType: this.state.repeatType
			}
		}
		let MusicListPath = {
			pathname: '/list',
			state: {
				currentMusicItem: this.state.currentMusicItem,
				musicList: this.state.musicList
			}
		}
		return (
			<div className="appPage" onClick={this.pageClick.bind(this)}>
				<Header isInSearch={this.state.isInSearch} searchData={this.state.searchData}/>
				<Switch>
					<Route exact path="/" render={(props) => <Player currentMusicItem={this.state.currentMusicItem} repeatType={this.state.repeatType} isLrc={this.state.isLrc} isUpdate={this.state.isUpdate} lrcReset={this.state.lrcReset}/>}/>
					<Route path="/list" render={(props) => <MusicList currentMusicItem={this.state.currentMusicItem} musicList={this.state.musicList} />}/>
					<Route path="/detail/:id" render={(props) => <Detail currentMusicItem={this.state.musicList[this.state.detailIndex]} />}/>
				</Switch>
			</div>
		);
	}
}

export default withRouter(App);