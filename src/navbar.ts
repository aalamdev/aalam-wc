import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './accordion';

interface NodeType {
    elementName: string;
    children: NodeType[];
}

@customElement('aalam-navbar')
export class AalamNavbar extends LitElement {
    @property({ type: String }) attr = 'data-m';
    @property({ type: String }) mode = 'saccordion';
    @property({ type: Number }) cutoffwidth = 0;
    @property({ type: String }) togglesel = '.nav-menu';
    @property({ type: String }) pos = 'left';
    @property({ type: String }) canvascls = 'canvas-body';

    no_parent_anchors: NodeType[] = [];
    no_parent_container: HTMLElement[] = [];
    parent_container: { [key: string]: HTMLElement[] } = {};
    anchor_elements: HTMLElement[];
    menu: HTMLElement;
    menu_element: HTMLElement;
    close_element: HTMLElement;
    back_element: HTMLElement;
    current_path: HTMLElement[] = [];
    change: boolean = false;
    overlay_container: { [key: string]: HTMLElement[] } = {};
    active_click_outside_listener: ((event: MouseEvent) => void) | null = null;
    navbar: HTMLElement;

    override createRenderRoot() {
        return this;
    }

    private getAttr(el: Element, suffix: string): string {
        return el.getAttribute(`${this.attr}-${suffix}`) || '';
    }
    override firstUpdated() {
        const initializeNavbar = () => {
            this.navbar = this as HTMLElement;

            const original = this.querySelectorAll(`[${this.attr}-nm]`);
            this.anchor_elements = Array.from(original).map((anchor) => {
                let clone: HTMLElement;

                if (anchor.tagName.toLowerCase() === 'aalam-dropdown') {
                    clone = document.createElement('div');
                    const toggler = anchor.querySelector('[slot="dd-toggler"]');

                    if (toggler) {
                        clone.innerHTML = toggler.innerHTML;
                    } else {
                        clone.innerHTML = anchor.innerHTML;
                    }

                    Array.from(anchor.attributes).forEach((attr) => clone.setAttribute(attr.name, attr.value));
                } else {
                    clone = anchor.cloneNode(true) as HTMLElement;
                }

                clone.addEventListener('click', () => {
                    const nm = this.getAttr(anchor, 'nm');

                    if (nm && this.parent_container[nm] && this.parent_container[nm].length > 0) {
                        return;
                    }

                    const link = anchor.tagName === 'A' ? anchor : anchor.querySelector('a');
                    if (link) {
                        (link as HTMLElement).click();
                    } else {
                        (anchor as HTMLElement).click();
                    }
                });

                const cls = this.getAttr(anchor, 'cls');
                if (cls) {
                    clone.className = cls;
                }

                return clone;
            });

            const length_of_input = this.anchor_elements.length;

            let i = 0;
            while (i < length_of_input) {
                const anchor = original[i];
                const clone = this.anchor_elements[i];
                const attr_name = this.getAttr(anchor, 'nm');

                let attr_pnt = this.getAttr(anchor, 'pnt');

                if (!attr_pnt) {
                    const parentEl = anchor.parentElement?.closest(`[${this.attr}-nm]`);
                    if (parentEl) {
                        attr_pnt = this.getAttr(parentEl, 'nm');
                    }
                }

                if (!attr_pnt) {
                    this.no_parent_anchors.push({ elementName: attr_name, children: [] });
                    if (attr_name !== 'menu' && attr_name !== 'back') this.no_parent_container.push(clone);
                } else {
                    if (!this.parent_container[attr_pnt]) {
                        this.parent_container[attr_pnt] = [];
                    }
                    this.parent_container[attr_pnt].push(clone);
                }
                i++;
            }

            const toggle = document.querySelector(this.togglesel) as HTMLElement;
            if (toggle) {
                this.menu_element = toggle;
            }

            let temps = document.getElementsByTagName('template');

            Array.from(temps).forEach((template) => {
                if (template.getAttribute('data-type') === 'back') {
                    const new_content = template.content.cloneNode(true) as DocumentFragment;
                    this.back_element = document.createElement('a');
                    this.back_element.appendChild(new_content.cloneNode(true));
                } else if (template.getAttribute('data-type') === 'close') {
                    const new_content = template.content.cloneNode(true) as DocumentFragment;
                    this.close_element = document.createElement('a');
                    this.close_element.appendChild(new_content.cloneNode(true));
                }
            });

            if (this.back_element) this.back_element.id = 'back';
            if (this.close_element) this.close_element.id = 'close';

            this.parent_container['menu'] = this.no_parent_container;

            if (this.cutoffwidth === 0) {
                this.cutoffwidth = this.getNavbarLength();
            }

            window.addEventListener('resize', this.updateNavbar.bind(this));
            this.updateNavbar();

            if (this.menu_element) {
                this.menu_element.onclick = (e) => {
                    e.stopPropagation();
                    this.handleMenu();
                };
            }
            if (this.close_element) this.close_element.onclick = this.handleClose.bind(this);

            this.menu = document.createElement('div');
            this.menu.style.position = 'fixed';
            this.menu.style.top = '0';
            this.menu.style.height = '100vh';
            this.menu.style.width = '320px';
            this.menu.style.maxWidth = '85vw';

            // Prevent parent scroll trap
            this.menu.style.overflowY = 'hidden';
            this.menu.style.overflowX = 'hidden';

            this.menu.style.zIndex = '9999';
            this.menu.style.backgroundColor = 'var(--clr-bg, #ffffff)';
            this.menu.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';

            if (this.pos === 'right') this.menu.style.right = '0';
            else this.menu.style.left = '0';

            // Scroll wrapper for root menu items
            const scrollWrapper = document.createElement('div');
            scrollWrapper.style.height = '100%';
            scrollWrapper.style.width = '100%';
            scrollWrapper.style.overflowY = 'auto';

            if (this.mode == 'overlay') {
                scrollWrapper.appendChild(this.overlayNode());
            } else if (this.mode == 'saccordion') {
                scrollWrapper.appendChild(this.accordionCreator());
            } else {
                scrollWrapper.appendChild(this.accordionCreator('menu', false));
            }

            this.menu.appendChild(scrollWrapper);
            this.menu.style.display = 'none';
            document.body.appendChild(this.menu);

            for (const key in this.overlay_container) {
                const anchor = this.getAnchorElement(key);
                if (anchor) {
                    anchor.onclick = () => {
                        if (this.current_path.length > 0) {
                            const previous_anchor = this.current_path[this.current_path.length - 1];
                            const nm = this.getAttr(previous_anchor, 'nm');

                            if (this.overlay_container[nm]) {
                                this.overlay_container[nm][0].style.display = 'none';
                            }
                        }
                        if (this.overlay_container[key]) {
                            // Maintained layout fix for flexbox display
                            this.overlay_container[key][0].style.display = 'flex';
                        }
                        this.current_path.push(anchor);
                    };
                }
            }

            const elements = document.querySelectorAll('#close');
            elements.forEach((element) => {
                (element as HTMLElement).onclick = () => this.handleClose();
            });

            const ele = document.querySelectorAll('#back');
            ele.forEach((element) => {
                (element as HTMLElement).onclick = () => this.handleBack();
            });

            this.menu.classList.add(this.canvascls);
        };

        let is_initialized = false;

        const attemptInit = () => {
            if (is_initialized) return;
            const dynamic_elements = this.querySelectorAll(`[${this.attr}-nm]`);

            if (dynamic_elements.length > 0) {
                is_initialized = true;
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        initializeNavbar();
                    });
                });
            }
        };

        attemptInit();

        if (!is_initialized) {
            const observer = new MutationObserver((_mutations, obs) => {
                attemptInit();
                if (is_initialized) obs.disconnect();
            });

            observer.observe(this, { childList: true, subtree: true });

            setTimeout(() => {
                if (!is_initialized) {
                    is_initialized = true;
                    observer.disconnect();
                    initializeNavbar();
                }
            }, 1500);
        }

        // Wait for all web fonts to finish loading, then force a recount
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                if (is_initialized) {
                    this.refreshCutoffWidth();
                    this.updateNavbar();
                }
            });
        }
    }

    overlayNode(parentName: string = 'menu'): HTMLElement {
        const dive = document.createElement('div');
        if (parentName == 'menu') {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.justifyContent = 'flex-end';
            div.style.padding = '15px';

            if (this.close_element) {
                const close_btn = this.close_element.cloneNode(true) as HTMLElement;
                close_btn.onclick = () => this.handleClose();
                div.appendChild(close_btn);
            }
            dive.appendChild(div);
        }

        if (this.parent_container[parentName]) {
            this.parent_container[parentName].forEach((child: HTMLElement) => {
                const div = document.createElement('div');
                const nm = this.getAttr(child, 'nm');

                const hasChildren = nm && this.parent_container[nm] && this.parent_container[nm].length > 0;
                if (hasChildren) {
                    div.className = 'acc-title';
                }

                div.appendChild(child);
                dive.appendChild(div);

                this.overlayCreator(nm);
            });
        }

        return dive;
    }

    overlayCreator(anchorName: string): void {
        const children = this.parent_container[anchorName];

        const close_cloned = this.close_element?.cloneNode(true) as HTMLElement;
        if (close_cloned) {
            close_cloned.style.display = 'block';
            close_cloned.onclick = () => this.handleClose();
        }

        const back_cloned = this.back_element?.cloneNode(true) as HTMLElement;
        if (back_cloned) {
            if (anchorName == 'menu') back_cloned.style.display = 'none';
            else back_cloned.style.display = 'block';
            back_cloned.onclick = () => this.handleBack();
        }

        const anchor_element = this.getAnchorElement(anchorName);
        const overlay = document.createElement('div');
        if (children) {
            overlay.id = `overlay-dropdown-${anchorName}`;
            overlay.classList.add('aalam-overlay-panel');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'var(--clr-bg, #ffffff)';
            overlay.style.zIndex = '1000';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';

            // Nested scroll behavior for overlays
            overlay.style.overflowY = 'auto';

            const parent_name_el = document.createElement('div');
            if (anchor_element) parent_name_el.innerHTML = anchor_element.innerHTML;
            parent_name_el.style.flex = '1';

            const header = document.createElement('div');
            header.style.padding = '10px';
            header.style.display = 'flex';
            header.style.alignItems = 'center';
            header.style.gap = '10px';
            header.style.width = '100%';
            header.style.borderBottom = '1px solid rgba(128,128,128,0.2)';
            header.style.boxSizing = 'border-box';

            if (back_cloned) header.appendChild(back_cloned);
            header.appendChild(parent_name_el);
            if (close_cloned) header.appendChild(close_cloned);
            overlay.appendChild(header);

            const dbox = document.createElement('div');

            const anchor = this.getAnchorElement(anchorName);
            if (anchor) {
                const mode = this.getAttr(anchor, 'mode') || 'saccordion';
                const nm = this.getAttr(anchor, 'nm');

                if (mode == 'overlay') {
                    dbox.appendChild(this.overlayNode(nm));
                } else if (mode == 'maccordion') {
                    dbox.appendChild(this.accordionCreator(nm, false));
                } else {
                    dbox.appendChild(this.accordionCreator(nm));
                }
            }
            overlay.appendChild(dbox);
            overlay.style.display = 'none';
            this.overlay_container[anchorName] = [overlay];
            if (this.menu) this.menu.appendChild(overlay);
        }
    }

    accordionCreator(parentName: string = 'menu', noMultiple: boolean = true): HTMLElement {
        const saccordion = document.createElement('aalam-accordion');
        (saccordion as any).nomultiple = noMultiple;
        const children = this.parent_container[parentName];

        if (parentName == 'menu') {
            const div = document.createElement('div');
            const divp = document.createElement('div');
            divp.style.display = 'flex';
            divp.style.justifyContent = 'flex-end';
            divp.style.borderBottom = '1px solid rgba(128,128,128,0.2)';
            divp.style.padding = '10px 15px';

            if (this.close_element) {
                const close_btn = this.close_element.cloneNode(true) as HTMLElement;
                close_btn.onclick = () => this.handleClose();
                divp.appendChild(close_btn);
            }
            div.appendChild(divp);
            saccordion.appendChild(div);
        }

        if (children)
            children.forEach((child: HTMLElement) => {
                const div = document.createElement('div');
                const mod = this.getAttr(child, 'mode') || 'saccordion';
                const child_name = this.getAttr(child, 'nm');

                const hasChildren = child_name && this.parent_container[child_name] && this.parent_container[child_name].length > 0;

                if (hasChildren) {
                    const divp = document.createElement('div');
                    const divc = document.createElement('div');

                    divp.className = 'acc-title';
                    divc.className = 'acc-body';

                    divp.appendChild(child);

                    if (mod == 'saccordion') {
                        divc.appendChild(this.accordionCreator(child_name));
                    } else if (mod == 'overlay') {
                        divc.appendChild(this.overlayNode(child_name));
                    } else {
                        divc.appendChild(this.accordionCreator(child_name, false));
                    }

                    // Append title and body as SIBLINGS inside the parent 'div'
                    div.appendChild(divp);
                    div.appendChild(divc);
                } else {
                    div.appendChild(child);
                }

                saccordion.appendChild(div);
            });

        return saccordion;
    }

    refreshCutoffWidth() {
        if (this.hasAttribute('cutoffwidth') && Number(this.getAttribute('cutoffwidth')) > 0) {
            return;
        }

        const wasCollapsed = this.change;

        if (wasCollapsed) {
            this.anchor_elements.forEach((anchor) => {
                anchor.style.display = '';
            });
        }

        this.cutoffwidth = this.getNavbarLength();

        if (wasCollapsed) {
            this.anchor_elements.forEach((anchor) => {
                anchor.style.display = 'none';
            });
        }
    }

    updateNavbar() {
        // Recalculate required space before checking the window width
        if (!this.change) {
            this.refreshCutoffWidth();
        }

        if (window.innerWidth < this.cutoffwidth) {
            if (!this.change) {
                if (this.navbar) this.navbar.style.display = 'none';
            }

            if (this.menu_element) this.menu_element.style.display = 'block';
            this.change = true;
            this.anchor_elements.forEach((anchor) => {
                anchor.style.display = '';
            });
        } else {
            if (this.change) {
                this.handleClose();
                this.change = false;
            }
            if (this.menu_element) this.menu_element.style.display = 'none';
            if (this.navbar) this.navbar.style.display = 'block';
        }
    }

    getAnchorElement(elementName: string): HTMLElement | null {
        const anchor_element = Array.from(this.anchor_elements).find((anchor) => this.getAttr(anchor, 'nm') === elementName);
        return anchor_element || null;
    }

    handleMenu() {
        if (this.mode == 'overlay') this.menu.style.display = 'block';
        else if (this.mode == 'saccordion') this.menu.style.display = 'block';
        else this.menu.style.display = 'block';

        const outside_click_listener = (e: MouseEvent) => {
            if (this.menu && this.menu.style.display === 'block' && !this.menu.contains(e.target as Node)) {
                this.handleClose();
                document.removeEventListener('click', outside_click_listener);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', outside_click_listener);
        }, 0);
    }

    handleClose() {
        if (this.menu) this.menu.style.display = 'none';
        if (this.menu_element) this.menu_element.style.display = 'block';
        const len = this.current_path.length;
        if (this.active_click_outside_listener) {
            document.removeEventListener('click', this.active_click_outside_listener);
        }
        if (len) {
            const anchor = this.current_path[len - 1];
            const nm = this.getAttr(anchor, 'nm');
            if (this.overlay_container[nm]) {
                this.overlay_container[nm][0].style.display = 'none';
            }
        }
        this.current_path = [];
    }

    handleBack() {
        if (this.current_path.length === 0) return;

        const current_anchor = this.current_path[this.current_path.length - 1];
        const current_anchor_name = this.getAttr(current_anchor, 'nm');

        if (this.overlay_container[current_anchor_name]) {
            this.overlay_container[current_anchor_name][0].style.display = 'none';
        }

        this.current_path.pop();

        if (this.current_path.length > 0) {
            const c_anchor = this.current_path[this.current_path.length - 1];
            const c_anchor_name = this.getAttr(c_anchor, 'nm');

            if (this.overlay_container[c_anchor_name]) {
                this.overlay_container[c_anchor_name][0].style.display = 'flex';
            }
        }
    }

    // Accurate Width Calculation with Flex Gaps and Margins
    getNavbarLength(): number {
        let len = 0;
        let top_level_count = 0;
        const original = this.querySelectorAll(`[${this.attr}-nm]`);
        const length_of_input = original.length;

        let i = 0;
        while (i < length_of_input) {
            const anchor = original[i] as HTMLElement;
            const attr_name = this.getAttr(anchor, 'nm');

            let attr_pnt = this.getAttr(anchor, 'pnt');
            if (!attr_pnt) {
                const parentEl = anchor.parentElement?.closest(`[${this.attr}-nm]`);
                if (parentEl) attr_pnt = this.getAttr(parentEl, 'nm');
            }

            if (!attr_pnt) {
                this.no_parent_anchors.push({ elementName: attr_name, children: [] });
                if (attr_name !== 'menu' && attr_name !== 'back') {
                    const style = window.getComputedStyle(anchor);
                    const margins = (parseFloat(style.marginLeft) || 0) + (parseFloat(style.marginRight) || 0);

                    len += anchor.offsetWidth + margins;
                    top_level_count++;
                }
            }
            i++;
        }

        const assumed_flex_gaps = top_level_count > 1 ? (top_level_count - 1) * 15 : 0;

        return len + assumed_flex_gaps + 60;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'aalam-navbar': AalamNavbar;
    }
}

