import {fixture, expect, html, oneEvent} from '@open-wc/testing';
import {AalamTabs} from "../src/tabs";
import {sendMouse} from "@web/test-runner-commands";
import {setViewport} from "@web/test-runner-commands";

describe('aalam-tabs', () => {
    const validate_el = (el:HTMLElement, ix:number) => {
        let title = el.querySelectorAll("[slot=tab-title]");
        let body = el.querySelectorAll("[slot=tab-body]");
        let count = 0;
        if(body[ix].style.display == 'block')
            count++;
        if(body[ix].classList.contains(el.activecls))
            count++;
        if(title[ix].classList.contains(el.activecls))
            count++;
        if(count == 3)
            return true;
        else
            return false;
    }
    const validate_prev = (el:HTMLElement, prev_ix:number) => {
        let title = el.querySelectorAll("[slot=tab-title]");
        let body = el.querySelectorAll("[slot=tab-body]");
        expect(body[prev_ix].style.display).to.equal('none');
        expect(body[prev_ix].classList.contains(el.activecls)).to.equal(false);
        expect(title[prev_ix].classList.contains(el.activecls)).to.equal(false);
    }
    const validate_RC = (el:HTMLElement, count:number) => {
        let title = el.querySelectorAll("[slot=tab-title]");
        let body = el.querySelectorAll("[slot=tab-body]");
        expect(title.length).to.equal(count);
        expect(body.length).to.equal(count);
    }
    const validate_acc = (el:HTMLElement, count:number) => {
        let acc = el.querySelectorAll("[slot=acc]");
        expect(acc.length).to.equal(count);
        for(let i = 0; i < count; i++) {
            expect(acc[i].children[0].slot).to.equal("tab-title");
            expect(acc[i].children[1].slot).to.equal('tab-body');
        }
    }
    const create_slot_el =(el:HTMLElement) => {
        let ttl = document.createElement("div");
        ttl.slot = 'tab-title';
        let bdy = document.createElement("div");
        bdy.slot = 'tab-body';
        el.appendChild(ttl);
        el.appendChild(bdy);

    }
    it('is defined', async () => {
        const el = await fixture(html`<aalam-tabs></aalam-tabs>`);
        expect(el).to.be.an.instanceof(AalamTabs);

        const el1 = document.createElement("aalam-tabs");
        expect(el1).to.be.an.instanceof(AalamTabs);
    });
    it('show', async () => {
        const el = await fixture (`
            <div id='parent'>
                <aalam-tabs>
                    <div slot="tab-title" id="t1">title1</div>
                    <div slot="tab-body" id='b1'>body1</div>
                    <div slot='tab-title' id='t2'>title2</div>
                    <div slot='tab-body' id='b2'>body2</div>
                    <div slot="tab-title" id="t3">title3</div>
                    <div slot="tab-body" id='b3'>body3</div>
                    <div slot='tab-title' id='t4'>title4</div>
                    <div slot='tab-body' id='b4'>body4</div>
                </aalam-tabs>
            </div>
        `);
        let tabs = el.querySelector("aalam-tabs");
        expect(validate_el(tabs, 0)).to.equal(true);
        expect(tabs._internal_fashion).to.equal('row');
        validate_RC(tabs, 4);

        tabs.show(1);
        expect(validate_el(tabs, 1)).to.equal(true);
        validate_prev(tabs, 0);
        validate_RC(tabs, 4);

        tabs.show(1);
        expect(validate_el(tabs, 1)).to.equal(true);
        validate_prev(tabs, 0);
        validate_RC(tabs, 4);

        tabs.show(3);
        expect(validate_el(tabs, 3)).to.equal(true);
        validate_prev(tabs, 1);
        validate_RC(tabs, 4);

        tabs.show(0);
        expect(validate_el(tabs, 0)).to.equal(true);
        validate_prev(tabs, 3);

        tabs.show(2);
        expect(validate_el(tabs, 2)).to.equal(true);
        validate_prev(tabs, 3);

        let t4 = tabs.querySelector("#t4");
        t4.click();
        expect(validate_el(tabs, 3)).to.equal(true);

        let t2 = tabs.querySelector("#t2");
        create_slot_el(tabs);
        t2.click();
        expect(validate_el(tabs, 1)).to.equal(true);
        validate_prev(tabs, 3);
        validate_RC(tabs, 5);
    });

    it('row-column-accordion', async () => {
        const el = await fixture (`
            <div id='parent'>
                <aalam-tabs fashion="xs:accordion;m:row;xl:column">
                    <div slot="tab-title" id="t1">title1</div>
                    <div slot="tab-body" id='b1'>body1</div>
                    <div slot='tab-title' class='tab-active'
                         id='t2'>title2</div>
                    <div slot='tab-body' id='b2'>body2</div>
                    <div slot="tab-title" class='tab-active'
                         id="t3">title3</div>
                    <div slot="tab-body" id='b3'>body3</div>
                    <div slot='tab-title' class='tab-active'
                         id='t4'>title4</div>
                    <div slot='tab-body' id='b4'>body4</div>
                </aalam-tabs>
            </div>
        `);
        let tabs = el.querySelector("aalam-tabs");
        expect(validate_el(tabs, 1)).to.equal(true);
        expect(validate_el(tabs, 2)).to.equal(false);
        expect(validate_el(tabs, 3)).to.equal(false);

        await setViewport({width:630, height:640})
        tabs.show(2);
        expect(validate_el(tabs, 2)).to.equal(true);
        validate_prev(tabs, 1);
        validate_acc(tabs, 4);
        expect(tabs._internal_fashion).to.equal('accordion');

        await setViewport({width:1000, height:640});
        create_slot_el(tabs);
        await tabs.updated();
        window.dispatchEvent(new Event('resize'));
        expect(tabs._internal_fashion).to.equal('row');
        expect(validate_el(tabs, 2)).to.equal(true);

        await setViewport({width:1640, height:680});
        window.dispatchEvent(new Event('resize'));
        validate_RC(tabs, 5);
        expect(tabs._internal_fashion).to.equal('column');
        expect(tabs._column_size.title).to.equal('30%');
        expect(tabs._column_size.body).to.equal('70%');

        let col = "title:50%;body:50%";
        expect(tabs._column_size.title).to.equal('30%');
        expect(tabs._column_size.body).to.equal('70%');
        tabs.setAttribute("colsize", col);
        expect(tabs._column_size.title).to.equal('50%');
        expect(tabs._column_size.body).to.equal('50%');
        tabs.show(3);
        expect(validate_el(tabs, 3)).to.equal(true);
        validate_prev(tabs, 2);

        await setViewport({width:600, height:640});
        const el2 = await fixture (`
            <div id='parent'>
                <aalam-tabs fashion="xs:accordion;m:row;xl:column">
                    <div slot="tab-title" id="t1">title1</div>
                    <div slot="tab-body" id='b1'>body1</div>
                    <div slot='tab-title' id='t2'>title2</div>
                    <div slot='tab-body' id='b2'>body2</div>
                    <div slot="tab-title" id="t3">title3</div>
                    <div slot="tab-body" id='b3'>body3</div>
                    <div slot='tab-title' id='t4'>title4</div>
                    <div slot='tab-body' id='b4'>body4</div>
                </aalam-tabs>
            </div>
        `);
        let tab2 = el2.querySelector("aalam-tabs");
        expect(tab2._internal_fashion).to.equal('accordion');
        validate_acc(tab2, 4);
        expect(validate_el(tab2, 0)).to.equal(true);

        await setViewport({width:1240, height:640});
        window.dispatchEvent(new Event('resize'));
        validate_RC(tab2, 4);
        expect(tab2._internal_fashion).to.equal('row');

        await setViewport({width:1680, height:640});
        create_slot_el(tab2);
        tab2.show(3);
        expect(validate_el(tab2, 3)).to.equal(true);
        validate_prev(tab2, 0);
        window.dispatchEvent(new Event('resize'));
        validate_RC(tab2, 5);
        expect(tab2._internal_fashion).to.equal('column');
        expect(tab2._column_size.title).to.equal('30%');
        expect(tab2._column_size.body).to.equal('70%');

        await setViewport({width:800, height:640});
        create_slot_el(tab2);
        window.dispatchEvent(new Event('resize'));
        expect(tab2._internal_fashion).to.equal('accordion');
        tab2.show(5);
        validate_acc(tab2, 6);
        expect(validate_el(tab2, 5)).to.equal(true);
        validate_prev(tab2, 3);

        await setViewport({width:1500, height:640});
        window.dispatchEvent(new Event('resize'));
        validate_RC(tab2, 6);
        expect(tab2._internal_fashion).to.equal('row');

        await setViewport({width:1100, height:640});
        create_slot_el(tab2);
        window.dispatchEvent(new Event('resize'));
        validate_RC(tab2, 7);
        expect(tab2._internal_fashion).to.equal('row');

        await setViewport({width:1601, height:640});
        const el3 = await fixture (`
            <div id='parent'>
                <aalam-tabs fashion="xs:accordion;m:row;xl:column">
                    <div slot="tab-title" id="t1">title1</div>
                    <div slot="tab-body" id='b1'>body1</div>
                    <div slot='tab-title' id='t2'>title2</div>
                    <div slot='tab-body' id='b2'>body2</div>
                    <div slot="tab-title" id="t3">title3</div>
                    <div slot="tab-body" id='b3'>body3</div>
                    <div slot='tab-title' id='t4'>title4</div>
                    <div slot='tab-body' id='b4'>body4</div>
                </aalam-tabs>
            </div>
        `);
        let tab3 = el3.querySelector("aalam-tabs");
        validate_RC(tab3, 4);
        expect(validate_el(tab3, 0)).to.equal(true);
        expect(tab3._internal_fashion).to.equal('column');
        expect(tab3._column_size.title).to.equal('30%');
        expect(tab3._column_size.body).to.equal('70%');

        await setViewport({width:640, height:640});
        window.dispatchEvent(new Event('resize'));
        expect(tab3._internal_fashion).to.equal('accordion');
        tab3.show(3);
        expect(validate_el(tab3, 3)).to.equal(true);
        validate_prev(tab3, 0);
        validate_acc(tab3, 4);

        await setViewport({width:1380, height:640});
        window.dispatchEvent(new Event('resize'));
        validate_RC(tab3, 4);
        expect(tab3._internal_fashion).to.equal('row');

        await setViewport({width:1800, height:640});
        create_slot_el(tab3);
        window.dispatchEvent(new Event('resize'));
        validate_RC(tab3, 5);
        expect(validate_el(tab3, 3)).to.equal(true);
        expect(tab3._internal_fashion).to.equal('column');
        expect(tab3._column_size.title).to.equal('30%');
        expect(tab3._column_size.body).to.equal('70%');
    });
    it('animation', async () => {
        await setViewport({width:1400, height:640});
        const el = await fixture (`
            <div id='parent'>
                <aalam-tabs animation="show:r2l;hide:t2b"
                            fashion="xs:accordion;m:row;xl:column">
                    <div slot="tab-title" id="t1">title1</div>
                    <div slot="tab-body" id='b1'>body1</div>
                    <div slot='tab-title' id='t2'>title2</div>
                    <div slot='tab-body' id='b2'>body2</div>
                    <div slot="tab-title" id="t3">title3</div>
                    <div slot="tab-body" id='b3'>body3</div>
                    <div slot='tab-title' id='t4'>title4</div>
                    <div slot='tab-body' id='b4'>body4</div>
                </aalam-tabs>
            </div>
        `);
        let tabs = el.querySelector("aalam-tabs");
        let body = tabs.querySelectorAll("[slot=tab-body]");
        expect(tabs._internal_fashion).to.equal('row');
        expect(validate_el(tabs, 0)).to.equal(true);
        validate_RC(tabs, 4);
        expect(tabs._animation_styles.open).to.equal('r2l');
        expect(tabs._animation_styles.close).to.equal('t2b');

        await setViewport({width:1640, height:640});
        window.dispatchEvent(new Event('resize'));
        validate_RC(tabs, 4);
        expect(validate_el(tabs, 0)).to.equal(true);
        expect(tabs._internal_fashion).to.equal('column');
        expect(tabs._animation_styles.open).to.equal('r2l');
        expect(tabs._animation_styles.close).to.equal('t2b');

        tabs.setAttribute('animation', "show:l2r;hide:fade");
        await setViewport({width:1680, height:640});
        window.dispatchEvent(new Event('resize'));
        tabs.show(2);
        expect(validate_el(tabs, 2)).to.equal(true);
        await oneEvent(tabs, 'transitionend');
        validate_prev(tabs, 0);
        expect(tabs._animation_styles.open).to.equal('l2r');
        expect(tabs._animation_styles.close).to.equal('fade');
        expect(tabs._internal_fashion).to.equal('column');

        tabs.setAttribute("animation", "fade");
        await setViewport({width:1400, height:640});
        window.dispatchEvent(new Event('resize'));
        expect(tabs._internal_fashion).to.equal('row');
        expect(tabs._animation_styles.open).to.equal('fade');
        expect(tabs._animation_styles.close).to.equal('fade');
        tabs.show(3);
        expect(validate_el(tabs, 3)).to.equal(true);
        await oneEvent(tabs, 'transitionend');
        validate_prev(tabs, 2);

        tabs.setAttribute("animation","t2b");
        await setViewport({width:800, height:640});
        window.dispatchEvent(new Event('resize'));
        expect(tabs._internal_fashion).to.equal('accordion');
        validate_acc(tabs, 4);
        expect(tabs._animation_styles.open).to.equal('t2b');
        expect(tabs._animation_styles.close).to.equal('t2b');

        tabs.setAttribute('animation', "show:t2b");
        await setViewport({width:1000, height:640});
        expect(validate_el(tabs, 3)).to.equal(true);
        validate_prev(tabs, 2);
        tabs.show(0);
        expect(validate_el(tabs, 0)).to.equal(true);
        validate_prev(tabs, 2);
        window.dispatchEvent(new Event('resize'));
        validate_RC(tabs, 4);
        expect(tabs._internal_fashion).to.equal('row');
        expect(tabs._animation_styles.open).to.equal('t2b');
        expect(tabs._animation_styles.close).to.equal(undefined);
    });
    it('check-events', async () => {
        const el = await fixture (`
            <div id='parent'>
                <aalam-tabs fashion="xs:accordion;m:row;xl:column">
                    <div slot="tab-title" id="t1">title1</div>
                    <div slot="tab-body" id='b1'>body1</div>
                    <div slot='tab-title' id='t2'>title2</div>
                    <div slot='tab-body' id='b2'>body2</div>
                    <div slot="tab-title" id="t3">title3</div>
                    <div slot="tab-body" id='b3'>body3</div>
                    <div slot='tab-title' id='t4'>title4</div>
                    <div slot='tab-body' id='b4'>body4</div>
                </aalam-tabs>
            </div>
        `);
        const tabs = el.querySelector("aalam-tabs") as HTMLElement;
        const t1 = tabs.querySelector("#t1") as HTMLElement;
        const t2 = tabs.querySelector("#t2");
        const t3 = tabs.querySelector("#t3");
        const t4 = tabs.querySelector("#t4");

        expect(validate_el(tabs, 0)).to.equal(true);
        let hide_listener = oneEvent(tabs, "hide");
        let change_listener = oneEvent(tabs, "change")
        let show_listener = oneEvent(tabs, "show")

        t3.click();
        let change_event = await change_listener;
        expect(change_event.detail.ix).to.equal(2);
        let hide_event = await hide_listener;
        expect(hide_event.detail.ix).to.equal(2);
        let show_event = await show_listener;
        expect(show_event.detail.ix).to.equal(2);
        expect(validate_el(tabs, 2)).to.equal(true);
        validate_prev(tabs, 0);

        change_listener = oneEvent(tabs, "change")
        t2.click();
        change_event = await change_listener;
        expect(change_event.detail.ix).to.equal(1);
        show_event = await show_listener;
        expect(show_event.detail.ix).to.equal(2);
        expect(hide_event.detail.ix).to.equal(2);
        expect(validate_el(tabs, 1)).to.equal(true);
        validate_prev(tabs, 2);

        hide_listener = oneEvent(tabs, "hide");
        t4.click();
        expect(hide_event.detail.ix).to.equal(2);
        hide_event = await hide_listener;
        expect(hide_event.detail.ix).to.equal(3);
        expect(show_event.detail.ix).to.equal(2);
        expect(change_event.detail.ix).to.equal(1);
        expect(validate_el(tabs, 3)).to.equal(true);
        validate_prev(tabs, 1);

        show_listener = oneEvent(tabs, "show");
        t1.click();
        expect(show_event.detail.ix).to.equal(2);
        show_event = await show_listener;
        expect(show_event.detail.ix).to.equal(0);
        expect(validate_el(tabs, 0)).to.equal(true);
        validate_prev(tabs, 3);

    });
});
