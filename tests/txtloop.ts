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
        console.log('\n\n\n');
        const el =await fixture (`
<div>
    <h1>
        knowledge is limted.
    <aalam-txtloop
        showanimation="name:b2t;dur:200" hideanimation="name:t2b;dur:200">
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

        //1st loop 
        expect(spans[0].classList.contains('show')).to.equal(true);
        console.log("show 0",spans[0]);
        expect(spans[1].classList.contains('show')).to.equal(false);
        expect(spans[2].classList.contains('show')).to.equal(false);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        let change_event =await change_listener;
        expect(change_event.detail.nxt_index).to.equal(1);
        console.log("change listener = ",change_listener);
        console.log("change event = ",change_event);
        await new Promise(resolve => setTimeout(resolve, 100));

        //2nd switch
        expect(spans[0].classList.contains('show')).to.equal(false);
        expect(spans[0].classList.contains('hide')).to.equal(true); 
        console.log("hide 0",spans[0]);
        expect(spans[1].classList.contains('show')).to.equal(true);
        console.log("show 1", spans[1]);
        expect(spans[2].classList.contains('show')).to.equal(false);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        change_event = await change_listener;
        expect(change_event.detail.nxt_index).to.equal(2);
        await new Promise(resolve => setTimeout(resolve, 100));

        //3rd switch
        expect(spans[1].classList.contains('show')).to.equal(false);
        expect(spans[1].classList.contains('hide')).to.equal(true);
        console.log("hide 1", spans[1]);
        expect(spans[2].classList.contains('show')).to.equal(true);
        console.log("show 2",spans[2]);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        change_event = await change_listener;
        expect(change_event.detail.nxt_index).to.equal(0);
        await new Promise(resolve =>setTimeout(resolve,100));

        //2nd loop
        expect(spans[2].classList.contains('hide')).to.equal(true);
        console.log("hide 2",spans[2]);
        expect(spans[0].classList.contains('show')).to.equal(true);
        console.log("2nd loop show 0", spans[0]);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        change_event = await change_listener;
        expect(change_event.detail.nxt_index).to.equal(1);
        await new Promise(resolve =>setTimeout(resolve,100));

        //2nd switch
        expect(spans[0].classList.contains('show')).to.equal(false);
        expect(spans[0].classList.contains('hide')).to.equal(true); 
        console.log("2nd loop hide 0",spans[0]);
        expect(spans[1].classList.contains('show')).to.equal(true);
        console.log("2nd loop show 1", spans[1]);
        expect(spans[2].classList.contains('show')).to.equal(false);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        change_event = await change_listener;
        expect(change_event.detail.nxt_index).to.equal(2);
        await new Promise(resolve =>setTimeout(resolve,100));

        //3rd switch
        expect(spans[1].classList.contains('show')).to.equal(false);
        expect(spans[1].classList.contains('hide')).to.equal(true);
        console.log("2nd loop hide 1", spans[1]);
        expect(spans[2].classList.contains('show')).to.equal(true);
        console.log("2nd loop show 2",spans[2]);

        change_listener = oneEvent(tloop,"change")
        tloop.switch();
        change_event = await change_listener;
        expect(change_event.detail.nxt_index).to.equal(0);
        await new Promise(resolve =>setTimeout(resolve,100));

     });

});

