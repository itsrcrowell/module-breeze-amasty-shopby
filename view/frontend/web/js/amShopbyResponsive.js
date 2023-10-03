/**
 * @author    Amasty Team
 * @copyright Copyright (c) Amasty Ltd. ( http://www.amasty.com/ )
 * @package   Amasty_Shopby
 */

define([
    'jquery',
    'matchMedia',
    'amShopbyTopFilters',
    'mage/tabs',
    'domReady!'
], function ($, mediaCheck, amShopbyTopFilters) {
    'use strict';

    var result = function () {
        // Breeze fix: rewritten using matchMedia
        var mql = window.matchMedia('(max-width: 768px)');

        function moveTopFilters(e) {
            if (e.matches) {
                amShopbyTopFilters.moveTopFiltersToSidebar();
            } else {
                amShopbyTopFilters.removeTopFiltersFromSidebar();
            }
        }

        moveTopFilters(mql);
        mql.addEventListener('change', moveTopFilters);
    };

    result.component = 'amShopbyResponsive';

    return result;
});
