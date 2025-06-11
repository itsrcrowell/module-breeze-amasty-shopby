# Amasty Shopby Integration

Tested on Improved Layered Navigation by Amasty 4.0.0.

The price slider supports only the `Default` style.

## Required patches

`vendor/amasty/shopby/view/frontend/web/js/amShopbyAjax.js`

1. Replace the following code in the `callAjax` function (line 180):

```js
    return $.ajax({
        url: clearUrl,
        data: data,
        cache: true,
        success: function (response) {
            try {
                $.mage.amShopbyAjax.prototype.startAjax = false;

                response = JSON.parse(response);

                if (response.isDisplayModePage) {
                    throw new Error();
                }
```

with

```js
    return $.ajax({
        url: clearUrl,
        data: data,
        cache: true,
        success: function (response) {
            try {
                $.mage.amShopbyAjax.prototype.startAjax = false;

                response = typeof response === 'object' ? response : JSON.parse(response);// Breeze patch

                if (response.isDisplayModePage) {
                    throw new Error();
                }
```

2. In the same function, replace (line 220):

```js
        $(document).trigger('amshopby:ajax_filter_applied');
    } catch (e) {
        var url = self.clearUrl ? self.clearUrl : self.options.clearUrl;
        window.location = (this.url.indexOf('shopbyAjax') == -1) ? this.url : url;
    }
```

with

```js
        $(document).trigger('amshopby:ajax_filter_applied');
    } catch (e) {
        var url = self.clearUrl ? self.clearUrl : self.options.clearUrl;
        window.location = url; // Breeze patch
    }
```

3. In the `updateTopNavigation` function, replace (line 422):

```js
    if (!data.categoryProducts || data.categoryProducts.indexOf('amasty-catalog-topnav') == -1) {
        $topNavigation = $(this.selectors.top_navigation).first();
        $topNavigation.replaceWith(data.navigationTop);
        // we should reinitialize element - because it was replaced
        $topNavigation = $(this.selectors.top_navigation).first();
        $topNavigation.trigger('contentUpdated');
    }
```

with

```js
    if (!data.categoryProducts || data.categoryProducts.indexOf('amasty-catalog-topnav') == -1) {
        $topNavigation = $(this.selectors.top_navigation).first();
        if ($topNavigation.length) {
            $topNavigation.replaceWith(data.navigationTop);
            // we should reinitialize element - because it was replaced
            $topNavigation = $(this.selectors.top_navigation).first();
            $topNavigation.trigger('contentUpdated');
        }
    }
```

## Installation

```bash
composer require swissup/module-breeze-amasty-shopby
bin/magento setup:upgrade --safe-mode=1
```
