<?php

/*
  Plugin Name: Taxonomy Chain Menu
  Plugin URI: https://pluginus.net/shop/wordpress-plugins/taxonomy-chain-menu/
  Description: Chain menu of taxonomies terms realized as chain of drop-downs. Example: [taxonomy_chain_menu post_type='product' taxonomy='product_cat' parent_id=0 exclude='36,12' watch_view='posts' show_count=1 button_title='Watch It' target='_blank' label_taxonomy='Producer|Model' label_post='Select car']
  Requires at least: WP 3.5
  Tested up to: WP 6.3
  Author: realmag777
  Author URI: https://pluginus.net/
  Version: 1.0.8
  Requires PHP: 7.2
  Tags: taxonomy menu, taxonomy, chain, menu, woocommerce, products, filter
  Text Domain: taxonomy-chain-menu
  Domain Path: /languages
  WC requires at least: 3.6
  WC tested up to: 8.0
  Forum URI: https://pluginus.net/support/forum/taxonomy-chain-menu/
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

add_action('before_woocommerce_init', function () {
    if (class_exists('\Automattic\WooCommerce\Utilities\FeaturesUtil')) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
    }
});


define('TAXONOMY_CHAIN_MENU_VER', '1.0.8');

//23-03-2021
class TaxonomyChainMenu {

    public $plugin_url = null;
    public static $enable_selectron23 = false;
    public $show_info = true;

    public function __construct() {
        $this->plugin_url = plugin_dir_url(__FILE__);

        add_action('wp_ajax_taxonomy_chain_menu', array($this, 'get_chain_item'));
        add_action('wp_ajax_nopriv_taxonomy_chain_menu', array($this, 'get_chain_item'));

        add_action('init', function() {
            add_shortcode('pn_chain_menu', array($this, 'draw_chain_menu')); //for backward compatibility
            add_shortcode('taxonomy_chain_menu', array($this, 'draw_chain_menu'));
            load_plugin_textdomain('taxonomy-chain-menu', false, dirname(plugin_basename(__FILE__)) . '/languages');
        }, 1);

        add_filter('plugin_action_links_' . plugin_basename(__FILE__), function($links) {
            $buttons = array_merge(['<a href="https://pluginus.net/shop/wordpress-plugins/wordpress-filter-plugins/taxonomy-chain-menu#shortcode-attributes" target="_blank">' . __('Documentation', 'taxonomy-chain-menu') . '</a>'], $links);

            if ($this->show_info) {
                $buttons[] = '<a target="_blank" style="color: red; font-weight: bold;" href="https://pluginus.net/shop/wordpress-plugins/wordpress-filter-plugins/taxonomy-chain-menu/">' . esc_html__('Go Pro!', 'taxonomy-chain-menu') . '</a>';
            }

            return $buttons;
        });
    }

    //ajax
    public function get_chain_item() {
        $request = $this->sanitize_request_data($_REQUEST);
        $childs = [];

        if ($request['type'] === 'taxonomy') {
            $childs = $this->get_terms($request);
        }

        $res = '';

        if (!empty($childs)) {
            $res = $this->generate_tax_select($request);
        } else {
            if ($request['watch_view'] !== 'none') {
                if ($request['watch_view'] === 'terms') {
                    $res = get_term_link(intval($request['term_id']), $request['taxonomy']);
                } else {
                    $res = $this->generate_post_select($request);
                }
            }
        }

        die($res);
    }

    //shortcode
    public function draw_chain_menu($args) {
        add_action('wp_footer', function() {

            if (self::$enable_selectron23) {
                wp_enqueue_style('taxonomy-chain-menu-selectron23', $this->plugin_url . 'assets/css/selectron23.css', [], TAXONOMY_CHAIN_MENU_VER);
                wp_register_script('taxonomy-chain-menu-selectron23', $this->plugin_url . 'assets/js/selectron23.js', [], TAXONOMY_CHAIN_MENU_VER);
                wp_register_script('taxonomy-chain-menu-reflector', $this->plugin_url . 'assets/js/reflector.js', ['taxonomy-chain-menu-selectron23'], TAXONOMY_CHAIN_MENU_VER);
                wp_enqueue_style('taxonomy-chain-menu', $this->plugin_url . 'assets/css/styles.css', [], TAXONOMY_CHAIN_MENU_VER);
                wp_register_script('taxonomy-chain-menu', $this->plugin_url . 'assets/js/general.js', ['taxonomy-chain-menu-reflector'], TAXONOMY_CHAIN_MENU_VER);
            } else {
                wp_enqueue_style('taxonomy-chain-menu', $this->plugin_url . 'assets/css/styles.css', [], TAXONOMY_CHAIN_MENU_VER);
                wp_register_script('taxonomy-chain-menu', $this->plugin_url . 'assets/js/general.js', [], TAXONOMY_CHAIN_MENU_VER);
            }

            wp_localize_script('taxonomy-chain-menu', 'taxonomy_chain_menu', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'plugin_uri' => $this->plugin_url,
                'loader' => apply_filters('taxonomy-chain-menu-loader', $this->plugin_url . 'assets/img/ajax-loader.gif')
            ));

            wp_enqueue_script('taxonomy-chain-menu');
        }, 1);

        //+++

        if (empty($args)) {
            $args = [];
        }

        $args['term_id'] = 0;
        if (isset($args['parent_id'])) {
            $args['term_id'] = intval($args['parent_id']);
        }

        $label_taxonomy = '';
        if (isset($args['label_taxonomy'])) {
            $label_taxonomy = $this->filter_label($args['label_taxonomy'], $args);
        }

        $label_post = __('Select post', 'taxonomy-chain-menu');
        if (isset($args['label_post'])) {
            $label_post = $this->filter_label($args['label_post'], $args);
        }

        $button_title = __('GO!', 'taxonomy-chain-menu');
        if (isset($args['button_title'])) {
            $button_title = $this->filter_label($args['button_title'], $args);
        }

        $watch_view = isset($args['watch_view']) && !empty($args['watch_view']) ? $args['watch_view'] : 'posts';

        $post_type = 'post';
        //old attribute for compatibility, changed to post_type in docs
        if (isset($args['post_slug'])) {
            $post_type = $args['post_slug'];
        }

        if (isset($args['post_type'])) {
            $post_type = $args['post_type'];
        }

        if (!isset($args['taxonomy'])) {
            $args['taxonomy'] = 'category';
        }

        $fields = [
            'taxonomy' => $args['taxonomy'],
            'exclude' => isset($args['exclude']) ? $args['exclude'] : '',
            'include' => isset($args['include']) ? $args['include'] : '',
            'include_top' => isset($args['include_top']) ? $args['include_top'] : '',
            'show-count' => isset($args['show_count']) ? $args['show_count'] : 0,
            'post-type' => $post_type,
            'watch-view' => $watch_view,
            'label-taxonomy' => $label_taxonomy,
            'label-post' => $label_post,
            'button-title' => $button_title,
            'target' => '_self',
            'chain_id' => isset($args['chain_id']) ? $args['chain_id'] : '',
            'connect-table' => isset($args['connect_table']) ? $args['connect_table'] : '',
            'ready-chain' => '',
            'do-filter' => isset($args['do_filter']) ? $args['do_filter'] : '',
            'select_wrapper' => '',
            'selectron23_max_open_height' => isset($args['selectron23_max_open_height']) ? $args['selectron23_max_open_height'] : '',
            'select-width' => isset($args['select_width']) ? $args['select_width'] : '',
            'max_posts_count' => isset($args['max_posts_count']) ? $args['max_posts_count'] : '',
            'posts-orderby' => isset($args['posts_orderby']) ? $args['posts_orderby'] : 'title',
            'posts-order' => isset($args['posts_order']) ? $args['posts_order'] : 'ASC',
            'posts_order_meta_key' => isset($args['posts_order_meta_key']) ? $args['posts_order_meta_key'] : ''
        ];

        $taxonomies = get_object_taxonomies($fields['post-type']);
        if (!in_array($fields['taxonomy'], $taxonomies)) {
            echo '<div class="taxonomy-chain-menu-notice">' . __('Taxonomy Chain Menu: select right pair of post type and its taxonomy!', 'taxonomy-chain-menu') . '</div>';
            return false;
        }

        $html = "<div class='taxonomy-chain-menu'";

        foreach ($fields as $key => $value) {
            $html .= " data-{$key}='{$value}'";
        }


        $label_before = '';

        $html .= ">{$label_before}";
        $html .= $this->generate_tax_select($args);
        $html .= '</div>';

        return $html;
    }

    private function generate_tax_select($args, $selected = 0) {
        $terms = $this->get_terms($args);

        if (!empty($terms)) {

            $label = '';
            if (isset($args['label_taxonomy']) && !empty($args['label_taxonomy'])) {
                $label = $this->filter_label($args['label_taxonomy'], $args);
            }

            if (empty($label)) {
                $label = __('Select category', 'taxonomy-chain-menu');
            }

            //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

            $data = [
                'css_class' => 'taxonomy-chain-menu-taxonomy',
                'data-fields' => [
                    'type' => 'taxonomy',
                //'term-link' => isset($args['term_id']) && $args['term_id'] > 0 ? get_term_link(intval($args['term_id']), $args['taxonomy']) : ''
                ],
                'label' => $label,
                'options' => [],
                'options_fields' => []
            ];

            $options = [
                0 => $label
            ];

            foreach ($terms as $t) {
                $option = $t['name'];

                if (isset($args['show_count']) && intval($args['show_count'])) {
                    $option .= " ({$t['count']})";
                }

                $options[$t['term_id']] = $option;

                if (intval($t['term_id']) > 0) {
                    $data['options_fields'][$t['term_id']]['slug'] = (get_term(intval($t['term_id']), $args['taxonomy']))->slug;
                }

                if (isset($args['watch_view']) && $args['watch_view'] === 'terms') {
                    $data['options_fields'][$t['term_id']]['link'] = get_term_link(intval($t['term_id']), $args['taxonomy']);
                    $data['options_fields'][$t['term_id']]['child-count'] = wp_count_terms(array(
                        'taxonomy' => $args['taxonomy'],
                        'hide_empty' => true,
                        'parent' => intval($t['term_id'])
                    ));
                }
            }

            $data['options'] = $options;
            $parent_id = 0;
            if (isset($args['parent_id'])) {
                $parent_id = intval($args['parent_id']);
            }
            if (isset($args['term_id'])) {
                $parent_id = intval($args['term_id']);
            }

            $chain_id = '';
            if (isset($args['chain_id'])) {
                $chain_id = $args['chain_id'];
            }
            return $this->draw_select($data, $selected, $args['taxonomy'], $parent_id, $chain_id);
        }

        return '';
    }

    private function generate_post_select($args, $selected = '') {
        $posts_per_page = -1;
        if (isset($args['max_posts_count'])) {
            $posts_per_page = intval($args['max_posts_count']);
        }

        $posts_orderby = 'title'; //see also: meta_value_num, meta_value
        if (isset($args['posts_orderby']) AND!empty($args['posts_orderby'])) {
            $posts_orderby = $args['posts_orderby'];
        }

        $posts_order = 'ASC';
        if (isset($args['posts_order']) AND!empty($args['posts_order'])) {
            $posts_order = $args['posts_order'];
        }

        //+++

        $posts_args = [
            'posts_per_page' => $posts_per_page,
            'orderby' => $posts_orderby,
            'order' => $posts_order,
            'post_type' => $args['post_type'],
            'tax_query' => array(
                'relation' => 'AND',
                array(
                    'taxonomy' => $args['taxonomy'],
                    'field' => 'term_id',
                    'terms' => $args['term_id']
                )
            )
        ];

        //for order by meta key
        if (isset($args['posts_order_meta_key']) AND!empty($args['posts_order_meta_key'])) {
            $posts_args['meta_key'] = $args['posts_order_meta_key'];
        }

        $posts = get_posts($posts_args);

        $label = isset($args['label_post']) ? $args['label_post'] : __('Select post', 'taxonomy-chain-menu');

        if (!empty($posts)) {
            $data = [
                'css_class' => 'taxonomy-chain-menu-post',
                'data-fields' => [
                    'type' => 'post'
                ],
                'label' => $label,
                'options' => [0 => $label],
                'options_fields' => []
            ];


            foreach ($posts as $post) {
                $data['options'][get_permalink($post->ID)] = $post->post_title;
                if ($selected === $post->ID) {
                    $selected = get_permalink($post->ID);
                }

                $data['options_fields'][get_permalink($post->ID)] = [
                    'post-id' => $post->ID
                ];
            }

            $chain_id = '';
            if (isset($args['chain_id'])) {
                $chain_id = $args['chain_id'];
            }

            return $this->draw_select($data, $selected, 'is_post', 0, $chain_id);
        }


        return '';
    }

    private function get_terms($args) {

        $parent_id = isset($args['term_id']) ? intval($args['term_id']) : 0;

        $exclude = [];

        if (isset($args['exclude'])) {
            if (is_string($args['exclude']) && !empty($args['exclude'])) {
                $exclude = array_map(function($term_id) {
                    return intval($term_id);
                }, explode(',', $args['exclude']));
            }
        }


        $include = [];

        if (isset($args['include'])) {
            if (is_string($args['include']) && !empty($args['include'])) {
                $include = array_map(function($term_id) {
                    return intval($term_id);
                }, explode(',', $args['include']));
            }
        }


        $include_top = [];

        if ($parent_id === 0) {
            if (isset($args['include_top']) AND!empty($args['include_top'])) {
                if (is_string($args['include_top']) && !empty($args['include_top'])) {
                    $include_top = array_map(function($term_id) {
                        return intval($term_id);
                    }, explode(',', $args['include_top']));
                }

                $include = $include_top;
            }
        }

        //***

        $cats_objects = get_categories(array(
            'orderby' => 'name',
            'order' => 'ASC',
            'style' => 'list',
            'show_count' => isset($args['show_count']) ? intval($args['show_count']) : 0,
            'hide_empty' => 1,
            'use_desc_for_title' => 1,
            'parent' => $parent_id,
            'hierarchical' => true,
            'title_li' => '',
            'show_option_none' => '',
            'number' => NULL,
            'echo' => 0,
            'depth' => 0,
            'current_category' => 0,
            'pad_counts' => 0,
            'exclude' => $exclude,
            'include' => $include,
            'taxonomy' => isset($args['taxonomy']) && !empty($args['taxonomy']) ? $args['taxonomy'] : 'category',
            'walker' => 'Walker_Category'
        ));

        $cats = [];

        if (!empty($cats_objects)) {
            foreach ($cats_objects as $t) {
                if (is_object($t)) {
                    $cats[$t->term_id] = [];
                    $cats[$t->term_id]['term_id'] = $t->term_id;
                    $cats[$t->term_id]['name'] = $t->name;
                    $cats[$t->term_id]['count'] = $t->count;
                }
            }
        }

        return $cats;
    }

    private function draw_select($data, $selected = 0, $taxonomy = '', $parent_id = 0, $chain_id = '') {
        $select = '<select';

        if (isset($data['css_class'])) {
            $select .= " class='{$data['css_class']}'";
        }

        if (isset($data['data-fields']) && !empty($data['data-fields'])) {
            foreach ($data['data-fields'] as $key => $value) {
                $select .= " data-{$key}='{$value}'";
            }
        }

        $select .= '>';

        if (!empty($data['options'])) {
            foreach ($data['options'] as $value => $label) {
                $sel = (strval($selected) === strval($value)) ? 'selected' : '';
                $text = '';
                $img = '';

                if ($taxonomy === 'is_post') {
                    $post_id = 0;
                    if (isset($data['options_fields'][$value]['post-id'])) {
                        $post_id = intval($data['options_fields'][$value]['post-id']);
                    }
                    $option_data = apply_filters('taxonomy-chain-menu-option-data', $post_id, $taxonomy, 0, $chain_id);
                } else {
                    $option_data = apply_filters('taxonomy-chain-menu-option-data', $value, $taxonomy, $parent_id, $chain_id);
                }

                if (isset($option_data['text'])) {
                    $text = $option_data['text'];
                }

                if (isset($option_data['img'])) {
                    $img = $option_data['img'];
                }

                $select .= "<option {$sel} data-text='{$text}' data-img='{$img}' value='{$value}'";

                if (isset($data['options_fields'][$value]) && !empty($data['options_fields'][$value])) {
                    foreach ($data['options_fields'][$value] as $k => $v) {
                        $select .= " data-{$k}='{$v}'";
                    }
                }

                $select .= ">{$label}</option>";
            }
        }

        $select .= '</select>';
        return $select;
    }

    private function filter_label($label, $args) {
        $res = $label;

        if (substr($res, 0, 12) === 'call_filter_') {
            $res = apply_filters(substr($res, 12), $args);
            if (is_array($res)) {
                $res = $label;
            }
        }

        return $res;
    }

    //normalize data keys and sanitize values from frontend
    private function sanitize_request_data($request_data) {
        $res = [];

        if (!empty($request_data)) {
            foreach ($request_data as $key => $value) {
                //$key = preg_replace('/([A-Z])/', '_$0', $key);//in js
                $res[strtolower($key)] = sanitize_textarea_field($value);
            }
        }

        return $res;
    }

}

new TaxonomyChainMenu();

