import { fixture, expect, html, oneEvent } from "@open-wc/testing";
import "../src/accordion.ts";

interface AccordionItem {
    title: string;
    body: string;
    active: boolean;
}
const createAccordionTemplate = (
    attributes: { [key: string]: any } = {},
    items: AccordionItem[] = []
) => {
    const attrs = Object.entries(attributes).map(([key, value]) =>
        typeof value === "boolean" && value ? key : `${key}="${value}"`
    );
    let accordionTemplate = html`
        <aalam-accordion ${attrs}>
            ${items.map(
                (item) => html`
                    <div class="container ${item.active ? "acc-active" : ""}">
                        <div class="acc-title">
                            <span>${item.title}</span>
                            <button>Toggle</button>
                        </div>
                        <div class="acc-body">${item.body}</div>
                    </div>
                `
            )}
        </aalam-accordion>
    `;

    // Check if nomultiple attribute is present in attributes
    if (attributes.nomultiple === "true") {
        accordionTemplate = html`
            ${console.log("nomultiple is used")}
            <aalam-accordion nomultiple>
                ${items.map(
                    (item) => html`
                        <div
                            class="container ${item.active ? "acc-active" : ""}"
                        >
                            <div class="acc-title">
                                <span>${item.title}</span>
                                <button>Toggle</button>
                            </div>
                            <div class="acc-body">${item.body}</div>
                        </div>
                    `
                )}
            </aalam-accordion>
        `;
        
    }

     if (attributes.nocloseall === "true") {
         accordionTemplate = html`
             <aalam-accordion nocloseall>
                 ${items.map(
                     (item) => html`
                         <div
                             class="container ${item.active
                                 ? "acc-active"
                                 : ""}"
                         >
                             <div class="acc-title">
                                 <span>${item.title}</span>
                                 <button>Toggle</button>
                             </div>
                             <div class="acc-body">${item.body}</div>
                         </div>
                     `
                 )}
             </aalam-accordion>
         `;
     }

    return accordionTemplate;
};

describe("AalamAccordion", () => {
    it("initially opens items with the acc-active class", async () => {
        const el = await fixture(
            createAccordionTemplate({ activecls: "acc-active" }, [
                {
                    title: "What is Artificial Intelligence?",
                    body: "body 1",
                    active: true,
                },
                {
                    title: "What is Machine Learning?",
                    body: "body 2",
                    active: true,
                },
                { title: "title 3?", body: "body 3", active: false },
                { title: "title 4?", body: "body 4", active: false },
                { title: "title 5?", body: "body 5", active: false },
            ])
        );

        expect(el.querySelectorAll(".container.acc-active").length).to.equal(2);

        const activeItems = el.querySelectorAll(".acc-active");
        activeItems.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("block");
        });

        const inactiveItems = el.querySelectorAll(
            ".container:not(.acc-active) .acc-body"
        );
        inactiveItems.forEach((item) => {
            expect(getComputedStyle(item).display).to.equal("none");
        });
    });

    it("allows multiple items to be open if nomultiple is true then set as false", async () => {
        const el = await fixture(
            createAccordionTemplate(
                { activecls: "acc-active", nomultiple: "true" },
                [
                    {
                        title: "What is Artificial Intelligence?",
                        body: "body 1",
                        active: true,
                    },
                    {
                        title: "What is Machine Learning?",
                        body: "body 2",
                        active: false,
                    },
                    { title: "title 3?", body: "body 3", active: true },
                    { title: "title 4?", body: "body 4", active: true },
                    { title: "title 5?", body: "body 5", active: false },
                ]
            )
        );

        const titles = el.querySelectorAll(".acc-title");
        expect(el.hasAttribute("nomultiple")).to.be.true;
        expect(el.querySelectorAll(".acc-active").length).to.equal(1);
        const active = el.querySelectorAll(".acc-active");
        active.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("block");
        });

        titles[0].click();
        titles[1].click();
        titles[2].click();
        await el.updateComplete;

        expect(el.querySelectorAll(".acc-active").length).equal(1);

        const activeItems = el.querySelectorAll(".acc-active");
        activeItems.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("block");
        });

        el.removeAttribute("nomultiple");
        await el.updateComplete;

        titles[2].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).equal(0);
        expect(el.hasAttribute("nomultiple")).to.be.false;

        const activeItemsAfter = el.querySelectorAll(".acc-active");
        activeItemsAfter.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("block");
        });
    });


    it("allows multiple items to be open if nomultiple is false then set as true", async () => {
        const el = await fixture(
            createAccordionTemplate(
                { activecls: "acc-active" },
                [
                    {
                        title: "What is Artificial Intelligence?",
                        body: "body 1",
                        active: true,
                    },
                    {
                        title: "What is Machine Learning?",
                        body: "body 2",
                        active: false,
                    },
                    { title: "title 3?", body: "body 3", active: true },
                    { title: "title 4?", body: "body 4", active: true },
                    { title: "title 5?", body: "body 5", active: false },
                ]
            )
        );

        const titles = el.querySelectorAll(".acc-title");
        expect(el.hasAttribute("nomultiple")).to.be.false;
        expect(el.querySelectorAll(".acc-active").length).to.equal(3);
        const active = el.querySelectorAll(".acc-active");
        active.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("block");
        });

        titles[0].click();
        titles[1].click();
        titles[2].click();
        await el.updateComplete;

        expect(el.querySelectorAll(".acc-active").length).equal(2);
        titles[1].click();
        titles[3].click();
        const activeItems = el.querySelectorAll(".acc-active");
        activeItems.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("none");
        });

        el.setAttribute("nomultiple","");
        await el.updateComplete;

        titles[2].click();
        titles[1].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).equal(1);
        expect(el.hasAttribute("nomultiple")).to.be.true;

        const activeItemsAfter = el.querySelectorAll(".acc-active");
        activeItemsAfter.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("block");
        });
    });



    it("allows multiple items to be open if nocloseall is true then set as false", async () => {
        const el = await fixture(
            createAccordionTemplate(
                { activecls: "acc-active", nocloseall: "true" },
                [
                    {
                        title: "What is Artificial Intelligence?",
                        body: "body 1",
                        active: true,
                    },
                    {
                        title: "What is Machine Learning?",
                        body: "body 2",
                        active: false,
                    },
                    { title: "title 3?", body: "body 3", active: true },
                    { title: "title 4?", body: "body 4", active: false },
                    { title: "title 5?", body: "body 5", active: true },
                ]
            )
        );

        const titles = el.querySelectorAll(".acc-title");
        titles[0].click();
        titles[1].click();
        titles[2].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(2);

        const activeItems = el.querySelectorAll(".acc-active");
        activeItems.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("block");
        });
        titles[1].click();
        titles[4].click();
        expect(el.querySelectorAll(".acc-active").length).equal(1);

        el.removeAttribute("nocloseall");
        await el.updateComplete;

        titles[2].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(2);
        titles[1].click();
        titles[2].click();
        titles[4].click();
        expect(el.querySelectorAll(".acc-active").length).to.equal(1);

        titles[0].click();
        titles[1].click();
        titles[3].click();
        expect(el.querySelectorAll(".acc-active").length).to.equal(2);
    });



    it("allows multiple items to be open if nocloseall is false then set as true", async () => {
        const el = await fixture(
            createAccordionTemplate(
                { activecls: "acc-active", nocloseall: "false" },
                [
                    {
                        title: "What is Artificial Intelligence?",
                        body: "body 1",
                        active: true,
                    },
                    {
                        title: "What is Machine Learning?",
                        body: "body 2",
                        active: false,
                    },
                    { title: "title 3?", body: "body 3", active: true },
                    { title: "title 4?", body: "body 4", active: false },
                    { title: "title 5?", body: "body 5", active: true },
                ]
            )
        );

        const titles = el.querySelectorAll(".acc-title");
        titles[0].click();
        titles[1].click();
        titles[2].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(2);

        const activeItems = el.querySelectorAll(".acc-active");
        activeItems.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("block");
        });
        titles[1].click();
        titles[4].click();
        expect(el.querySelectorAll(".acc-active").length).equal(0);

        el.setAttribute("nocloseall","");
        await el.updateComplete;

        expect(el.hasAttribute("nocloseall")).to.be.true;

        titles[0].click();
        titles[4].click();

        expect(el.querySelectorAll(".acc-active").length).equal(2);

    });

    it('dispatches "itemopened" event when an item is opened', async () => {
        const el = await fixture(
            createAccordionTemplate({}, [
                { title: "Title 1", body: "Body 1", active: false },
            ])
        );

        const item = el.querySelector(".container");
        const title = item.querySelector(".acc-title");

        setTimeout(() => title.click());

        const event = await oneEvent(el, "itemopened");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(0);
    });

    it('dispatches "itemcollapsed" event when an item is closed', async () => {
        const el = await fixture(
            createAccordionTemplate({}, [
                { title: "Title 1", body: "Body 1", active: true },
            ])
        );

        const item = el.querySelector(".container");
        const title = item.querySelector(".acc-title");

        setTimeout(() => title.click());

        const event = await oneEvent(el, "itemcollapsed");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(0);
    });

    it("handles random open and close operations correctly", async () => {
        const el = await fixture(
            createAccordionTemplate({ nomultiple: false }, [
                { title: "Title 1", body: "Body 1", active: false },
                { title: "Title 2", body: "Body 2", active: false },
                { title: "Title 3", body: "Body 3", active: false },
            ])
        );

        const titles = el.querySelectorAll(".acc-title");
        setTimeout(() => titles[0].click());
        let event = await oneEvent(el, "itemopened");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(0);

        setTimeout(() => titles[1].click());
        event = await oneEvent(el, "itemopened");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(1);

        setTimeout(() => titles[0].click());
        event = await oneEvent(el, "itemcollapsed");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(0);

        setTimeout(() => titles[2].click());
        event = await oneEvent(el, "itemopened");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(2);

        setTimeout(() => titles[1].click());
        event = await oneEvent(el, "itemcollapsed");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(1);
    });

    it("handles random clicks on already opened and closed items", async () => {
        const el = await fixture(
            createAccordionTemplate({ nomultiple: false }, [
                { title: "Title 1", body: "Body 1", active: false },
                { title: "Title 2", body: "Body 2", active: false },
                { title: "Title 3", body: "Body 3", active: false },
            ])
        );

        const titles = el.querySelectorAll(".acc-title");

        setTimeout(() => titles[1].click());
        let event = await oneEvent(el, "itemopened");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(1);

        setTimeout(() => titles[2].click());
        event = await oneEvent(el, "itemopened");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(2);

        setTimeout(() => titles[2].click());
        event = await oneEvent(el, "itemcollapsed");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(2);

        setTimeout(() => titles[1].click());
        event = await oneEvent(el, "itemcollapsed");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(1);

        setTimeout(() => titles[0].click());
        event = await oneEvent(el, "itemopened");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(0);

        setTimeout(() => titles[1].click());
        event = await oneEvent(el, "itemopened");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(1);

        setTimeout(() => titles[1].click());
        event = await oneEvent(el, "itemcollapsed");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(1);
    });
});
