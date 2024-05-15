import { fixture, expect, html } from '@open-wc/testing';
import { AalamSwitchElement } from "../src/toggle-switch";

describe('aalam-switch', () => {
    it('is defined', async () => {
        const el = await fixture(html` <aalam-switch></aalam-switch>`);
        expect(el).to.be.an.instanceof(AalamSwitchElement);

        const el1 = document.createElement("aalam-switch");
        expect(el1).to.be.an.instanceof(AalamSwitchElement);
    });
    it('check attributes', async() => {
        const el = await fixture(html`<aalam-switch status="on"></aalam-switch>`)
        expect(el.status).to.equal("on");
        for (let k of ['onColor', 'offColor', 'dialColor', 'width', 'height'])
            expect(el[k]).to.equal(el.DEFAULT_STYLES[k]);

        el.setAttribute('style', "oncolor: #000;offcolor: #232;width:100px");
        expect(el.onColor).to.equal('#000');
        expect(el.offColor).to.equal('#232');
        expect(el.width).to.equal('100px');
        for (let k of ['dialColor', 'height'])
            expect(el[k]).to.equal(el.DEFAULT_STYLES[k]);

        el.setAttribute("style", "height:50px;");
        expect(el.height).to.equal('50px');
        for (let k of ['onColor', 'offColor', 'dialColor', 'width'])
            expect(el[k]).to.equal(el.DEFAULT_STYLES[k]);

        /*set invalid style value*/
        el.setAttribute('style', "oncolor: invalid;height:40;width:40px");
        expect(el.width).to.equal('40px');
        for (let k of ['onColor', 'offColor', 'dialColor', 'height'])
            expect(el[k]).to.equal(el.DEFAULT_STYLES[k]);
    })
    it("check events", async() => {
        const el = await fixture(html`<aalam-switch></aalam-switch>`)
        let dial = el.shadowRoot.querySelector(".switch-dial");
        let cur_status = el.status;
        expect(el.status).to.equal("off");
        el.addEventListener("change", (event) => {
            cur_status = event.detail});
        dial.click();
        expect(el.status).to.equal("on");
        expect(cur_status).to.equal("on");
        dial.click();
        expect(el.status).to.equal("off");
        expect(cur_status).to.equal("off");
    })
});
