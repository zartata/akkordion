
	function bind(el, options) {
		this.root = el;
		this.options = extend({}, options, getDataAttrs(el, dataPrefix));
		this.cache();
		this.setDefaultState();
		this.bindEvents();
	};

	bind.prototype.cache = function () {
		var root = this.root,
			elements = root.querySelectorAll('.akkordion-title'),
			empty = document.createElement('div'),
			titleSet = [],
			contentSet = [],
			outerSet = [],
			i, title, content, outer;

		empty.className = 'akkordion-outer';
		for(i = elements.length - 1; i > -1; i--) {

			// Exclude nested structures
			if((title = elements[i]).parentNode === this.root) {

				// Get next non-text node
				content = ! (content = title.nextSibling) ? null : content.nodeType === 1 ? content :
							! (content = content.nextSibling) ? null : content.nodeType === 1 ? content : null;

				// Check is content
				content = content && content.className.indexOf('akkordion-content') > -1 ? content : null;

				// Make outer and add to sets
				if(content) {
					titleSet.unshift(title);
					
					outer = empty.cloneNode();
					outer.appendChild(root.replaceChild(outer, content));
					outerSet.unshift(outer);
					contentSet.unshift(content);
				}

			}
		}

		this.titleSet = titleSet;
		this.outerSet = outerSet;
		this.contentSet = contentSet;
	};

	bind.prototype.setDefaultState = function () {
		var titleSet = this.titleSet,
			outerSet = this.outerSet,
			contentSet = this.contentSet,
			i, max, title, outer, content,
			single = this.options.single;

		for(i = 0, max = titleSet.length; i < max; i++) {

			// Info
			attr(title = titleSet[i], dataIndex, i);
			attr(outer = outerSet[i], dataIndex, i);
			(content = contentSet[i]).style.height = 'auto';

			// States
			if(content.className.indexOf('akkordion-active') > -1 && (single && ! this.initSingle || ! single)) {
				this.initSingle = true;
				attr(title, dataActive, true);
				attr(outer, dataActive, true);
				attr(content, dataActive, true);
			} else {
				outer.style.height = 0;
			}
		}
	};

	bind.prototype.bindEvents = function () {
		var self = this;

		on(this.root, 'click', function (e) {
			if(e.target.className.indexOf('akkordion-title') > -1) {
				e.preventDefault();
			}
		});

		on(this.root, 'click', function (e) {
			var title = e.target,
				index = self.titleSet.indexOf(title),
				i;

			if(index > -1) {
				if(attr(title, dataActive)) {
					self.close(index);
				} else {
					self.open(index);
					if(self.options.single) {
						for(i = self.outerSet.length -1; i > -1; i--) if(i !== index) {
							self.close(i);
						}
					}
				}
			}
		});

		on(this.root, transitionEnd, function (e) {
			var el = e.target,
				prop = e.propertyName,
				index;

			if(prop === 'height' && (index = self.outerSet.indexOf(el)) > -1) {
				attr(el, dataAnimating, null);
				if(attr(el, dataActive)) {
					el.style.cssText = 'height:auto;';
				} else {
					el.style.cssText = 'height:0;';
				}
			}
		});
	};

	bind.prototype.setActive = function (index, isActive) {
		if(isActive) {
			attr(this.titleSet[index], dataActive, true);
			attr(this.outerSet[index], dataActive, true);
			attr(this.contentSet[index], dataActive, true);
		} else {
			attr(this.titleSet[index], dataActive, null);
			attr(this.outerSet[index], dataActive, null);
			attr(this.contentSet[index], dataActive, null);
		}
	}

	bind.prototype.open = function (index, noAnim) {
		var title = this.titleSet[index],
			outer = this.outerSet[index],
			content = this.contentSet[index],
			transitionDuration = transition + ':' + this.options.speed + 'ms;',
			height;

		if( ! transition || noAnim) {
			this.setActive(index, true);
			outer.style.cssText = 'height:auto;';
		} else if( ! attr(outer, dataAnimating) && ! attr(outer, dataActive)) {
			this.setActive(index, true);
			attr(outer, dataAnimating, true);
			attr(content, dataAnimating, true);

			outer.style.height = 'auto';
			height = getComputedStyle(outer).height;
			outer.style.height = 0;
			outer.offsetWidth;
			outer.style.cssText = 'height:' + height + ';' + transitionDuration;
		}
	}

	bind.prototype.close = function (index, noAnim) {
		var outer = this.outerSet[index];
			content = this.contentSet[index],
			transitionDuration = transition + ':' + this.options.speed + 'ms;';

		if( ! transition || noAnim) {
			this.setActive(index, false);
			outer.style.cssText = 'height:0;';
		} else if( ! attr(outer, dataAnimating) && attr(outer, dataActive)) {
			this.setActive(index, false);
			attr(outer, dataAnimating, true);
			attr(content, dataAnimating, true);

			outer.style.height = getComputedStyle(outer).height;
			outer.offsetHeight;
			outer.style.cssText = 'height:0;' + transitionDuration;
		}
	}