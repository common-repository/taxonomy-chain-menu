=== Taxonomy Chain Menu ===
Contributors: RealMag777
Donate link: https://pluginus.net/shop/wordpress-plugins/wordpress-filter-plugins/taxonomy-chain-menu/
Tags: taxonomy chain menu, filter, menu, taxonomy, taxonomies, terms, woof, tableon, woot
Requires at least: 4.1.0
Tested up to: 6.3
Requires PHP: 4.2
Stable tag: trunk
License: GPLv2
License URI: https://www.gnu.org/licenses/gpl-2.0.html


Taxonomy Chain Menu – allows to create taxonomies terms chain menus using dropdowns with inbuilt or custom types of WordPress taxonomies.

== Description ==

**Taxonomy Chain Menu**  is WordPress plugin with one shortcode, which allows to create taxonomies terms chain menus using dropdowns with inbuilt or custom types of WordPress taxonomies.

Taxonomy Chain Menu is available as one shortcode: [[taxonomy_chain_menu]](https://pluginus.net/shop/wordpress-plugins/wordpress-filter-plugins/taxonomy-chain-menu#tab-description) with heap of attributes described below.
Compatible with [WOOF filtration behavior](https://demo.products-filter.com/taxonomy-chain-menu/)!

### Demo Pages:
* [Demo page 1](http://cars.wp-filter.com/simple-taxonomy-chain-menu/)
* [Demo Ready Chain (premium feature)](http://woocommerce.wp-filter.com/simple-taxonomy-chain-menu-2/)
* [Compatible with TABLEON](https://demo.posts-table.com/taxonomy-chain-menu/)
* [Compatible with PROTAS](https://demo.products-tables.com/taxonomy-chain-menu/)
* [Compatible with WOOF](https://demo.products-filter.com/taxonomy-chain-menu/)


Latest PHP 8.x – COMPATIBLE!


### Taxonomy Chain Menu Features (shortcode attributes):

&#9989;&nbsp;**post_slug**: post type to use in the chain menu. Default slug is 'post'.

&#9989;&nbsp;**taxonomy**: taxonomy terms to navigate. Default taxonomy is 'category'.

&#9989;&nbsp;**parent_id**: started term ID, 0 means top parents. Default slug is 0.

&#9989;&nbsp;**exclude**: terms ids to hide from the chain. For example: 12,44,73.  

&#9989;&nbsp;**include**: terms ids to show. Opposite to 'exclude'. For example: 11,43,72.

&#9989;&nbsp;**include_top**: terms ids related to the top parent terms only (parent == 0). For example: 10,42,71.

&#9989;&nbsp;**show_count**: show/hide count of posts in the terms in drop-downs options. Default value is 0.

&#9989;&nbsp;**watch_view**: values: 'posts',  'terms', 'none'. What to show on the end of the chain. Posts - drop-down with posts. Terms - button with the link to posts of the selected term in the last drop-down. None - nothing, good to apply with products tables filtering.

&#9989;&nbsp;**label_taxonomy**:  label(s) of the drop-down(s). Example: 'Producer'. Also it is possible to use custom actions (<em>must started from 'call_filter_'</em>) for translations, example: [taxonomy_chain_menu label_taxonomy='call_filter_chain1' label_post='call_filter_chain1-post']. In file functions.php add next code:

`
add_filter('chain1', function($args) {
 
    $res = 'Producer';
    //for WPML compatibility as an example
    if (defined('ICL_LANGUAGE_CODE')) {
        switch (ICL_LANGUAGE_CODE) {
            case 'es':
                $res = 'Productor';
                break;
            case 'uk':
                $res = 'Виробник';
                break;
        }
    }
 
    return $res;
}, 10, 1);
`

&#9989;&nbsp;**label_post**: label of the posts drop-down. To use action instead of text in file functions.php add next code: (<em>must started from 'call_filter_'</em>)
`
add_filter('chain1-post', function($args) {
 
    $res = 'Select car';
    //for WPML compatibility as an example
    if (defined('ICL_LANGUAGE_CODE')) {
        switch (ICL_LANGUAGE_CODE) {
            case 'es':
                $res = 'Seleccionar coche';
                break;
            case 'uk':
                $res = 'Яке твое авто';
                break;
            default:
                $res = 'Select your car';
                break;
        }
    }
 
    return $res;
}, 10, 1);
`

&#9989;&nbsp;**button_title**: title of the button at the end of the chain. By default it is 'GO!'. Also is possible to use action (<em>must started from 'call_filter_'</em>), example: [taxonomy_chain_menu post_slug='product' taxonomy='product_cat' button_title='call_filter_chain1-btn']
`
add_filter('chain1-btn', function($args) {
 
    $res = 'Take it!';
    //for WPML compatibility as an example
    if (defined('ICL_LANGUAGE_CODE')) {
        switch (ICL_LANGUAGE_CODE) {
            case 'es':
                $res = 'Tomar lo!';
                break;
            case 'uk':
                $res = 'Забираймо!';
                break;
        }
    }
 
    return $res;
}, 10, 1);
`

&#9989;&nbsp;**chain_id**: (<em>for developers</em>)unique JavaScript identifier for javascript event 'taxonomy-chain-menu' and in custom WordPress actions

&#9989;&nbsp;**connect_table**: unique identifier of posts/products table (TABLEON or WOOT) set in table shortcode attribute or its backend settings. It is possible to use Taxonomy Chain Menu as filter with posts and products table plugins: [TABLEON - WordPress Posts Table Filterable](https://posts-table.com/) and [WOOT - WooCommerce Products Table](https://products-tables.com/)
Such scripts cooperation is possible thanks to JavaScript event 'taxonomy-chain-menu' and shortcode attributes 'chain_id' with attribute 'connect_table'

&#9989;&nbsp;**do_filter**: accepts from the box only one value - 'woof' ([demo](https://demo.products-filter.com/taxonomy-chain-menu)), but it is possible to adapt any another wordpress/woocommerce filter plugin (<em>for developers</em>) using js event taxonomy-chain-menu-do-filter and values there: e.detail.term_id, e.detail.slug, e.detail.container. Example: [taxonomy_chain_menu post_slug='product' taxonomy='product_cat' do_filter='woof']

&#9989;&nbsp;**select_width**: widths for drop-downs in chain. Use one value or some separated by '|'. Examples: '300px', '300px|250px|20%'. Last value is actual for drop-downs in chain with number 3 and more.

&#9989;&nbsp;**max_posts_count**: set maximum count of posts in posts drop-down

&#9989;&nbsp;**posts_orderby**: how to order posts in posts drop-down (by title, id, meta). By default: title.

&#9989;&nbsp;**posts_order**: posts order direction in posts drop-down. Possible values: ASC, DESC

&#9989;&nbsp;**posts_order_meta_key**: here is meta key by which posts in posts drop-down should be ordered. Be care - meta values should exist in the requested posts. Example: [taxonomy_chain_menu post_slug='product' taxonomy='product_cat' posts_orderby='meta_value_num' posts_order_meta_key='prod_1' posts_order='DESC']

&#9989;&nbsp;**no jQuery - pure JavaScript!**



### PREMIUM FEATURES

&#9989;&nbsp;All features above

&#9989;&nbsp;**target**: how to open selected post/terms page. Default is: '_self' (opening in the same browser tab). To open in another tab use: '_blank'

&#9989;&nbsp;**syntax for label_taxonomy**: as an example - 'Producer|Model', such syntax allows to set individual title for each drop-down in the chain

&#9989;&nbsp;**label_before**: any words before first drop-down. Also it is possible to set text through action (<em>must started from 'call_filter_'</em>): ([taxonomy_chain_menu post_slug='product' taxonomy='product_cat' label_before='call_filter_chain1-before'])

&#9989;&nbsp;**ready_chain**: allows to display pre-selected values in the chain menu, example - [taxonomy_chain_menu watch_view='posts' ready_chain='17,20,post(51)'] - at the end of the chain will be displayed drop-down with posts and button with the link to the selected post. If exists more sub-categories use 0 (zero) at the end: [taxonomy_chain_menu ready_chain='17,20,0']. [See example](https://woocommerce.wp-filter.com/simple-taxonomy-chain-menu-2/).

&#9989;&nbsp;**select_wrapper**: has only one value 'selectron23' and allows to wrap drop-down in reach html-element Selectron23. Just [look an example](https://demo.products-filter.com/taxonomy-chain-menu/?swoof=1&ready_chain=9,66,0&product_cat=wooman) please to understand!

&#9989;&nbsp;Compatible with [WPML](https://wpml.org/plugin/taxonomy-chain-menu/) automatically, no actions need.


**Get Premium version of the plugin**: [on PluginUs.Net](https://pluginus.net/shop/wordpress-plugins/wordpress-filter-plugins/taxonomy-chain-menu/)



### Make your site more profitable with next powerful scripts:

&#9989;&nbsp;[WOOF - Products Filter for WooCommerce](https://wordpress.org/plugins/woocommerce-products-filter/): is an extendable, flexible and robust plugin for WooCommerce that allows your site customers filter products by products categories, attributes, tags, custom taxonomies and price. Supports latest version of the WooCommerce plugin. A must have plugin for your WooCommerce powered online store! Maximum flexibility!

&#9989;&nbsp;[WOOCS - WooCommerce Currency Switcher](https://wordpress.org/plugins/woocommerce-currency-switcher/): is WooCommerce multi currency plugin, that allows your shop customers switch products prices currency according to the set rates in the real time and pay in the selected currency (optionally). Allows to add any currency to you WooCommerce store! The best woo currency switcher plugin for WooCommerce e-shop!

&#9989;&nbsp;[BEAR - Bulk Editor for WooCommerce](https://wordpress.org/plugins/woo-bulk-editor/): WordPress plugin for managing and bulk edit WooCommerce Products data in robust and flexible way! Be professionals with managing data of your woocommerce e-shop!

&#9989;&nbsp;[WPBE - WordPress Posts Bulk Editor Professional](https://wordpress.org/plugins/bulk-editor/): is WordPress plugin for managing and bulk edit WordPress posts, pages and custom post types data in robust and flexible way! Be professionals with managing data of your site!

&#9989;&nbsp;[PROTAS - WooCommerce Active Products Tables](https://wordpress.org/plugins/profit-products-tables-for-woocommerce/): is WooCommerce plugin for displaying shop products in table format. Tables makes focus for your buyers on the things they want to get, nothing superfluous, just what the client wants, and full attention to what is offered!

&#9989;&nbsp;[TABLEON - WordPress Post Tables Filterable](https://wordpress.org/plugins/posts-table-filterable): WordPress plugin for displaying site posts and their custom post types in table format. Tables makes focus for your customers on the things they want to get, nothing superfluous, just what the client wants, and full attention to what is offered!

&#9989;&nbsp;[MDTF - WordPress Meta Data Filter & Taxonomies Filter](https://wp-filter.com/): the plugin for filtering and searching WordPress content in posts and their custom types by taxonomies and meta data fields. The plugin has very high flexibility thanks to its rich filter elements and in-built meta fields constructor!

&#9989;&nbsp;[WPCS - WordPress Currency Switcher](https://wordpress.org/plugins/currency-switcher/): is a WordPress plugin that allows to switch currencies and get their rates converted in the real time on your site!



== Installation ==
* Download to your plugin directory or simply install via Wordpress admin interface.
* Activate.
* Use.


== Frequently Asked Questions ==

Q: Where can I see demo?
R: [Demo page 1](http://cars.wp-filter.com/simple-taxonomy-chain-menu/)
R: [Demo Ready Chain (premium feature)](http://woocommerce.wp-filter.com/simple-taxonomy-chain-menu-2/)
R: [Compatible with TABLEON](https://demo.posts-table.com/taxonomy-chain-menu/)
R: [Compatible with PROTAS](https://demo.products-tables.com/taxonomy-chain-menu/)
R: [Compatible with WOOF](https://demo.products-filter.com/taxonomy-chain-menu/)

Q: Documentation?
R: [www.pluginus.net](https://pluginus.net/shop/wordpress-plugins/wordpress-filter-plugins/taxonomy-chain-menu/)

Q: Video?
R: [www.youtube.com](https://www.youtube.com/watch?v=q75upi1ldZg&ab_channel=PluginUs.NET)

Q: Where to buy?
R: [www.pluginus.net](https://pluginus.net/shop/wordpress-plugins/wordpress-filter-plugins/taxonomy-chain-menu/)

Q: Support?
R: [www.pluginus.net](https://pluginus.net/support/forum/taxonomy-chain-menu/)


== Screenshots ==
1. Basic view

== Changelog ==

= 1.0.8 =
* select_width: widths for drop-downs in chain. Use one value or some separated by '|'. Examples: '300px', '300px|250px|20%'. Last value is actual for drop-downs in chain with number 3 and more.
* max_posts_count: set maximum count of posts in posts drop-down
* posts_orderby: how to order posts in posts drop-down (by title, id, meta). By default: title.
* posts_order: posts order direction in posts drop-down. Possible values: ASC, DESC
* posts_order_meta_key: here is meta key by which posts in posts drop-down should be ordered. Be care - meta values should exist in the requested posts. Example: [taxonomy_chain_menu post_slug='product' taxonomy='product_cat' posts_orderby='meta_value_num' posts_order_meta_key='prod_1' posts_order='DESC']

= 1.0.7.2 =
Plugin release. Operate all the basic functions.



== License ==

This plugin is copyright pluginus.net &copy; 2012-2023 with [GNU General Public License][] by realmag777.

This program is free software; you can redistribute it and/or modify it under the terms of the [GNU General Public License][] as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY. See the GNU General Public License for more details.

[GNU General Public License]: http://www.gnu.org/copyleft/gpl.html



== Upgrade Notice ==
[Look here for ADVANCED version of the plugin](https://pluginus.net/shop/wordpress-plugins/wordpress-filter-plugins/taxonomy-chain-menu/)

