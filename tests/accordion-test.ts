import { fixture, expect, oneEvent, litFixture } from "@open-wc/testing";
import { html } from "lit";
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
    let accordionTemplate = html`
        <aalam-accordion activecls=${attributes["activecls"]} ?nomultiple=${attributes["nomultiple"]} ?nocloseall=${attributes["nocloseall"]} >
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

    return accordionTemplate;
};

describe("AalamAccordion", () => {
    it("initially opens items with the acc-active class", async () => {
        const el = await litFixture(
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
        expect(el.querySelectorAll(".container")[0].classList.contains("acc-active"));
        expect(el.querySelectorAll(".container")[1].classList.contains("acc-active"));

        const activeItems = el.querySelectorAll(".acc-active");
        activeItems.forEach((item) => {
            expect(getComputedStyle(item.querySelector(".acc-body")).display).to.equal("block");
        });

        const inactiveItems = el.querySelectorAll(".container:not(.acc-active) .acc-body");
        inactiveItems.forEach((item) => {
            expect(getComputedStyle(item).display).to.equal("none");
        });
    });

    it("allows multiple items to be open if nomultiple is true then set as false", async () => {
        const el = await litFixture(
            createAccordionTemplate(
                { activecls: "acc-active", nomultiple: true },
                [
                    {
                        title: "What is Artificial Intelligence?",
                        body: "body 1",
                        active: false,
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
        let titles = el.querySelectorAll(".acc-title");
        let bodyElement = el.querySelectorAll(".acc-body");
        let containerElement = el.querySelectorAll(".container");
        expect(el.hasAttribute("nomultiple")).to.be.true;
        expect(el.querySelectorAll(".acc-active").length).to.equal(1);

        containerElement.forEach((_, index) => {
            if (index === 2) {
                expect(getComputedStyle(bodyElement[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodyElement[index]).display).to.equal("none");
            }
        });
        el.animationDur = 0;
        const active = el.querySelectorAll(".acc-active");
        titles[0]?.click();
        await el.updateComplete;
        titles[1]?.click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).equal(1);

        containerElement.forEach((_, index) => {
            if (index === 1) {
                expect(getComputedStyle(bodyElement[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodyElement[index]).display).to.equal("none");
            }
        });
        expect(el.hasAttribute("nomultiple")).to.be.true;
        el.removeAttribute("nomultiple");
        await el.updateComplete;

        titles[2].click();
        await el.updateComplete;
        expect(el.hasAttribute("nomultiple")).to.be.false;

        titles[0].click();
        await el.updateComplete;
        titles[1].click();
        await el.updateComplete;
        titles[4].click();
        await el.updateComplete;

        expect(titles[0].parentElement?.classList.contains("acc-active")).to.be
            .true;
        expect(titles[1].parentElement?.classList.contains("acc-active")).to.be
            .false;
        expect(titles[2].parentElement?.classList.contains("acc-active")).to.be
            .true;
        expect(titles[3].parentElement?.classList.contains("acc-active")).to.be
            .false;
        expect(titles[4].parentElement?.classList.contains("acc-active")).to.be
            .true;

        containerElement.forEach((_, index) => {
            if (index === 0 || index === 2 || index ===4) {
                expect(getComputedStyle(bodyElement[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodyElement[index]).display).to.equal("none");
            }
        });
    });

    it("allows multiple items to be open if nomultiple is false then set as true", async () => {
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
                    active: false,
                },
                { title: "title 3?", body: "body 3", active: true },
                { title: "title 4?", body: "body 4", active: true },
                { title: "title 5?", body: "body 5", active: false },
            ])
        );
        el.animationDur = 0;
        const titles = el.querySelectorAll(".acc-title");
        const containerElement = el.querySelectorAll(".container");
        const bodysel = el.querySelectorAll(".acc-body");
        expect(el.hasAttribute("nomultiple")).to.be.false;
        expect(el.querySelectorAll(".acc-active").length).to.equal(3);
        containerElement.forEach((_, index) => {
            if (index === 0 || index === 2 || index === 3) {
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });

        titles[0].click();
        await el.updateComplete;
        titles[1].click();
        await el.updateComplete;
        titles[2].click();

        await el.updateComplete;
        expect(titles[0].parentElement?.classList.contains("acc-active")).to.be
            .false;
        expect(titles[1].parentElement?.classList.contains("acc-active")).to.be
            .true;
        expect(titles[2].parentElement?.classList.contains("acc-active")).to.be
            .false;
        expect(titles[3].parentElement?.classList.contains("acc-active")).to.be
            .true;

        containerElement.forEach((_, index) => {
            if (index === 1 || index === 3) {
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });

        expect(el.querySelectorAll(".acc-active").length).equal(2);
        el.setAttribute("nomultiple", "");
        await el.updateComplete;

        containerElement.forEach((_, index) => {
            if (index === 1) {
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });

        titles[2].click();
        await el.updateComplete;
        titles[3].click();
        await el.updateComplete;

        expect(el.querySelectorAll(".acc-active").length).equal(1);
        expect(el.hasAttribute("nomultiple")).to.be.true;

        containerElement.forEach((_, index) => {
            if (index === 3) {
                expect(bodysel[index].parentElement?.classList.contains('acc-active')).to.be.equal(true);
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(bodysel[index].parentElement?.classList.contains('acc-active')).to.be.equal(false);
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });
    });

    it("allows multiple items to be open if nocloseall is true then set as false", async () => {
        const el = await fixture(
            createAccordionTemplate(
                { activecls: "acc-active", nocloseall: true },
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
        el.animationDur = 0;
        const titles = el.querySelectorAll(".acc-title");
        titles[0].click();
        await el.updateComplete;
        titles[1].click();
        await el.updateComplete;
        titles[2].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(2);
        const containerElement = el.querySelectorAll(".container");
        const bodysel = el.querySelectorAll(".acc-body");

        containerElement.forEach((_, index) => {
            if (index == 1 || index == 4) {
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });

        titles[1].click();
        await el.updateComplete;
        titles[4].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).equal(1);
        expect(el.querySelectorAll(".container")[4].classList.contains("acc-active")).to.be.true;

        containerElement.forEach((_, index) => {
            if (index == 4) {
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });

        el.removeAttribute("nocloseall");
        await el.updateComplete;
        el.animationDur = 0;
        titles[4].click();
        containerElement.forEach((_, index) => {
            expect(bodysel[index].parentElement?.classList.contains("acc-active")).to.be.false;
            expect(getComputedStyle(bodysel[index]).display).to.equal("none");
        });

        titles[2].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(1);

        titles[1].click();
        titles[4].click();
        titles[2].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(2);
        expect(el.querySelectorAll(".container")[1].classList.contains("acc-active")).to.be.true;
        containerElement.forEach((_, index) => {
            if (index == 1 || index == 4) {
                expect(bodysel[index].parentElement?.classList.contains("acc-active")).to.be.true;
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(bodysel[index].parentElement?.classList.contains("acc-active")).to.be.false;
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });

        titles[0].click();
        await el.updateComplete;
        titles[1].click();
        await el.updateComplete;
        titles[3].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(3);
        containerElement.forEach((_, index) => {
            if (index === 0 || index === 3 || index == 4) {
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });
    });

    it("allows multiple items to be open if nocloseall is true then set as false  and all are no active ", async () => {
        const el = await fixture(
            createAccordionTemplate(
                { activecls: "acc-active", nocloseall: true },
                [
                    {
                        title: "What is Artificial Intelligence?",
                        body: "body 1",
                        active: false,
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
        expect(
            el.querySelectorAll(".container")[0].classList.contains("acc-active")).to.be.true;
        const titles = el.querySelectorAll(".acc-title");
        const bodyElements = el.querySelectorAll(".acc-body");
        const containerElement = el.querySelectorAll(".container");
        bodyElements.forEach((body, index) => {
            if (index === 0) {
                expect(getComputedStyle(body).display).to.equal("block");
            } else {
                expect(getComputedStyle(body).display).to.equal("none");
            }
        });
        titles[0].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".container")[0].classList.contains("acc-active")).to.be.true;
        containerElement.forEach((_, index) => {
            if (index === 0) {
                expect(getComputedStyle(bodyElements[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodyElements[index]).display).to.equal("none");
            }
        });
        titles[1].click();
        titles[3].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(3);
        expect(el.querySelectorAll(".container")[0].classList.contains("acc-active")).to.be.true;
        expect(el.querySelectorAll(".container")[1].classList.contains("acc-active")).to.be.true;
        expect(el.querySelectorAll(".container")[3].classList.contains("acc-active")).to.be.true;
        containerElement.forEach((_, index) => {
            if (index === 0 || index === 1 || index === 3) {
                expect(getComputedStyle(bodyElements[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodyElements[index]).display).to.equal("none");
            }
        });
        el.removeAttribute("nocloseall");
        titles[0].click();
        titles[1].click();
        titles[3].click();

        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(0);
        el.querySelectorAll(".acc-active").forEach((body) => {
            expect(getComputedStyle(body).display).equal("none");
        });
    });

    it("allows multiple items to be open if nocloseall is false then set as true", async () => {
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
                    active: false,
                },
                { title: "title 3?", body: "body 3", active: true },
                { title: "title 4?", body: "body 4", active: false },
                { title: "title 5?", body: "body 5", active: true },
            ])
        );
        el.animationDur = 0;
        const titles = el.querySelectorAll(".acc-title");
        const containerElement = el.querySelectorAll(".container");
        const bodysel = el.querySelectorAll(".acc-body");
        titles[0].click();
        titles[1].click();
        titles[2].click();
        await el.updateComplete;
        expect(el.querySelectorAll(".acc-active").length).to.equal(2);

        containerElement.forEach((_, index) => {
            if (index === 1 || index === 4) {
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });

        titles[1].click();
        titles[4].click();
        expect(el.querySelectorAll(".acc-active").length).equal(0);

        containerElement.forEach((_, index) => {
            expect(getComputedStyle(bodysel[index]).display).to.equal("none");
        });

        el.setAttribute("nocloseall", "");
        await el.updateComplete;
        
        expect(el.querySelectorAll(".acc-active").length).to.equal(1);
        expect(el.querySelectorAll(".container")[0].classList.contains("acc-active")).to.be.true;
        containerElement.forEach((_, index) => {
            if (index === 0) {
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });

        expect(el.hasAttribute("nocloseall")).to.be.true;

        titles[0].click();
        titles[4].click();
        expect(el.querySelectorAll(".acc-active").length).equal(2);
        containerElement.forEach((_, index) => {
            if (index === 0 || index === 4) {
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });

        titles[0].click();
        titles[4].click();
        expect(el.querySelectorAll(".acc-active").length).equal(1);
        containerElement.forEach((_, index) => {
            if (index === 4) {
                expect(getComputedStyle(bodysel[index]).display).to.equal("block");
            } else {
                expect(getComputedStyle(bodysel[index]).display).to.equal("none");
            }
        });
    });

    it('dispatches "itemopened" event when an item is opened', async () => {
        const el = await fixture(
            createAccordionTemplate({ activecls: "acc-active" }, [
                { title: "Title 1", body: "Body 1", active: false },
            ])
        );

        const item = el.querySelector(".container");
        const title = item?.querySelector(".acc-title");

        setTimeout(() => title.click());

        const event = await oneEvent(el, "itemopened");
        expect(event).to.exist;
        expect(event.detail.index).to.equal(0);
    });

    it('dispatches "itemcollapsed" event when an item is closed', async () => {
        const el = await fixture(
            createAccordionTemplate({ activecls: "acc-active" }, [
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
            createAccordionTemplate(
                { activecls: "acc-active", nomultiple: false },
                [
                    { title: "Title 1", body: "Body 1", active: false },
                    { title: "Title 2", body: "Body 2", active: false },
                    { title: "Title 3", body: "Body 3", active: false },
                ]
            )
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
            createAccordionTemplate(
                { activecls: "acc-active", nomultiple: false },
                [
                    { title: "Title 1", body: "Body 1", active: false },
                    { title: "Title 2", body: "Body 2", active: false },
                    { title: "Title 3", body: "Body 3", active: false },
                ]
            )
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
