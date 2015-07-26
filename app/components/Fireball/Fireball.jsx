import React, {Component, PropTypes} from 'react';

if (typeof window !== 'undefined') {
    require('./_fireball.scss');
}

class Home extends Component {
    constructor(props) {
        super(props);
        this.update = this.update.bind(this);

        this.state = {value: 22};
    }

    update(e) {
        let value = e.target.value;
        console.log(value);

        this.setState({value});
    }

    render() {
        return (
            <div className="app__content fireball">
                <h1>I am fireball!!!</h1>
            </div>
        );
    }
}

export default Home;