import React, {Component, PropTypes} from 'react';

require('./_home.scss');

class Home extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="home">
                <h1>Hello, I am HOME now</h1>
                <div>V2</div>
            </div>
        );
    }
}

export default Home;