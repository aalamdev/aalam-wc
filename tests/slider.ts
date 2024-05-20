import { fixture, expect, html } from '@open-wc/testing';
import { stub } from 'sinon';
import { sendMouse } from '@web/test-runner-commands';
import { AalamSliderElement } from "../src/slider";

let getItemsInView = (el:AalamSliderElement) => {
    let got:number[] = [];
    let pr = el.getBoundingClientRect();
    for (let i = 0; i < el.slide_items.length; i++) {
        let ir = el.slide_items[i].getBoundingClientRect();
        if (ir.left < pr.right && ir.right > pr.left) {
            got.push(i);
        }
    }
    return got
}

let isItemInCenter = (el, ix) => {
    let center_x = el._getCenterX();
    let ir = el.slide_items[ix].getBoundingClientRect();
    let gap = parseInt(window.getComputedStyle(el.slide_items[ix]).paddingLeft || '0px', 10)
    return center_x == ir.left + gap/2 + el.slide_items[ix].clientWidth/2
}

afterEach(async () => {
    document.body.innerHTML = "";
})

describe('aalam-slider', () => {
    it('is defined', async () => {
        const el = await fixture(html` <aalam-slider></aalam-slider>`);
        expect(el).to.be.an.instanceof(AalamSliderElement);

        const el1 = document.createElement("aalam-slider");
        expect(el1).to.be.an.instanceof(AalamSliderElement);
    });
    it('check loop', async() => {
        const el = await fixture(html`<aalam-slider loop gap="xs:10px;m:30px">
        <div slot="slide-item" style="width:33.33%;height:100px;"></div>
        <div slot="slide-item" style="width:50%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        </aalam-slider>`)
        el.transition_dur = 0;
        expect(el.loop).to.equal(true);

        await el.show(4);
        expect(el.anchorindex).to.equal(4)
        expect([0,1,4]).to.have.deep.members(getItemsInView(el).sort());

        await el.next();
        expect(el.anchorindex).to.equal(0)
        expect([0,1,2]).to.have.deep.members(getItemsInView(el).sort());

        await el.prev();
        expect(el.anchorindex).to.equal(4);
        expect([0,1,4]).to.have.deep.members(getItemsInView(el).sort());

        await el.prev();
        expect(el.anchorindex).to.equal(3);
        expect([0,1,3,4]).to.have.deep.members(getItemsInView(el).sort());

        el.loop = false;
        await requestAnimationFrame(() => {});

        await el.next();
        expect(el.anchorindex).to.equal(4);
        expect([1,2,3,4]).to.have.deep.members(getItemsInView(el).sort());

        await el.next();
        expect(el.anchorindex).to.equal(4);
        expect([1,2,3,4]).to.have.deep.members(getItemsInView(el).sort());

        await el.prev();
        expect(el.anchorindex).to.equal(1);
        expect([1,2,3]).to.have.deep.members(getItemsInView(el).sort());

        await el.show(0)
        expect(el.anchorindex).to.equal(0);
        expect([0,1,2]).to.have.deep.members(getItemsInView(el).sort());

        await el.prev();
        expect(el.anchorindex).to.equal(0);
        expect([0,1,2]).to.have.deep.members(getItemsInView(el).sort());

        el.loop = true;
        await requestAnimationFrame(() => {});

        await el.prev();
        expect(el.anchorindex).to.equal(4);
        expect([0,1,4]).to.have.deep.members(getItemsInView(el).sort());
    });

    /*sets with and without loop*/
    it('check sets', async() => {
        // el1 all equal width - 2 sets
        const el1 = await fixture(html`<aalam-slider gap="xs:8px;m:30px" sets>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        </aalam-slider>`)
        el1.transition_dur = 0;

        expect(el1.sets).to.equal(true);

        expect(el1.anchorindex).to.equal(0)
        expect([0,1,2,3]).to.have.deep.members(getItemsInView(el1).sort());

        await el1.next();
        expect([1,2,3,4]).to.have.deep.members(getItemsInView(el1).sort());

        await el1.next();
        expect([1,2,3,4]).to.have.deep.members(getItemsInView(el1).sort());

        await el1.prev();
        expect([0,1,2,3]).to.have.deep.members(getItemsInView(el1).sort());

        el1.loop = true;
        await requestAnimationFrame(() => {});

        await el1.next();
        expect([0,1,2,4]).to.have.deep.members(getItemsInView(el1).sort());
        await el1.next();
        expect([0,1,2,3]).to.have.deep.members(getItemsInView(el1).sort());

        await el1.prev();
        expect([0,1,2,4]).to.have.deep.members(getItemsInView(el1).sort());
        await el1.prev();
        expect([0,1,2,3]).to.have.deep.members(getItemsInView(el1).sort());

        //el2 unequal width - 3 sets
        const el2 = await fixture(html`<aalam-slider gap="xs:10px;m:30px" sets>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:33.33%;height:100px;"></div>
        <div slot="slide-item" style="width:50%;height:100px;"></div>
        <div slot="slide-item" style="width:33.33%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        </aalam-slider>`)
        el2.transition_dur = 0;
        expect(el2.sets).to.equal(true);

        expect(el2.anchorindex).to.equal(0)
        expect([0,1,2]).to.have.deep.members(getItemsInView(el2).sort());

        await el2.next();
        expect(el2.anchorindex).to.equal(1)
        expect([2,3,4]).to.have.deep.members(getItemsInView(el2).sort());

        await el2.next();
        expect(el2.anchorindex).to.equal(2)
        expect([2,3,4]).to.have.deep.members(getItemsInView(el2).sort());

        await el2.next();
        expect(el2.anchorindex).to.equal(2)
        expect([2,3,4]).to.have.deep.members(getItemsInView(el2).sort());

        await el2.prev();
        expect(el2.anchorindex).to.equal(1)
        expect([2,3,4]).to.have.deep.members(getItemsInView(el2).sort());

        await el2.prev();
        expect(el2.anchorindex).to.equal(0)
        expect([0,1,2]).to.have.deep.members(getItemsInView(el2).sort());

        el2.loop = true;
        await requestAnimationFrame(() => {});

        await el2.next();
        expect(el2.anchorindex).to.equal(1)
        expect([2,3,4]).to.have.deep.members(getItemsInView(el2).sort());

        await el2.next();
        expect(el2.anchorindex).to.equal(2)
        expect([0,1,2,4]).to.have.deep.members(getItemsInView(el2).sort());

        await el2.next();
        expect(el2.anchorindex).to.equal(0)
        expect([0,1,2]).to.have.deep.members(getItemsInView(el2).sort());

        await el2.prev();
        expect(el2.anchorindex).to.equal(2)
        expect([0,1,2,4]).to.have.deep.members(getItemsInView(el2).sort());

        await el2.show(1);
        expect(el2.anchorindex).to.equal(1)
        expect([2,3,4]).to.have.deep.members(getItemsInView(el2).sort());

    });

    /*center with and without loop, with and without sets*/
    it('check center', async() => {
        const el1 = await fixture(html`<aalam-slider gap="xs:9px;m:18px" center>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:50%;height:100px;"></div>
        <div slot="slide-item" style="width:50%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:50%;height:100px;"></div>
        </aalam-slider>`)
        el1.transition_dur = 0;
        el1.showing= false;
        expect(el1.center).to.equal(true);
        // The center setup takes some time and we wont know for
        // the moment the setup is finished, hence sleeping generously
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        await requestAnimationFrame(() => {});

        expect(el1.anchorindex).to.equal(0)
        expect([0,1]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 0)).to.equal(true);

        await el1.next();
        expect(el1.anchorindex).to.equal(1)
        expect([0,1,2]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 1)).to.equal(true);

        await el1.next();
        expect(el1.anchorindex).to.equal(2)
        expect([1,2,3,4]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 2)).to.equal(true);

        await el1.next();
        expect(el1.anchorindex).to.equal(3)
        expect([2,3,4]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 3)).to.equal(true);

        await el1.next();
        expect(el1.anchorindex).to.equal(4)
        expect([3,4]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 4)).to.equal(true);

        await el1.next();
        expect(el1.anchorindex).to.equal(4)
        expect([3,4]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 4)).to.equal(true);

        await el1.show(1);
        expect(el1.anchorindex).to.equal(1)
        expect([0,1,2]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 1)).to.equal(true);

        await el1.prev();
        expect(el1.anchorindex).to.equal(0)
        expect([0,1]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 0)).to.equal(true);

        await el1.prev();
        expect(el1.anchorindex).to.equal(0)
        expect([0,1]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 0)).to.equal(true);

        el1.loop = true;
        await requestAnimationFrame(() => {});

        await el1.prev();
        expect(el1.anchorindex).to.equal(4)
        expect([3,4,0,1]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 4)).to.equal(true);

        await el1.show(1);
        expect(el1.anchorindex).to.equal(1)
        expect([0,1,2]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 1)).to.equal(true);

        await el1.show(4);
        expect(el1.anchorindex).to.equal(4)
        expect([3,4,0]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 4)).to.equal(true);

        await el1.next();
        expect(el1.anchorindex).to.equal(0)
        expect([4,0,1]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 0)).to.equal(true);

        // sets will be ignored on center
        el1.sets = true;
        await requestAnimationFrame(() => {});

        await el1.next();
        expect(el1.anchorindex).to.equal(1)
        expect([0,1,2]).to.have.deep.members(getItemsInView(el1).sort());
        expect(isItemInCenter(el1, 1)).to.equal(true);

        el1.center = false;
        await requestAnimationFrame(() => {});
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});

        expect(el1.anchorindex).to.equal(1)
        expect([2,3,4]).to.have.deep.members(getItemsInView(el1).sort());

        await el1.next();
        expect(el1.anchorindex).to.equal(2)
        expect([4,0,1]).to.have.deep.members(getItemsInView(el1).sort());
    });

    /*autoplay scenarios*/
    it('check autoplay', async() => {
        const el = await fixture(html`<aalam-slider loop gap="xs:10px;m:30px">
        <div slot="slide-item" style="width:33.33%;height:100px;"></div>
        <div slot="slide-item" style="width:50%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        </aalam-slider>`)
        el.transition_dur = 0;
        expect(el.loop).to.equal(true);

        let mock_control = {'count': 0, 'stopat': 0};
        let original_tmout = window.setTimeout;

        let mock_ctmout = stub(window, "clearTimeout").callsFake((id) => {
            if (id < mock_control['count'])
                return;
            mock_control['should_stop'] = true;
        })
        let mock_stmout = stub(window, "setTimeout").callsFake((fn, dur) => {
            if (mock_control['count'] == mock_control['stopat'])
                return;
            mock_control['count'] += 1
            fn();
            return mock_control['count'];
        })

        try {
        mock_control['stopat'] = 1;
        el.autoslide = "dur:2000;onhover:pause";
        await requestAnimationFrame(() => {});
        await new Promise((resolve) => {original_tmout(() => {resolve()}, 50)});

        expect(mock_control['count']).to.equal(1);
        expect([1,2,3]).to.have.deep.members(getItemsInView(el).sort());

        /*TODO: Findout a way to test the onhover behaviour as well*/
        } finally {
        mock_ctmout.restore();
        mock_stmout.restore();
        }
    })

    /*Nav guide scenarios with changing sets to true and false*/
    it('check navguides', async() => {
        const el1 = await fixture(html`<aalam-slider loop gap="xs:10px;m:30px">
        <div slot="slide-item" style="width:33.33%;height:100px;"></div>
        <div slot="slide-item" style="width:50%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg" class="guide-item" slot="nav-guide-item">
          <rect width="10" height="10" x="0" y="0" rx="10" ry="10" fill="none" stroke="currentColor"/>
        </svg>
        </aalam-slider>`)
        el1.transition_dur = 0;
        expect(el1.loop).to.equal(true);

        expect(el1.guide_items.length).to.equal(5);
        expect(el1._guide_els.length).to.equal(0);
        let guides = [...el1.guide_items];

        el1.sets = true;
        await requestAnimationFrame(() => {});

        expect(el1.guide_items.length).to.equal(2);
        expect(el1._guide_els.length).to.equal(0);
        expect(guides.indexOf(el1.guide_items[0])).to.equal(0);
        expect(guides.indexOf(el1.guide_items[1])).to.equal(-1);

        const el2 = await fixture(html`<aalam-slider loop gap="xs:10px;m:30px">
        <div slot="slide-item" style="width:33.33%;height:100px;"></div>
        <div slot="slide-item" style="width:50%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        </aalam-slider>`)
        el2.transition_dur = 0;
        expect(el2.loop).to.equal(true);

        expect(el2.guide_items.length).to.equal(0);
        expect(el2._guide_els.length).to.equal(5);
        guides = [...el2._guide_els];

        el2.sets = true;
        await requestAnimationFrame(() => {});

        expect(el2.guide_items.length).to.equal(0);
        expect(el2._guide_els.length).to.equal(2);
        expect(guides.indexOf(el2._guide_els[0])).to.equal(-1);
        expect(guides.indexOf(el2._guide_els[1])).to.equal(-1);
    })

    /*swipe on finite sets and check the end. and on loop to check it goes round and round*/
    it('check swipe', async() => {
        const el = await fixture(html`<aalam-slider gap="xs:10px;m:30px">
        <div slot="slide-item" style="width:33.33%;height:100px;"></div>
        <div slot="slide-item" style="width:50%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg" class="guide-item" slot="nav-guide-item">
          <rect width="10" height="10" x="0" y="0" rx="10" ry="10" fill="none" stroke="currentColor"/>
        </svg>
        </aalam-slider>`)
        el.transition_dur = 0;
        expect(el.loop).to.equal(false);

        await el.show(4);
        expect([1,2,3,4]).to.have.deep.members(getItemsInView(el).sort());

        let pr = el.getBoundingClientRect();
        await sendMouse({type: 'move', position: [pr.right - 60, pr.bottom - 20]})
        await sendMouse({type: 'down'})
        await sendMouse({type: 'move', position: [0, (pr.bottom - pr.top)/2]})
        expect([4]).to.have.deep.members(getItemsInView(el).sort());
        await sendMouse({type: 'up'})

        /*It moves the 4th item to the left extreme, and then puts it back at the right end*/
        /*We dont hvae a reliable way to wait on the touch end event. hence, we sleep*/
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect([1, 2,3,4]).to.have.deep.members(getItemsInView(el).sort());

        await el.show(0);
        expect([0,1,2]).to.have.deep.members(getItemsInView(el).sort());
        await sendMouse({type: 'move', position: [pr.left + 20, pr.bottom - 20]})
        await sendMouse({type: 'down'})
        await sendMouse({type: 'move', position: [pr.right, (pr.bottom - pr.top)/2]})
        expect([0]).to.have.deep.members(getItemsInView(el).sort());
        await sendMouse({type: 'up'})

        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect([0,1,2]).to.have.deep.members(getItemsInView(el).sort());

        el.loop = true;
        await requestAnimationFrame(() => {});

        expect([0,1,2]).to.have.deep.members(getItemsInView(el).sort());
        await sendMouse({type: 'move', position: [pr.left + 20, pr.bottom - 20]})
        await sendMouse({type: 'down'})
        await sendMouse({type: 'move', position: [pr.left + 160 + el.slide_items[0].offsetWidth, (pr.bottom - pr.top)/2]})
        //expect([4, 0, 1]).to.have.deep.members(getItemsInView(el).sort());
        await sendMouse({type: 'up'})
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect([4,0,1]).to.have.deep.members(getItemsInView(el).sort());
    })

    /*check events and data attributes*/
    it('check events', async() => {
        const el = await fixture(html`<aalam-slider gap="xs:10px;m:30px">
        <div slot="slide-item" style="width:33.33%;height:100px;"></div>
        <div slot="slide-item" style="width:50%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        <div slot="slide-item" style="width:25%;height:100px;"></div>
        </aalam-slider>`)
        el.transition_dur = 0;
        expect(el.loop).to.equal(false);
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});

        let hidden_ix = [];
        let shown_ix = [];
        el.addEventListener("itemshown", (e) => {shown_ix.push(el.slide_items.indexOf(e.detail))})
        el.addEventListener("itemhidden", (e) => {hidden_ix.push(el.slide_items.indexOf(e.detail))})

        await el.next();
        expect([1,2,3]).to.have.deep.members(getItemsInView(el).sort());
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect([0]).to.have.deep.members(hidden_ix);
        expect([1]).to.have.deep.members(shown_ix);

        hidden_ix = [];
        shown_ix = [];
        await el.next();
        expect([1,2,3, 4]).to.have.deep.members(getItemsInView(el).sort());
        expect([1]).to.have.deep.members(hidden_ix);
        expect([2]).to.have.deep.members(shown_ix);

        expect(el.slide_items[0].getAttribute("data-active-ix")).to.equal("-2");
        expect(el.slide_items[1].getAttribute("data-active-ix")).to.equal("-1");
        expect(el.slide_items[2].getAttribute("data-active-ix")).to.equal("0");
        expect(el.slide_items[3].getAttribute("data-active-ix")).to.equal("1");
        expect(el.slide_items[4].getAttribute("data-active-ix")).to.equal("2");
        expect(el._guide_els[0].getAttribute("data-active-ix")).to.equal("-2");
        expect(el._guide_els[1].getAttribute("data-active-ix")).to.equal("-1");
        expect(el._guide_els[2].getAttribute("data-active-ix")).to.equal("0");
        expect(el._guide_els[3].getAttribute("data-active-ix")).to.equal("1");
        expect(el._guide_els[4].getAttribute("data-active-ix")).to.equal("2");
    })
});
