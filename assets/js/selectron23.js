/*!
 * Selectron23 v.1.0.2 // 2021.03.22
 * https://github.com/realmag777/selectron23
 *
 * You may use Selectron23 under the terms of the MIT license. Basically that
 * means you are free to use Selectron23 as long as this header is left intact.
 * Copyright 2021 Rostislav Sofronov
 */

'use strict';
//22-03-2021
class Selectron23 {
    constructor(element, data = {}) {
        this.data = data;
        Selectron23.z_index = 9999;

        this.el = document.createElement('div');
        this.el.className = 'selectron23';
        this.element = element;
        this.element.insertAdjacentElement('afterend', this.el);

        if (this.element.tagName.toLowerCase() === 'select') {
            //select replacement
            this.element.style.display = 'none';
            if (this.element.hasAttribute('style')) {
                if (this.element.style.width) {
                    this.data.width = this.element.style.width;
                }
            }

            let selected = null;
            let options = this.element.querySelectorAll('option');
            if (options.length > 0) {
                let fusion = Boolean(this.data.fusion);

                let opt = [];
                options.forEach((o) => {

                    let d = {
                        value: o.value,
                        title: o.textContent
                    };

                    if (o.hasAttribute('data-img') && o.getAttribute('data-img').length > 0) {
                        d.img = o.getAttribute('data-img');
                    }

                    if (o.hasAttribute('data-text') && o.getAttribute('data-text').length > 0) {
                        d.text = o.getAttribute('data-text');
                    }

                    opt.push(d);

                    if (o.hasAttribute('selected')) {
                        selected = o.value;
                    }
                });

                //data fusion
                if (fusion) {
                    this.data.options.forEach((o) => {
                        opt = opt.map((op) => {
                            if (op.value.toString() === o.value.toString()) {
                                op = o;
                            }

                            return op;
                        });
                    });
                }

                //+++

                this.data.options = opt;

                if (selected !== null) {
                    this.data.selected = selected;
                }
            }

            //+++

            if (Object.keys(this.element.dataset).length > 0) {
                Object.keys(this.element.dataset).forEach((key) => {
                    this.data[key] = this.element.dataset[key];
                });
            }

        }

        //+++

        this.container = null;
        this.value = null;
        this.input = null;

        this._draw();
        this.el.querySelector('*').addEventListener('click', ev => this._click(ev));
        document.addEventListener('click', ev => this.show(false));
        return this;
    }

    _draw() {

        if (this.data.options.length > 0) {

            this.container = document.createElement('div');
            this.container.className = 'selectron23-container';
            this.el.appendChild(this.container);
            this.container.setAttribute('data-opened', 0);

            this.data.options.forEach((o) => {
                this.append(o);
            });

            this.pointer = document.createElement('span');
            this.pointer.setAttribute('data-pointer', 1);
            this.container.appendChild(this.pointer);
        }

        if (typeof this.data.selected !== 'undefined') {
            this.select(this.data.selected);
        } else {
            if (typeof this.data.label !== 'undefined' && this.data.label.length > 0) {
                let option = document.createElement('div');
                option.setAttribute('data-label', 1);
                option.className = 'selectron23-option';
                option.innerHTML = `<div>${this.data.label}</div>`;
                this.container.insertAdjacentElement('afterbegin', option);
            } else {
                this.container.querySelector('div').setAttribute('data-selected', 1);
            }
        }

        if (typeof this.data.width !== 'undefined') {
            //this.container.style.width = this.data.width;
            this.el.style.flexBasis = this.el.style.width = this.data.width;
        }

        if (typeof this.data.name !== 'undefined') {
            this.input = document.createElement('input');
            this.input.setAttribute('type', 'hidden');
            this.input.setAttribute('name', this.data.name);
            this.input.setAttribute('value', '');
            if (this.container.querySelector('div').hasAttribute('data-value')) {
                this.input.setAttribute('value', this.container.querySelector('div').getAttribute('data-value'));
            }
            this.el.appendChild(this.input);
        }

        this._normalize_min_height();
    }

    append(data) {
        if (!this.container.querySelector(`[data-value="${data.value}"]`)) {
            let option = this._create_option(data);
            this.container.appendChild(option);

            if (data.img) {
                //img height fix
                option.querySelector('img').style.maxHeight = parseInt(option.offsetHeight - option.offsetHeight * 0.25) + 'px';
            }

            return true;
        }

        return false;
    }

    _create_option(data) {
        let option = document.createElement('div');
        option.setAttribute('data-value', data.value);
        option.className = 'selectron23-option';

        let float = 'left';
        if (typeof this.data.imgpos !== 'undefined') {
            if (this.data.imgpos === 'right') {
                float = 'right';
            }
        }

        let title = '';
        if (data.title) {
            title = `<div class="selectron23-option-title">${data.title}</div>`;
        }

        let text = '';
        if (data.text) {
            text = `<div class="selectron23-option-text">${data.text}</div>`;
        }

        let img = '';
        if (data.img) {
            let margin_top = 0;
            if (!text) {
                margin_top = 'margin-top: -6px;';
            }
            img = `<img src='${data.img}' alt='' loading='lazy' style="float: ${float}; ${margin_top}" />`;
        }

        option.innerHTML = `${img}<div>${title}${text}</div>`;

        if (img) {
            option.querySelector('img').style.maxHeight = parseInt(option.offsetHeight - option.offsetHeight * 0.25) + 'px';
        }

        return option;
    }

    select(value) {
        if (this.value !== value) {

            if (!this.container.querySelector(`[data-value="${value}"]`)) {
                return;
            }

            this.value = value;
            this._remove_label();

            let option = this.container.querySelector(`[data-value="${value}"]`);
            option.setAttribute('data-selected', 1);
            this.container.insertAdjacentElement('afterbegin', option);

            this.data.options.reverse().forEach((o) => {
                if (o.value !== value) {
                    let opt = this.container.querySelector(`[data-value="${o.value}"]`);
                    option.insertAdjacentElement('afterend', opt);
                    opt.removeAttribute('data-selected');
                }
            });

            this._normalize_min_height();
            if (this.input) {
                this.input.value = value;
            }
            this.onSelect();

            return true;
        }

        return false;
    }

    _remove_label() {
        if (this.container.querySelector(`[data-label="1"]`)) {
            this.container.querySelector(`[data-label="1"]`).remove();
        }
    }

    _click(ev) {

        let target = ev.target;

        if (!target.hasAttribute('data-value')) {
            target = target.closest('.selectron23-option');
        }

        if (!target) {
            this.show(false);
            return;
        }

        if (target.hasAttribute('data-pointer') || target.hasAttribute('data-label')
                || target.hasAttribute('data-selected')) {

            if (parseInt(this.container.getAttribute('data-opened')) === 1) {
                this.show(false);
            } else {
                this.show(true);
            }
        } else {
            this.select(target.getAttribute('data-value'));
            this.show(false);
            if (this.element.tagName.toLowerCase() === 'select') {
                this.element.value = this.value;
                this.element.dispatchEvent(new Event("change"));
            }
        }

    }

    show(is, dir = 'down') {
        if (is) {
            if (parseInt(this.container.getAttribute('data-opened'))) {
                return;
            }

            this.container.style.zIndex = ++Selectron23.z_index;//to avoid css issue with anothers selectron23 drop-downs

            //animation
            let counter = 1;
            let timer = setInterval(() => {
                let max_height = 0;

                if (typeof this.data.max_open_height !== 'undefined') {
                    max_height = parseInt(this.data.max_open_height);
                } else {
                    this.container.querySelectorAll('.selectron23-option').forEach(function (item) {
                        max_height += item.offsetHeight;
                    });
                }


                //growing
                this.container.style.maxHeight = parseFloat(0.05 * counter) * max_height + 'px';

                if (parseInt(this.container.style.maxHeight) >= max_height) {
                    clearInterval(timer);
                    if (typeof this.data.max_open_height !== 'undefined') {
                        this.container.style.maxHeight = max_height + 'px';
                        this.container.style.overflow = 'auto';
                    } else {
                        this.container.style.maxHeight = '100vh';
                    }
                    this.container.setAttribute('data-opened', 1);
                    this.pointer.style.top = (parseInt(this.pointer.style.top) + 3) + 'px';
                }
                counter++;
            }, 10);
        } else {
            if (!parseInt(this.container.getAttribute('data-opened'))) {
                return;
            }

            this.container.setAttribute('data-opened', 0);
            this.pointer.style.top = (parseInt(this.pointer.style.top) - 3) + 'px';

            this._normalize_min_height();
            this.container.style.maxHeight = this.container.style.minHeight;
            if (typeof this.container.style.overflow !== 'undefined') {
                this.container.scrollTop = 0;//!!
                this.container.style.overflow = null;
            }
    }
    }

    _normalize_min_height() {
        this.container.style.minHeight = this.container.querySelector('div').clientHeight + 'px';
        this.el.style.height = (parseInt(this.container.style.minHeight) + 1) + 'px';//!!
        this.pointer.style.top = parseInt(this.container.style.minHeight) / 2 + 'px';
        //this.el.style.maxHeight = window.getComputedStyle(this.el, null).getPropertyValue('min-height');
    }

    onSelect() {
        //for API
    }
}

