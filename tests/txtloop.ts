import { fixture, expect, html, oneEvent} from '@open-wc/testing';
import {AalamTxtloop} from "../src/txtloop";
import { sendMouse } from '@web/test-runner-commands';

describe('aalam-txtloop', () => {
    it('is defined', async () => {
        const el=await fixture(html`<aalam-txtloop></aalam-txtloop>`);
        expect(el).to.be.an.instanceof(AalamTxtloop);

        const el1=document.createElement("aalam-txtloop");
        expect(el1).to.be.an.instanceof(AalamTxtloop);
    });

    it('show and hide',async ()=> {
        const el =await fixture (`
            <div>
                <h1>
                    knowledge is limted.
                <aalam-txtloop
                    showanimation="name:b2t;dur:200">
                    <span > title1 </span>
                    <span >  body1 </span>
                    <span >  body2 </span>
                </aalam-txtloop>
                not the imagination.
              </h1>
             </div>`);
        const tloop = el.querySelector("aalam-txtloop");
        const spans = tloop.querySelectorAll('span');
        expect(spans.length).to.be.above(0);

        expect(spans[0].textContent.trim()).to.equal('title1');
        expect(spans[1].textContent.trim()).to.equal('body1');
        expect(spans[2].textContent.trim()).to.equal('body2');

        let change_listener = oneEvent(tloop,"change")

        let bound = tloop.getBoundingClientRect();
        expect(bound.left >0).to.equal(true);
        expect(bound.right>0).to.equal(true);
        expect(bound.height>0).to.equal(true);
        expect(bound.width>0).to.equal(true);
        expect(bound.top>0).to.equal(true);
        expect(bound.bottom>0).to.equal(true);
        expect(bound.x>0).to.equal(true);
        expect(bound.y>0).to.equal(true);

        expect(spans[0].classList.contains('show')).to.equal(true);
        expect(spans[1].classList.contains('show')).to.equal(false);
        expect(spans[2].classList.contains('show')).to.equal(false);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        let change_event =await change_listener;
        expect(change_event.detail.showing).to.equal(1);
        expect(change_event.detail.hiding).to.equal(0);
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(spans[0].classList.contains('show')).to.equal(false);
        expect(spans[0].classList.contains('hide')).to.equal(true); 
        expect(spans[1].classList.contains('show')).to.equal(true);
        expect(spans[2].classList.contains('show')).to.equal(false);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        change_event = await change_listener;
        expect(change_event.detail.showing).to.equal(2);
        expect(change_event.detail.hiding).to.equal(1);
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(spans[1].classList.contains('show')).to.equal(false);
        expect(spans[1].classList.contains('hide')).to.equal(true);
        expect(spans[2].classList.contains('show')).to.equal(true);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        change_event = await change_listener;
        expect(change_event.detail.showing).to.equal(0);
        expect(change_event.detail.hiding).to.equal(2);
        await new Promise(resolve =>setTimeout(resolve,100));

        expect(spans[2].classList.contains('hide')).to.equal(true);
        expect(spans[0].classList.contains('show')).to.equal(true);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        change_event = await change_listener;
        expect(change_event.detail.showing).to.equal(1);
        expect(change_event.detail.hiding).to.equal(0);
        await new Promise(resolve =>setTimeout(resolve,100));

        expect(spans[0].classList.contains('show')).to.equal(false);
        expect(spans[0].classList.contains('hide')).to.equal(true); 
        expect(spans[1].classList.contains('show')).to.equal(true);
        expect(spans[2].classList.contains('show')).to.equal(false);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        change_event = await change_listener;
        expect(change_event.detail.showing).to.equal(2);
        await new Promise(resolve =>setTimeout(resolve,100));

        expect(spans[1].classList.contains('show')).to.equal(false);
        expect(spans[1].classList.contains('hide')).to.equal(true);
        expect(spans[2].classList.contains('show')).to.equal(true);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        change_event = await change_listener;
        expect(change_event.detail.showing).to.equal(0);
        await new Promise(resolve =>setTimeout(resolve,100));

     });

});

