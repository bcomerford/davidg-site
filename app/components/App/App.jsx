import React, {Component} from 'react';
import CSSTransitionGroup from 'react-addons-css-transition-group';
import classnames from 'classnames';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import Fireball from 'fireball-js';

import Hamburger from '../Hamburger/Hamburger';
import Header from '../Header/Header';
import Nav from '../Nav/Nav';

import {contain} from '../../utils';
import {getRouteByUrl} from '../../utils/routeLibrary';
import {
    ANIMATION_DURATION_MS,
    MED_LARGE_BREAKPOINT_EMS,
    NAV_WIDTH_EMS,
    MAX_NAV_POS,
    NAV_MASK_OPACITY,
} from '../../utils/constants';

if (process.env.WEBPACK) {
    require('./app.scss');
    require('./fontFace.scss');
    require('./layout.scss');
    require('./resets.scss');
    require('./theme.scss');
    require('./typography.scss');
}

const MIN_NAV_POS = NAV_WIDTH_EMS * -1;


class App extends Component {
    constructor(props) {
        super(props);

        this.hideNav = this.hideNav.bind(this);
        this.toggleNav = this.toggleNav.bind(this);
        this.onResize = debounce(this.onResize.bind(this), 50);
        this.handleNav = this.handleNav.bind(this);
        this.hideNavIfSmall = this.hideNavIfSmall.bind(this);
        this.onTouchStart = this.onTouchStart.bind(this);
        this.onTouchMove = throttle(this.onTouchMove.bind(this), 16);
        this.onTouchEnd = this.onTouchEnd.bind(this);

        this.state = {
            showNav: true,
            showNavInitial: true,
            navTranslate: 0,
        };

        this.touchStartPos = 0;
        this.navEl = undefined;
        this.navMaskEl = undefined;
        this.navTranslate = undefined;
        this.movingNav = false;
    }

    componentDidMount() {
        Fireball.run({
            speedRanges: [
                {min: 0, className: 'speed-of-sloth'},
                {min: 4000, className: 'speed-of-tortoise'},
                {min: 8000, className: 'speed-of-puppy'},
                {min: 16000, className: 'speed-of-cheetah'},
            ],
        });

        // The nav is always in the show position on load (good for desktop)
        // but leave it hidden on mobile, then close it after a while
        this.hideNavIfSmall();

        setTimeout(() => {
            this.setState({showNavInitial: false});
        }, ANIMATION_DURATION_MS);

        this.navEl = document.querySelector('.nav');
        this.navMaskEl = document.querySelector('.nav__mask');

        window.addEventListener('resize', this.onResize, false);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize, false);
    }

    onResize() {
        this.hideNavIfSmall();
    }

    onTouchStart(e) {
        this.movingNav = true;
        const dims = e.touches ? e.touches[0] : e;
        this.touchStartPos = dims.clientX;

        this.navEl.style.transition = 'none';
        this.navMaskEl.style.transition = 'none';

        window.removeEventListener('touchstart', this.onTouchStart, false); // it will be added again depending on touch end
        window.addEventListener('touchmove', this.onTouchMove, false);
        window.addEventListener('touchend', this.onTouchEnd, false);
    }

    onTouchMove(e) {
        if (!this.movingNav) return; // sometimes a touchMove can fire AFTER the touch end. Bad touchMove. Bad.

        const dims = e.touches ? e.touches[0] : e;
        const currentLeft = dims.clientX;

        const distanceMoved = (currentLeft - this.touchStartPos) / 16; // in ems now

        this.navTranslate = contain(distanceMoved, MIN_NAV_POS, MAX_NAV_POS);
        const transformVal = `translateX(${this.navTranslate}rem)`;
        this.navEl.style.transform = transformVal;
        this.navEl.style.webkitTransform = transformVal;

        let navMaskOpacity = NAV_MASK_OPACITY * (1 - (this.navTranslate / MIN_NAV_POS));

        navMaskOpacity = contain(navMaskOpacity, 0, NAV_MASK_OPACITY);

        this.navMaskEl.style.opacity = navMaskOpacity;
    }

    onTouchEnd() {
        this.movingNav = false;

        this.navEl.style.transition = '';
        this.navEl.style.transform = '';
        this.navEl.style.webkitTransform = '';

        this.navMaskEl.style.transition = '';
        this.navMaskEl.style.opacity = '';

        if (this.navTranslate < (MIN_NAV_POS / 2)) {
            this.hideNav();
        } else {
            this.showNav();
        }

        window.removeEventListener('touchmove', this.onTouchMove, false);
        window.removeEventListener('touchend', this.onTouchEnd, false);
    }

    toggleNav() {
        if (this.state.showNav) {
            this.hideNav();
        } else {
            this.showNav();
        }
    }

    showNav() {
        this.setState({showNav: true});

        if (window.innerWidth < (MED_LARGE_BREAKPOINT_EMS * 16)) {
            window.addEventListener('touchstart', this.onTouchStart, false);
        }
    }

    hideNav() {
        this.setState({showNav: false});

        window.removeEventListener('touchstart', this.onTouchStart, false);
    }

    handleNav(path) {
        if (window.ga) ga('send', 'pageview', path);

        this.hideNavIfSmall();
    }

    hideNavIfSmall() {
        if (this.state.showNav && window.innerWidth < (MED_LARGE_BREAKPOINT_EMS * 16)) {
            this.hideNav();
        }
    }

    render() {
        const {location} = this.props;
        const {state} = this;
        const currentRoute = getRouteByUrl(location.pathname);
        const title = currentRoute.title || 'DG707';
        const appWrapperClasses = classnames(
            'app__wrapper',
            {'app__wrapper--nav-visible--init': this.state.showNavInitial},
            {'app__wrapper--nav-visible': this.state.showNav},
        );

        return (
            <div className={appWrapperClasses}>
                <Hamburger onToggleNav={this.toggleNav} className="header__hamburger" />

                <div className="nav__mask" onClick={this.hideNav} />

                <Nav handleNav={this.handleNav} />

                <Header title={title} />
                <h1>Hello</h1>

                <CSSTransitionGroup
                    component="div"
                    transitionName="app__transition-wrapper"
                    transitionEnterTimeout={ANIMATION_DURATION_MS}
                    transitionLeaveTimeout={ANIMATION_DURATION_MS}
                >
                    {React.cloneElement(
                        this.props.children,
                        {
                            showNav: state.showNav,
                            key: location.pathname, // required for the transition
                        },
                    )}
                </CSSTransitionGroup>
            </div>
        );
    }
}

App.propTypes = {
    children: React.PropTypes.element,
    location: React.PropTypes.object.isRequired,
};

export default App;
