define([
    'jquery',
    'amShopbyFilterAbstract',
    'mage/tooltip',
    'amShopbyFiltersSync'
], function ($, amShopbyFilterAbstract) {
    'use strict';

    $.widget('mage.amShopbyFilterSlider', 'amShopbyFilterAbstract', {
        options: {
            gradients: {}
        },
        selectors: {
            value: '[data-amshopby-slider-id="value"]',
            range: '.ui-slider-range',
            slider: '[data-amshopby-slider-id="slider"]',
            display: '[data-amshopby-slider-id="display"]',
            container: '[data-am-js="slider-container"]',
            tooltip: '[data-amshopby-js="slider-tooltip"]',
            corner: '[data-amshopby-js="slider-corner"]',
            handle: '.ui-slider-handle',
            topNav: '.amasty-catalog-topnav'
        },
        classes: {
            tooltip: 'amshopby-slider-tooltip',
            corner: 'amshopby-slider-corner',
            styleDefault: '-default',
            loaded: '-loaded'
        },
        attributes: {
            tooltip: 'slider-tooltip',
            corner: 'slider-corner'
        },
        slider: null,
        value: null,
        display: null,

        /**
         * @inheritDoc
         */
        _create: function () {
            this._initializeWidget();

            $.mage.amShopbyFilterAbstract.prototype.setCollectFilters(this.options.collectFilters);
        },

        /**
         * @private
         * @returns {void}
         */
        _initializeWidget: function () {
            var hideDigitsAfterDot = this.options.hideDigitsAfterDot,
                fromLabel = Number(this._getInitialFromTo('from')).amToFixed(2, hideDigitsAfterDot),
                toLabel = Number(this._getInitialFromTo('to')).amToFixed(2, hideDigitsAfterDot);

            this.setCurrency(this.options.curRate);
            this._initNodes();

            if (this.options.to) {
                this.value.val(fromLabel + '-' + toLabel);
            } else {
                this.value.trigger('change');
                this.value.trigger('sync');
            }

            fromLabel = this.processPrice(false, fromLabel, this.options.deltaFrom).amToFixed(2, hideDigitsAfterDot);
            toLabel = this.processPrice(false, toLabel, this.options.deltaTo).amToFixed(2, hideDigitsAfterDot);

            this._initSlider(fromLabel, toLabel);
            this._renderLabel(fromLabel, toLabel);
            this._setTooltipValue(this.slider, fromLabel, toLabel);
            this.value.on('amshopby:sync_change', this._onSyncChange.bind(this));

            if (this.options.hideDisplay) {
                this.display.hide();
            }
        },

        /**
         * @private
         * @param {String} value - 'from' or 'to'
         * @returns {String | Number}
         */ // eslint-disable-next-line consistent-return
        _getInitialFromTo: function (value) {
            // eslint-disable-next-line default-case
            switch (value) {
                case 'from':
                    return this.options.from && this.options.from >= this.options.min
                        ? this.options.from
                        : this.options.min;
                case 'to':
                    return this.options.to && this.options.to <= this.options.max
                        ? this.options.to
                        : this.options.max;
            }
        },

        /**
         * @private
         * @returns {void}
         */
        _initNodes: function () {
            this.value = this.element.find(this.selectors.value);
            this.slider = this.element.find(this.selectors.slider);
            this.display = this.element.find(this.selectors.display);
        },

        /**
         * @private
         * @param {Number} fromLabel
         * @param {Number} toLabel
         * @returns {void}
         */
        _initSlider: function (fromLabel, toLabel) {
            const self = this,
                range = $('<range-slider>'),
                minPrice = this.options.min * +this.options.curRate,
                maxPrice = this.options.max * +this.options.curRate,
                fromPrice = fromLabel,
                toPrice = toLabel,
                step = (this.options.step ? this.options.step : 1) * +this.options.curRate,
                onPriceChange = _.debounce(function (newFrom, newTo) {
                    self._setValue(newFrom, newTo, true);
                }, 500),
                hexToRgb = hex =>
                    hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
                        .substring(1).match(/.{2}/g)
                        .map(x => parseInt(x, 16));

            this.slider.hide();

            range.attr('style', '--thumb-bg:' + hexToRgb(this.options.colors.main).join(' '));

            range
                .attr('min', minPrice)
                .attr('max', maxPrice)
                .attr('value', [fromPrice, toPrice].join('-'))
                .attr('step', step)
                .insertBefore(this.slider)
                .on('range:input', function (event) {
                    var from  = event.target.value[0],
                        to = event.target.value[1];

                    self._onSlide(from, to);

                    onPriceChange(from, to);
                });
        },

        /**
         * @private
         * @returns {Boolean}
         */
        _isNotDefaultSlider: function () {
            return this.options.style !== this.classes.styleDefault;
        },

        /**
         * @private
         * @param {Object} event
         * @param {Object} ui
         * @returns {Boolean}
         */
        _onChange: function (event, ui) {
            var rate;

            if (this.slider.skipOnChange !== true) {
                rate = $(ui.handle).closest(this.selectors.container).data('rate');

                this._setValue(
                    Number(ui.values[0]).amToFixed(2, this.options.hideDigitsAfterDot),
                    Number(ui.values[1]).amToFixed(2, this.options.hideDigitsAfterDot),
                    true,
                    rate
                );
            }

            return true;
        },

        /**
         * @private
         * @param {Object} event
         * @param {Object} ui
         * @returns {Boolean}
         */
        _onSlide: function (valueFrom, valueTo) {
            this._setValue(valueFrom, valueTo, false);
            this._renderLabel(valueFrom, valueTo);

            this._setTooltipValue(event.target, valueFrom, valueTo);

            return true;
        },

        /**
         * @private
         * @param {Object} event
         * @param {Array} values
         * @returns {void}
         */
        _onSyncChange: function (event, values) {
            var value = values[0].split('-'),
                valueFrom,
                valueTo;

            if (value.length === 2) {
                valueFrom = this._parseValue(value[0]);
                valueTo = this._parseValue(value[1]);

                this.slider.skipOnChange = true;

                this.slider.slider('values', [valueFrom, valueTo]);
                this._setValueWithoutChange(valueFrom, valueTo);
                this._setTooltipValue(this.slider, valueFrom, valueTo);
                this.slider.skipOnChange = false;
            }
        },

        /**
         * @private
         * @param {Number} from
         * @param {Number} to
         * @param {Boolean} apply
         * @returns {void}
         */
        _setValue: function (from, to, apply) {
            var valueFrom = this._parseValue(this.processPrice(true, from)),
                valueTo = this._parseValue(this.processPrice(true, to)),
                newValue,
                changedValue,
                linkHref;

            newValue = valueFrom + '-' + valueTo;
            changedValue = this.value.val() !== newValue;

            this.value.val(newValue);

            if (!this.isBaseCurrency()) {
                this.setDeltaParams(this.getDeltaParams(from, valueFrom, to, valueTo, false));
            }

            if (changedValue) {
                this.value.trigger('change');
                this.value.trigger('sync');
            }

            if (apply !== false) {
                newValue = valueFrom + '-' + valueTo;
                linkHref = this.options.url
                    .replace('amshopby_slider_from', valueFrom)
                    .replace('amshopby_slider_to', valueTo);

                linkHref = this.getUrlWithDelta(
                    linkHref,
                    valueFrom,
                    from,
                    valueTo,
                    to,
                    this.options.deltaFrom,
                    this.options.deltaTo
                );

                this.value.val(newValue);
                $.mage.amShopbyFilterAbstract.prototype.renderShowButton(0, this.element[0]);
                $.mage.amShopbyFilterAbstract.prototype.apply(linkHref);
            }

            $(this.value).trigger('amshopby:price_slider', {
                defaults: {
                    from: parseFloat(this.options.min),
                    to: parseFloat(this.options.max)
                },
                current: {
                    from: parseFloat(valueFrom),
                    to: parseFloat(valueTo)
                }
            });
        },

        /**
         * @private
         * @param {Number} from
         * @param {Number} to
         * @returns {void}
         */
        _setValueWithoutChange: function (from, to) {
            this.value.val(this._parseValue(from) + '-' + this._parseValue(to));
        },

        /**
         * @private
         * @param {String} from
         * @param {String} to
         * @returns {String}
         */
        _getLabel: function (from, to) {
            return this.options.template.replace('{from}', from.toString()).replace('{to}', to.toString());
        },

        /**
         * @private
         * @param {Number} from
         * @param {Number} to
         * @returns {void}
         */
        _renderLabel: function (from, to) {
            var valueFrom = this._parseValue(from),
                valueTo = this._parseValue(to);

            this.display.html(this._getLabel(valueFrom, valueTo));
        },

        /**
         * @private
         * @returns {Object}
         */
        _getTooltip: function () {
            return $('<span>', {
                'class': this.classes.tooltip,
                'data-amshopby-js': this.attributes.tooltip
            });
        },

        /**
         * @private
         * @returns {Object}
         */
        _getCorner: function () {
            return $('<span>', {
                'class': this.classes.corner,
                'data-amshopby-js': this.attributes.corner
            });
        },

        /**
         * @private
         * @returns {void}
         */
        _renderTooltips: function () {
            this.handles.prepend(this._getTooltip());
            this.handles.prepend(this._getCorner());
            this.tooltips = this.handles.find(this.selectors.tooltip);
            this.tooltipCorners = this.handles.find(this.selectors.corner);
        },

        /**
         * @private
         * @param {Object} element
         * @param {String} from
         * @param {String} to
         * @returns {void}
         */
        _setTooltipValue: function (element, from, to) {
            var handle = this.selectors.handle,
                tooltip = this.selectors.tooltip,
                currencySymbol = this.options.currencySymbol,
                currencyPosition = parseInt(this.options.currencyPosition),
                valueFrom = this._parseValue(from),
                valueTo = this._parseValue(to),
                firstElement = $(element).find(handle + ':first-of-type ' + tooltip),
                lastElement = $(element).find(handle + ':last-of-type ' + tooltip);

            if (!this._isNotDefaultSlider()) {
                return;
            }

            if (currencyPosition) {
                firstElement.html(valueFrom + currencySymbol);
                lastElement.html(valueTo + currencySymbol);
            } else {
                firstElement.html(currencySymbol + valueFrom);
                lastElement.html(currencySymbol + valueTo);
            }

            this._setTooltipOffset(firstElement, 'left');
            this._setTooltipOffset(lastElement, 'right');
        },

        /**
         * @private
         * @param {Object} tooltip - jQuery Element
         * @param {String} side - 'right' or 'left'
         * @returns {void}
         */
        _setTooltipOffset: function (tooltip, side) {
            var width = tooltip.width() / 2,
                sliderWidth = tooltip.closest(this.selectors.slider)[0].clientWidth,
                parent = tooltip.parent(),
                parentOffset = parent[0].offsetLeft,
                volumetricStyleOffset = this.options.style === '-volumetric' ? 3 : 0,
                offset,
                isFixed;

            offset = side === 'right' ? sliderWidth - parentOffset : parentOffset;

            offset += volumetricStyleOffset;

            isFixed = offset < width || width < 0;

            if (tooltip.closest(this.selectors.topNav) && width < 0) {
                parent.on('hover.amShopby', function () {
                    this._setTooltipOffset(tooltip, side);
                    parent.off('hover.amShopby');
                }.bind(this));
            }

            tooltip.css(side, isFixed ? -(offset > 3 ? offset : 3 + volumetricStyleOffset) : 'unset');
        },

        /**
         * @private
         * @param {String | Number} value
         * @returns {String}
         */
        _parseValue: function (value) {
            return parseFloat(value).amToFixed(2, this.options.hideDigitsAfterDot);
        },

        /**
         * @private
         * @param {String} value
         * @returns {String}
         */
        _replacePriceDelimiter: function (value) {
            return value.replace('.', ',');
        }
    });

    return $.mage.amShopbyFilterSlider;
});
