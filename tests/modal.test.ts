import { fixture, expect, html } from '@open-wc/testing';
import { stub } from 'sinon';
import { sendMouse } from '@web/test-runner-commands';
import { AalamModal } from "../src/modal";
import { sendKeys } from "@web/test-runner-commands";
import { setViewport } from "@web/test-runner-commands";

const element_bounds = (el:HTMLElement) => {
    let modal_body = el.querySelector("[slot=modal-body]");
    let wrp = modal_body.getBoundingClientRect();
    expect(wrp.width).to.be.not.equal(0);
    expect(wrp.height).to.be.not.equal(0);
    expect(wrp.right).to.be.not.equal(0);
    expect(wrp.bottom).to.be.not.equal(0);
}

describe('aalam-modal', () => {
    it('is defined', async () => {
        const el = await fixture(html` <aalam-modal></aalam-modal>`);
        expect(el).to.be.an.instanceof(AalamModal);

        const el1 = document.createElement("aalam-modal");
        expect(el1).to.be.an.instanceof(AalamModal);
    });

    it('show-hide-attachParent-attachBody', async () => {
        const root = await fixture (html`
<div id="parent">
    <aalam-modal>
        <div id="modal-body" slot="modal-body">
            <div style="height:20px;width:30px;background:grey">
            </div>
            <div style="height:40px;width:20px"></div>
        </div>
    </aalam-modal>
</div>`);
        const modal = root.querySelector('aalam-modal');
        const body_el = document.body;
        const parent_el = modal.parentElement;
        modal.animationDur = 0;
        modal.show();
        await modal.updated()
        expect(modal.open).to.equal(true);
        element_bounds(modal);
        expect(modal.parentElement).to.equal(document.body);
        expect(modal.parentElement).to.not.equal(parent_el);
        expect(modal.open).to.equal(true);
        modal.hide();
        expect(modal.parentElement).to.equal(parent_el);
        expect(modal.open).to.equal(false);
        modal.show();
        element_bounds(modal);
        expect(modal.open).to.equal(true);
        expect(modal.parentElement).to.equal(body_el);

    });

    it('stack', async () => {
        const el1 = await fixture (html`
<div id = "parent_holder">
    <aalam-modal id="outer_modal">
        <div id="parent-slot" slot="modal-body">
            <div style="height:20px;width:30px;background:grey">
            </div>
            <div id="child_modal">
                <aalam-modal id="inner_modal">
                    <div id="inner-slot" slot="modal-body">
                        <div style="height:20px;width:40px;background:orange">
                        </div>
                    </div>
                </aalam-modal>
            </div>
        </div>
    </aalam-modal>
    <aalam-modal id="stack_modal" stack>
        <div id="stack-slot" slot="modal-body">
            <div style="height:20px;width:40px;background:orange"></div>
        </div>
    </aalam-modal>
</div>`);

        const out_mod = el1.querySelector("#outer_modal");
        const in_mod = out_mod.querySelector("#inner_modal");
        const out_par = out_mod.parentElement;
        const in_par = in_mod.parentElement;
        const body_el = document.body;
        out_mod.show();
        await out_mod.updated();
        element_bounds(out_mod);
        expect(out_mod.parentElement).to.equal(document.body);
        expect(out_mod.open).to.equal(true);
        expect(in_mod.parentElement).to.equal(in_par);
        expect(in_mod.open).to.equal(false);
        out_mod.animationDur = 0;
        in_mod.show();
        await in_mod.updated();
        element_bounds(in_mod);
        expect(out_mod.parentElement).to.equal(out_par);
        expect(out_mod.open).to.equal(false);
        expect(in_mod.parentElement).to.equal(document.body);
        expect(in_mod.open).to.equal(true);

        const stack_modal = el1.querySelector("#stack_modal");
        const stack_par = stack_modal.parentElement;
        stack_modal.animationDur =0;

        out_mod.show();
        await out_mod.updated();
        element_bounds(out_mod);
        expect(out_mod.open).to.equal(true);
        expect(in_mod.open).to.equal(false);
        expect(stack_modal.open).to.equal(false);
        stack_modal.show();
        await stack_modal.updated();
        element_bounds(stack_modal);
        expect(stack_modal.parentElement).to.equal(out_mod.parentElement);
        expect(stack_modal.parentElement).to.equal(body_el);
        expect(out_mod.parentElement).to.equal(body_el);

        expect(in_mod.open).to.equal(false);
        expect(out_mod.open).to.equal(true);
        expect(stack_modal.open).to.equal(true);

        stack_modal.hide();
        expect(stack_modal.open).to.equal(false);
        expect(stack_modal.parentElement).to.equal(stack_par);
        expect(out_mod.open).to.equal(true);
        expect(out_mod.parentElement).to.equal(body_el);
    });

    it('closesel', async () => {
        const el1 = await fixture (html`
<div id = "parent">
    <button id="open_btn"></button>
    <aalam-modal id="modal" closesel=".closing">
           <div id="slot" slot="modal-body">
               <button id = "close_btn"></button>
               <button id="new_button"></button>
           </div>
    </aalam-modal>
</div>`);
        const modal = el1.querySelector("#modal");
        modal.animationDur = 0;
        const slot_id = el1.querySelector("#slot");
        const modal_par = modal.parentElement;
        expect(modal.parentElement).to.equal(modal_par);
        modal.show();
        await modal.updated();
        element_bounds(modal);
        expect(modal.parentElement).to.equal(document.body);
        const new_btn = modal.querySelector("#new_button");
        const new_el = document.createElement("button");
        new_el.click();
        expect(modal.parentElement).to.equal(document.body);
        new_el.classList.add("closing");
        slot_id.appendChild(new_el);
        expect(modal.parentElement).to.equal(document.body);
        new_el.click();
        expect(modal.parentElement).to.equal(modal_par);
    });

    it('noesc', async () => {
        const el1 = await fixture(html`
<div id="parent">
    <aalam-modal id="modal">
       

 <div slot="modal-body">
            <div style="height:20px;width:40px;background:orange"></div>
        </div>
    </aalam-modal>
</div>`);
        const modal = el1.querySelector("#modal");
        const modal_parent = modal.parentElement;
        modal.animationDur = 0;
        modal.show();
        await modal.updated();
        element_bounds(modal);
        expect(modal.parentElement).to.equal(document.body);
        await sendKeys({down:"Escape"});
        expect(modal.open).to.equal(false);
        expect(modal.parentElement).to.equal(modal_parent);
        modal.setAttribute("noesc", true);
        modal.show();
        await modal.updated();
        await sendKeys({down:"Escape"});
        expect(modal.open).to.equal(true);
        expect(modal.parentElement).to.equal(document.body);
        element_bounds(modal);

        const el2 = await fixture(html `
<div id="parent">
    <aalam-modal id="modal" noesc>
        <div slot="modal-body">
            <div style="height:20px;width:40px;background:orange"></div>
        </div>
    </aalam-modal>
</div>`);
        const el_modal = el2.querySelector("#modal");
        const el_mod_par = el_modal.parentElement;
        el_modal.animationDur = 0;
        el_modal.show();
        await el_modal.updated()
        element_bounds(el_modal);
        expect(el_modal.parentElement).to.equal(document.body);
        await sendKeys({down:"Escape"});
        expect(el_modal.parentElement).to.equal(document.body);
        el_modal.removeAttribute("noesc");
        await sendKeys({down:"Escape"});
        expect(el_modal.parentElement).to.equal(el_mod_par);
    });

    it('nobgclose', async () => {
        const el1 = await fixture(html`<div>
<div id="parent">
    <aalam-modal id="modal">
            <div id="modal_body" slot="modal-body">
                <h2 id="c_click">h2 </h2>
                <div style="height:20px;width:40px;background:orange"></div>
            </div>
    </aalam-modal>
</div></div>`);
        const modal = el1.querySelector("#modal");
        await modal.updated();
        modal.animationDur=0;
        const modal_body = el1.querySelector("#modal_body");
        const modal_par = modal.parentElement;
        modal.show();
        await modal.updated()
        element_bounds(modal);
        expect(modal.parentElement).to.equal(document.body);
        const c_click = modal.querySelector("#c_click");
        c_click.click();
        expect(modal.parentElement).to.equal(document.body);
        const wrapper_bounds = modal_body.getBoundingClientRect();
        await sendMouse({type:'move', position: [wrapper_bounds.width - 200,
                         Math.round(wrapper_bounds.y - 40)]});
        await modal.updated();
        await sendMouse({type:'down'});
        await sendMouse({type:'up'});
        expect(modal.parentElement).to.equal(modal_par);
        expect(modal.open).to.equal(false);

        modal.setAttribute("nobgclose", true);
        modal.show();
        await modal.updated()
        element_bounds(modal);
        await sendMouse({type:'move', position: [wrapper_bounds.width - 200,
                         Math.round(wrapper_bounds.y - 40)]});
        await modal.updated();
        await sendMouse({type:'down'});
        await sendMouse({type:'up'});
        expect(modal.parentElement).to.equal(document.body);
        expect(modal.open).to.equal(true);
        element_bounds(modal);
    });

    it('height', async () => {
        const el1 = await fixture(html `
<div>
    <div id="parent">
        <aalam-modal id="modal" height="xs:30vh;s:100vh;l:40vh;
                                        m:80vh;xl:70vh">
            <div id="modal-body" slot="modal-body">
                <div style="height:200px;width:250px">
                    <h1>h1</h1>
                </div>
                <div style="height:300px;width:200px">
                    <h2>h2</h2>
                </div>
                <div style="height:350px;width:250px">
                    <h3>h3</h3>
                </div>
            </div>
        </aalam-modal>
    </div> 
</div>`);
        const modal = el1.querySelector("#modal");
        const modal_body = el1.querySelector("#modal-body");
        modal.animationDur = 0;
        modal_body.style.height="100%";
        modal_body.style.overflow="auto";
        modal_body.style.margin="auto";
        modal_body.style.minWidth="320px";
        modal_body.style.boxSizing="border-box";
        modal_body.style.padding="15px";
        modal.show();
        await modal.updated()
        element_bounds(modal);
        expect(modal.parentElement).to.equal(document.body);

        await setViewport({width:630, height:640});
        const wrap_body_xs = modal_body.getBoundingClientRect();
        expect(wrap_body_xs.height).to.equal(640*0.3);

        await setViewport({width:990, height:640});
        const wrap_body_s = modal_body.getBoundingClientRect();
        expect(wrap_body_s.height).to.equal(640);

        await setViewport({width:1024, height:680});
        const wrap_body_m = modal_body.getBoundingClientRect();
        expect(wrap_body_m.height).to.equal(680*0.8);

        await setViewport({width:1230, height:720});
        const wrap_body_l = modal_body.getBoundingClientRect();
        expect(wrap_body_l.height).to.equal(720*0.4);

        await setViewport({width:1608, height:680});
        const wrap_body_xl = modal_body.getBoundingClientRect();
        expect(wrap_body_xl.height).to.equal(Math.round(680*0.7));
        element_bounds(modal);

        const el2 = await fixture(html `
<div>
    <div id="parent">
        <aalam-modal id="modal" height="xs:auto;l:xry;xl:70vh">
            <div id="modal-body" slot="modal-body">
                <div style="height:200px;width:250px">
                    <h1>h1</h1>
                </div>
                <div style="height:300px;width:200px">
                    <h2>h2</h2>
                </div>
                <div style="height:350px;width:250px">
                    <h3>h3</h3>
                </div>
            </div>
        </aalam-modal>
    </div>
</div>`);
        const new_modal = el2.querySelector("#modal");
        const new_modal_body = el2.querySelector("#modal-body");
        new_modal.animationDur = 0;
        new_modal_body.style.height="100%";
        new_modal_body.style.overflow="auto";
        new_modal_body.style.margin="auto";
        new_modal_body.style.minWidth="320px";
        new_modal_body.style.boxSizing="border-box";
        new_modal_body.style.padding="15px";
        new_modal.show();
        await new_modal.updated();
        element_bounds(new_modal);
        expect(new_modal.parentElement).to.equal(document.body);

        await setViewport({width:630, height:640});
        const new_wrap_body_xs = new_modal_body.getBoundingClientRect();
        const wrap_modal = new_modal_body.scrollHeight;
        expect(Math.round(new_wrap_body_xs.height)).to.equal(wrap_modal);

        await setViewport({width:990, height:640});
        const new_wrap_body_s = new_modal_body.getBoundingClientRect();
        expect(Math.round(new_wrap_body_s.height)).to.equal(wrap_modal);

        await setViewport({width:1024, height:680});
        const new_wrap_body_m = new_modal_body.getBoundingClientRect();
        expect(Math.round(new_wrap_body_m.height)).to.equal(wrap_modal);

        await setViewport({width:1230, height:720});
        const new_wrap_body_l = new_modal_body.getBoundingClientRect();
        expect(Math.round(new_wrap_body_l.height)).to.equal(wrap_modal);

        await setViewport({width:1608, height:680});
        const new_wrap_body_xl = new_modal_body.getBoundingClientRect();
        expect(new_wrap_body_xl.height).to.equal(Math.round(680*0.7));
        element_bounds(new_modal);
     });

     it('width', async () => {
        const el1 = await fixture(html`
<div>
    <div id="parent">
        <aalam-modal id="modal" width="xs:80vw;s:70vw;m:20vw;
                                       l:35vw;xl:120vw">
            <div id="modal-body" slot="modal-body">
                <div style="height:200px;width:250px">
                    <h1>h1</h1>
                </div>
                <div style="height:300px;width:200px">
                    <h2>h2</h2>
                </div>
                <div style="height:400px;width:300px">
                    <h3>h3</h3>
                </div>
            </div>
        </aalam-modal>
    </div>
</div>`);
        const modal = el1.querySelector("#modal");
        const modal_body = el1.querySelector("#modal-body");
        modal.animationDur = 0;
        modal_body.style.height="100%";
        modal_body.style.overflow="auto";
        modal_body.style.margin="auto";
        modal_body.style.boxSizing="border-box";
        modal_body.style.padding="15px";
        modal.show();
        await modal.updated();
        element_bounds(modal);
        expect(modal.parentElement).to.equal(document.body);

        await setViewport({width:640, height:640});
        const wrap_body_xs = modal_body.getBoundingClientRect();
        expect(wrap_body_xs.width).to.equal(640*0.8);

        await setViewport({width:720, height:660});
        const wrap_body_s = modal_body.getBoundingClientRect();
        expect(wrap_body_s.width).to.equal(Math.round(720*0.7));

        await setViewport({width:1024, height:680});
        const wrap_body_m = modal_body.getBoundingClientRect();
        expect(Math.round(wrap_body_m.width)).to.equal(Math.round(1024*0.2));

        await setViewport({width:1240, height:680});
        const wrap_body_l = modal_body.getBoundingClientRect();
        expect(wrap_body_l.width).to.equal(1240*0.35);

        await setViewport({width:1620, height:680});
        const wrap_body_xl = modal_body.getBoundingClientRect();
        expect(wrap_body_xl.width).to.equal(1620*1.2);
        element_bounds(modal);

        const el2 = await fixture(html`
<div>
    <div id="parent">
        <aalam-modal id="modal" width="xs:auto;l:mvw;xl:120vw">
            <div id="modal-body" slot="modal-body">
                <div style="height:200px;width:250px">
                    <h1>h1</h1>
                </div>
                <div style="height:300px;width:200px">
                    <h2>h2</h2>
                </div>
                <div style="height:400px;width:300px">
                    <h3>h3</h3>
                </div>
            </div>
        </aalam-modal>
    </div>
</div>`);

        const new_modal = el2.querySelector("#modal");
        const new_modal_body = el2.querySelector("#modal-body");
        new_modal.animationDur = 0;
        new_modal_body.style.height="100%";
        new_modal_body.style.overflow="auto";
        new_modal_body.style.margin="auto";
        new_modal_body.style.boxSizing="border-box";
        new_modal_body.style.padding="15px";
        new_modal.show();
        await new_modal.updated();
        element_bounds(new_modal);
        expect(new_modal.parentElement).to.equal(document.body);

        await setViewport({width:640, height:640});
        const new_wrap_body_xs = new_modal_body.getBoundingClientRect();
        const wrap_xs = new_modal_body.scrollWidth;
        expect(new_wrap_body_xs.width).to.equal(wrap_xs);

        await setViewport({width:720, height:660});
        const new_wrap_body_s = new_modal_body.getBoundingClientRect();
        const wrap_s = new_modal_body.scrollWidth;
        expect(new_wrap_body_s.width).to.equal(wrap_s);

        await setViewport({width:1024, height:680});
        const new_wrap_body_m = new_modal_body.getBoundingClientRect();
        const wrap_m = new_modal_body.scrollWidth;
        expect(Math.round(new_wrap_body_m.width)).to.equal(wrap_m);

        await setViewport({width:1240, height:680});
        const new_wrap_body_l = new_modal_body.getBoundingClientRect();
        const wrap_l = new_modal_body.scrollWidth;
        expect(new_wrap_body_l.width).to.equal(wrap_l);

        await setViewport({width:1620, height:680});
        const new_wrap_body_xl = new_modal_body.getBoundingClientRect();
        expect(new_wrap_body_xl.width).to.equal(1620*1.2);


    });

    it('position', async () => {
       const el1 = await fixture(html`
<div>
    <div id="parent">
        <aalam-modal id="modal" pos="xs:top;s:left;m:right;
                                     l:cener;xl:bottom-left">
            <div id="modal-body" slot="modal-body" 
                 class="modal-body">
                <div style="height:200px;width:250px;
                            background:green">
                    <h1>h1</h1>
                </div>
                <div style="height:300px;width:200px;
                            background:yellow">
                    <h2>h2</h2>
                </div>
                <div style="height:350px;width:250px;
                            background:blue">
                    <h3 style="height:35px;width:25px">h3</h3>
                </div>
            </div>
        </aalam-modal>
    </div>
</div>`);

       const modal = el1.querySelector("#modal");
       const modal_body = el1.querySelector("#modal-body");
       const modal_par = modal.parentElement;
       modal.animationDur = 0;
       modal_body.style.height="100%";
       modal_body.style.overflow="auto";
       modal_body.style.margin="auto";
       modal_body.style.boxSizing="border-box";
       modal_body.style.padding="15px";
       modal.show();
       await modal.updated();
       element_bounds(modal);
       expect(modal.parentElement).to.equal(document.body);

       await setViewport({width:640, height:600});
       const wrap_body_xs = modal_body.getBoundingClientRect();
       expect(wrap_body_xs.height).to.equal(600/2);
       expect(wrap_body_xs.width).to.equal(640);
       expect(wrap_body_xs.right).to.equal(640);
       expect(wrap_body_xs.left).to.equal(0);
       expect(wrap_body_xs.top).to.equal(0);

       await setViewport({width:720, height:640});
       const wrap_body_s = modal_body.getBoundingClientRect();
       expect(wrap_body_s.height).to.equal(640/2);
       expect(wrap_body_s.width).to.equal(720);
       expect(wrap_body_s.right).to.equal(720);
       expect(wrap_body_s.left).to.equal(0);
       expect(wrap_body_s.top).to.equal(0);
       expect(wrap_body_s.bottom).to.equal(640/2);

       await setViewport({width:1024, height:640});
       const wrap_body_m = modal_body.getBoundingClientRect();
       expect(wrap_body_m.height).to.equal(640);
       expect(wrap_body_m.width).to.equal(1024/2);
       expect(wrap_body_m.right).to.equal(1024);
       expect(wrap_body_m.left).to.equal(512);
       expect(wrap_body_m.top).to.equal(0);
       expect(wrap_body_m.bottom).to.equal(640);

       await setViewport({width:1400, height:640});
       const wrap_body_l = modal_body.getBoundingClientRect();
       const wrp = modal._wrapper_el;
       expect(Math.round(wrap_body_l.height)).to.equal(wrp.clientHeight);
       expect(wrap_body_l.width).to.equal(1400/2);
       expect(wrap_body_l.right).to.equal(1400);
       expect(wrap_body_l.left).to.equal(1400/2);
       expect(wrap_body_l.top).to.equal(0);
       expect(Math.round(wrap_body_l.bottom)).to.equal(wrp.clientHeight);

       await setViewport({width:1640, height:680});
       const wrap_body_xl = modal_body.getBoundingClientRect();
       const mdl_bdy = modal_body.scrollHeight;
       expect(wrap_body_xl.width).to.equal(1640/2);
       expect(Math.round(wrap_body_xl.height)).to.equal(mdl_bdy);
       expect(wrap_body_xl.left).to.equal(0);
       expect(wrap_body_xl.right).to.equal(1640/2);
       expect(wrap_body_xl.top).to.equal(0);
       expect(Math.round(wrap_body_xl.bottom)).to.equal(mdl_bdy);

       element_bounds(modal);
       modal.hide();
       await modal.updated();
       expect(modal.parentElement).to.equal(modal_par);

       const el2 = await fixture(html`
<div>
    <div id="parent">
        <aalam-modal id="modal" pos="xs:top;s:auto;xl:ft" 
                     height="m:50vh">
            <div id="modal-body" slot="modal-body" 
                 class="modal-body">
                <div style="height:200px;width:250px;
                            background:green">
                    <h1>h1</h1>
                </div>
                <div style="height:300px;width:200px;
                            background:yellow">
                    <h2>h2</h2>
                </div>
                <div style="height:350px;width:250px;
                            background:blue">
                    <h3 style="height:35px;width:25px">h3</h3>
                </div>
            </div>
        </aalam-modal>
    </div>
</div>`);

       const new_modal = el2.querySelector("#modal");
       const new_modal_body = el2.querySelector("#modal-body");
       new_modal.animationDur = 0;
       new_modal_body.style.height="100%";
       new_modal_body.style.overflow="auto";
       new_modal_body.style.margin="auto";
       new_modal_body.style.boxSizing="border-box";
       new_modal_body.style.padding="15px";
       new_modal.show();
       await new_modal.updated();
       element_bounds(new_modal);
       expect(new_modal.parentElement).to.equal(document.body);

       await setViewport({width:640, height:600});
       const new_wrap_body_xs = new_modal_body.getBoundingClientRect();
       expect(new_wrap_body_xs.height).to.equal(600/2);
       expect(new_wrap_body_xs.width).to.equal(640);
       expect(new_wrap_body_xs.right).to.equal(640);
       expect(new_wrap_body_xs.left).to.equal(0);
       expect(new_wrap_body_xs.top).to.equal(0);
       expect(new_wrap_body_xs.bottom).to.equal(600/2);

       await setViewport({width:720, height:640});
       const new_wrap_body_s = new_modal_body.getBoundingClientRect();
       expect(new_wrap_body_s.height).to.equal(640/2);
       expect(new_wrap_body_s.width).to.equal(720);
       expect(new_wrap_body_s.right).to.equal(720);
       expect(new_wrap_body_s.left).to.equal(0);
       expect(new_wrap_body_s.top).to.equal(0);
       expect(new_wrap_body_s.bottom).to.equal(640/2);

       await setViewport({width:1024, height:640});
       const new_wrap_body_m = new_modal_body.getBoundingClientRect();
       expect(new_wrap_body_m.height).to.equal(640/2);
       expect(new_wrap_body_m.width).to.equal(1024/2);
       expect(new_wrap_body_m.right).to.equal(1024/2);
       expect(new_wrap_body_m.left).to.equal(0);
       expect(new_wrap_body_m.top).to.equal(0);
       expect(new_wrap_body_m.bottom).to.equal(640/2);

       await setViewport({width:1400, height:640});
       const new_wrap_body_l = new_modal_body.getBoundingClientRect();
       const new_wrap_l = new_modal.getBoundingClientRect();
       const new_wrp = new_modal._wrapper_el;
       expect(Math.round(new_wrap_body_l.height)).to.equal(640/2);
       expect(new_wrap_body_l.width).to.equal(1400/2);
       expect(new_wrap_body_l.right).to.equal(1400/2);
       expect(new_wrap_body_l.left).to.equal(0);
       expect(new_wrap_body_l.top).to.equal(0);
       expect(Math.round(new_wrap_body_l.bottom)).to.equal(640/2);

       await setViewport({width:1640, height:680});
       const new_wrap_body_xl = new_modal_body.getBoundingClientRect();
       const new_mdl_bdy = new_modal_body.scrollHeight;
       expect(new_wrap_body_xl.width).to.equal(1640/2);
       expect(Math.round(new_wrap_body_xl.height)).to.equal(680/2);
       expect(new_wrap_body_xl.left).to.equal(0);
       expect(new_wrap_body_xl.right).to.equal(1640/2);
       expect(new_wrap_body_xl.top).to.equal(0);
       expect(Math.round(new_wrap_body_xl.bottom)).to.equal(680/2);
    });

    it('animation', async () => {
       const el1 = await fixture(html`
<div>
    <div id="parent">
        <aalam-modal id="modal" animation="l:t2b;s:r2l;xl:2r;xs:k">
            <div id="modal-body" slot="modal-body" 
                 class="modal-body">
                <div style="height:200px;width:250px;
                            background:green">
                    <h1>h1</h1>
                </div>
                <div style="height:300px;width:200px;
                            background:yellow">
                    <h2>h2</h2>
                </div>
                <div style="height:350px;width:250px;
                            background:blue">
                    <h3 style="height:35px;width:25px">h3</h3>
                </div>
            </div>
        </aalam-modal>
    </div>
</div>`);
       const modal = el1.querySelector("#modal");
       const modal_body = el1.querySelector("#modal-body");
       modal.animationDur = 0;
       modal_body.style.height="100%";
       modal_body.style.overflow="auto";
       modal_body.style.margin="auto";
       modal_body.style.boxSizing="border-box";
       modal_body.style.padding="15px";
       let md = modal._animate_breakpoints;
       modal.show();
       await modal.updated();
       element_bounds(modal);
       expect(modal.parentElement).to.equal(document.body);

       await setViewport({width:600, height:640});
       expect(md[0].ll).to.equal(0);
       expect(md[0].ul).to.equal(640);
       expect(md[0].val).to.equal('b2t');

       await setViewport({width:720, height:640});
       expect(md[1].ll).to.equal(641);
       expect(md[1].ul).to.equal(1200);
       expect(md[1].val).to.equal('r2l');

       await setViewport({width:1024, height:640});
       expect(md[1].ll).to.equal(641);
       expect(md[1].ul).to.equal(1200);
       expect(md[1].val).to.equal('r2l');

       await setViewport({width:1400, height:640});
       expect(md[2].ll).to.equal(1201);
       expect(md[2].ul).to.equal(null);
       expect(md[2].val).to.equal('t2b');

       await setViewport({width:1640, height:640});
       expect(md[2].ll).to.equal(1201);
       expect(md[2].ul).to.equal(null);
       expect(md[2].val).to.equal('t2b');
    });

    it('guide', async () => {
       const el1 = await fixture(html`
<div>
    <div id="parent">
        <aalam-modal id="modal" pos="l:right;xl:top-center;m:bottom" 
                     guidesel="right:.right-guide;left:.left-guide;
                               bottom:.bottom-guide;top:.top-guide">
           <div id="modal-body" slot="modal-body" class="modal-body">
               <div class="right-guide" style="background:orange;">
                   <p> class: right-guide, pos: right</p>
                   <div style="background:yellow;height:20px;
                               margin:auto;width:20px;
                               border-top:3px solid #000">
                   </div>
               </div>
               <div class="top-guide" style="background:yellow">
                   <p> class: top-guide, pos: top</p>
                   <div style="background:red;height:20px;
                               width:20px;margin:auto;
                               border-top:3px solid #000">
                   </div>
                </div>
                <div class="left-guide" style="background:blue;
                                               position:static">
                    <p>class: left-guide, pos: left</p>
                    <div style="background:green;display:flex;
                                position:sticky;left:0px;
                                height:20px;width:20px;
                                border-left:4px solid #000;
                                margin:auto;">
                    </div>
                </div>
                <div class="bottom-guide" style="background:red">
                    <p> class: bottom-guide, pos: bottom</p>
                    <div style="background:grey;height:20px;
                                width:20px;margin:auto;
                                border-top:3px solid #000">
                    </div>
                </div>
                <div style="height:200px;width:250px;
                            background:green">
                    <h1>h1</h1>
                </div>
                <div style="height:300px;width:200px;
                            background:yellow">
                    <h2>h2</h2>
                </div>
                <div style="height:350px;width:250px;
                            background:blue">
                    <h3 style="height:35px;width:25px">h3</h3>
                </div>
            </div>
        </aalam-modal>
    </div>
</div>`);
       const modal = el1.querySelector("#modal");
       const modal_body = el1.querySelector("#modal-body");
       const r_guide = modal.querySelector(".right-guide");
       const l_guide = modal.querySelector(".left-guide");
       const t_guide = modal.querySelector(".top-guide");
       const b_guide = modal.querySelector(".bottom-guide");
       modal.animationDur = 0;
       modal_body.style.height="100%";
       modal_body.style.overflow="auto";
       modal_body.style.margin="auto";
       modal_body.style.boxSizing="border-box";
       modal.show();
       await modal.updated();
       element_bounds(modal);
       expect(modal.parentElement).to.equal(document.body);

       await setViewport({width:1400, height:640});
       let r_guide_rect = r_guide.getBoundingClientRect();
       let t_guide_rect = t_guide.getBoundingClientRect();
       let l_guide_rect = l_guide.getBoundingClientRect();
       let b_guide_rect = b_guide.getBoundingClientRect();

       let [sx, sy, ex, ey] = [r_guide_rect.x + r_guide_rect.width - 100,
            r_guide_rect.y + 10, r_guide_rect.x + r_guide_rect.width - 420,
            r_guide_rect.y + 10];
       let bounds = modal_body.getBoundingClientRect();
       await sendMouse({type:'move', position: [sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position: [ex, ey]});
       await sendMouse({type: 'up'});
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();
       element_bounds(modal);

       expect(modal.open).to.equal(true);
       [sx, sy, ex, ey] = [r_guide_rect.x + r_guide_rect.width - 100,
            r_guide_rect.y + 10, r_guide_rect.x + r_guide_rect.width - 200,
            r_guide_rect.y + 10];
       await sendMouse({type:'move', position: [sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position: [ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);

       modal.hide();
       modal.show();
       element_bounds(modal);
       [sx, sy, ex, ey] = [t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 10, t_guide_rect.x +
            t_guide_rect.width - 100, t_guide_rect.y + 204];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);
       modal.show();

       [sx, sy, ex, ey] = [t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 10, t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 202];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);

       modal.hide();
       modal.show();
       await modal.updated();
       element_bounds(modal);
       expect(modal.open).to.equal(true);

       [sx, sy, ex, ey] = [l_guide_rect.x + l_guide_rect.width - 100,
            l_guide_rect.y + 10, l_guide_rect.x + l_guide_rect.width + 111,
            l_guide_rect.y + 10];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'})
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();
       element_bounds(modal);
       expect(modal.open).to.equal(true);

       [sx, sy, ex, ey] = [l_guide_rect.x + l_guide_rect.width - 100,
            l_guide_rect.y + 10, l_guide_rect.x + l_guide_rect.width + 110,
            l_guide_rect.y + 10];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'})
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);

       modal.hide();
       modal.show();
       element_bounds(modal);
       expect(modal.open).to.equal(true);

       [sx, sy, ex, ey] = [l_guide_rect.x + l_guide_rect.width - 100,
            l_guide_rect.y + 10, l_guide_rect.x + l_guide_rect.width - 800,
            l_guide_rect.y + 202];
       expect(modal_body.getBoundingClientRect().left).to.equal(700);
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       expect(modal_body.getBoundingClientRect().left).to.equal(0);
       expect(modal_body.getBoundingClientRect().right).to.equal(1400);

       [sx, sy, ex, ey] = [b_guide_rect.x + b_guide_rect.width - 100,
            b_guide_rect.y + 10, b_guide_rect.x + b_guide_rect.width - 100,
            b_guide_rect.y - 183];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.show();

       [sx, sy, ex, ey] = [b_guide_rect.x + b_guide_rect.width - 100,
            b_guide_rect.y + 10, b_guide_rect.x + b_guide_rect.width - 100,
            b_guide_rect.y - 182];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);

       modal.hide();
       await setViewport({width:1024, height:640});
       modal.show();
       await modal.updated();
       element_bounds(modal);

       r_guide_rect = r_guide.getBoundingClientRect();
       t_guide_rect = t_guide.getBoundingClientRect();
       l_guide_rect = l_guide.getBoundingClientRect();
       b_guide_rect = b_guide.getBoundingClientRect();
       bounds = modal_body.getBoundingClientRect();
       expect(bounds.width).to.equal(1024/2);
       expect(bounds.right).to.equal(512);
       expect(bounds.left).to.equal(0);

       [sx, sy, ex, ey] = [r_guide_rect.x + r_guide_rect.width - 100,
            r_guide_rect.y + 10, r_guide_rect.x + r_guide_rect.width + 412,
            r_guide_rect.y + 10];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       let bdy = modal_body.getBoundingClientRect();
       expect(bdy.width).to.equal(1024);
       expect(bdy.right).to.equal(1024);
       expect(bdy.left).to.equal(0);

       modal.hide();
       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [r_guide_rect.x + r_guide_rect.width - 100,
            r_guide_rect.y + 10, r_guide_rect.x + r_guide_rect.width - 254,
            r_guide_rect.y + 10];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [r_guide_rect.x + r_guide_rect.width - 100,
            r_guide_rect.y + 10, r_guide_rect.x + r_guide_rect.width - 253,
            r_guide_rect.y + 10];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);

       modal.hide();
       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 10, t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 202];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       bdy = modal_body.getBoundingClientRect();
       expect(bdy.top).to.equal(192);
       expect(bdy.width).to.equal(1024/2);
       expect(bdy.right).to.equal(1024/2);
       expect(bdy.left).to.equal(0);

       modal.hide();
       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 10, t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 203];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.hide();
       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [l_guide_rect.x + l_guide_rect.width - 100,
            l_guide_rect.y + 10, l_guide_rect.x + l_guide_rect.width + 54,
            l_guide_rect.y + 10];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.hide();
       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [b_guide_rect.x + b_guide_rect.width - 100,
            b_guide_rect.y + 10, b_guide_rect.x + b_guide_rect.width - 100,
            b_guide_rect.y - 183];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.hide();
       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [b_guide_rect.x + b_guide_rect.width - 100,
            b_guide_rect.y + 10, b_guide_rect.x + b_guide_rect.width - 100,
            b_guide_rect.y - 182];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       bdy = modal_body.getBoundingClientRect();
       expect(bdy.left).to.equal(0);
       expect(bdy.right).to.equal(512);
       expect(bdy.width).to.equal(512);

       [sx, sy, ex, ey] = [b_guide_rect.x + b_guide_rect.width - 100,
            b_guide_rect.y + 10, b_guide_rect.x + b_guide_rect.width - 100,
            b_guide_rect.y + 52];
       await sendMouse({type:'move', position:[sx, sy]})
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       bdy = modal_body.getBoundingClientRect();
       expect(bdy.bottom).to.equal(490);

       modal.hide();
       await setViewport({width:1640, height:680});
       modal.show();
       await modal.updated();
       r_guide_rect = r_guide.getBoundingClientRect();
       t_guide_rect = t_guide.getBoundingClientRect();
       l_guide_rect = l_guide.getBoundingClientRect();
       b_guide_rect = b_guide.getBoundingClientRect();

       [sx, sy, ex, ey] = [r_guide_rect.x + r_guide_rect.width - 100,
            r_guide_rect.y + 10, r_guide_rect.x + r_guide_rect.width + 310,
            r_guide_rect.y + 10];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);
       expect(bdy.right).to.equal(1640);
       expect(bdy.left).to.equal(410);
       expect(bdy.width).to.equal(1230);
       expect(bdy.top).to.equal(0);

       modal.hide();
       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [r_guide_rect.x + r_guide_rect.width - 100,
            r_guide_rect.y + 10, r_guide_rect.x + r_guide_rect.width - 346,
            r_guide_rect.y + 10];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);
       expect(bdy.width).to.equal(820-246);
       expect(bdy.right).to.equal(410+820-246);
       expect(bdy.left).to.equal(410);

       modal.hide();
       modal.show();
       await modal.updated();
       element_bounds(modal);

       [sx, sy, ex, ey] = [r_guide_rect.x + r_guide_rect.width - 100,
            r_guide_rect.y + 10, r_guide_rect.x + r_guide_rect.width - 347,
            r_guide_rect.y + 10];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.hide();
       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 10, t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 213];
       await sendMouse({type: 'move', position: [sx, sy]});
       await sendMouse({type: 'down'});
       await sendMouse({type: 'move', position: [ex, ey]});
       await sendMouse({type: 'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);
       expect(bdy.top).to.equal(203);
       expect(bdy.left).to.equal(410);
       expect(bdy.right).to.equal(1230);

       modal.hide();
       modal.show();
       await modal.updated();
       element_bounds(modal);

       [sx, sy, ex, ey] = [t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 10, t_guide_rect.x + t_guide_rect.width - 100,
            t_guide_rect.y + 215];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [b_guide_rect.x + 90, b_guide_rect.y + 18,
            b_guide_rect.x + 90, b_guide_rect.y - 197];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [b_guide_rect.x + 90, b_guide_rect.y + 18,
            b_guide_rect.x + 90, b_guide_rect.y - 186];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);
       expect(bdy.bottom).to.equal(680-204);
       expect(bdy.left).to.equal(410);
       expect(bdy.right).to.equal(1230);
       expect(bdy.top).to.equal(0);

       modal.show();
       await modal.updated();

       [sx, sy, ex, ey] = [l_guide_rect.x + 90, l_guide_rect.y + 38,
            l_guide_rect.x + 336, l_guide_rect.y + 38];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       document.dispatchEvent(new Event("mouseup", {bubbles: true}));
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);

       modal.hide();
       modal.show();
       await modal.updated();
       element_bounds(modal);
       [sx, sy, ex, ey] = [l_guide_rect.x + 90, l_guide_rect.y + 10,
            l_guide_rect.x + 340, l_guide_rect.y + 10];
       await sendMouse({type:'move', position:[sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);
    });


    it("check delayed show & hide", async () => {
       const el1 = await fixture(html`<div>
<div id="parent">
   <aalam-modal id="modal">
           <div id="modal_body" slot="modal-body">
               <h2 id="c_click">h2 </h2>
           </div>
   </aalam-modal>
</div></div>`);
       const modal = el1.querySelector("#modal");
       modal.animationDur = 0;
       let mock_control = {'count': 0, nocall: false};
       let setTimeout_calls = []
       let clrTimeout_calls = []
       let mock_ctmout = stub(window, "clearTimeout").callsFake((id) => {
           clrTimeout_calls.push(id);
           if (id < mock_control['count']) {
               return;
           }
       })
       let mock_stmout = stub(window, "setTimeout").callsFake((fn, dur) => {
           setTimeout_calls.push(dur);
           mock_control['count'] += 1;
           if (!mock_control['nocall']) {
               fn();
           }
           return mock_control['count'];
       })
        try {
           modal.show(10);
           await modal.updated();
           element_bounds(modal);
           expect(setTimeout_calls.length).to.be.equal(1);
           expect(clrTimeout_calls.length).to.be.equal(0);
           expect(setTimeout_calls[0]).to.be.equal(10);
           expect(modal.open).to.be.equal(true);
           modal.hide(15);
           expect(setTimeout_calls.length).to.be.equal(2);
           expect(clrTimeout_calls.length).to.be.equal(1);
           expect(setTimeout_calls[1]).to.be.equal(15);
           expect(clrTimeout_calls[0]).to.be.equal(1);
           expect(modal.open).to.be.equal(false);

           setTimeout_calls = [];
           mock_control['nocall'] = true;
           modal.show(20);
           expect(setTimeout_calls.length).to.be.equal(1);
           expect(clrTimeout_calls.length).to.be.equal(2);
           expect(setTimeout_calls[0]).to.be.equal(20);
           expect(clrTimeout_calls[1]).to.be.equal(2);

           modal.show(12);
           expect(clrTimeout_calls.length).to.be.equal(3);
           expect(clrTimeout_calls[2]).to.be.equal(mock_control['count'] - 1);
           expect(setTimeout_calls.length).to.be.equal(2);
           expect(setTimeout_calls[0]).to.be.equal(20);
           expect(setTimeout_calls[1]).to.be.equal(12);

           clrTimeout_calls = [];
           modal.show();
           await modal.updated();
           element_bounds(modal);
           modal.hide(25);
           expect(clrTimeout_calls.length).to.be.equal(1);
           expect(clrTimeout_calls[0]).to.be.equal(4);
           expect(setTimeout_calls[1]).to.be.equal(12);
           expect(setTimeout_calls.length).to.be.equal(3);
           expect(setTimeout_calls[2]).to.be.equal(25);

           modal.hide(30);
           expect(setTimeout_calls.length).to.be.equal(4);
           expect(setTimeout_calls[3]).to.be.equal(30);
           expect(clrTimeout_calls.length).to.be.equal(2);
           expect(clrTimeout_calls[1]).to.be.equal(5);
        } finally {
        mock_ctmout.restore();
        mock_stmout.restore();
        }
    });
    it('clamp', async () => {
       const el1 = await fixture(html`
<div>
    <div id="parent">
        <aalam-modal id="modal"
                     pos="l:top;xl:top-center;m:bottom;s:top;xs:top-right"
                     guidesel="right:.right-guide,20;left:.left-guide,15;
                               bottom:.bottom-guide,edge;top:.top-guide,15">
           <div id="modal-body" slot="modal-body" class="modal-body">
               <div class="right-guide" style="background:orange;">
                   <p> class: right-guide, pos: right</p>
                   <div style="background:yellow;height:20px;
                               margin:auto;width:20px;
                               border-top:3px solid #000">
                   </div>
               </div>
               <div class="top-guide" style="background:yellow">
                   <p> class: top-guide, pos: top</p>
                   <div style="background:red;height:20px;
                               width:20px;margin:auto;
                               border-top:3px solid #000">
                   </div>
                </div>
                <div class="left-guide" style="background:blue;
                                               position:static">
                    <p>class: left-guide, pos: left</p>
                    <div style="background:green;display:flex;
                                position:sticky;left:0px;
                                height:20px;width:20px;
                                border-left:4px solid #000;
                                margin:auto;">
                    </div>
                </div>
                <div class="bottom-guide" style="background:red">
                    <p> class: bottom-guide, pos: bottom</p>
                    <div style="background:grey;height:20px;
                                width:20px;margin:auto;
                                border-top:3px solid #000">
                    </div>
                </div>
            </div>
        </aalam-modal>
    </div>
</div>`);
       const modal = el1.querySelector("#modal");
       const modal_body = el1.querySelector("#modal-body");
       const r_guide = modal.querySelector(".right-guide");
       const l_guide = modal.querySelector(".left-guide");
       const t_guide = modal.querySelector(".top-guide");
       const b_guide = modal.querySelector(".bottom-guide");
       modal.animationDur = 0;
       modal_body.style.height="100%";
       modal_body.style.overflow="auto";
       modal_body.style.margin="auto";
       modal_body.style.boxSizing="border-box";
       modal.show();
       await modal.updated();
       element_bounds(modal);
       expect(modal.parentElement).to.equal(document.body);

       await setViewport({width:1680, height:800});

       let r_clamp = 1680 - (1680 / 100) * 20;
       let l_clamp = (1680 / 100) * 15;

       let r_guide_rect = r_guide.getBoundingClientRect();
       let t_guide_rect = t_guide.getBoundingClientRect();
       let l_guide_rect = l_guide.getBoundingClientRect();
       let b_guide_rect = b_guide.getBoundingClientRect();

       let [sx, sy, ex, ey] = [
            r_guide_rect.x + r_guide_rect.width - 100,
            r_guide_rect.y + 10,
            r_guide_rect.x + r_guide_rect.width - 420,
            r_guide_rect.y + 10];
       let bounds = modal_body.getBoundingClientRect();
       await sendMouse({type:'move', position: [sx, sy]});


       await sendMouse({type:'down'});
       await sendMouse({type:'move', position: [ex, ey]});
       await sendMouse({type: 'up'});
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();
       element_bounds(modal);

       [sx, sy] = [
            r_guide_rect.x + Math.round(r_guide_rect.width / 2),
            r_guide_rect.y + Math.round(r_guide_rect.height / 2)];
       [ex, ey] = [sx + 20, sy];
       bounds = modal_body.getBoundingClientRect();
       await sendMouse({type:'move', position: [sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position: [ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);

       bounds = modal_body.getBoundingClientRect();
       expect(bounds.right).to.equal(r_clamp);

       l_guide_rect = l_guide.getBoundingClientRect();
       [sx, sy] = [
            l_guide_rect.x + Math.round(l_guide_rect.width / 2),
            l_guide_rect.y + Math.round(l_guide_rect.height / 2)];
       [ex, ey] = [sx - 40, sy];
       await sendMouse({type:'move', position: [sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position: [ex, ey]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);

       bounds = modal_body.getBoundingClientRect();
       expect(bounds.left).to.equal(l_clamp);
       let bnds_lft = bounds.left;

       [sx, sy] = [
            l_guide_rect.x + Math.round(l_guide_rect.width / 2),
            l_guide_rect.y + Math.round(l_guide_rect.height / 2)];
       [ex, ey] = [sx + 20, sy];

       await sendMouse({type:'move', position: [sx, sy]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position: [ex, ey]});
       await sendMouse({type:'up'});

       expect(modal.open).to.equal(true);

       bounds = modal_body.getBoundingClientRect();
       expect(bounds.left).to.equal(bnds_lft + 20);

        [sx, sy] = [
             l_guide_rect.x + Math.round(l_guide_rect.width / 2),
             l_guide_rect.y + Math.round(l_guide_rect.height / 2)];
        [ex, ey] = [sx - 40, sy];
        await sendMouse({type:'move', position: [sx, sy]});
        await sendMouse({type:'down'});
        await sendMouse({type:'move', position: [ex, ey]});
        await sendMouse({type:'up'});
        expect(modal.open).to.equal(true);

        bounds = modal_body.getBoundingClientRect();
        expect(bounds.left).to.equal(l_clamp);

        await setViewport({width:1400, height:800});

        r_clamp = 1400 - (1400 / 100) * 20;
        l_clamp = (1400 / 100) * 15;
        let b_clamp = 800;

        expect(modal.open).to.equal(true);
        element_bounds(modal);

        b_guide_rect = b_guide.getBoundingClientRect();
        [sx, sy] = [
             b_guide_rect.x + Math.round(b_guide_rect.width / 2),
             b_guide_rect.y + Math.round(b_guide_rect.height / 2)];
        [ex, ey] = [sx, sy + 20];

        await sendMouse({type:'move', position: [sx, sy]});
        await sendMouse({type:'down'});
        await sendMouse({type:'move', position: [ex, ey]});
        await sendMouse({type:'up'});

        bounds = modal_body.getBoundingClientRect();
        expect(bounds.bottom).to.equal(b_clamp);
        let bnds_bottom = bounds.bottom;

        b_guide_rect = b_guide.getBoundingClientRect();
        [sx, sy] = [
             b_guide_rect.x + Math.round(b_guide_rect.width / 2),
             b_guide_rect.y + Math.round(b_guide_rect.height / 2)];
        [ex, ey] = [sx, sy - 20];

        await sendMouse({type:'move', position: [sx, sy]});
        await sendMouse({type:'down'});
        await sendMouse({type:'move', position: [ex, ey]});
        await sendMouse({type:'up'});

        expect(modal.open).to.equal(true);
        bounds = modal_body.getBoundingClientRect();
        element_bounds(modal);
        expect(bounds.bottom).to.equal(bnds_bottom - 20);

        b_guide_rect = b_guide.getBoundingClientRect();
        [sx, sy] = [
             b_guide_rect.x + Math.round(b_guide_rect.width / 2),
             b_guide_rect.y + Math.round(b_guide_rect.height / 2)];
        [ex, ey] = [sx, sy + 20];

        await sendMouse({type:'move', position: [sx, sy]});
        await sendMouse({type:'down'});
        await sendMouse({type:'move', position: [ex, ey]});
        await sendMouse({type:'up'});

        bounds = modal_body.getBoundingClientRect();
        expect(bounds.bottom).to.equal(b_clamp);
        r_guide_rect = r_guide.getBoundingClientRect();
        [sx, sy] = [
             r_guide_rect.x + Math.round(r_guide_rect.width / 2),
             r_guide_rect.y + Math.round(r_guide_rect.height / 2)];
        [ex, ey] = [sx + 20, sy];
        bounds = modal_body.getBoundingClientRect();
        await sendMouse({type:'move', position: [sx, sy]});
        await sendMouse({type:'down'});
        await sendMouse({type:'move', position: [ex, ey]});
        await sendMouse({type:'up'});
        expect(modal.open).to.equal(true);

        bounds = modal_body.getBoundingClientRect();
        expect(bounds.right).to.equal(r_clamp);

        await modal.hide();
        await modal.show();
        await setViewport({width:1200, height:610});
        expect(modal.open).to.equal(true);

        bounds = modal_body.getBoundingClientRect();
        t_guide_rect = t_guide.getBoundingClientRect();

        [sx, sy] = [
             t_guide_rect.x + Math.round(t_guide_rect.width / 2),
             t_guide_rect.y + Math.round(t_guide_rect.height / 2)];
        [ex, ey] = [sx, sy - 20];

        let t_clamp = (610 / 100) * 15;
        r_clamp = 1200 - (1200 / 100) * 20;

        await sendMouse({type:'move', position:[sx, sy]});
        await sendMouse({type:'down'});
        await sendMouse({type:'move', position:[ex, ey]});
        await sendMouse({type:'up'});

        expect(modal.open).to.equal(true);
        element_bounds(modal);
        bounds = modal_body.getBoundingClientRect();
        expect(bounds.top).to.equal(t_clamp);

        t_guide_rect = t_guide.getBoundingClientRect();
        [sx, sy] = [
             t_guide_rect.x + Math.round(t_guide_rect.width / 2),
             Math.round(t_guide_rect.y) + Math.round(t_guide_rect.height / 2)];
        [ex, ey] = [sx, sy + 20];

        await sendMouse({type:'move', position:[sx, sy]});
        await sendMouse({type:'down'});
        await sendMouse({type:'move', position:[ex, ey]});
        await sendMouse({type:'up'});

        expect(modal.open).to.equal(true);
        element_bounds(modal);
        bounds = modal_body.getBoundingClientRect();
        expect(bounds.top).to.equal(t_clamp + 20);

        r_guide_rect = r_guide.getBoundingClientRect();
        [sx, sy] = [
             r_guide_rect.x + Math.round(r_guide_rect.width / 2),
             Math.round(r_guide_rect.y) + Math.round(r_guide_rect.height / 2)];
        [ex, ey] = [sx + 20, sy];
        bounds = modal_body.getBoundingClientRect();
        await sendMouse({type:'move', position: [sx, sy]});
        await sendMouse({type:'down'});
        await sendMouse({type:'move', position: [ex, ey]});
        await sendMouse({type:'up'});
        expect(modal.open).to.equal(true);

        bounds = modal_body.getBoundingClientRect();
        expect(bounds.right).to.equal(r_clamp);
   });
});
