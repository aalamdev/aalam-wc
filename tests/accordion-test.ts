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
    const attrs = Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");
    return html`
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

    it("allows multiple items to be open if nomultiple is false and true", async () => {
        const el = await fixture(
            createAccordionTemplate(
                { activecls: "acc-active", nomultiple: false },
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
                    { title: "title 3?", body: "body 3", active: false },
                    { title: "title 4?", body: "body 4", active: false },
                    { title: "title 5?", body: "body 5", active: false },
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

        el.setAttribute("nomultiple", "true");
        await el.updateComplete;

        titles[2].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(0);

        expect(titles[2].parentElement?.classList.contains("acc-active")).to.be
            .false;
        expect(
            getComputedStyle(
                titles[2].parentElement?.querySelector(".acc-body")
            ).display
        ).to.equal("block");

        titles[1].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(1);

        expect(titles[1].parentElement?.classList.contains("acc-active")).to.be
            .true;
        expect(
            getComputedStyle(
                titles[1].parentElement?.querySelector(".acc-body")
            ).display
        ).to.equal("block");

        titles[0].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(1);

        expect(titles[0].parentElement?.classList.contains("acc-active")).to.be
            .true;
        expect(
            getComputedStyle(
                titles[0].parentElement?.querySelector(".acc-body")
            ).display
        ).to.equal("block");

        el.setAttribute("nomultiple", "false");

        titles[1].click();
        expect(titles.length).to.equal(5);
        
        expect(el.querySelectorAll(".acc-active").length).to.equal(1);
        titles[1].click();
        expect(el.querySelectorAll(".acc-active").length).to.equal(0);
        titles[2].click();
        expect(
            getComputedStyle(
                titles[2].parentElement?.querySelector(".acc-body")
            ).display
        ).to.equal("block");
    });

    it("allows multiple items to be open if nocloseall is false and true", async () => {
        const el = await fixture(
            createAccordionTemplate(
                { activecls: "acc-active", nocloseall: false },
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

        el.setAttribute("nocloseall", "true");
        await el.updateComplete;
        
        titles[2].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(3);
        titles[1].click();
        titles[2].click();
        titles[4].click();
        expect(el.querySelectorAll(".acc-active").length).to.equal(1);
        
        const activeItem = el.querySelectorAll(".acc-active");
        activeItem.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("block");
        });
        
        titles[0].click();
        titles[1].click();
        titles[3].click();

        expect(el.querySelectorAll(".acc-active").length).to.equal(4);

        el.setAttribute("nocloseall", "false");

        titles[1].click();
        titles[3].click();
        titles[4].click();
        expect(el.querySelectorAll(".acc-active").length).equal(1);

        const active = el.querySelectorAll(".acc-active")
        active.forEach((item) => {
            expect(
                getComputedStyle(item.querySelector(".acc-body")).display
            ).to.equal("block");
        });
       

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
                { title: "Title 1", body: "Body 1", active: true },
                { title: "Title 2", body: "Body 2", active: false },
                { title: "Title 3", body: "Body 3", active: false },
            ])
        );

        const titles = el.querySelectorAll(".acc-title");
        setTimeout(() => titles[0].click());
        let event = await oneEvent(el, "itemcollapsed");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(0);

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

        setTimeout(() => titles[2].click());
        event = await oneEvent(el, "itemopened");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(2);
    });
});
