import { fixture, expect, html, triggerFocusFor } from "@open-wc/testing";
import "../src/suggestion-box.js";
import { sendKeys } from "@web/test-runner-commands";
describe("SuggestionBox", () => {
    it("should render input box", async () => {
        const el = await fixture(html`<aalam-sgn-box> </aalam-sgn-box>`);
        const input = el.shadowRoot?.querySelector("input");
        expect(input).to.exist;
    });

    it("should render input box with id 'sgn-input'", async () => {
        const el = await fixture(html`<aalam-sgn-box> </aalam-sgn-box>`);
        const input1 = el.shadowRoot?.getElementById("sgn-input");
        expect(input1).to.exist;
    });

    it("should handle focus and display of #sgn-container with random inputs", async () => {
        let el = await fixture(html`<aalam-sgn-box></aalam-sgn-box>`);
        let input = el.shadowRoot?.querySelector("input");
        let dd = el.shadowRoot?.querySelector("#sgn-container");
        expect(dd?.style.display).to.equal("none");

        const shouldFocus = Math.random() < 0.5;
        if (shouldFocus) {
            input?.focus();
            await el.updateComplete;
            expect(dd?.style.display).to.equal("block");
        } else {
            expect(dd?.style.display).to.equal("none");
        }

        el = await fixture(
            html`<aalam-sgn-box>
                <div slot="sgn-empty">This is the empty block</div>
            </aalam-sgn-box>`
        );
        input = el.shadowRoot?.querySelector("input");
        dd = el.shadowRoot?.querySelector("#sgn-container");
        const emptyBlock = el.querySelector('[slot="sgn-empty"]');

        const shouldFocusAgain = Math.random() < 0.5;
        if (shouldFocusAgain) {
            input?.focus();
            await el.updateComplete;
            expect(dd?.style.display).to.equal("block");
            expect(getComputedStyle(emptyBlock).display).to.not.equal("none");
        } else {
            expect(dd?.style.display).to.equal("none");
            expect(emptyBlock).to.exist;
        }
    });


    it("should render #sgn-container", async () => {
        const el = await fixture(html`<aalam-sgn-box></aalam-sgn-box>`);
        const container = el.shadowRoot?.getElementById("sgn-container");
        expect(container).to.exist;

    });

    it("should render #private-item", async () => {
        const el = await fixture(html`<aalam-sgn-box id="sgnbox" minchar="1">
            <div class="input" slot="sgn-input">
                <input id="box1" type="text" placeholder="search..." />
            </div>
            <div slot="sgn-item-template">
                <div class="container">
                    <p name="name">{name}</p>
                    <p class="description">{description}</p>
                </div>
            </div>
            <div class="sgn-empty" slot="sgn-empty">Empty Items</div>
        </aalam-sgn-box>`);
        const privateitem = el.shadowRoot?.getElementById("private-item");
        expect(privateitem).to.exist;
    });

    it("should update suggestions on input event with multiple inputs and list values", async () => {
        const el = await fixture(
            html`
                <aalam-sgn-box>
                    <div slot="sgn-item-template">{name}</div>
                </aalam-sgn-box>
            `
        );
        const input = el.shadowRoot?.querySelector("input");
        el.list = [
            {
                name: "thiruvarur",
                description: "My native",
            },
            {
                name: "coimbatore",
                description: "Working place",
            },
            {
                name: "chennai",
                description: "dream location",
            },
        ];
        el.listkey = "name";
        const testInputs = ["thi", "coi", "ch",""];
        for (const testInput of testInputs) {
            input.value = testInput;
            input.dispatchEvent(
                new Event("input", { bubbles: true, composed: true })
            );
            await el.updateComplete;
            const matchedSuggestions = el.filtered_list.filter((item) =>
                item.name.startsWith(testInput)
            );
            expect(el.filtered_list.length).to.equal(matchedSuggestions.length);
            expect(
                el.filtered_list.map((item) => item.name)
            ).to.include.members(matchedSuggestions.map((item) => item.name));
        }
    });

    it("should update suggestions using setSuggestion", async () => {
        const el = await fixture(
            html`
                <aalam-sgn-box>
                    <div slot="sgn-item-template">
                        <div class="container">
                            <p>thiruvarur</p>
                        </div>
                    </div>
                    <div slot="load-more">Load More</div>
                </aalam-sgn-box>
            `
        );

        const input = el.shadowRoot?.querySelector("input");
        input.focus();
        await sendKeys({ type: "thi" });
        const suggestions = [
            {
                name: "thiruvarur",
                description: "My native",
            },
        ];

        el.setSuggestion(suggestions, true);
        await el.updateComplete;

        expect(el.filtered_list.length).to.equal(1);
        expect(el.filtered_list[0].name).to.equal("thiruvarur");

        const items = el.querySelector("[slot='sgn-item-template']");
        expect(items.textContent.trim()).to.equal("thiruvarur");
        const loadMoreElement = el.querySelector("[slot='load-more']");
        expect(loadMoreElement).to.exist;
        expect(loadMoreElement.textContent.trim()).to.equal("Load More");
    });

    it("should navigate suggestions with keyboard", async () => {
        const el = await fixture(
            html`
                <aalam-sgn-box>
                    <div slot="sgn-item-template">{name}</div>
                    <div slot="load-more">Load More</div>
                </aalam-sgn-box>
            `
        );

        const input = el.shadowRoot?.querySelector("input");
        el.list = [
            { name: "test1" },
            { name: "test2" },
            { name: "test3" },
            { name: "test4" },
            { name: "test5" },
            { name: "test6" },
            { name: "test7" },
        ];
        el.listkey = "name";

        if (!input) throw new Error("Input element not found");

        input.focus();

        await sendKeys({ type: "test" });

        await el.updateComplete;
        for (let i = 0; i < 7; i++) {
            await sendKeys({ press: "ArrowDown" });
            await el.updateComplete;
            expect(el.index).to.equal(i);
        }
        await sendKeys({ press: "ArrowDown" });
        await el.updateComplete;
        expect(el.index).to.equal(0);
        for (let i = 0; i < 7; i++) {
            await sendKeys({ press: "ArrowUp" });
            await el.updateComplete;
            if (i == 0) {
                expect(el.index).to.equal(-1);
            } else {
                expect(el.index).to.equal(6 - i + 1);
            }
        }
        el.index = -1;
        await sendKeys({ press: "ArrowUp" });
        await el.updateComplete;
        expect(el.index).to.equal(6);
        el.setSuggestion(el.list, true);
        await el.updateComplete;

        await sendKeys({ press: "ArrowDown" });
        await el.updateComplete;
        expect(el.index).to.equal(0);

        const container = el.shadowRoot?.querySelector("#sgn-container");
        const loadMoreElement = el?.querySelector("[slot='load-more']");
        expect(loadMoreElement).to.exist;
        expect(loadMoreElement.textContent.trim()).to.equal("Load More");
    });

    it("should select a suggestion with Enter key", async () => {
        const el = await fixture(
            html`
                <aalam-sgn-box
                    .list=${[{ name: "test1" }, { name: "test2" }]}
                    .listkey=${"name"}
                >
                    <div slot="sgn-item-template">{name}</div>
                </aalam-sgn-box>
            `
        );

        await el.updateComplete;

        const input = el.shadowRoot?.querySelector("input");
        if (!input) throw new Error("Input element not found");

        input.focus();
        await triggerFocusFor(input);
        input.value = "test";
        input.dispatchEvent(
            new Event("input", { bubbles: true, composed: true })
        );
        await el.updateComplete;
        const arrowDownEvent = new KeyboardEvent("keydown", {
            key: "ArrowDown",
            bubbles: true,
            composed: true,
        });
        input.dispatchEvent(arrowDownEvent);
        await el.updateComplete;

        const enterEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            composed: true,
        });
        input.dispatchEvent(enterEvent);
        await el.updateComplete;

        expect(input.value).to.equal("test1");
        expect(el.show_container).to.be.false;
    });

    it("should close container on outside click", async () => {
        const el = await fixture(html`<aalam-sgn-box></aalam-sgn-box>`);
        const input = el.shadowRoot?.querySelector("input");
        const container = el.shadowRoot?.querySelector("#sgn-container");

        expect(container?.style.display).to.equal("none");

        input?.focus();
        await el.updateComplete;

        expect(container?.style.display).to.equal("block");

        document.body.click();
        await el.updateComplete;

        expect(container?.style.display).to.equal("none");
    });
    it("should load more suggestions on 'Loadmore' click", async () => {
        const el = await fixture(
            html`
                <aalam-sgn-box>
                    <div slot="sgn-item-template">{name}</div>
                </aalam-sgn-box>
            `
        );

        const input = el.shadowRoot?.querySelector("input");
        if (!input) throw new Error("Input element not found");

        input.focus();
        input.value = "test";
        input.dispatchEvent(
            new Event("input", { bubbles: true, composed: true })
        );
        await el.updateComplete;

        el.setSuggestion(
            [
                { name: "test1" },
                { name: "test2" },
                { name: "test3" },
                { name: "test4" },
                { name: "test5" },
            ],
            true
        );
        await el.updateComplete;

        const loadmoreItem = el?.querySelector(".sgn-loadmore");
        expect(loadmoreItem).to.exist;

        expect(el.private_items.length).to.equal(6);
        loadmoreItem[5]?.dispatchEvent(
            new MouseEvent("click", { bubbles: true, composed: true })
        );
        el.appendSuggestion([{ name: "test6" }, { name: "test7" }], true);
        await el.updateComplete;
        expect(el.private_items.length).to.equal(9);
        const newLoadmoreItem = el?.querySelector(".sgn-loadmore");
        expect(newLoadmoreItem).to.exist;

        newLoadmoreItem?.dispatchEvent(
            new MouseEvent("click", { bubbles: true, composed: true })
        );
        el.appendSuggestion([{ name: "test8" }, { name: "test9" }], false);
        await el.updateComplete;
        expect(el.private_items.length).to.equal(11);
    });

    it("should highlight matching suggestions", async () => {
        const el = await fixture(html`
            <aalam-sgn-box
                .list=${[{ name: "test1" }, { name: "test2" }]}
                .listkey=${"name"}
            >
                <div slot="sgn-item-template">{name}</div>
            </aalam-sgn-box>
        `);

        el.setSuggestion([{ name: "test1" }, { name: "test2" }], false);

        const input = el.shadowRoot?.querySelector("input");
        input.value = "st";

        await el.updateComplete;
        const highlightedElements =
            el.shadowRoot?.querySelectorAll(".sgn-highlight");
        highlightedElements.forEach((highlightedElement) => {
            expect(highlightedElement.textContent).to.equal("st");
        });
    });
});
