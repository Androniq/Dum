/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './HeaderMobile.css';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import Navigation from '../Navigation';
import logoUrl from '../Header/logo-small.png';
import logoUrl2x from '../Header/logo-small@2x.png';
import logo from '../Header/logo.png';
import BlueButton from '../BlueButton/BlueButton';
import Collapsible from 'react-collapsible';
import NavigationMobile from '../NavigationMobile/NavigationMobile';

class HeaderMobile extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state =
        {
            menuExpanded: false
        };
    }

    expandClick()
    {
        var element = document.querySelector("#expMenu");
        var expanded = this.state.menuExpanded;
        if (expanded)
            this.collapseSection(element);
        else
            this.expandSection(element);
        this.setState({ menuExpanded: !expanded });
    }

    collapseSection(element)
    {
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = element.scrollHeight;

        // temporarily disable all css transitions
        var elementTransition = element.style.transition;
        element.style.transition = '';
  
        // on the next frame (as soon as the previous style change has taken effect),
        // explicitly set the element's height to its current pixel height, so we 
        // aren't transitioning out of 'auto'
        requestAnimationFrame(function()
        {
            element.style.height = sectionHeight + 'px';
            element.style.transition = elementTransition;

            // on the next frame (as soon as the previous style change has taken effect),
            // have the element transition to height: 0
            requestAnimationFrame(function()
            {
                element.style.height = 0 + 'px';
            });
        });
    }

    expandSection(element)
    {
        // get the height of the element's inner content, regardless of its actual size
        var sectionHeight = element.scrollHeight;

        // have the element transition to the height of its inner content
        element.style.height = sectionHeight + 'px';

        var callback = () =>
        {
            // remove this event listener so it only gets triggered once
            element.removeEventListener('transitionend', callback);

            // remove "height" from the element's inline styles, so it can return to its initial value
            element.style.height = null;
        }

        // when the next css transition finishes (which should be the one we just triggered)
        element.addEventListener('transitionend', callback);
    }

  render()
  {        
    return (
        <div className={s.root}>
          <div className={s.container}>
            <Link className={s.item1} to="/">
              <img
                src={logo}
                srcSet={`${logoUrl2x} 2x`}
                width="38"
                height="38"
                alt="ДУМ"
                />
            </Link>
            <Link className={s.item2} to="/">
              <span className={s.brandTxt}>ДУМ</span>
            </Link>
            <BlueButton className={s.item3} onClick={this.expandClick.bind(this)}>{this.state.menuExpanded ? "-" : "+"}</BlueButton>
        </div>
            <div className={s.menuContainer}>
                <div id="expMenu" className={cx(s.expandableMenu, this.state.menuExpanded ? s.visible : s.invisible)}>
                    <NavigationMobile {...this.props} />
                </div>
            </div>
        </div>
    );
  }
}

export default withStyles(s)(HeaderMobile);
