import React from 'react';
import './progress.less';

class Progress extends React.Component {
	static defaultProps = {
		barColor: '#2f9842'
	};

	constructor(props) {
		super(props);
		this.refProgressBar = React.createRef();
    	this.changeProgress = this.changeProgress.bind(this);
	};

	changeProgress(e) {
		let progressBar = this.refProgressBar.current;
		let progress = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.clientWidth;

		this.props.onProgressChange && this.props.onProgressChange(progress);
	};

	render() {
		return (
			<div className="components-progress" ref={this.refProgressBar} onClick={this.changeProgress}>
				<div className="progress" style={{width: `${this.props.progress}%`,background: this.props.barColor}}></div>
			</div>
		);
	};
}

export default Progress;