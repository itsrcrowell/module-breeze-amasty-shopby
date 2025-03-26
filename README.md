# Amasty Shopby Integration

Tested on Improved Layered Navigation by Amasty 3.3.0

## Required patches

`vendor/amasty/shopby/view/frontend/web/js/amShopbyAjax.js`

Replace the following code in the `callAjax` function (line 180):

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

## Installation

```bash
composer require swissup/module-breeze-amasty-shopby
bin/magento setup:upgrade --safe-mode=1
```
