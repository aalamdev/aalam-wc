import {fixture, expect, html, oneEvent} from '@open-wc/testing';
import {AalamDropdown} from "../src/dropdown";
import {sendMouse, setViewport} from "@web/test-runner-commands";

describe('aalam-dropdown', () => {
    const check_bounding_open = (el) => {
        expect(el.left != 0).to.equal(true);
        expect(el.right != 0).to.equal(true);
        expect(el.top != 0).to.equal(true);
        expect(el.bottom != 0).to.equal(true);
        expect(el.width != 0).to.equal(true);
        expect(el.height != 0).to.equal(true);
    }
    const check_bounding_close = (el) => {
        expect(el.left == 0).to.equal(true);
        expect(el.right == 0).to.equal(true);
        expect(el.top == 0).to.equal(true);
        expect(el.bottom == 0).to.equal(true);
        expect(el.width == 0).to.equal(true);
        expect(el.height == 0).to.equal(true);
    }
    const check_pos_top = (tgl, bdy) => {
        expect(tgl.top > bdy.top).to.equal(true);
        expect(tgl.top > bdy.bottom).to.equal(true);
    }
    const check_pos_bottom = (tgl, bdy) => {
        expect(tgl.bottom < bdy.top).to.equal(true);
        expect(tgl.bottom < bdy.bottom).to.equal(true);
    }
    const check_pos_left = (tgl, bdy) => {
        expect(tgl.left > bdy.left).to.equal(true);
        expect(tgl.left > bdy.right).to.equal(true);
    }
    const check_pos_right = (tgl, bdy) => {
        expect(tgl.right < bdy.left).to.equal(true);
        expect(tgl.right < bdy.right).to.equal(true);
    }
    it('is defined', async () => {
        const el = await fixture(html`<aalam-dropdown></aalam-dropdown>`);
        expect(el).to.be.an.instanceof(AalamDropdown);

        const el1 = document.createElement('aalam-dropdown');
        expect(el1).to.be.an.instanceof(AalamDropdown);
    });
    it('closesel', async () => {
        const el = await fixture(`
<div>
    <aalam-dropdown closesel='.closing'>
        <button slot='dd-toggler'></button>
        <div slot='dd-body'>
            <div>item 1</div>
            <div class='closing'>item 2</div>
            <div class='close'>item 3</div>
        </div>
    </aalam-dropdown>
</div>`);

        const dd = el.querySelector('aalam-dropdown');
        const tgl = dd.querySelector('[slot=dd-toggler]');
        const bdy = dd.querySelector('[slot=dd-body]');
        let bdy_rect = bdy.getBoundingClientRect();

        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        await tgl.click();
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);
        expect(bdy.children.length).to.equal(3);

        await bdy.children[0].click();
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);
        expect(dd._isOpen).to.equal(true);

        await bdy.children[1].click();
        await dd.updated();
        expect(dd._isOpen).to.equal(false);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_close(bdy_rect);

        /*remove closesel attribute*/
        dd.removeAttribute('closesel');

        await tgl.click();
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);

        await bdy.children[0].click();
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);

        await bdy.children[1].click();
        await dd.updated();
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);

        await bdy.children[2].click();
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);

        /*set closesel attribute*/
        dd.setAttribute('closesel', '.close');

        await bdy.children[0].click();
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);

        await bdy.children[1].click();
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);

        await bdy.children[2].click();
        expect(dd._isOpen).to.equal(false);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_close(bdy_rect);

        /*invalid closesel*/
        dd.setAttribute('closesel', '.wrong');
        let cl = dd.querySelector('.wrong');
        expect(cl).to.equal(null);
    });
    it('position', async () => {
        const el = await fixture(`
<div>
    <div id='container' style="display:flex;justify-content:center">
        <aalam-dropdown position='top' noflip mode='hover'>
            <button slot='dd-toggler'>toggler</button>
            <div slot='dd-body'>
                <div>item 1</div>
                <div>item 2</div>
                <div>item 3</div>
            </div>
        </aalam-dropdown>
    </div>
</div>`);
        const dd = el.querySelector('aalam-dropdown');
        const container = el.querySelector('#container');
        const tgl = dd.querySelector('[slot=dd-toggler]');
        const bdy = dd.querySelector('[slot=dd-body]');
        let bdy_rect = bdy.getBoundingClientRect();
        let tgl_rect = tgl.getBoundingClientRect();

        /*top position*/
        expect(dd.position).to.equal('top');
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        let [x, y] = [Math.round(tgl_rect.x + tgl_rect.width/2),
                      Math.round(tgl_rect.y + tgl_rect.height/2)];
        let [lx, ly] = [Math.round(tgl_rect.x/2), Math.round(tgl_rect.y/2)];
        await sendMouse({type:'move', position:[x, y]});
        await dd.updated();
        tgl_rect = tgl.getBoundingClientRect();
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_top(tgl_rect, bdy_rect);

        /*left position*/
        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        dd.setAttribute('position', 'left');
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_left(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*right position*/
        dd.setAttribute('position', 'right');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_right(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*bottom position*/
        dd.setAttribute('position', 'bottom');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_bottom(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*check with invalid position*/
        /*bottom-left position*/
        dd.setAttribute('position', 'bt-start');
        expect(dd.position).to.equal('bottom-left');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_bottom(tgl_rect, bdy_rect);
        expect(tgl_rect.left < bdy_rect.left).to.equal(true);
        expect(tgl_rect.right > bdy_rect.left).to.equal(true);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*top-left position*/
        dd.setAttribute('position', 'top-left');
        expect(dd.position).to.equal('top-left');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_top(tgl_rect, bdy_rect);
        expect(tgl_rect.left < bdy_rect.left).to.equal(true);
        expect(tgl_rect.right > bdy_rect.left).to.equal(true);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*top-right position*/
        dd.setAttribute('position', 'top-right');
        expect(dd.position).to.equal('top-right');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_top(tgl_rect, bdy_rect);
        expect(tgl_rect.left < bdy_rect.right).to.equal(true);
        expect(tgl_rect.right > bdy_rect.left).to.equal(true);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*bottom-right position*/
        dd.setAttribute('position', 'bottom-right');
        expect(dd.position).to.equal('bottom-right');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_bottom(tgl_rect, bdy_rect);
        expect(tgl_rect.left < bdy_rect.right).to.equal(true);
        expect(tgl_rect.right > bdy_rect.left).to.equal(true);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*right-bottom position*/
        dd.setAttribute('position', 'right-bottom');
        expect(dd.position).to.equal('right-bottom');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_right(tgl_rect, bdy_rect);
        expect(tgl_rect.top < bdy_rect.bottom).to.equal(true);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*right-top position*/
        dd.setAttribute('position', 'right-top');
        expect(dd.position).to.equal('right-top');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_right(tgl_rect, bdy_rect);
        expect(tgl_rect.top < bdy_rect.top).to.equal(true);
        expect(tgl_rect.bottom > bdy_rect.top).to.equal(true);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*left-bottom position*/
        dd.setAttribute('position', 'left-bottom');
        expect(dd.position).to.equal('left-bottom');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_left(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*left-top position*/
        dd.setAttribute('position', 'left-top');
        expect(dd.position).to.equal('left-top');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_left(tgl_rect, bdy_rect);
        expect(tgl_rect.top < bdy_rect.top).to.equal(true);
        expect(tgl_rect.bottom > bdy_rect.top).to.equal(true);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*remove attribute noflip*/
        dd.removeAttribute('noflip');
        dd.setAttribute('position', 'bottom');
        /*bottom position*/
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_bottom(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*top position*/
        dd.setAttribute('position', 'top');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_bottom(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*left position*/
        dd.setAttribute('position', 'left');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_left(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*right position*/
        dd.setAttribute('position', 'right');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_right(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*element at left end*/
        /*remove style attribute*/
        container.removeAttribute('style');
        await dd.updated();
        tgl_rect = tgl.getBoundingClientRect();
        bdy_rect = bdy.getBoundingClientRect();
        [x, y] = [Math.round(tgl_rect.x + tgl_rect.width/2),
                  Math.round(tgl_rect.y + tgl_rect.height/2)];
        [lx, ly] = [
            Math.round(tgl_rect.right + (
                window.innerWidth - tgl_rect.right)/2),
            Math.round(tgl_rect.bottom + (
                window.innerHeight - tgl_rect.bottom)/2)];
        /*right position*/
        dd.setAttribute('position', 'right');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_right(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*left position*/
        dd.setAttribute('position', 'left');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_bottom(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*top position*/
        dd.setAttribute('position', 'top');
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_bottom(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);

        /*bottom position*/
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_bottom(tgl_rect, bdy_rect);

        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);



    });
    it('boundsel', async () => {
        const el = await fixture(`
<div>
    <div id='top-div' style="display:inline-block;height:200px;width:400px">
    </div>
    <div id='boundsel' style='display:block;width:400px;height:250px'></div>
    <div style='display:flex;justify-content:center'>
        <aalam-dropdown id='dd' mode='hover' mode='hover' boundsel='#boundsel'
            position='left' noflip>
            <button slot='dd-toggler'>toggler</button>
            <div slot='dd-body'>
                <div>1</div>
                <div>2</div>
                <div>3</div>
            </div>
        </aalam-dropdown>
    </div>
</div>`);
        const dd = el.querySelector('#dd');
        const td = el.querySelector('#top-div');
        const bdy = dd.querySelector('[slot=dd-body]');
        const tgl = dd.querySelector('[slot=dd-toggler]');
        let bnd = el.querySelector(dd.boundsel);
        let bdy_rect = bdy.getBoundingClientRect();
        let tgl_rect = tgl.getBoundingClientRect();
        let bnd_rect = bnd.getBoundingClientRect();
        let [x, y] = [Math.round(tgl_rect.x + tgl_rect.width/2),
                      Math.round(tgl_rect.y + tgl_rect.height/2)];
        let [lx, ly] = [Math.round(tgl_rect.x/2), Math.round(tgl_rect.y/2)];

        expect(dd._isOpen).to.equal(false);
        expect(dd.position).to.equal('left');
        expect(dd.boundsel).to.equal('#boundsel');
        check_bounding_close(bdy_rect);

        /*left position*/
        await sendMouse({type:'move', position: [x, y]});
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);
        check_pos_left(bnd_rect, bdy_rect);

        await sendMouse({type:'move', position: [lx, ly]});
        expect(dd._isOpen).to.equal(false);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_close(bdy_rect);

        /*top position*/
        dd.setAttribute('position', 'top');
        await sendMouse({type:'move', position:[x, y]});
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);
        check_pos_top(bnd_rect, bdy_rect);

        await sendMouse({type:'move', position: [lx, ly]});
        expect(dd._isOpen).to.equal(false);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_close(bdy_rect);

        /*right position*/
        dd.setAttribute('position', 'right');
        await sendMouse({type:'move', position: [x, y]});
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);
        check_pos_right(bnd_rect, bdy_rect);

        await sendMouse({type:'move', position: [lx, ly]});
        expect(dd._isOpen).to.equal(false);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_close(bdy_rect);

        /*bottom position*/
        dd.setAttribute('position', 'bottom');
        await sendMouse({type:'move', position:[x,y]});
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);
        check_pos_bottom(bnd_rect, bdy_rect);

        await sendMouse({type:'move', position: [lx, ly]});
        expect(dd._isOpen).to.equal(false);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_close(bdy_rect);

        /*change boundsel attribute*/
        dd.setAttribute('boundsel', '#top-div');
        bnd = el.querySelector(dd.boundsel);
        bdy_rect = bdy.getBoundingClientRect();
        tgl_rect = tgl.getBoundingClientRect();
        bnd_rect = bnd.getBoundingClientRect();
        [x, y] = [Math.round(tgl_rect.x + tgl_rect.width/2),
                      Math.round(tgl_rect.y + tgl_rect.height/2)];
        [lx, ly] = [Math.round(tgl_rect.x/2), Math.round(tgl_rect.y/2)];

        expect(dd._isOpen).to.equal(false);
        expect(dd.position).to.equal('bottom');
        expect(dd.boundsel).to.equal('#top-div');
        check_bounding_close(bdy_rect);

        /*bottom position*/
        dd.setAttribute('position', 'bottom');
        await sendMouse({type:'move', position:[x,y]});
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);
        check_pos_bottom(bnd_rect, bdy_rect);

        await sendMouse({type:'move', position: [lx, ly]});
        expect(dd._isOpen).to.equal(false);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_close(bdy_rect);

        /*set invalid value on  boundsel attribute*/
        dd.setAttribute('boundsel', '.clos');
        expect(dd.boundsel).to.equal('.clos');
        let tmp = el.querySelector('.clos');
        expect(tmp).to.equal(null);
    });
    it('safe polygon', async () => {
        const el = await fixture(`
</div>
<div style='display:flex;justify-content:center'>
    <aalam-dropdown id='dd' mode='hover' mode='hover'
        position='left' noflip>
        <button id='dd-toggler' slot='dd-toggler'>toggler</button>
        <div id='dd-body' slot='dd-body'>
            <aalam-dropdown id="inner-dd"
                animationDur="90" mode="hover" position="right-top"
                closesel="closesel">
                <div id='dd-inner-toggler' slot="dd-toggler"
                    class="dropdown-item item-1">
                    Link 1
                </div>
                <div id='dd-inner-body' slot="dd-body" class="dropdown-body">
                    <div class="dropdown-item">
                        Sub Item 1
                    </div>
                    <div class="dropdown-item closesel">
                        Sub Item 2
                    </div>
                    <div class="dropdown-item">
                        Sub Item 3
                    </div>
                </div>
            </aalam-dropdown>
            <div>1</div>
            <div>2</div>
            <div>3</div>
        </div>
    </aalam-dropdown>
</div>`);
        
        const dd = el.querySelector('#dd');
        const in_dd = el.querySelector('#inner-dd');
        const bdy = dd.querySelector('#dd-body');
        const tgl = dd.querySelector('#dd-toggler');
        const in_bdy = in_dd.querySelector('#dd-inner-body');
        const in_tgl = in_dd.querySelector('#dd-inner-toggler');
        let bdy_rect = bdy.getBoundingClientRect();
        let tgl_rect = tgl.getBoundingClientRect();
        let in_tgl_rect = in_tgl.getBoundingClientRect();
        let in_bdy_rect = in_bdy.getBoundingClientRect();
        let [x, y] = [Math.round(tgl_rect.x + tgl_rect.width/2),
                      Math.round(tgl_rect.y + tgl_rect.height/2)];
        let [lx, ly] = [Math.round(tgl_rect.x/2), Math.round(tgl_rect.y/2)];
        let [in_x, in_y] = [Math.round(in_tgl_rect.x + in_tgl_rect.width/2),
                            Math.round(in_tgl_rect.y + in_tgl_rect.height/2)];
        let [in_lx, in_ly] = [Math.round(in_tgl_rect.x/2),
                              Math.round(in_tgl_rect.y/2)];


        expect(dd._isOpen).to.equal(false);
        expect(in_dd._isOpen).to.equal(false);
        expect(dd.position).to.equal('left');
        expect(in_dd.position).to.equal('right-top');
        check_bounding_close(bdy_rect);
        check_bounding_close(in_bdy_rect);

        /*open first dropdown*/
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_pos_left(tgl_rect, bdy_rect);
        check_bounding_close(in_bdy_rect);
        in_tgl_rect = in_tgl.getBoundingClientRect();

        /*open second dropdown*/
        [in_x, in_y] = [Math.round(in_tgl_rect.x + in_tgl_rect.width/2),
                            Math.round(in_tgl_rect.y + in_tgl_rect.height/2)];
        [in_lx, in_ly] = [Math.round(in_tgl_rect.x/2),
                          Math.round(in_tgl_rect.y/2)];

        await sendMouse({type:'move', position:[in_x, in_y]});
        expect(in_dd._isOpen).to.equal(true);
        expect(dd._isOpen).to.equal(true);
        in_bdy_rect = in_bdy.getBoundingClientRect();
        check_bounding_open(in_bdy_rect);
        check_bounding_open(bdy_rect);
        check_pos_right(in_tgl_rect, in_bdy_rect);
        check_pos_left(tgl_rect, bdy_rect);

        /*move within the 2nd dropdown*/
        let bx = Math.round(in_bdy_rect.x + in_bdy_rect.width/2)
        await sendMouse({type:'move', position:[bx, in_y]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(in_dd._isOpen).to.equal(true);
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_bounding_open(in_bdy_rect);

        await sendMouse({type:'move', position:[
            bx, Math.round(in_bdy_rect.bottom - 2)]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(in_dd._isOpen).to.equal(true);
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_bounding_open(in_bdy_rect);

        await sendMouse({type:'move', position:[in_x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(in_dd._isOpen).to.equal(true);
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_bounding_open(in_bdy_rect);

        /*check 2nd dropdown close and 1st dropdown open*/
        await sendMouse({type:'move', position:[
            in_x, Math.round(bdy_rect.bottom - 2)]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        expect(in_dd._isOpen).to.equal(false);
        check_bounding_open(bdy_rect);
        check_bounding_close(in_bdy_rect);

        /*check close entire dropdown*/
        await sendMouse({type:'move', position:[lx, ly]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(false);
        expect(in_dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);
        check_bounding_close(in_bdy_rect);

        /*open 1st dropdown*/
        await sendMouse({type:'move', position:[x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(dd._isOpen).to.equal(true);
        expect(in_dd._isOpen).to.equal(false);
        check_bounding_open(bdy_rect);
        check_bounding_close(in_bdy_rect);

        /*open second dropdown*/
        [in_x, in_y] = [Math.round(in_tgl_rect.x + in_tgl_rect.width/2),
                            Math.round(in_tgl_rect.y + in_tgl_rect.height/2)];
        [in_lx, in_ly] = [Math.round(in_tgl_rect.x/2),
                          Math.round(in_tgl_rect.y/2)];

        await sendMouse({type:'move', position:[in_x, in_y]});
        expect(in_dd._isOpen).to.equal(true);
        expect(dd._isOpen).to.equal(true);
        in_bdy_rect = in_bdy.getBoundingClientRect();
        check_bounding_open(in_bdy_rect);
        check_bounding_open(bdy_rect);
        check_pos_right(in_tgl_rect, in_bdy_rect);
        check_pos_left(tgl_rect, bdy_rect);

        /*move within the 2nd dropdown*/
        bx = Math.round(in_bdy_rect.x + in_bdy_rect.width/2)
        await sendMouse({type:'move', position:[bx, in_y]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(in_dd._isOpen).to.equal(true);
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_bounding_open(in_bdy_rect);

        await sendMouse({type:'move', position:[
            bx, Math.round(in_bdy_rect.bottom - 2)]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(in_dd._isOpen).to.equal(true);
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_bounding_open(in_bdy_rect);

        await sendMouse({type:'move', position:[in_x, y]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(in_dd._isOpen).to.equal(true);
        expect(dd._isOpen).to.equal(true);
        check_bounding_open(bdy_rect);
        check_bounding_open(in_bdy_rect);

        /*close both 1st and 2nd dropdown*/
        await sendMouse({type:'move', position:[in_lx, in_ly]});
        bdy_rect = bdy.getBoundingClientRect();
        in_bdy_rect = in_bdy.getBoundingClientRect();
        expect(in_dd._isOpen).to.equal(false);
        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);
        check_bounding_close(in_bdy_rect);
    });
    it('animation', async () => {
        let anim = 'show:reveal-y;hide:conceal-y';
        const el = await fixture(`
<div>
    <aalam-dropdown animation="${anim}"
        animationDur="90" mode="hover" position="right-top"
        closesel="closesel">
        <div slot="dd-toggler" class="dropdown-item item-1">
            Link 1
        </div>
        <div slot="dd-body" class="dropdown-body">
            <div class="dropdown-item">
                Sub Item 1
            </div>
            <div class="dropdown-item closesel">
                Sub Item 2
            </div>
            <div class="dropdown-item">
                Sub Item 3
            </div>
        </div>
    </aalam-dropdown>
</div>`);
        const dd = el.querySelector('aalam-dropdown');
        let as = dd._animation_styles;
        expect(dd.animation).to.equal(anim);
        expect(as.show).to.equal('reveal-y');
        expect(as.hide).to.equal('conceal-y');

        /*only show animation*/
        anim = 'show:reveal-x';
        dd.setAttribute('animation', anim);
        as = dd._animation_styles;
        expect(as.show).to.equal('reveal-x');
        expect(as.hide).to.equal('');

        /*only hide animation*/
        anim = 'hide:fade-out';
        dd.setAttribute('animation', anim);
        as = dd._animation_styles;
        expect(as.show).to.equal('');
        expect(as.hide).to.equal('fade-out');

        /*format 2*/
        anim = 'conceal-x';
        dd.setAttribute('animation', anim);
        as = dd._animation_styles;
        expect(as.show).to.equal('reveal-x');
        expect(as.hide).to.equal('conceal-x');

        anim = 'reveal-y';
        dd.setAttribute('animation', anim);
        as = dd._animation_styles;
        expect(as.show).to.equal('reveal-y');
        expect(as.hide).to.equal('conceal-y');

        anim = 'fade-out';
        dd.setAttribute('animation', anim);
        as = dd._animation_styles;
        expect(as.show).to.equal('fade-in');
        expect(as.hide).to.equal('fade-out');

        /*invalid values as input*/
        anim = 'reveal-out';
        dd.setAttribute('animation', anim);
        as = dd._animation_styles;
        expect(as.show).to.equal('');
        expect(as.hide).to.equal('');

        anim = 'fade-x';
        dd.setAttribute('animation', anim);
        as = dd._animation_styles;
        expect(as.show).to.equal('');
        expect(as.hide).to.equal('');

        anim = 'show:conceal-x;hide:reveal-y';
        dd.setAttribute('animation', anim);
        as = dd._animation_styles;
        expect(as.show).to.equal('');
        expect(as.hide).to.equal('');
    });
    it('events', async () => {
        const el = await fixture(`
<div>
    <div style='display:flex;justify-content:center'>
        <aalam-dropdown id='dd' mode='hover'
            position='left' noflip>
            <button slot='dd-toggler'>toggler</button>
            <div slot='dd-body'>
                <div>1</div>
                <div>2</div>
                <div>3</div>
            </div>
        </aalam-dropdown>
    </div>
</div>`);
        const dd = el.querySelector('aalam-dropdown') as HTMLELemnent;
        const tgl = dd.querySelector('[slot=dd-toggler]');
        const bdy = dd.querySelector('[slot=dd-body]');
        let tgl_rect = tgl.getBoundingClientRect();
        let bdy_rect = bdy.getBoundingClientRect();
        let show_listener = oneEvent(dd, 'show');
        let hide_listener = oneEvent(dd, 'hide');

        expect(dd._isOpen).to.equal(false);
        check_bounding_close(bdy_rect);


        let [x, y] = [Math.round(tgl_rect.x + tgl_rect.width/2),
                      Math.round(tgl_rect.y + tgl_rect.height/2)];
        let [lx, ly] = [Math.round(tgl_rect.right + 20),
                        Math.round(tgl_rect.bottom + 20)];
        await sendMouse({type:'move', position:[x, y]});
        let show_event = await show_listener;
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);
        expect(bdy.children.length).to.equal(3);
        expect(show_event).to.exist;

        await sendMouse({type:'move', position:[lx, ly]});
        let hide_event = await hide_listener;
        expect(dd._isOpen).to.equal(false);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_close(bdy_rect);
        expect(hide_event).to.exist;

        /*show event*/
        await sendMouse({type:'move', position:[x, y]});
        show_event = await show_listener;
        expect(dd._isOpen).to.equal(true);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_open(bdy_rect);
        expect(bdy.children.length).to.equal(3);
        expect(show_event).to.exist;

        /*hide event*/
        await sendMouse({type:'move', position:[lx, ly]});
        hide_event = await hide_listener;
        expect(dd._isOpen).to.equal(false);
        bdy_rect = bdy.getBoundingClientRect();
        check_bounding_close(bdy_rect);
        expect(hide_event).to.exist;
    });
});
