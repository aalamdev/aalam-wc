import {fixture, expect, html, oneEvent} from '@open-wc/testing';
import {AalamTooltip} from "../src/tooltip";
import { sendMouse } from '@web/test-runner-commands';

describe('aalam-tooltip', () => {
    const check_pos = (btn, bdy, pos) => {
        if(pos == 'top' || pos == 'left')
            expect(btn > bdy).to.equal(true);
        else
            expect(bdy > btn).to.equal(true);
    }
    const display = (el:HTMLElement, state:Boolean) => {
        if(state)
            expect(el.style.display).to.equal('block');
        else
            expect(el.style.display).to.equal('');
    }

    it('is defined', async () => {
        const el = await fixture(html`<aalam-tooltip></aalam-tooltip>`);
        expect(el).to.be.an.instanceof(AalamTooltip);

        const el1 = document.createElement("aalam-tooltip");
        expect(el1).to.be.an.instanceof(AalamTooltip);
    });
    it('position', async () => {
        const el = await fixture(`
<div style="position:absolute;left:70%;top:50%">
    <aalam-tooltip id="ttp">
        <button id="btn">my button</button>
    </aalam-tooltip>
</div>`);
        const tltp = el.querySelector("#ttp");
        const btn = el.querySelector("#btn");
        const bdy = tltp.body_el;
        let btn_bounds = btn.getBoundingClientRect();
        let [x, y] = [
            Math.round(btn_bounds.x + btn_bounds.width/2),
            Math.round(btn_bounds.y + btn_bounds.height/2)
        ];
        let [lx, ly] = [Math.round(btn_bounds.x/2), Math.round(btn_bounds.y/2)];
        display(bdy);
        await sendMouse({type:'move', position:[x, y]});
        let bdy_bounds = bdy.getBoundingClientRect();
        expect(tltp.position).to.equal('top');
        display(bdy, true);
        check_pos(btn_bounds.top, bdy_bounds.bottom, 'top');

        tltp.setAttribute('position', 'left');
        await sendMouse({type:'move', position:[lx, ly]});
        display(bdy, false);
        await sendMouse({type:'move', position:[x, y]});
        bdy_bounds = bdy.getBoundingClientRect();
        expect(tltp.position).to.equal('left');
        display(bdy, true);
        expect(btn_bounds.left > bdy_bounds.left).to.equal(true);
        expect(btn_bounds.bottom > bdy_bounds.top).to.equal(true);
        expect(btn_bounds.top < bdy_bounds.bottom).to.equal(true);
        expect(btn_bounds.right > bdy_bounds.right).to.equal(true);

        tltp.setAttribute("position", 'bottom');
        await sendMouse({type:'move', position:[lx, ly]});
        display(bdy, false);
        await sendMouse({type:'move', position:[x, y]});
        bdy_bounds = bdy.getBoundingClientRect();
        expect(tltp.position).to.equal('bottom');
        display(bdy, true);
        check_pos(btn_bounds.bottom, bdy_bounds.top, 'bottom');

        tltp.setAttribute("position", 'btm');
        await sendMouse({type:'move', position:[lx, ly]});
        display(bdy, false);
        await sendMouse({type:'move', position:[x, y]});
        bdy_bounds = bdy.getBoundingClientRect();
        expect(tltp.position).to.equal('top');
        display(bdy, true);
        check_pos(btn_bounds.top, bdy_bounds.bottom, 'top');

        tltp.setAttribute('position', 'right');
        await sendMouse({type:'move', position:[lx, ly]});
        display(bdy, false);
        await sendMouse({type:'move', position:[x, y]});
        bdy_bounds = bdy.getBoundingClientRect();
        expect(tltp.position).to.equal('right');
        display(bdy, true);
        check_pos(btn_bounds.right, bdy_bounds.left, 'right');

        tltp.setAttribute('position', 'top');
        await sendMouse({type:'move', position:[lx, ly]});
        display(bdy, false);
        await sendMouse({type:'move', position:[x, y]});
        bdy_bounds = bdy.getBoundingClientRect();
        expect(tltp.position).to.equal('top');
        display(bdy, true);
        check_pos(btn_bounds.top, bdy_bounds.bottom, 'top');
    });
});
