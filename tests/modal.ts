import { fixture, expect, html } from '@open-wc/testing';
import { stub } from 'sinon';
import { sendMouse } from '@web/test-runner-commands';
import { AalamModal } from "../src/modal";
import { sendKeys } from "@web/test-runner-commands";
import { setViewport } from "@web/test-runner-commands";

describe('aalam-modal', () => {
    it('is defined', async () => {
        const el = await fixture(html` <aalam-modal></aalam-modal>`);
        expect(el).to.be.an.instanceof(AalamModal);

        const el1 = document.createElement("aalam-modal");
        expect(el1).to.be.an.instanceof(AalamModal);
    });

    it('show', async () => {
        const el = document.createElement("aalam-modal");
        el.show();
        expect(el.open).to.equal(true);
    });

    it('hide', async () => {
        const el = document.createElement("aalam-modal");
        el.hide();
        expect(el.open).to.equal(false);
    });

    it('attach-parent', async () => {
        const root = await fixture (`
                <div id="parent_el">
                    <aalam-modal>
                        <div slot="modal-body"></div>
                    </aalam-modal>
                </div>
        `);
        const body = document.body;
        let el = root.querySelector("aalam-modal");
        el.animationDur = 0;
        const parent_el = el.parentElement;
        el.show();
        expect(el.parentElement).to.equal(body);
        el.hide();
        expect(el.parentElement).to.equal(parent_el);
    });

    it('attach-body', async () => {
        const body_el = document.body;
        const el1 = await fixture (html`
                <aalam-modal>
                    <div slot="modal-body">
                        <div style="height:20px;width:30px;background:grey">
                        </div>
                        <div style="height:40px;width:20px"></div>
                    </div>
                </aalam-modal>`);
        el1.show();
        const parent_el = el1.parentElement;
        expect(body_el).to.equal(parent_el)
    });

    it('stack', async () => {
        const el1 = await fixture (html`
            <div id = "parent_holder">
                <aalam-modal id="outer_modal">
                    <div slot="modal-body">
                        <div style="height:20px;width:30px;background:grey">
                        </div>
                        <div id="child_modal">
                            <aalam-modal id="inner_modal">
                                <div slot="modal-body">
                                    <div style="background:orange"></div>
                                </div>
                            </aalam-modal>
                        </div>
                    </div>
                </aalam-modal>
                <aalam-modal id="stack_modal" stack>
                    <div slot="modal-body"></div>
                </aalam-modal>
            </div>`);

        const out_mod = el1.querySelector("#outer_modal");
        const out_par = out_mod.parentElement;
        out_mod.show();
        expect(out_mod.parentElement).to.equal(document.body);
        const in_mod = out_mod.querySelector("#inner_modal");
        const in_par = in_mod.parentElement;
        out_mod.animationDur = 0;
        in_mod.show();
        expect(out_mod.parentElement).to.equal(out_par);
        expect(in_mod.parentElement).to.equal(document.body);

        const stack_modal = el1.querySelector("#stack_modal");
        out_mod.show();
        stack_modal.show();
        stack_modal.animationDur =0;
        expect(stack_modal.parentElement).to.equal(out_mod.parentElement);
        expect(stack_modal.parentElement).to.equal(document.body);
        expect(out_mod.parentElement).to.equal(document.body);
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
            </div>
        `);
        const modal = el1.querySelector("#modal");
        modal.animationDur = 0;
        const slot_id = el1.querySelector("#slot");
        const modal_par = modal.parentElement;
        modal.show();
        const new_btn = modal.querySelector("#new_button");
        const new_el=document.createElement("button");
        new_el.classList.add("closing");
        slot_id.appendChild(new_el);
        const new_el_wrap = new_el.getBoundingClientRect();
        expect(modal.parentElement).to.equal(document.body);
        new_el.click();
        expect(modal.parentElement).to.equal(modal_par);
    });

    it('noesc', async () => {
        const el1 = await fixture(html`
            <div id="parent">
                <aalam-modal id="modal">
                    <div slot="modal-body"></div>
                </aalam-modal>
            </div>
        `);
        const modal = el1.querySelector("#modal");
        const modal_parent = modal.parentElement;
        modal.show();
        modal.animationDur = 0;
        expect(modal.parentElement).to.equal(document.body);
        await sendKeys({down:"Escape"});
        expect(modal.parentElement).to.equal(modal_parent);

        const el2 = await fixture(html `
            <div id="parent">
                <aalam-modal id="modal" noesc>
                    <div slot="modal-body"></div>
                </aalam-modal>
            </div> `);
        const el_modal = el2.querySelector("#modal");
        el_modal.show();
        el_modal.animationDur = 0;
        expect(el_modal.parentElement).to.equal(document.body);
        await sendKeys({down:"Escape"});
        expect(el_modal.parentElement).to.equal(document.body);
    });

    it('bgclose', async () => {
        const el1 = await fixture(html`<div>
            <div id="parent">
                <aalam-modal id="modal">
                        <div id="modal_body" slot="modal-body">
                            <h2 id="c_click">h2 </h2>
                        </div>
                </aalam-modal>
            </div></div>
            `);
        const modal = el1.querySelector("#modal");
        await modal.updated();
        modal.animationDur=0;
        const modal_body = el1.querySelector("#modal_body");
        const modal_par = modal.parentElement;
        modal.show();
        await modal.updated()
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
            </div>   `);
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
        await modal.updated();
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
            </div>   `);
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
            </div>
        `);

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
            </div>
        `);

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
                                                 l:center;xl:bottom-left">
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
            </div>
       `);

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
       const wrap_l = modal.getBoundingClientRect();
       const wrp = modal._wrapper_el;
       expect(Math.round(wrap_body_l.height)).to.equal(wrp.clientHeight);
       expect(wrap_body_l.width).to.equal(1400/2);
       expect(wrap_body_l.right).to.equal(1400/2+1400/4);
       expect(wrap_body_l.left).to.equal(1400/4);
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
            </div>
       `);

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
            </div>
       `);
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
       expect(modal.parentElement).to.equal(document.body);

       await setViewport({width:600, height:640});
       expect(md[0].cond).to.equal('(min-width:0px) and (max-width:641px)');
       expect(md[0].ll).to.equal(0);
       expect(md[0].ul).to.equal(641);
       expect(md[0].val).to.equal('b2t');

       await setViewport({width:720, height:640});
       expect(md[1].cond).to.equal('(min-width:641px) and (max-width:1201px)');
       expect(md[1].ll).to.equal(641);
       expect(md[1].ul).to.equal(1201);
       expect(md[1].val).to.equal('r2l');

       await setViewport({width:1024, height:640});
       expect(md[1].cond).to.equal('(min-width:641px) and (max-width:1201px)');
       expect(md[1].ll).to.equal(641);
       expect(md[1].ul).to.equal(1201);
       expect(md[1].val).to.equal('r2l');

       await setViewport({width:1400, height:640});
       expect(md[2].cond).to.equal('(min-width:1201px)');
       expect(md[2].ll).to.equal(1201);
       expect(md[2].ul).to.equal(null);
       expect(md[2].val).to.equal('t2b');

       await setViewport({width:1640, height:640});
       expect(md[2].cond).to.equal('(min-width:1201px)');
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
            </div>
       `);
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
       expect(modal.parentElement).to.equal(document.body);

       await setViewport({width:1400, height:640});
       let bounds = modal_body.getBoundingClientRect();
       await sendMouse({type:'move', position: [1300, 50]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position: [1089, 50]});
       await sendMouse({type: 'up'});
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position: [1300, 50]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position: [1100, 50]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       expect(modal_body.getBoundingClientRect().right).to.equal(1200);

       modal.hide();
       modal.show();

       await sendMouse({type:'move', position:[800, 100]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[800, 294]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.show();

       await sendMouse({type:'move', position:[800, 100]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[800, 292]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);

       modal.hide();
       modal.show();
       await modal.updated();
       expect(modal.open).to.equal(true);

       await sendMouse({type:'move', position:[800, 200]});
       await sendMouse({type:'down'})
       await sendMouse({type:'move', position:[1011, 200]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();
       expect(modal.open).to.equal(true);

       await sendMouse({type:'move', position:[800, 200]});
       await sendMouse({type:'down'})
       await sendMouse({type:'move', position:[1010, 200]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);

       modal.hide();
       modal.show();
       expect(modal.open).to.equal(true);

       expect(modal_body.getBoundingClientRect().left).to.equal(700);
       await sendMouse({type:'move', position:[800, 180]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[100, 180]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       expect(modal_body.getBoundingClientRect().left).to.equal(0);
       expect(modal_body.getBoundingClientRect().right).to.equal(1400);

       await sendMouse({type:'move', position:[800, 250]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[800, 57]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.show();

       await sendMouse({type:'move', position:[800, 250]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[800, 58]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);

       modal.hide();
       await setViewport({width:1024, height:640});
       modal.show();
       await modal.updated();

       bounds = modal_body.getBoundingClientRect();
       expect(bounds.width).to.equal(1024/2);
       expect(bounds.right).to.equal(512);
       expect(bounds.left).to.equal(0);

       await sendMouse({type:'move', position:[100, 50]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[612, 50]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       let bdy = modal_body.getBoundingClientRect();
       expect(bdy.width).to.equal(1024);
       expect(bdy.right).to.equal(1024);
       expect(bdy.left).to.equal(0);

       modal.hide();
       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[100, 50]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[-54, 50]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[100, 50]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[-53, 50]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);

       modal.hide();
       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[100, 100]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[100, 292]});
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

       await sendMouse({type:'move', position:[100, 100]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[100, 293]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.hide();
       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[100, 200]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[254, 200]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.hide();
       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[100, 200]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[253, 200]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       bdy = modal_body.getBoundingClientRect();
       expect(bdy.left).to.equal(153);
       expect(bdy.right).to.equal(512);
       expect(bdy.width).to.equal(512-153);

       modal.hide();
       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[100, 250]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[100, 57]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.hide();
       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[100, 250]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[100, 58]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       bdy = modal_body.getBoundingClientRect();
       expect(bdy.left).to.equal(0);
       expect(bdy.right).to.equal(512);
       expect(bdy.width).to.equal(512);

       await sendMouse({type:'move', position:[100, 250]})
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[100, 292]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(true);
       bdy = modal_body.getBoundingClientRect();
       expect(bdy.bottom).to.equal(490);

       modal.hide();
       await setViewport({width:1640, height:680});
       modal.show();
       await modal.updated();
       let bd = modal_body.getBoundingClientRect();
       let r = r_guide.getBoundingClientRect();

       await sendMouse({type:'move', position:[500, 50]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[910, 50]});
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

       await sendMouse({type:'move', position:[1000, 50]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[754, 50]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);
       expect(bdy.width).to.equal(820-246);
       expect(bdy.right).to.equal(410+820-246);
       expect(bdy.left).to.equal(410);

       modal.hide();
       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[1000, 50]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[753, 50]});
       await sendMouse({type:'up'});
       expect(modal.open).to.equal(false);

       modal.hide();
       modal.show();
       await modal.updated();

       await sendMouse({type: 'move', position: [500, 100]});
       await sendMouse({type: 'down'});
       await sendMouse({type: 'move', position: [500, 303]});
       await sendMouse({type: 'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);
       expect(bdy.top).to.equal(203);
       expect(bdy.left).to.equal(410);
       expect(bdy.right).to.equal(1230);

       modal.hide();
       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[500, 100]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[500, 305]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[500, 250]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[500, 45]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(false);

       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[500, 250]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[500, 46]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);
       expect(bdy.bottom).to.equal(680-204);
       expect(bdy.left).to.equal(410);
       expect(bdy.right).to.equal(1230);
       expect(bdy.top).to.equal(0);

       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[500, 200]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[746, 200]});
       await sendMouse({type:'up'});
       bdy = modal_body.getBoundingClientRect();
       expect(modal.open).to.equal(true);

       modal.hide();
       modal.show();
       await modal.updated();

       await sendMouse({type:'move', position:[500,200]});
       await sendMouse({type:'down'});
       await sendMouse({type:'move', position:[747, 200]});
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
           </div></div>
       `);
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
           expect(setTimeout_calls.length).to.be.equal(1);
           expect(setTimeout_calls[0]).to.be.equal(10);
           expect(modal.open).to.be.equal(true);
           modal.hide(15);
           expect(setTimeout_calls.length).to.be.equal(2);
           expect(setTimeout_calls[1]).to.be.equal(15);
           expect(modal.open).to.be.equal(false);
           setTimeout_calls = [];
           mock_control['nocall'] = true;
           modal.show(20);
           expect(setTimeout_calls.length).to.be.equal(1);
           expect(setTimeout_calls[0]).to.be.equal(20);

           modal.show(12);
           expect(clrTimeout_calls.length).to.be.equal(4);
           expect(clrTimeout_calls[3]).to.be.equal(mock_control['count'] - 1);
           expect(setTimeout_calls.length).to.be.equal(2);
           expect(setTimeout_calls[0]).to.be.equal(20);
        } finally {
        mock_ctmout.restore();
        mock_stmout.restore();
        }
    });
});
