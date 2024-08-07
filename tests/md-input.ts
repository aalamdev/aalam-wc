import {fixture, expect, html, oneEvent} from '@open-wc/testing';
import {AalamMdInput} from "../src/md-input";
import {sendMouse, sendKeys} from "@web/test-runner-commands";

describe('aalam-md-input', () => {
    const check_greater = (val1:object, val2:object) => {
        expect(val1.y < val2.y).to.equal(true);
        expect(val1.height < val2.height).to.equal(true);
        expect(val1.width < val2.width).to.equal(true);
        expect(val1.top < val2.top).to.equal(true);
        expect(val1.bottom < val2.bottom).to.equal(true);
        expect(val1.right < val2.right).to.equal(true);
    };
    const check_equal = (val1:object, val2:object) => {
        expect(val2.x == val2.x).to.equal(true);
        expect(val1.y == val2.y).to.equal(true);
        expect(val1.height == val2.height).to.equal(true);
        expect(val1.width == val2.width).to.equal(true);
        expect(val1.top == val2.top).to.equal(true);
        expect(val1.bottom == val2.bottom).to.equal(true);
        expect(val1.right == val2.right).to.equal(true);
        expect(val1.left == val2.left).to.equal(true);
    }
    it('is defined', async () => {
        const el = await fixture( html`<aalam-md-input></aalam-md-input>`);
        expect(el).to.be.an.instanceof(AalamMdInput);

        const el2 = document.createElement('aalam-md-input');
        expect(el).to.be.an.instanceof(AalamMdInput);
    });

    it('prefix, suffix', async () => {
        let prefix_value = '@';
        let suffix_value = '%';
        const el = await fixture(html`
<div>
    <aalam-md-input prefix=${prefix_value} suffix=${suffix_value} id="md-inp">
    </aalam-md-input>
</div>`);
        const inp = el.querySelector('#md-inp');
        const _prefix_el = inp.shadowRoot.querySelector('#_prefix');
        const _suffix_el = inp.shadowRoot.querySelector('#_suffix');

        expect(inp.prefix).to.equal(prefix_value);
        expect(inp.suffix).to.equal(suffix_value);
        expect(_prefix_el.innerText).to.equal(prefix_value);
        expect(_suffix_el.innerText).to.equal(suffix_value);

        let prefix_value2 = 'Mr.';
        let suffix_value2 = 'kg';
        inp.setAttribute('prefix', prefix_value2);
        inp.setAttribute('suffix', suffix_value2);
        expect(inp.prefix).to.equal(prefix_value2);
        expect(inp.suffix).to.equal(suffix_value2);
        await inp.updated();
        expect(_prefix_el.innerText).to.equal(prefix_value2);
        expect(_suffix_el.innerText).to.equal(suffix_value2);
    });

    it('label position', async () => {

        const el = await fixture(html`
<div>
    <aalam-md-input id='md-inp'>
    <aalam-md-input>
</div>`);
        const inp = el.querySelector('#md-inp');
        const container_input = inp.shadowRoot.querySelector(
            '#_input-container');
        let con_pos = container_input.getBoundingClientRect();
        con_pos.height = Math.round(con_pos.height);
        let label_text = container_input.querySelector('#_label');

        let ev = oneEvent(container_input, 'transitionend');
        expect(inp.label).to.equal('Label');
        expect(inp.mode).to.equal('filled');
        expect(label_text.innerText).to.equal('Label');

        let new_label = 'data';
        inp.setAttribute('label', new_label);
        await inp.updated();
        expect(inp.label).to.equal(new_label);
        expect(label_text.innerText).to.equal(new_label);

        let before_label_pos = label_text.getBoundingClientRect();
        expect(inp._container.classList.contains('focused')).to.equal(false);
        expect(inp._container.classList.contains('focusout')).to.equal(false);
        await label_text.click();
        await ev;
        expect(inp._container.classList.contains('focused')).to.equal(true);
        expect(inp._container.classList.contains('focusout')).to.equal(false);

        let after_label_pos = label_text.getBoundingClientRect();
        check_greater(after_label_pos, before_label_pos);
        let tmp = 'abcd';
        await sendKeys({type:tmp});
        await inp.updated();
        expect(inp._input_box.value).to.equal(tmp);

        await sendMouse({type:'move', position: [
            con_pos.right + 30, con_pos.bottom + 30]});
        await sendMouse({type:'down'});
        await sendMouse({type:'up'});
        await inp.updated();
        expect(inp._container.classList.contains('focusout')).to.equal(true);

        await label_text.click();
        expect(inp._container.classList.contains('focusout')).to.equal(false);
        after_label_pos = label_text.getBoundingClientRect();
        con_pos = container_input.getBoundingClientRect();
        con_pos.height = Math.round(con_pos.height);
        await sendKeys({down:'Backspace'})
        expect(inp._input_box.value).to.equal('abc');
        await sendKeys({down:'Space'});
        expect(inp._input_box.value).to.equal('abc ');

        await sendKeys({down:'Backspace'});
        expect(inp._input_box.value).to.equal('abc');
        await sendKeys({down:'Backspace'});
        expect(inp._input_box.value).to.equal('ab');
        expect(inp._container.classList.contains('focused')).to.equal(true);

        await sendKeys({down:'Backspace'});
        await sendKeys({down:'Backspace'});
        expect(inp._input_box.value).to.equal('');

        ev = oneEvent(container_input, 'transitionend');
        await sendMouse({type:'move', position: [
            con_pos.right + 30, con_pos.bottom + 30]});
        await sendMouse({type:'down'});
        await sendMouse({type:'up'});
        await inp.updated();
        await ev;
        expect(inp._container.classList.contains('focused')).to.equal(false);
        expect(inp._container.classList.contains('focusout')).to.equal(false);

        after_label_pos = label_text.getBoundingClientRect();
        check_equal(before_label_pos, after_label_pos);

        inp.setAttribute('mode', 'outline');
        expect(inp.mode).to.equal('outline');
        con_pos = container_input.getBoundingClientRect();
        con_pos.height = Math.round(con_pos.height);
        await inp.updated();
        expect(inp.label).to.equal(new_label);
        expect(label_text.innerText).to.equal(new_label);

        ev = oneEvent(container_input, 'transitionend');
        before_label_pos = label_text.getBoundingClientRect();
        expect(inp._container.classList.contains('focused')).to.equal(false);
        expect(inp._container.classList.contains('focusout')).to.equal(false);
        await label_text.click();
        await inp.updated();
        await ev;
        expect(inp._container.classList.contains('focused')).to.equal(true);
        expect(inp._container.classList.contains('focusout')).to.equal(false);

        tmp = 'pqrs';
        await sendKeys({type:tmp});
        await inp.updated();
        expect(inp._input_box.value).to.equal(tmp);

        await sendMouse({type:'move', position: [
            con_pos.right + 30, con_pos.bottom + 30]});
        await sendMouse({type:'down'});
        await sendMouse({type:'up'});
        await inp.updated();

        await label_text.click();
        after_label_pos = label_text.getBoundingClientRect();
        con_pos = container_input.getBoundingClientRect();
        con_pos.height = Math.round(con_pos.height);
        await sendKeys({down:'Backspace'})
        expect(inp._input_box.value).to.equal('pqr');
        await sendKeys({down:'Space'});
        expect(inp._input_box.value).to.equal('pqr ');

        await sendKeys({down:'Backspace'});
        expect(inp._input_box.value).to.equal('pqr');
        await sendKeys({down:'Backspace'});
        expect(inp._input_box.value).to.equal('pq');
        expect(inp._container.classList.contains('focused')).to.equal(true);
        expect(inp._container.classList.contains('focusout')).to.equal(false);

        await sendKeys({down:'Backspace'});
        await sendKeys({down:'Backspace'});
        expect(inp._input_box.value).to.equal('');

        ev = oneEvent(container_input, 'transitionend');
        await sendMouse({type:'move', position: [
            con_pos.right + 30, con_pos.bottom + 30]});
        await sendMouse({type:'down'});
        await sendMouse({type:'up'});
        await inp.updated();
        await ev;
        expect(inp._container.classList.contains('focused')).to.equal(false);
        expect(inp._container.classList.contains('focusout')).to.equal(false);
    });
    it('disabled', async () => {
        const el = await fixture(`
<div>
    <aalam-md-input disabled>
    </aalam-md-input>
</div>`);
        const inp = el.querySelector('aalam-md-input');
        const container_input = inp.shadowRoot.querySelector(
            '#_input-container');
        const label_text = container_input.querySelector('#_label');
        let ev = oneEvent(container_input, 'transitionend');
        expect(inp.hasAttribute('disabled')).to.equal(true);
        expect(inp._input_box.hasAttribute('disabled')).to.equal(true);

        let before_label_pos = label_text.getBoundingClientRect();
        await label_text.click();
        await inp.updated();
        let after_label_pos = label_text.getBoundingClientRect();
        expect(inp._container.classList.contains('focused')).to.equal(false);
        check_equal(before_label_pos, after_label_pos);

        inp.removeAttribute('disabled');
        expect(inp.hasAttribute('disabled')).to.equal(false);
        expect(inp._input_box.hasAttribute('disabled')).to.equal(false);

        ev = oneEvent(container_input, 'transitionend');
        await label_text.click();
        await ev;
        after_label_pos = label_text.getBoundingClientRect();
        check_greater(after_label_pos, before_label_pos);
        expect(inp._container.classList.contains('focused')).to.equal(true);
    });

    it('charcount', async () => {
        const el = await fixture(`
<div>
    <aalam-md-input>
    </aalam-md-input>
</div>`);
        let inp = el.querySelector('aalam-md-input');
        expect(inp.charcount).to.equal('');

        inp.setAttribute('charcount', 5);
        await inp.updated();
        expect(inp.charcount).to.equal(5);
        expect(inp._display_counter.innerText).to.equal(`0/${inp.charcount}`);

        inp.removeAttribute('charcount');
        expect(inp.charcount).to.equal(null);
        expect(inp._display_counter.textContent).to.equal('');

        const el1 = await fixture(`
<div>
    <aalam-md-input charcount="5">
    </aalam-md-input>
</div>`);
        inp = el1.querySelector('aalam-md-input');
        const container_input = inp.shadowRoot.querySelector(
            '#_input-container');
        const label_text = container_input.querySelector('#_label');
        let ev = oneEvent(container_input, 'transitionend');
        expect(inp.charcount).to.equal(5);
        expect(inp._display_counter.textContent).to.equal(`0/5`);

        let before_label_pos = label_text.getBoundingClientRect();
        await label_text.click();
        await ev;
        let after_label_pos = label_text.getBoundingClientRect();
        expect(inp._container.classList.contains('focused')).to.equal(true);
        check_greater(after_label_pos, before_label_pos);

        await sendKeys({down:'u'});
        expect(inp._display_counter.innerText).to.equal(`1/${inp.charcount}`);
        expect(inp._input_box.value).to.equal('u');

        await sendKeys({down:'h'});
        expect(inp._input_box.value).to.equal('uh');
        expect(inp._display_counter.innerText).to.equal(`2/${inp.charcount}`);

        await sendKeys({type:'vm'});
        expect(inp._display_counter.innerText).to.equal(`4/${inp.charcount}`);
        expect(inp._input_box.value).to.equal('uhvm');

        await sendKeys({type:'sl'});
        expect(inp._display_counter.innerText).to.equal(`5/${inp.charcount}`);
        expect(inp._input_box.value).to.equal('uhvms');

        await sendKeys({down:'t'});
        expect(inp._display_counter.innerText).to.equal(`5/${inp.charcount}`);
        expect(inp._input_box.value).to.equal('uhvms');

        await sendKeys({down:'Backspace'});
        expect(inp._display_counter.innerText).to.equal(`4/${inp.charcount}`);
        expect(inp._input_box.value).to.equal('uhvm');

        await sendKeys({down:'Backspace'});
        expect(inp._display_counter.innerText).to.equal(`3/${inp.charcount}`);

        await sendKeys({down:'Backspace'});
        await sendKeys({down:'Backspace'});
        expect(inp._display_counter.innerText).to.equal(`1/${inp.charcount}`);
        expect(inp._input_box.value).to.equal('u');

        await sendKeys({down:'Space'});
        expect(inp._display_counter.innerText).to.equal(`2/${inp.charcount}`);
        expect(inp._input_box.value).to.equal('u ');

        await sendKeys({down:'Backspace'});
        await sendKeys({down:'Backspace'});
        expect(inp._display_counter.innerText).to.equal(`0/${inp.charcount}`);
        expect(inp._input_box.value).to.equal('');

        inp.removeAttribute('charcount');
        expect(inp._display_counter.textContent).to.equal('');
        expect(inp._input_box.value).to.equal('');
        expect(inp._input_box.value).to.equal('');
    });

});
