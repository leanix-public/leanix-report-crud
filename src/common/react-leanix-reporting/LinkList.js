/* The MIT License (MIT)

Copyright (c) 2018 LeanIX GmbH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

// from https://github.com/leanix/leanix-custom-reports

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Link from './Link';

class LinkList extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		if (this.props.links.length < 1) {
			return null;
		}
		const delimiter = !this.props.delimiter ? '<br/>' : this.props.delimiter;
		return (
			<span>
				{this.props.links.map((e, i) => {
					if (i === 0) {
						return (
							<span key={i}>
								<Link link={e.link}
									target={e.target}
									text={e.text} />
							</span>
						);
					}
					return (
						<span key={i}>
							<span dangerouslySetInnerHTML={{ __html: delimiter }} />
							<Link link={e.link}
								target={e.target}
								text={e.text} />
						</span>
					);
				})}
			</span>
		);
	}
}

LinkList.propTypes = {
	links: PropTypes.arrayOf(
		PropTypes.shape({
			link: PropTypes.string.isRequired,
			target: PropTypes.string.isRequired,
			text: PropTypes.string.isRequired
		}).isRequired
	).isRequired,
	delimiter: PropTypes.string
};

export default LinkList;
