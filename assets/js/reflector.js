'use strict';

class TCM_Reflector {
    constructor(container) {
        this.container = container;
        this.reflection = document.createElement('div');
        this.container.insertAdjacentElement('afterend', this.reflection);
        this.reflection.className = 'taxonomy-chain-menu-reflection';
        this.clone();
    }

    clone() {
        this.reflection.innerHTML = '';
        this.container.childNodes.forEach((item) => {

            let clone = item.cloneNode(true);
            this.append(clone);

            if (clone.nodeType === Node.ELEMENT_NODE && item.tagName.toLowerCase() === 'select') {
                clone.className = '';
                let data = {};
                if (clone.hasAttribute('data-selectron23-open-height')) {
                    data.max_open_height = parseInt(clone.getAttribute('data-selectron23-open-height'));
                }
                let _this = this;
                (new Selectron23(clone, data)).onSelect = function () {
                    const event = new CustomEvent('taxonomy-chain-menu-select-changed', {detail: {
                            value: this.value,
                            container: _this.container
                        }});
                    item.dispatchEvent(event);
                };
            }

        });
    }

    append(clone) {
        this.reflection.appendChild(clone);
    }
}



