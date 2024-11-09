import {fixture, expect, html, oneEvent} from '@open-wc/testing';
import {AalamNavMenu} from "../src/navmenu";
import {setViewport} from "@web/test-runner-commands";

describe('aalam-navmenu', () => {
    const template = `
<div>
    <style>
        aalam-navmenu {font-size:16px;font-family:serif}
        [slot=menu-item] {background:yellow;padding:20px}
        [slot=toggle-item] {background:orange;padding:20px;color:blue}
    </style>
    <div id='outer'
        style='display:inline-block;width:100%;height:100px;background:pink'>
        <div id='upper'
            style='width:25%;height:200px;display:inline-block;background:blue'>
        </div>
        <div id='container'
            style='width:70%;height:80px;background:green;display:inline-block'>
            <aalam-navmenu direction='first'>
                <div id='a1' slot='menu-item' data-priority='4'>06abcde05</div>
                <div id='b2' slot='menu-item' data-priority='2'>03bcdef02</div>
                <div id='c3' slot='menu-item' data-priority='5'>08cdefg07</div>
                <div id='d4' slot='menu-item' data-priority='7'>10defgh10</div>
                <div id='e5' slot='menu-item' data-priority='9'>12efghi12</div>
                <div id='f6' slot='menu-item' data-priority='8'>11fghij11</div>
                <div id='g7' slot='menu-item' data-priority='1'>01ghijk01</div>
                <div id='h8' slot='menu-item' data-priority='2'>02hijkl03</div>
                <div id='i9' slot='menu-item' data-priority='4'>05ijklm06</div>
                <div id='j10' slot='menu-item' data-priority='5'>07jklmn08</div>
                <div id='k11' slot='menu-item' data-priority='6'>09klmno09</div>
                <div id='l12' slot='menu-item' data-priority='3'>04lmnop04</div>
                <div id='tgl' slot='toggle-item'>toggler</div>
            </aalam-navmenu>
        </div>
        <div id='lower'
            style='width:150px;height:100px;background:red;display:inline-block'>
        </div>
    </div>
</div>`;
        const m_slot = (nav) => {
            return nav.querySelectorAll('[slot=menu-item]');
        }
        const c_slot = (nav) => {
            return nav.querySelectorAll('[slot=collapsed-item]');
        }

    it('is defined', async () => {
        const el = await fixture(html`<aalam-navmenu></aalam-navmenu>`);
        expect(el).to.be.an.instanceof(AalamNavMenu);

        const el1 = document.createElement('aalam-navmenu');
        expect(el1).to.be.an.instanceof(AalamNavMenu);
    });
    it('direction', async () => {
        await setViewport({width:1460, height:900});
        const el = await fixture(template);
        const check_menu_el = (el) => {
            expect(el.slot).to.equal('menu-item');
        }
        const check_dd_el = (el) => {
            expect(el.slot).to.equal('collapsed-item');
        }
        let nav = el.querySelector('aalam-navmenu');
        expect(nav.direction).to.equal('first');

        /*sorted menu*/
        expect(m_slot(nav).length).to.equal(8);
        nav._sorted_menu.forEach( (el) => {
            check_menu_el(el);
        });
        expect(nav._slotted_menu_order[0]).to.equal(nav._sorted_menu[0]);
        expect(nav._slotted_menu_order[8]).to.equal(nav._sorted_menu[1]);
        expect(nav._slotted_menu_order[2]).to.equal(nav._sorted_menu[2]);
        expect(nav._slotted_menu_order[9]).to.equal(nav._sorted_menu[3]);
        expect(nav._slotted_menu_order[10]).to.equal(nav._sorted_menu[4]);
        expect(nav._slotted_menu_order[3]).to.equal(nav._sorted_menu[5]);
        expect(nav._slotted_menu_order[5]).to.equal(nav._sorted_menu[6]);
        expect(nav._slotted_menu_order[4]).to.equal(nav._sorted_menu[7]);

        /*sorted dropdown*/
        nav._sorted_dd.forEach( (el) => {
            check_dd_el(el);
        });
        expect(c_slot(nav).length).to.equal(4);
        expect(nav._slotted_menu_order[6]).to.equal(nav._sorted_dd[0]);
        expect(nav._slotted_menu_order[1]).to.equal(nav._sorted_dd[1]);
        expect(nav._slotted_menu_order[7]).to.equal(nav._sorted_dd[2]);
        expect(nav._slotted_menu_order[11]).to.equal(nav._sorted_dd[3]);

        nav.setAttribute('direction', 'last');

        /*sorted menu*/
        nav._sorted_menu.forEach( (el) => {
            check_menu_el(el);
        });
        expect(m_slot(nav).length).to.equal(8);
        expect(nav._slotted_menu_order[0]).to.equal(nav._sorted_menu[0]);
        expect(nav._slotted_menu_order[8]).to.equal(nav._sorted_menu[1]);
        expect(nav._slotted_menu_order[2]).to.equal(nav._sorted_menu[2]);
        expect(nav._slotted_menu_order[9]).to.equal(nav._sorted_menu[3]);
        expect(nav._slotted_menu_order[10]).to.equal(nav._sorted_menu[4]);
        expect(nav._slotted_menu_order[3]).to.equal(nav._sorted_menu[5]);
        expect(nav._slotted_menu_order[5]).to.equal(nav._sorted_menu[6]);
        expect(nav._slotted_menu_order[4]).to.equal(nav._sorted_menu[7]);

        /*sorted dropdown*/
        nav._sorted_dd.forEach( (el) => {
            check_dd_el(el);
        });
        expect(c_slot(nav).length).to.equal(4);
        expect(nav._slotted_menu_order[6]).to.equal(nav._sorted_dd[0]);
        expect(nav._slotted_menu_order[1]).to.equal(nav._sorted_dd[1]);
        expect(nav._slotted_menu_order[7]).to.equal(nav._sorted_dd[2]);
        expect(nav._slotted_menu_order[11]).to.equal(nav._sorted_dd[3]);

        const el2 = await fixture(html`
<div>
    <style>
        [slot=menu-item] {background:yellow;padding:20px}
        [slot=toggle-item] {background:orange;padding:20px;color:blue}
    </style>
    <div id='outer'
        style='display:inline-block;width:100%;height:100px;background:pink'>
        <div id='upper'
            style='width:150px;height:200px;display:inline-block;background:blue'>
        </div>
        <div id='container'
            style='width:70%;height:80px;background:green;display:inline-block'>
            <aalam-navmenu direction='last'>
                <div id='a1' slot='menu-item' data-priority='4'>06abcde05</div>
                <div id='b2' slot='menu-item' data-priority='2'>03bcdef02</div>
                <div id='c3' slot='menu-item' data-priority='5'>08cdefg07</div>
                <div id='d4' slot='menu-item' data-priority='7'>10defgh10</div>
                <div id='e5' slot='menu-item' data-priority='9'>12efghi12</div>
                <div id='f6' slot='menu-item' data-priority='8'>11fghij11</div>
                <div id='g7' slot='menu-item' data-priority='1'>01ghijk01</div>
                <div id='h8' slot='menu-item' data-priority='2'>02hijkl03</div>
                <div id='i9' slot='menu-item' data-priority='4'>05ijklm06</div>
                <div id='j10' slot='menu-item' data-priority='5'>07jklmn08</div>
                <div id='k11' slot='menu-item' data-priority='6'>09klmno09</div>
                <div id='l12' slot='menu-item' data-priority='3'>04lmnop04</div>
                <div id='tgl' slot='toggle-item'>toggler</div>
            </aalam-navmenu>
        </div>
        <div id='lower'
            style='width:150px;height:100px;background:red;display:inline-block'>
        </div>
    </div>
</div>`);
        nav = el2.querySelector('aalam-navmenu');
        expect(nav.direction).to.equal('last');

        /*sorted menu*/
        nav._sorted_menu.forEach( (el) => {
            check_menu_el(el);
        });
        expect(m_slot(nav).length).to.equal(8);
        expect(nav._slotted_menu_order[8]).to.equal(nav._sorted_menu[0]);
        expect(nav._slotted_menu_order[0]).to.equal(nav._sorted_menu[1]);
        expect(nav._slotted_menu_order[9]).to.equal(nav._sorted_menu[2]);
        expect(nav._slotted_menu_order[2]).to.equal(nav._sorted_menu[3]);
        expect(nav._slotted_menu_order[10]).to.equal(nav._sorted_menu[4]);
        expect(nav._slotted_menu_order[3]).to.equal(nav._sorted_menu[5]);
        expect(nav._slotted_menu_order[5]).to.equal(nav._sorted_menu[6]);
        expect(nav._slotted_menu_order[4]).to.equal(nav._sorted_menu[7]);

        /*sorted dropdown*/
        nav._sorted_dd.forEach( (el) => {
            check_dd_el(el);
        });
        expect(c_slot(nav).length).to.equal(4);
        expect(nav._slotted_menu_order[6]).to.equal(nav._sorted_dd[0]);
        expect(nav._slotted_menu_order[7]).to.equal(nav._sorted_dd[1]);
        expect(nav._slotted_menu_order[1]).to.equal(nav._sorted_dd[2]);
        expect(nav._slotted_menu_order[11]).to.equal(nav._sorted_dd[3]);

        const el3 = await fixture(html`
<div>
    <style>
        [slot=menu-item] {background:yellow;padding:20px}
        [slot=toggle-item] {background:orange;padding:20px;color:blue}
    </style>
    <div id='outer'
        style='display:inline-block;width:100%;height:100px;background:pink'>
        <div id='upper'
            style='width:150px;height:200px;
                   display:inline-block;background:blue'>
        </div>
        <div id='container'
            style='width:70%;height:80px;background:green;display:inline-block'>
            <aalam-navmenu>
                <div id='a1' slot='menu-item' data-priority='4'>06abcde05</div>
                <div id='b2' slot='menu-item' data-priority='2'>03bcdef02</div>
                <div id='c3' slot='menu-item' data-priority='5'>08cdefg07</div>
                <div id='d4' slot='menu-item' data-priority='7'>10defgh10</div>
                <div id='e5' slot='menu-item' data-priority='9'>12efghi12</div>
                <div id='f6' slot='menu-item' data-priority='8'>11fghij11</div>
                <div id='g7' slot='menu-item' data-priority='1'>01ghijk01</div>
                <div id='h8' slot='menu-item' data-priority='2'>02hijkl03</div>
                <div id='i9' slot='menu-item' data-priority='4'>05ijklm06</div>
                <div id='j10' slot='menu-item' data-priority='5'>07jklmn08</div>
                <div id='k11' slot='menu-item' data-priority='6'>09klmno09</div>
                <div id='l12' slot='menu-item' data-priority='3'>04lmnop04</div>
                <div id='tgl' slot='toggle-item'>toggler</div>
            </aalam-navmenu>
        </div>
        <div id='lower'
            style='width:150px;height:100px;background:red;display:inline-block'>
        </div>
    </div>
</div>`);
        nav = el3.querySelector('aalam-navmenu');
        expect(nav.direction).to.equal('last');

        /*sorted menu*/
        nav._sorted_menu.forEach( (el) => {
            check_menu_el(el);
        });
        expect(m_slot(nav).length).to.equal(8);
        expect(nav._slotted_menu_order[8]).to.equal(nav._sorted_menu[0]);
        expect(nav._slotted_menu_order[0]).to.equal(nav._sorted_menu[1]);
        expect(nav._slotted_menu_order[9]).to.equal(nav._sorted_menu[2]);
        expect(nav._slotted_menu_order[2]).to.equal(nav._sorted_menu[3]);
        expect(nav._slotted_menu_order[10]).to.equal(nav._sorted_menu[4]);
        expect(nav._slotted_menu_order[3]).to.equal(nav._sorted_menu[5]);
        expect(nav._slotted_menu_order[5]).to.equal(nav._sorted_menu[6]);
        expect(nav._slotted_menu_order[4]).to.equal(nav._sorted_menu[7]);

        /*sorted dropdown*/
        nav._sorted_dd.forEach( (el) => {
            check_dd_el(el);
        });
        expect(c_slot(nav).length).to.equal(4);
        expect(nav._slotted_menu_order[6]).to.equal(nav._sorted_dd[0]);
        expect(nav._slotted_menu_order[7]).to.equal(nav._sorted_dd[1]);
        expect(nav._slotted_menu_order[1]).to.equal(nav._sorted_dd[2]);
        expect(nav._slotted_menu_order[11]).to.equal(nav._sorted_dd[3]);
    });

    it('shrink and expand', async () => {
        await setViewport({width:1484, height:900});
        const el = await fixture(template);
        let nav = el.querySelector('aalam-navmenu');
        const mn_len = nav._slotted_menu_order.length;

        expect(m_slot(nav).length).to.equal(8);
        expect(c_slot(nav).length).to.equal(4);

        const par = () => {
            return Math.round(nav.parentElement.getBoundingClientRect().width)};
        const x = () => {return Math.round(par()*100/70 + sl_order(el_wid()))};
        const rx = () => {return Math.round(par()*100/70 - sl_order(el_wid()))};
        const dd_len = () => {return nav._sorted_dd.length};
        const sl_order = (ix) => {
            if(ix < 0)
                return 0;
            return Math.round(nav._slot_order_list[ix])
        };
        const el_wid = () => {
            return Array.prototype.indexOf.call(
                nav._slotted_menu_order, nav._sorted_dd[dd_len() - 1]);
        }
        const menu_el = () => {
            if(dd_len() < 1)
                return mn_len;
            let len;
            if(dd_len() > 1)
                len = nav._tgl_width;
            else if(dd_len() == 1)
                len = 0;
            let i;
            for(i = 0; len < window.innerWidth * 0.7; i++) {
                let ix = Array.prototype.indexOf.call(
                    nav._slotted_menu_order,
                    nav._sorted_menu[nav._sorted_menu.length - 1 -i]);
                len += nav._slot_order_list[ix];
            }
            return i - 1;
        }
        const y = 900;
        expect(nav._slotted_menu_order[el_wid()].slot).to.equal('collapsed-item');

        await setViewport({width:1000, height:y});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        await setViewport({width:x(), height:y})
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        await setViewport({width:rx(), height:y})
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        await setViewport({width:rx(), height:y})
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        await setViewport({width:rx(), height:y})
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        await setViewport({width:1852, height:y})
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        await setViewport({width:1854, height:y})
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        await setViewport({width:500, height:y})
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        await setViewport({width:x(), height:y})
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        await setViewport({width:x(), height:y})
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        await setViewport({width:x(), height:y})
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(menu_el());
        expect(c_slot(nav).length).to.equal(mn_len - m_slot(nav).length);

        /*check toggler element*/
        let i;
        let len = 0;
        for(i = 0; i < nav._slot_order_list.length; i++) {
            len += nav._slot_order_list[i];
        }

        /*add 16 for body element's margin 8*/
        let full_x = Math.ceil(len * 100/70) + 16;

        await setViewport({width: full_x, height:y});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(mn_len);
        expect(nav._dd_toggler.style.display).to.equal('none');

        await setViewport({width:rx(), height:y});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(11);
        expect(c_slot(nav).length).to.equal(1);
        expect(nav._dd_toggler.style.display).to.equal('block');

        await setViewport({width:rx(), height:y});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(10);
        expect(c_slot(nav).length).to.equal(2);
        expect(nav._dd_toggler.style.display).to.equal('block');

        await setViewport({width:rx(), height:y});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(9);
        expect(c_slot(nav).length).to.equal(3);
        expect(nav._dd_toggler.style.display).to.equal('block');

        await setViewport({width:full_x, height:y});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(mn_len);
        expect(nav._dd_toggler.style.display).to.equal('none');

        await setViewport({width:full_x - 1, height:y});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(m_slot(nav).length).to.equal(mn_len - 1);
        expect(nav._dd_toggler.style.display).to.equal('block');
    });
    it('proxy and persist', async () => {
        const el = await fixture(html`
<div>
    <style>
        [slot=menu-item] {background:yellow;padding:20px}
        [slot=toggle-item] {background:orange;padding:20px;color:blue}
    </style>
    <div id='outer'
        style='display:inline-block;width:100%;height:100px;background:pink'>
        <div id='upper'
            style='width:150px;height:200px;
                   display:inline-block;background:blue'>
        </div>
        <div id='container'
            style='width:70%;height:80px;background:green;display:inline-block'>
            <aalam-navmenu>
                <div id='a1' slot='menu-item' data-priority='4'>06abcde05</div>
                <div id='b2' slot='menu-item' data-priority='2'>03bcdef02</div>
                <div id='c3' slot='menu-item' data-priority='5'>08cdefg07</div>
                <div id='d4' data-persist slot='collapsed-item' data-priority='7'>10defgh10</div>
                <div id='e5' slot='menu-item' data-priority='9'>12efghi12</div>
                <div id='f6' slot='menu-item' data-priority='8'>11fghij11</div>
                <div id='g7' slot='menu-item' data-priority='1'><input id="inp" type="text" value="01ghijk01" /></div>
                <div id='h8' data-proxy="h8" slot='menu-item' data-priority='2'><input type="text" value="02hijkl03" /></div>
                <div id='h8' data-proxy="h8" slot='collapsed-item' data-priority='2'>h8*02hijkl03</div>
                <div id='i9' data-proxy="i9" slot='menu-item' data-priority='4'><input type="text" value="check" /></div>
                <div id='i9' data-proxy="i9" slot='collapsed-item' data-priority='4'>i9*05ijklm06</div>
                <div id='j10' slot='menu-item' data-priority='5'>07jklmn08</div>
                <div id='k11' data-proxy="k11" slot='collapsed-item' data-priority='6'>k11*09klmno09</div>
                <div id='k11' data-proxy="k11" slot='menu-item' data-priority='6'><input type="text" value="09klmno09" /></div>
                <div id='l12' data-persist slot='collapsed-item' data-priority='3'>04lmnop04</div>
                <div id='tgl' slot='toggle-item'>toggler</div>
            </aalam-navmenu>
        </div>
        <div id='lower'
            style='width:150px;height:100px;background:red;display:inline-block'>
        </div>
    </div>
</div>`);
        const nav = el.querySelector('aalam-navmenu');
        const mn_len = nav._slotted_menu_order.length;
        const dd_len = () => {return nav._sorted_dd.length};
        const el_wid = () => {
            return Array.prototype.indexOf.call(
                nav._slotted_menu_order, nav._sorted_dd[dd_len() - 1]);
        }
        const sl_order = (ix) => {
            if(ix < 0)
                return 0;
            return Math.round(nav._slot_order_list[ix])
        };
        const par = () => {
            return Math.round(nav.parentElement.getBoundingClientRect().width)};
        const x = () => {return Math.round((par() + sl_order(el_wid()))*100/70)};
        const rx = () => {return Math.round((par() - sl_order(el_wid()))*100/70)};

        const isProxy = (el) => {
            return el.hasAttribute('data-proxy');
        }
        const check_proxy_clp = (el) => {
            let px = el.getAttribute('data-proxy');
            let clp = nav.querySelector(`[data-proxy=${px}][slot=collapsed-item]`);
            expect(clp.style.display).to.equal('block');
            expect(el.style.display).to.equal('none');
        }
        const check_proxy_mnu = (el) => {
            let px = el.getAttribute('data-proxy');
            let mnu = nav.querySelector(`[data-proxy=${px}][slot=menu-item]`);
            expect(mnu.style.display).to.equal('block');
            expect(el.style.display).to.equal('none');
        }
        const check_not_proxy = (el) => {
            let px = el.getAttribute('data-proxy');
            expect(px).to.equal(null);
        }
        const tgl_disp = () => {
            expect(nav._dd_toggler.style.display).to.equal('block');
        }
        const check_persist = () => {
            let c = nav.querySelectorAll('[data-persist][slot=collapsed-item]');
            expect(c.length).to.equal(2);
            tgl_disp();
        }


        check_persist();
        let sz = 0;
        let i = 0;
        for(i = 0;i < nav._sorted_menu.length;i++) {
            let ix = Array.prototype.indexOf.call(
                nav._slotted_menu_order, nav._sorted_menu[i]);
            sz += nav._slot_order_list[ix];
        }
        sz = Math.ceil((sz + nav._tgl_width) * 100/70) + 16;

        await setViewport({width:sz, height:200});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(nav._sorted_menu.length).to.equal(i);
        check_persist();

        let len = 0;
        for(i = 0; i < nav._slot_order_list.length; i++)
            len += nav._slot_order_list[i];

        /*add 16 for body element's margin 8*/
        let full_x = Math.ceil((len + nav._tgl_width) * 100/70) + 16;

        check_persist();
        await setViewport({width:full_x, height:200});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(nav._sorted_menu.length).to.equal(mn_len);
        expect(nav._sorted_dd.length).to.equal(0);
        check_persist();

        await setViewport({width:rx(), height:200});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(nav._sorted_menu.length).to.equal(mn_len - 1);
        expect(nav._sorted_dd.length).to.equal(1);
        check_not_proxy(nav._sorted_dd[dd_len() - 1]);
        let inp_el = nav.querySelector("#inp");;
        expect(nav._sorted_dd[dd_len() - 1].children[0]).to.equal(inp_el)
        check_persist();

        await setViewport({width:rx(), height:200});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(nav._sorted_menu.length).to.equal(mn_len - 2);
        expect(nav._sorted_dd.length).to.equal(2);
        check_proxy_clp(nav._sorted_dd[dd_len() - 1]);
        check_persist();

        await setViewport({width:rx(), height:200});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(nav._sorted_menu.length).to.equal(mn_len - 3);
        expect(nav._sorted_dd.length).to.equal(3);
        check_not_proxy(nav._sorted_dd[dd_len() - 1]);
        check_persist();

        await setViewport({width:x(), height:200});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(nav._sorted_menu.length).to.equal(mn_len - 2);
        expect(nav._sorted_dd.length).to.equal(2);
        expect(isProxy(nav._sorted_dd[dd_len() - 1])).to.equal(true);
        check_proxy_clp(nav._sorted_dd[dd_len() - 1])
        check_persist();

        await setViewport({width:full_x + full_x, height:200});
        nav.dispatchEvent(new Event('resize', {bubbles:true}));
        expect(nav._sorted_menu.length).to.equal(mn_len);
        expect(nav._sorted_dd.length).to.equal(0);
        check_persist();
    });
});
