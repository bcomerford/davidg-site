/**
 * This page is a bit heavy on the plugins, but here we go:
 *
 * Masonry is in charge of laying out the thumbnails in a grid.
 * It does maths once the images are loaded, the sizing is done in CSS
 *
 * PhotoSwipe is just awesome and used for showing individual images and
 * handling all the swiping, pinchy zoomy, etc.
 *
 * imagesloaded is a library by the masonry guy and just fires a function as each
 * image finishes loading, without this, Masonry doesn't really work.
 *
 **/

import React, {Component, PropTypes} from 'react';
import classnames from 'classnames';
import {isOnServer} from '../../utils';
import {ANIMATION_DURATION_MS} from '../../utils/constants';
import photos from './photos';

const PhotoSwipe = require('photoswipe/dist/photoswipe.js');
const photoSwipeUIDefault = require('photoswipe/dist/photoswipe-ui-default.js');

if (process.env.WEBPACK) {
    require('./gallery.scss');
    require('./photoswipe/photoswipe.css');
    require('./photoswipe/default-skin/default-skin.css');
}

class Gallery extends Component {
    constructor(props) {
        super(props);

        this.calcThumbBoundsFn = this.calcThumbBoundsFn.bind(this);
        this.showGallery = this.showGallery.bind(this);

        this.photos = [];
        this.msnry = undefined;
        this.imageEls = {};
    }

    componentWillMount() { // client and server
        // On mount, set the thumbnail version to medium or large
        // imgur uses the syntax of adding an 'l' or 'm' at the end to denote a large or medium thumbnail version of an image
        // I haven't been able to find what they use for 'small'

        // when generating the HTML on the server, assume smallest screen so set thumbnails to small
        const windowWidth = isOnServer ? 1 : window.innerWidth;

        this.photos = photos.map((photo) => {
            const newPhoto = {...photo};

            if (windowWidth >= 1300 || photo.doubleWidth) {
                newPhoto.msrc = newPhoto.src.replace(/\.jpg$/, 'l.jpg'); // large thumbnail ~20 - 50kb each;  640px
            } else {
                newPhoto.msrc = newPhoto.src.replace(/\.jpg$/, 'm.jpg'); // medium thumbnail ~15 - 25kb each;  320px
            }

            return newPhoto;
        });
    }

    componentDidMount() { // client side only
        const Masonry = Masonry || require('masonry-layout');
        const imagesLoaded = imagesLoaded || require('imagesloaded');

        const gridEl = document.querySelector('.gallery__wrapper');

        this.msnry = new Masonry(gridEl, {
            itemSelector: '.gallery__thumb',
            columnWidth: '.gallery__thumb-sizer',
            percentPosition: true,
        });

        imagesLoaded(gridEl).on('progress', () => this.msnry.layout());
    }

    shouldComponentUpdate(newProps) {
        if (newProps.showNav !== this.props.showNav) {
            setTimeout(() => {
                this.msnry.layout();
            }, ANIMATION_DURATION_MS);
        }

        return false;
    }

    calcThumbBoundsFn(i) {
        const photoEl = this.imageEls[`img-${i}`];
        const dims = photoEl.getBoundingClientRect();

        const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;

        return {x: dims.left, y: dims.top + pageYScroll, w: dims.width};
    }

    showGallery(i) {
        const pswpElement = document.querySelector('.pswp');

        const options = {
            index: i,
            getThumbBoundsFn: this.calcThumbBoundsFn,
            shareEl: false,
            zoomEl: false,
        };

        // Initializes and opens PhotoSwipe
        const gallery = new PhotoSwipe(pswpElement, photoSwipeUIDefault, this.photos, options);
        gallery.init();
    }

    render() {
        const classes = classnames(
            'gallery',
            this.props.className,
        );

        const photoEls = this.photos.map((img, i) => {
            // TODO (davidg): in here, if I'm selecting double width I should be taking the big thumb
            let thumbClasses = 'gallery__thumb';

            if (img.doubleWidth) {
                thumbClasses += ' gallery__thumb--double';
            }

            return (
                <div key={img.msrc} className={thumbClasses}>
                    <img
                        ref={el => this.imageEls[`img-${i}`] = el}
                        src={img.msrc}
                        alt={img.title}
                        onClick={() => this.showGallery(i)}
                    />
                </div>
            );
        });

        // The below boilerplate and comments are from http://photoswipe.com/documentation/getting-started.html
        return (
            <section className={classes}>
                <div className="gallery__wrapper">
                    <div className="gallery__thumb-sizer" />
                    {photoEls}
                </div>
                {/* Root element of PhotoSwipe. Must have class pswp. */}
                <div className="pswp" tabIndex="-1" role="dialog" aria-hidden="true">

                    {/* Background of PhotoSwipe.
                         It's a separate element as animating opacity is faster than rgba(). */}
                    <div className="pswp__bg" />

                    {/* Slides wrapper with overflow:hidden. */}
                    <div className="pswp__scroll-wrap">

                        {/* Container that holds slides.
                            PhotoSwipe keeps only 3 of them in the DOM to save memory.
                            Don't modify these 3 pswp__item elements, data is added later on. */}
                        <div className="pswp__container">
                            <div className="pswp__item" />
                            <div className="pswp__item" />
                            <div className="pswp__item" />
                        </div>

                        {/* Default (photoSwipeUIDefault) interface on top of sliding area. Can be changed. */}
                        <div className="pswp__ui pswp__ui--hidden">

                            <div className="pswp__top-bar">

                                {/*  Controls are self-explanatory. Order can be changed. */}

                                <div className="pswp__counter" />

                                <button className="pswp__button pswp__button--close" title="Close (Esc)" />

                                <button className="pswp__button pswp__button--share" title="Share" />

                                <button className="pswp__button pswp__button--fs" title="Toggle fullscreen" />

                                <button className="pswp__button pswp__button--zoom" title="Zoom in/out" />

                                {/* Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR */}
                                {/* element will get class pswp__preloader--active when preloader is running */}
                                <div className="pswp__preloader">
                                    <div className="pswp__preloader__icn">
                                        <div className="pswp__preloader__cut">
                                            <div className="pswp__preloader__donut" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                                <div className="pswp__share-tooltip" />
                            </div>

                            <button className="pswp__button pswp__button--arrow--left" title="Previous (arrow left)" />

                            <button className="pswp__button pswp__button--arrow--right" title="Next (arrow right)" />

                            <div className="pswp__caption">
                                <div className="pswp__caption__center" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}

Gallery.propTypes = {
    className: PropTypes.string.isRequired,
    showNav: PropTypes.bool.isRequired,
};

export default Gallery;
