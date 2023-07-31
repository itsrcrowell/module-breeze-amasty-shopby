define([], function () {
    'use strict';

    var result = function (config, element) {
        $(element.firstElementChild).pagebuilderSlider();
    };

    result.component = 'amShopbySwiperSlider';

    return result;
});
