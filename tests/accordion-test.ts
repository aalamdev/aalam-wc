import { fixture, expect, html, oneEvent } from "@open-wc/testing";
import "../src/accordion.ts";

describe("AalamAccordion", () => {
    it("initially opens items with the acc-active class", async () => {
        const el = await fixture(html`
            <aalam-accordion activecls="acc-active">
                <div class="acc-title">Title 1</div>
                <div class="acc-body acc-active">Content 1</div>
                <div class="acc-title">Title 2</div>
                <div class="acc-body">Content 2</div>
            </aalam-accordion>
        `);
        expect(el.querySelectorAll(".acc-body.acc-active").length).to.equal(1);
        expect(el.querySelector(".acc-body.acc-active")).to.exist;

        const element = await fixture(html`
            <aalam-accordion>
                <div class="container acc-active">
                    <div class="acc-title">Title 1</div>
                    <div class="acc-body acc-active">Content 1</div>
                </div>
                <div class="container acc-active">
                    <div class="acc-title">Title 2</div>
                    <div class="acc-body acc-active">Content 2</div>
                </div>
            </aalam-accordion>
        `);
        expect(
            element.querySelectorAll(".acc-body.acc-active").length
        ).to.equal(2);
        expect(element.querySelector(".acc-body.acc-active")).to.exist;
        expect(element.querySelectorAll(".acc-active")).to.exist;
    });

    it("allows multiple items to be open if nomultiple y ", async () => {
        const el = await fixture(html`
            <aalam-accordion activecls="acc-active">
                <div class="container ">
                    <div class="acc-title">
                        <span>What is Artificial Intelligence?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">
                        <p>body 1</p>
                    </div>
                </div>
                <div class="container  ">
                    <div class="acc-title">
                        <span>What is Machine Learning?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 2</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 3?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 3</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 4</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 4</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 5</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 5</div>
                </div>
            </aalam-accordion>
        `);

        const titles = el.querySelectorAll(".acc-title");
        titles[0]?.click();
        titles[1]?.click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(2);

        titles[0]?.click();
        titles[3]?.click();
        titles[4]?.click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(3);

        titles[1]?.click();
        titles[3]?.click();
        titles[4]?.click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(0);

        const ele = await fixture(html`
            <aalam-accordion nomultiple activecls="acc-active">
                <div class="container acc-active">
                    <div class="acc-title">
                        <span>What is Artificial Intelligence?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">
                        <p>body 1</p>
                    </div>
                </div>
                <div class="container acc-active ">
                    <div class="acc-title">
                        <span>What is Machine Learning?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 2</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 3?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 3</div>
                </div>

                <div class="container acc-active ">
                    <div class="acc-title">
                        <span>title 4</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 4</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 5</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 5</div>
                </div>
            </aalam-accordion>
        `);

        const title = ele.querySelectorAll(".acc-active");
        console.log(title);
        expect(ele.querySelectorAll(".acc-active").length).to.equal(1);

        title[1]?.click();
        await ele.updateComplete;

        expect(ele.querySelectorAll(".acc-active").length).to.equal(1);
        title[1]?.click();
        expect(ele.querySelectorAll(".ac-open").length).to.equal(0);
    });

    it("toggles an item closed", async () => {
        const el = await fixture(html`
            <aalam-accordion activecls="acc-active">
                <div class="container ">
                    <div class="acc-title">
                        <span>What is Artificial Intelligence?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">
                        <p>body 1</p>
                    </div>
                </div>
                <div class="container  ">
                    <div class="acc-title">
                        <span>What is Machine Learning?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 2</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 3?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 3</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 4</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 4</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 5</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 5</div>
                </div>
            </aalam-accordion>
        `);
        const titles = el.querySelectorAll(".acc-title");
        expect(el.querySelectorAll(".acc-body.acc-active")).to.not.exist;
        titles[0]?.click();
        expect(el.querySelectorAll(".acc-active").length).equal(1);
        titles[1]?.click();
        expect(el.querySelectorAll(".acc-active").length).equal(2);
        titles[0]?.click();
        titles[2]?.click();
        titles[4]?.click();
        expect(el.querySelectorAll(".acc-active").length).equal(3);
    });

    it("should be an nocloseall is true", async () => {
        const el = await fixture(html`
            <aalam-accordion activecls="acc-active">
                <div class="container acc-active ">
                    <div class="acc-title">
                        <span>What is Artificial Intelligence?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">
                        <p>body 1</p>
                    </div>
                </div>
                <div class="container ">
                    <div class="acc-title">
                        <span>What is Machine Learning?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 2</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 3?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 3</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 4</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 4</div>
                </div>

                <div class="container  ">
                    <div class="acc-title">
                        <span>title 5</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 5</div>
                </div>
            </aalam-accordion>
        `);
        const titles = el.querySelectorAll(".acc-title");
    });

    it("ensures at least one item remains open when nocloseall is true", async () => {
        const el = await fixture(html`
            <aalam-accordion nocloseall>
                <div class="container">
                    <div class="acc-title">
                        <span>What is Artificial Intelligence?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">
                        <p>body 1</p>
                    </div>
                </div>
                <div class="container">
                    <div class="acc-title">
                        <span>What is Machine Learning?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 2</div>
                </div>
                <div class="container">
                    <div class="acc-title">
                        <span>title 3?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 3</div>
                </div>
                <div class="container">
                    <div class="acc-title">
                        <span>title 4</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 4</div>
                </div>
                <div class="container">
                    <div class="acc-title">
                        <span>title 5</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 5</div>
                </div>
            </aalam-accordion>
        `);

        const activeelements = el.querySelectorAll(".acc-title");
        console.log(activeelements.length);

        expect(el.querySelectorAll(".acc-active").length).equal(0);
        const element = el.querySelectorAll(".acc-title");
        element[0]?.click();
        element[1]?.click();
        expect(el.querySelectorAll(".acc-active").length).equal(2);
        element[0]?.click();
        element[1]?.click();
        expect(el.querySelectorAll(".acc-active").length).equal(1);

        const ele = await fixture(html`
            <aalam-accordion nocloseall activecls="acc-active">
                <div class="container acc-active">
                    <div class="acc-title">
                        <span>What is Artificial Intelligence?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">
                        <p>body 1</p>
                    </div>
                </div>
                <div class="container acc-active">
                    <div class="acc-title">
                        <span>What is Machine Learning?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 2</div>
                </div>
                <div class="container">
                    <div class="acc-title">
                        <span>title 3?</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 3</div>
                </div>
                <div class="container">
                    <div class="acc-title">
                        <span>title 4</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 4</div>
                </div>
                <div class="container">
                    <div class="acc-title">
                        <span>title 5</span>
                        <button>Toggle</button>
                    </div>
                    <div class="acc-body">body 5</div>
                </div>
            </aalam-accordion>
        `);
        const activeitem = ele.querySelectorAll(".acc-title");
        expect(ele.querySelectorAll(".acc-active").length).equal(2);

        activeitem[0]?.click();
        activeitem[1]?.click();

        expect(ele.querySelectorAll(".acc-active").length).equal(1);

        activeitem[0]?.click();
        activeitem[1]?.click();
        activeitem[2]?.click();
        activeitem[1]?.click();
        activeitem[3]?.click();
        expect(ele.querySelectorAll(".acc-active").length).equal(4);
    });

     it('dispatches "itemopened" event when an item is opened', async () => {
         const el = await fixture(html`
             <aalam-accordion>
                 <div class="acc-item">
                     <div class="acc-title">Title 1</div>
                     <div class="acc-body">Body 1</div>
                 </div>
             </aalam-accordion>
         `);

         const item = el.querySelector(".acc-item") as HTMLElement;
         const title = item.querySelector(".acc-title") as HTMLElement;

         setTimeout(() => title.click());

         const event = await oneEvent(el, "itemopened");
         expect(event).to.exist;
         expect(event.detail.index).to.equal(0);
     });

     it('dispatches "itemcollapsed" event when an item is closed', async () => {
         const el = await fixture(html`
             <aalam-accordion>
                 <div class="acc-item acc-active">
                     <div class="acc-title">Title 1</div>
                     <div class="acc-body">Body 1</div>
                 </div>
             </aalam-accordion>
         `);

         const item = el.querySelector(".acc-item") as HTMLElement;
         const title = item.querySelector(".acc-title") as HTMLElement;

         setTimeout(() => title.click());

         const event = await oneEvent(el, "itemcollapsed");
         expect(event).to.exist;
         expect(event.detail.index).to.equal(0);
     });

});
