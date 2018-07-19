import React from 'react';
import App from './app';
import { BrowserRouter, HashRouter, Route, Switch, Link, withRouter } from 'react-router-dom';

class Root extends React.Component {
	render() {
		return (
			<HashRouter>
				<App/>
			</HashRouter>
		);
	}
}

export default Root;