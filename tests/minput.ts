import { fixture, expect, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';

import { AalamManagedInputElement } from "../src/minput";

describe('aalam-minput', () => {
    it('is defined', async () => {
        const el = await fixture(html` <aalam-minput></aalam-minput>`);
        expect(el).to.be.an.instanceof(AalamManagedInputElement);

        const el1 = document.createElement("aalam-minput");
        expect(el1).to.be.an.instanceof(AalamManagedInputElement);
    });
    it("check order attribute", async () => {
        /*Validate the order with and without proper data attributes*/
        const el = await fixture(html`<aalam-minput order="n1,n2,n3"></aalam-minput>`)
        let inps = el.shadowRoot.querySelectorAll("input")
        expect(inps.length).to.be.equal(3);
        expect(inps[0].id).to.be.equal('n1');
        expect(inps[1].id).to.be.equal('n2');
        expect(inps[2].id).to.be.equal('n3');
        for (let inp of inps){
            expect(inp.style.width).to.be.equal('');
            expect(inp.type).to.be.equal('tel');
        }
        const el1 = await fixture(html`<aalam-minput order="n1,n2,n3"
data-n1="chars:3;type:text" data-n*="chars:2;type:number;ph:test"></aalam-minput>`)
        inps = el1.shadowRoot.querySelectorAll("input")
        expect(inps.length).to.be.equal(3);
        for (let inp of inps){
            if (inp.id == 'n1') {
                expect(inp.style.width).to.be.equal('4ch');
                expect(inp.type).to.be.equal('text');
                expect(inp.placeholder).to.be.equal('');
            } else {
                expect(inp.style.width).to.be.equal('3ch');
                expect(inp.type).to.be.equal('tel')
                expect(inp.placeholder).to.be.equal('test');
            }
        }
    })
    it("check item specification", async () => {
        /*Check spec is respected - check for chars, type, ph, sep, gap are all respected*/
        const el = await fixture(html`<aalam-minput order="n1,n2,n3"
data-n1="chars:3;type:text;gapnxt:30px;ph:n1"
data-n*="chars:5;type:num;gapnxt:10px;sepnxt::;ph:n*"></aalam-minput>`)
        let children = el.shadowRoot.children
        expect(children.length).to.be.equal(4); /*3 inps, 1 sep div*/

        expect(children[0].tagName).to.be.equal('INPUT')
        expect(children[0].placeholder).to.be.equal('n1');
        expect(children[0].style.width).to.be.equal('4ch');
        expect(children[0].style.marginRight).to.be.equal('30px');
        expect(children[0].id).to.be.equal('n1');

        expect(children[1].tagName).to.be.equal('INPUT')
        expect(children[1].placeholder).to.be.equal('n*');
        expect(children[1].style.width).to.be.equal('6ch');
        expect(children[1].style.marginRight).to.be.equal('');
        expect(children[1].id).to.be.equal('n2');

        expect(children[2].tagName).to.be.equal('DIV')
        expect(children[2].style.width).to.be.equal('10px');
        expect(children[2].innerText).to.be.equal(':');
        expect(children[2].style.marginRight).to.be.equal('');
        expect(children[2].style.display).to.be.equal('inline-block');
        expect(children[2].style.textAlign).to.be.equal('center');

        expect(children[3].tagName).to.be.equal('INPUT')
        expect(children[3].placeholder).to.be.equal('n*');
        expect(children[3].style.width).to.be.equal('6ch');
        expect(children[3].style.marginRight).to.be.equal('');
        expect(children[3].id).to.be.equal('n3');
    });
    it("check value property", async () => {
        /*Check init value is processed correctly*/
        const el = await fixture(html`<aalam-minput order="n1,n2,n3"
value="n1:a;n2:b;n4:c" data-n*="chars:5;type:text;gapnxt:10px;sepnxt::;ph:n*">
</aalam-minput>`)
        expect(el._evnt_data['n1']).to.be.equal('a');
        expect(el._evnt_data['n2']).to.be.equal('b');
        expect(el._evnt_data['n3']).to.be.equal('');
        expect(Object.keys(el._evnt_data).length).to.be.equal(3);

        let inp3 = el.shadowRoot.querySelector("#n1");
        inp3.focus();
        await sendKeys({press: '1'});
        expect(el.value).to.be.equal("n1:a;n2:b;n4:c")

        await sendKeys({type: '234'});
        expect(el.value).to.be.equal("n1:a1234;n2:b;n3:")
    });
    it("check key events", async () => {
        /*Check for arrow keys & delete/backspace keys*/
        const el = await fixture(html`<aalam-minput order="n1,n2,n3"
data-n1="chars:1;type:text;"
data-n*="chars:2;type:text;gapnxt:10px;sepnxt::;ph:n*">
</aalam-minput>`)
        let inp1 = el.shadowRoot.querySelector("#n1");
        let inp2 = el.shadowRoot.querySelector("#n2");
        let inp3 = el.shadowRoot.querySelector("#n3");
        inp1.focus();

        await sendKeys({type: 'abcdef'})
        expect(inp1.value).to.be.equal('f');
        expect(inp2.value).to.be.equal('bc');
        expect(inp3.value).to.be.equal('de');
        expect(inp2.selectionStart).to.be.equal(0);
        expect(inp2.selectionEnd).to.be.equal(2);
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);

        await sendKeys({press: 'ArrowRight'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);
        expect(inp2.selectionStart).to.be.equal(2);

        await sendKeys({press: 'ArrowRight'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        expect(inp3.selectionStart).to.be.equal(0);

        await sendKeys({press: 'ArrowRight'});
        await sendKeys({press: 'ArrowRight'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        expect(inp3.selectionStart).to.be.equal(2);

        await sendKeys({press: 'ArrowRight'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp1.selectionStart).to.be.equal(0);

        await sendKeys({press: 'ArrowRight'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp1.selectionStart).to.be.equal(1);

        await sendKeys({press: 'ArrowLeft'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp1.selectionStart).to.be.equal(0);

        await sendKeys({press: 'ArrowLeft'});
        await sendKeys({press: 'ArrowLeft'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        expect(inp3.selectionStart).to.be.equal(1);

        await sendKeys({press: 'ArrowLeft'});
        await sendKeys({press: 'ArrowLeft'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);
        expect(inp2.selectionStart).to.be.equal(2);

        /*Make sure the input box doesnt get more thant the maxchars*/
        await sendKeys({type: 'xxxx'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);
        expect(inp2.selectionStart).to.be.equal(2);
        expect(inp2.value).to.be.equal('bc');

        await sendKeys({press: 'Backspace'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);
        expect(inp2.value).to.be.equal('b');
        expect(inp2.selectionStart).to.be.equal(1);

        await sendKeys({press: 'Backspace'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);
        expect(inp2.value).to.be.equal('');
        expect(inp2.selectionStart).to.be.equal(0);

        await sendKeys({press: 'Backspace'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp1.value).to.be.equal('');

        await sendKeys({press: 'Backspace'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp3.value).to.be.equal('de');

        await sendKeys({press: 'Backspace'});
        await sendKeys({press: 'Backspace'});
        await sendKeys({press: 'Backspace'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp3.value).to.be.equal('de');

        await sendKeys({type: 'abcde'})
        expect(inp1.value).to.be.equal('a');
        expect(inp2.value).to.be.equal('bc');
        expect(inp3.value).to.be.equal('de');
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);

        inp3.focus()
        inp3.selectionStart = inp3.selectionEnd = 0
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        await sendKeys({press: 'Delete'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        expect(inp3.selectionStart).to.be.equal(0);
        expect(inp3.value).to.be.equal('e');

        await sendKeys({press: 'Delete'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        expect(inp3.selectionStart).to.be.equal(0);
        expect(inp3.value).to.be.equal('');

        await sendKeys({press: 'Delete'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        expect(inp3.selectionStart).to.be.equal(0);
        expect(inp3.value).to.be.equal('');

        await sendKeys({press: 'Delete'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);

        await sendKeys({press:'ArrowRight'})
        await sendKeys({press:'ArrowRight'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);

        await sendKeys({press:'ArrowLeft'})
        await sendKeys({press:'ArrowLeft'})
        await sendKeys({press:'ArrowUp'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        expect(inp3.value).to.be.equal('1');

        await sendKeys({press:'ArrowUp'})
        await sendKeys({press:'ArrowUp'})
        await sendKeys({press:'ArrowUp'})
        await sendKeys({press:'ArrowUp'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        expect(inp3.value).to.be.equal('5');
    });
    it("check choice inputs", async () => {
        const el = await fixture(html`<aalam-minput order="n1,n2,n3"
data-n1="type:text;choices:EST,PST,GMT,NMT,NT,EAT,IST"
data-n*="chars:2;type:num;gapnxt:10px;sepnxt::;ph:n*;nmax:15;nmin:1">
</aalam-minput>`)
        let inp1 = el.shadowRoot.querySelector("#n1");
        let inp2 = el.shadowRoot.querySelector("#n2");
        let inp3 = el.shadowRoot.querySelector("#n3");
        inp1.focus();
        expect(inp1.placeholder).to.be.equal('');
        expect(inp1.style.width).to.be.equal('4ch');

        expect(inp1.value).to.be.equal('EST');

        await sendKeys({type: "adsf"});
        expect(inp1.value).to.be.equal('EST');

        await sendKeys({press:'Delete'})
        expect(inp1.value).to.be.equal('EST');

        await sendKeys({press:'Delete'})
        expect(inp1.value).to.be.equal('EST');

        await sendKeys({type: "gnh"});
        expect(inp1.value).to.be.equal('GMT');

        await sendKeys({press:'Backspace'})
        expect(inp1.value).to.be.equal('EST');

        await sendKeys({type: "Nt"});
        expect(inp1.value).to.be.equal('NT');

        await sendKeys({press:'Backspace'})
        expect(inp1.value).to.be.equal('EST');

        await sendKeys({type: "nM"});
        expect(inp1.value).to.be.equal('NMT');

        await sendKeys({press:'ArrowDown'})
        expect(inp1.value).to.be.equal('NT');

        await sendKeys({press:'ArrowDown'})
        await sendKeys({press:'ArrowDown'})
        expect(inp1.value).to.be.equal('IST');

        await sendKeys({press:'ArrowDown'})
        expect(inp1.value).to.be.equal('EST');

        await sendKeys({press:'ArrowDown'})
        expect(inp1.value).to.be.equal('PST');

        await sendKeys({press:'ArrowUp'})
        expect(inp1.value).to.be.equal('EST');

        await sendKeys({press:'ArrowUp'})
        expect(inp1.value).to.be.equal('IST');

        await sendKeys({press:'ArrowUp'})
        await sendKeys({press:'ArrowUp'})
        await sendKeys({press:'ArrowUp'})
        expect(inp1.value).to.be.equal('NMT')

        await sendKeys({press:'ArrowRight'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);

        await sendKeys({type: '1213'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp3.value).to.be.equal('13')
        expect(inp2.value).to.be.equal('12')

        await sendKeys({press:'ArrowLeft'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);

        await sendKeys({press:'ArrowLeft'})
        await sendKeys({press:'ArrowLeft'})
        await sendKeys({press:'ArrowLeft'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);

        await sendKeys({press:'ArrowLeft'})
        await sendKeys({press:'ArrowLeft'})
        await sendKeys({press:'ArrowLeft'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);

        await sendKeys({press:'ArrowLeft'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);

        await sendKeys({press:'ArrowRight'})
        await sendKeys({press:'ArrowRight'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);
    })
    it("check number inputs", async () => {
        const el = await fixture(html`<aalam-minput order="n1,n2,n3"
data-n1="chars:1;type:number;nmax:7;nmin:2;loop:1"
data-n*="chars:2;type:num;gapnxt:10px;sepnxt::;ph:n*;nmax:15;nmin:1">
</aalam-minput>`)
        let inp1 = el.shadowRoot.querySelector("#n1");
        let inp2 = el.shadowRoot.querySelector("#n2");
        let inp3 = el.shadowRoot.querySelector("#n3");
        inp1.focus();

        let ev_dets = [];
        el.addEventListener("change", (event) => {
            ev_dets.push(event.detail)});

        await sendKeys({type: '5431'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);
        expect(inp1.value).to.be.equal('2'); /*1 is less than min val(2)*/
        expect(inp2.value).to.be.equal('4');
        expect(inp3.value).to.be.equal('3');
        expect(ev_dets.length).to.be.equal(4);
        expect(ev_dets[0].changed, "n1")
        expect(ev_dets[0].old_val, undefined)
        expect(ev_dets[0].new_val, '5')
        expect(ev_dets[1].changed, "n2")
        expect(ev_dets[1].old_val, undefined)
        expect(ev_dets[1].new_val, '4')
        expect(ev_dets[2].changed, "n3")
        expect(ev_dets[2].old_val, undefined)
        expect(ev_dets[2].new_val, '3')
        expect(ev_dets[3].changed, "n1")
        expect(ev_dets[3].old_val, '5')
        expect(ev_dets[3].new_val, '2')

        ev_dets = [];
        inp1.focus();

        await sendKeys({press:'ArrowUp'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp1.value).to.be.equal('3');
        await sendKeys({press:'ArrowUp'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp1.value).to.be.equal('4');
        await sendKeys({press:'ArrowDown'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp1.value).to.be.equal('3');
        await sendKeys({press:'ArrowDown'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp1.value).to.be.equal('2');
        await sendKeys({press:'ArrowDown'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp1.value).to.be.equal('7');
        expect(ev_dets.length).to.be.equal(5);
        expect(ev_dets[3].changed, "n1")
        expect(ev_dets[3].old_val, '3')
        expect(ev_dets[3].new_val, '2')
        expect(ev_dets[3].changed, "n1")
        expect(ev_dets[3].old_val, '2')
        expect(ev_dets[3].new_val, '7')

        ev_dets = [];
        await sendKeys({press:'ArrowUp'})
        await sendKeys({press:'ArrowUp'})
        await sendKeys({press:'ArrowUp'})
        await sendKeys({press:'ArrowUp'})
        await sendKeys({press:'ArrowUp'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp1);
        expect(inp1.value).to.be.equal('6');
        expect(ev_dets.length).to.be.equal(5);
        expect(ev_dets[4].changed).to.be.equal("n1")
        expect(ev_dets[4].old_val).to.equal('5')
        expect(ev_dets[4].new_val).to.equal('6')

        await sendKeys({press:'ArrowUp'})
        expect(inp1.value).to.be.equal('7');
        expect(ev_dets.length).to.be.equal(6);
        expect(ev_dets[5].changed).to.equal("n1")
        expect(ev_dets[5].old_val).to.equal('6')
        expect(ev_dets[5].new_val).to.equal('7')
        ev_dets = [];

        await sendKeys({press:'ArrowUp'})
        expect(inp1.value).to.be.equal('2');
        expect(ev_dets.length).to.be.equal(1);
        expect(ev_dets[0].changed).to.equal("n1")
        expect(ev_dets[0].old_val).to.equal('7')
        expect(ev_dets[0].new_val).to.equal('2')
        ev_dets = [];

        inp2.click();
        await sendKeys({type: '11'})
        expect(inp2.value).to.be.equal('11');
        expect(ev_dets.length).to.be.equal(1);
        expect(ev_dets[0].changed, "n2")
        expect(ev_dets[0].old_val, '4')
        expect(ev_dets[0].new_val, '11')
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);

        ev_dets = [];
        await sendKeys({press:'ArrowLeft'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);
        expect(ev_dets.length).to.be.equal(0);
        await sendKeys({type: '23'})
        expect(inp2.value).to.be.equal('11');
        expect(ev_dets.length).to.be.equal(0);

        await sendKeys({press: 'Backspace'})
        expect(inp2.value).to.be.equal('1');
        expect(ev_dets.length).to.be.equal(0);

        await sendKeys({type: '6'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp2);
        expect(inp2.value).to.be.equal('1');
        expect(ev_dets.length).to.be.equal(0);

        await sendKeys({press: 'Backspace'})
        expect(inp2.value).to.be.equal('');

        await sendKeys({type: '00'})
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        expect(inp2.value).to.be.equal('1');
        expect(ev_dets.length).to.be.equal(1);
        expect(ev_dets[0].changed, "n2")
        expect(ev_dets[0].old_val, '11')
        expect(ev_dets[0].new_val, '1')
    })
    it("check event notification", async () => {
        /*Check for arrow keys & delete/backspace keys*/
        const el = await fixture(html`<aalam-minput order="n1,n2,n3"
data-n1="chars:1;type:text;"
data-n*="chars:2;type:text;gapnxt:10px;sepnxt::;ph:n*">
</aalam-minput>`)
        let event_detail = null;
        /*Check if the events are sent correctly and the value is read correctly*/
        el.addEventListener("change", (event) => {
            event_detail = event.detail});

        let inp1 = el.shadowRoot.querySelector("#n1");
        let inp2 = el.shadowRoot.querySelector("#n2");
        let inp3 = el.shadowRoot.querySelector("#n3");
        inp1.focus()
        await sendKeys({press: 'KeyA'})
        expect(event_detail?.changed).to.equal('n1')
        expect(event_detail?.old_val).to.equal(undefined)
        expect(event_detail?.new_val).to.equal('a')

        event_detail = null;
        await sendKeys({press: 'KeyB'});
        expect(event_detail).to.equal(null);
        await sendKeys({press: 'KeyC'});
        expect(event_detail?.changed).to.equal('n2');
        expect(event_detail?.old_val).to.equal(undefined)
        expect(event_detail?.new_val).to.equal('bc')

        event_detail = null;
        await sendKeys({press: 'KeyD'});
        expect(event_detail).to.equal(null);

        await sendKeys({press: 'ArrowRight'});
        expect(event_detail?.changed).to.equal('n3');
        expect(event_detail?.old_val).to.equal(undefined)
        expect(event_detail?.new_val).to.equal('d')

        /*When the value isnt changed, no need to raise event*/
        event_detail = null;
        await sendKeys({press: 'ArrowRight'});
        await sendKeys({press: 'ArrowRight'});
        await sendKeys({press: 'ArrowRight'});
        await sendKeys({press: 'ArrowRight'});
        await sendKeys({press: 'ArrowRight'});
        expect(el.shadowRoot.activeElement).to.be.equal(inp3);
        expect(event_detail).to.equal(null);
    })
})
