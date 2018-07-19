import React from 'react';
import './header.less';
import logoImg from '../../static/images/logo.png';

class Header extends React.Component {
	constructor(props) {
	  	super(props);
	
	  	this.state = {
			keyword: '输入关键字'
	  	};
	}

	searchPut(e) {
		let value = e.target.value;
		this.setState({
			keyword: value
		});
	}

	searchAjax() {
		if(this.state.keyword != '输入关键字'){
			// console.log(this.state.keyword);
			PubSub.publish('SEARCH_AJAX', this.state.keyword);
		}
	}

	focus() {
		PubSub.publish('IS_INSEARCH', true);

		if(this.state.keyword == '输入关键字'){
			this.setState({
				keyword: ''
			});
		}
	}

	Blur() {
		if(this.state.keyword == ''){
			this.setState({
				keyword: '输入关键字'
			});
		}
	}

	render() {
		return (
			<div className="components-header">
				<div className="row">
					<img src={logoImg} width="40" alt="" className="-col-auto" />
					<h1 className="caption">React Music Player</h1>
				</div>
				<div className="search row">
					<input className="inSearch" type="text" value={this.state.keyword} onChange={this.searchPut.bind(this)} onFocus={this.focus.bind(this)} onBlur={this.Blur.bind(this)}/>
					<input className="inSearch" type="button" value="搜索" onClick={this.searchAjax.bind(this)} onFocus={this.focus.bind(this)}/>
					<div className={`search-result inSearch ${this.props.isInSearch ? 'show' : 'hidden'}`}>
						<ul>
							<List searchData={this.props.searchData}/>
						</ul>
					</div>
				</div>
			</div>
		);
	}
}

class List extends React.Component {
	searchAjax(e) {
		let value = e.target.innerHTML;
		PubSub.publish('SEARCH_AJAX', value);
		this.setState({
			keyword: value
		});
	}

	addData(e) {
		let value = e.target.getAttribute("data-hash");
		PubSub.publish('ADDDATA_AJAX', value);
	}

	render(){
		let list = (searchData) => {
	  		let res = [];
	  		for(let i = 0; i < searchData.length; i++) {
	    		res.push(<li key={i} className="inSearch"><span className="inSearch" onClick={this.searchAjax.bind(this)}>{searchData[i].filename}</span><i data-hash={searchData[i].hash} onClick={this.addData.bind(this)}>&#xe642;</i></li>)
	  		}
	  		return res
		}
		return (
		  	list(this.props.searchData)
		)
	}
}


export default Header;