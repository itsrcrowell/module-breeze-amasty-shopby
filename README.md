# Amasty Shopby Integration

## Required patches

`vendor/amasty/shopby/view/frontend/templates/layer/filter/category/labels_folding.phtml`

Replace

```html
<script>
    // initialize component by emulation behaviour of x-magento-init but without waiting of DOM load
    require([
        'mage/apply/main'
    ], function (main) {
        main.applyFor(
            '.am-filter-items-<?= /* @noEscape */ $filterCode ?>',
            {
                "mode": "folding",
                "collapseSelector": "<?= $block->isTopNav() ? '.amasty-catalog-topnav' : '.sidebar' ?>"
            },
            'amShopbyFilterCollapse'
        );
    });
</script>
```

with

```html
<script type="text/x-magento-init">
    {
        ".am-filter-items-<?= $filterCode ?>": {
            "Amasty_Shopby/js/components/amShopbyFilterCollapse": {
                "mode": "folding",
                "collapseSelector": "<?= $block->isTopNav() ? '.amasty-catalog-topnav' : '.sidebar' ?>"
            }
        }
    }
</script>
```

## Installation

```bash
composer require swissup/module-breeze-amasty-shopby
bin/magento setup:upgrade --safe-mode=1
```
