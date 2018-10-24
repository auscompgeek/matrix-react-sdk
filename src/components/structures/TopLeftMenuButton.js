/*
Copyright 2018 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import PropTypes from 'prop-types';
import * as ContextualMenu from './ContextualMenu';
import {TopLeftMenu} from '../views/context_menus/TopLeftMenu';
import AccessibleButton from '../views/elements/AccessibleButton';
import BaseAvatar from '../views/avatars/BaseAvatar';
import MatrixClientPeg from '../../MatrixClientPeg';
import Avatar from '../../Avatar';

const AVATAR_SIZE = 28;

export default class TopLeftMenuButton extends React.Component {

    static propTypes = {
        collapsed: PropTypes.bool.isRequired,
    };

    static displayName = 'TopLeftMenuButton';

    constructor() {
        super();
        this.state = {
            menuDisplayed: false,
            profileInfo: null,
        };

        this.onToggleMenu = this.onToggleMenu.bind(this);
    }

    async _getProfileInfo() {
        const cli = MatrixClientPeg.get();
        const userId = cli.getUserId();
        const profileInfo = await cli.getProfileInfo(userId);
        const avatarUrl = Avatar.avatarUrlForUser(
            {avatarUrl: profileInfo.avatar_url},
            AVATAR_SIZE, AVATAR_SIZE, "crop");

        return {
            userId,
            name: profileInfo.displayname,
            avatarUrl,
        };
    }

    async componentDidMount() {
        try {
            const profileInfo = await this._getProfileInfo();
            this.setState({profileInfo});
        } catch (ex) {
            console.log("could not fetch profile");
            console.error(ex);
        }
    }

    render() {
        const fallbackUserId = MatrixClientPeg.get().getUserId();
        const profileInfo = this.state.profileInfo;
        const name = profileInfo ? profileInfo.name : fallbackUserId;
        let nameElement;
        if (!this.props.collapsed) {
            nameElement = <div className="mx_TopLeftMenuButton_name">
                { name }
            </div>;
        }

        return (
            <AccessibleButton className="mx_TopLeftMenuButton" onClick={this.onToggleMenu}>
                <BaseAvatar
                    idName={fallbackUserId}
                    name={name}
                    url={profileInfo && profileInfo.avatarUrl}
                    width={AVATAR_SIZE}
                    height={AVATAR_SIZE}
                    resizeMethod="crop"
                />
                { nameElement }
                <img className="mx_TopLeftMenuButton_chevron" src="img/topleft-chevron.svg" width="11" height="6" />
            </AccessibleButton>
        );
    }

    onToggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();

        const elementRect = e.currentTarget.getBoundingClientRect();
        const x = elementRect.left;
        const y = elementRect.top + elementRect.height;

        ContextualMenu.createMenu(TopLeftMenu, {
            chevronFace: "none",
            left: x,
            top: y,
            onFinished: () => {
                this.setState({ menuDisplayed: false });
            },
        });
        this.setState({ menuDisplayed: true });
    }
}
