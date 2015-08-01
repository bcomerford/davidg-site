import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';
//import {isWebPack} from '../../../utils';

//if (isWebPack) {
//    require('./fireball.scss');
//}

import PageWrapper from '../../PageWrapper/PageWrapper.jsx';

class Home extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <PageWrapper className="fireball">
                <h1 className="fireball__title">I am fireball!!!</h1>
            </PageWrapper>
        );
    }
}

export default Home;
