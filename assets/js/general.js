'use strict';

(function ($) {

    window.addEventListener('load', function () {
        //init all chains
        [].forEach.call($.querySelectorAll('div.taxonomy-chain-menu'), function (container) {
            new TaxonomyChainMenu(container);
        });

        //+++

        $.addEventListener('taxonomy-chain-menu', function (e) {
            //woocommerce products and wp posts table compatibility (WOOT(protas) && TABLEON)
            if (e.detail.container) {

                let container = e.detail.container;

                if (container.dataset.chain_id) {
                    table_connector(e.detail, container.dataset.chain_id);
                }

                if (container.dataset.doFilter) {
                    if (!Boolean(e.detail.is_from_ready_chain)) {
                        let request_data = e.detail.request_data;
                        let term_id = parseInt(request_data.term_id);
                        let slug = null;

                        let selection = Array.from(container.querySelectorAll('select.taxonomy-chain-menu-taxonomy')).reverse().find(function (item) {
                            return parseInt(item.value) > 0;
                        });

                        if (selection) {
                            slug = selection.options[selection.selectedIndex].dataset.slug;
                        }

                        if (term_id === 0) {
                            if (container.querySelectorAll('select').length > 1) {
                                term_id = parseInt(selection.value);
                            }
                        }

                        switch (container.dataset.doFilter) {
                            case 'woof':
                                let ready_chain = '';

                                if (container.dataset.readyChain) {
                                    ready_chain = container.dataset.readyChain;
                                }

                                ready_chain = container.dataset.readyChain.replace(/(,0)$/, '');

                                woof_current_values['ready_chain'] = term_id + ',' + '0';


                                if (ready_chain.length > 0) {
                                    woof_current_values['ready_chain'] = '';
                                    container.querySelectorAll('select.taxonomy-chain-menu-taxonomy').forEach((item) => {
                                        woof_current_values['ready_chain'] += item.value + ',';
                                    });
                                }

                                woof_current_values['ready_chain'] = woof_current_values['ready_chain'].replace(/(,)$/, '');

                                if (slug) {
                                    woof_current_values[container.dataset.taxonomy] = slug;
                                } else {
                                    delete woof_current_values[container.dataset.taxonomy];
                                    delete woof_current_values['ready_chain'];
                                }

                                woof_submit_link(woof_get_submit_link());
                                break;

                            default:
                                $.dispatchEvent(new CustomEvent('taxonomy-chain-menu-do-filter', {detail: {term_id, slug, container}}));
                                break;
                        }

                    } else {
                        $.querySelector('.woof_products_top_panel').remove();
                    }

                }
            }
        });

    });

    //connector for TABLEON && WOOT(PROTAS), uses in event 'taxonomy-chain-menu' only
    function table_connector(data, chain_id) {
        if (typeof DataTable23 !== 'undefined') {
            if (data.request_data.chain_id === chain_id) {
                let table = null;
                let request_data = data.request_data;
                let term_id = parseInt(request_data.term_id);

                if (term_id === 0) {
                    //if to deselect any select in the chain
                    if (data.container.querySelectorAll('select').length > 1) {
                        Array.from(data.container.querySelectorAll('select.taxonomy-chain-menu-taxonomy')).reverse().forEach(function (item) {
                            if (item.value > 0 && !term_id) {
                                term_id = parseInt(item.value);
                                return true;
                            }
                        });
                    }
                }

                if (request_data.connect_table) {
                    if (table = DataTable23.tables[request_data.connect_table]) {

                        if (term_id > 0) {
                            table.request_data.filter_data = {
                                [request_data.taxonomy]: term_id
                            };
                        } else {
                            delete table.request_data.filter_data[request_data.taxonomy];
                        }

                        table.redraw_table();
                    }
                }
            }
        }
    }


}
)(document);

class TaxonomyChainMenu {
    constructor(container) {
        this.cache = [];
        this.reflection = null;
        this.container = container;

        this._init_events();

        this._set_select_width();
        this._set_selectron23_height();

        //+++

        if (this.container.dataset.readyChain) {
            let data = this.container.dataset.readyChain.split(',');
            let last = data[data.length - 1];

            if (last !== '0') {
                let sels = this.container.querySelectorAll('select');
                if (this.container.dataset.watchView !== 'none') {
                    if (this.container.dataset.watchView === 'terms') {
                        if (sels[sels.length - 1].value > 0) {
                            let l = sels[sels.length - 1].options[sels[sels.length - 1].selectedIndex].dataset.link;
                            this.create_button(l, 'taxonomy-chain-menu-btn');
                        }
                    } else {
                        this.create_button((sels[sels.length - 1]).value);
                    }
                }
            }

            //+++
            let val = 0;
            this.container.querySelectorAll('select.taxonomy-chain-menu-taxonomy').forEach(function (item, index) {
                if (item.value > 0) {
                    val = item.value;
                }
            });

            if (val) {
                setTimeout(() => {
                    this.cast_event(this.prepare_request_data(val, 'taxonomy'), null, 1);
                }, 333);
            }
        }

        //+++
        //for outside connection
        Array.from(this.container.querySelectorAll('select.taxonomy-chain-menu-taxonomy')).forEach((select) => {
            this.append_select_changed_event(select);
        });

    }

    _init_events() {
        document.body.addEventListener('change', (e) => {
            if (e.target.tagName.toLowerCase() === 'select') {
                let select = e.target;

                if (select.parentNode === this.container) {
                    if (e.target.classList.contains('taxonomy-chain-menu-taxonomy')) {
                        this.trigger_taxonomy_select(select);
                    }

                    if (e.target.classList.contains('taxonomy-chain-menu-post')) {
                        this.trigger_post_select(select);
                    }
                }
            }

            return true;
        });
    }

    _set_selectron23_height() {
        let selectron23_height = [];
        if (this.container.dataset.selectron23_max_open_height) {
            selectron23_height = this.container.dataset.selectron23_max_open_height.split('|');
        }

        if (selectron23_height.length > 0) {
            this.container.querySelectorAll('select').forEach(function (item, index) {

                if (typeof selectron23_height[index] !== 'undefined') {
                    item.setAttribute('data-selectron23-open-height', selectron23_height[index]);
                } else {
                    item.setAttribute('data-selectron23-open-height', selectron23_height[selectron23_height.length - 1]);
                }

            });
        }
    }

    _set_select_width() {
        let select_width = [];
        if (this.container.dataset.selectWidth) {
            select_width = this.container.dataset.selectWidth.split('|');
        }

        if (select_width.length > 0) {
            this.container.querySelectorAll('select').forEach(function (item, index) {

                if (typeof select_width[index] !== 'undefined') {
                    item.style.maxWidth = item.style.width = select_width[index];
                } else {
                    item.style.maxWidth = item.style.width = select_width[select_width.length - 1];
                }

            });
        }
    }

    append_select_changed_event(select) {
        if (select.tagName.toLowerCase() === 'select') {
            let _this = this;
            select.addEventListener('taxonomy-chain-menu-select-changed', function (e) {

                if (e.detail.container === _this.container) {
                    this.value = e.detail.value;
                    if (this.options.length > 0) {
                        for (let i = 0; i < this.options.length; i++)
                        {
                            if (this.options[i].value.toString() == this.value.toString()) {
                                this.selectedIndex = i;
                                this.options[i].setAttribute('selected', true);
                            } else {
                                this.options[i].removeAttribute('selected');
                            }
                        }
                    }

                    if (this.classList.contains('taxonomy-chain-menu-post')) {
                        _this.trigger_post_select(this);
                    } else {
                        _this.trigger_taxonomy_select(this);
                    }
                }

            });
        }
    }

    trigger_taxonomy_select(select) {
        //let container = select.parentNode;
        let container = this.container;
        let term_id = parseInt(select.value);
        this.remove_siblings(select);

        if (this.reflection) {
            this.reflection.clone();
        }

        if (this.cache[term_id]) {
            if (this.cache[term_id]['node']) {
                if (this.cache[term_id]['node'].options.length > 0) {
                    for (let i = 0; i < this.cache[term_id]['node'].options.length; i++)
                    {
                        this.cache[term_id]['node'].options[i].removeAttribute('selected');//!!
                    }
                }
                container.appendChild(this.cache[term_id]['node']);
                container.querySelectorAll('select')[container.querySelectorAll('select').length - 1].value = 0;
            } else {
                this.create_button(this.cache[term_id]['text'], 'taxonomy-chain-menu-btn');
            }

            this.cast_event(this.cache[term_id]['request_data'], this.cache[term_id]['node']);

            if (this.reflection) {
                this.reflection.clone();
            }
        } else {

            let request_data = this.prepare_request_data(term_id, select.dataset.type);

            //+++

            let do_fetch = true;

            if (container.dataset.watchView === 'terms') {
                if (parseInt(select.options[select.selectedIndex].dataset.childCount) === 0) {
                    do_fetch = false;
                }
            }

            if (do_fetch) {
                if (term_id > 0) {
                    this.loader();

                    fetch(taxonomy_chain_menu.ajax_url, {
                        method: 'POST',
                        credentials: 'same-origin',
                        body: (function (data) {
                            const formData = new FormData();

                            Object.keys(data).forEach(function (k) {
                                formData.append(k, data[k]);
                            });

                            return formData;
                        })(request_data)
                    }).then(response => response.text()).then(text => {

                        const doc = (new DOMParser()).parseFromString(text, 'text/html');
                        let node = doc.body.querySelectorAll('*')[0];

                        this.loader(false);

                        if (node) {
                            container.appendChild(node);

                            this._set_select_width();
                            this._set_selectron23_height();

                            this.append_select_changed_event(node);
                            this.cache[term_id] = {request_data, node};
                        } else {
                            if (container.dataset.watchView !== 'none') {
                                if (container.dataset.watchView === 'posts') {
                                    container.appendChild(node);
                                    this.cache[term_id] = {request_data, node};
                                } else {
                                    this.create_button(text, 'taxonomy-chain-menu-btn');
                                    this.cache[term_id] = {request_data, text};
                                }
                            }
                        }


                        this.cast_event(request_data, node);

                        if (this.reflection) {
                            this.reflection.clone();
                        }

                    }).catch((err) => {
                        console.log(err);
                    });
                } else {
                    this.cast_event(request_data);
                }
            } else {
                this.create_button(select.options[select.selectedIndex].dataset.link, 'taxonomy-chain-menu-btn');
                if (this.reflection) {
                    this.reflection.clone();
                }
                this.cast_event(request_data);
            }
        }


    }

    trigger_post_select(select) {
        this.remove_siblings(select);
        if (parseInt(select.value) !== 0) {
            this.create_button(select.value);
        }

        if (this.reflection) {
            this.reflection.clone();
        }
    }

    cast_event(request_data, node = null, is_from_ready_chain = null) {
        let container = this.container;
        document.dispatchEvent(new CustomEvent('taxonomy-chain-menu', {detail: {request_data, container, node, is_from_ready_chain}}));
    }

    prepare_request_data(term_id, type) {
        let request_data = {
            action: 'taxonomy_chain_menu',
            count_of_selects: this.container.querySelectorAll('select').length,
            term_id,
            type
        };

        let dataset = Object.assign({}, this.container.dataset);

        if (Object.keys(dataset).length > 0) {
            Object.keys(dataset).forEach(function (key) {
                //keys normalizing from dataset
                request_data[key.replace(/([A-Z])/, '_$1').toLowerCase()] = dataset[key];
            });
        }

        return request_data;
    }

    create_button(href, class_name = 'taxonomy-chain-menu-btn') {
        let a = document.createElement('a');
        a.className = class_name;
        a.setAttribute('href', href);
        a.setAttribute('target', this.container.dataset.target);
        a.innerText = this.container.dataset.buttonTitle;
        this.container.appendChild(a);
    }

    remove_siblings(elem) {
        let siblings = (function (elem) {
            let matched = [];

            while (elem = elem.nextSibling) {
                if (elem.nodeType === 1) {
                    matched.push(elem);
                }
            }

            return matched;
        })(elem);

        if (siblings.length > 0) {
            siblings.forEach(function (item) {
                item.remove();
            });
        }
    }

    loader(create = true) {
        if (create) {
            let img = document.createElement('img');
            img.className = 'taxonomy-chain-menu-loader';
            img.setAttribute('src', taxonomy_chain_menu.loader);
            img.setAttribute('loading', 'lazy');
            this.container.appendChild(img);
            if (this.reflection) {
                this.reflection.append(img.cloneNode(true));
            }
            return true;
        }

        this.container.querySelector('img.taxonomy-chain-menu-loader').remove();
    }
}


