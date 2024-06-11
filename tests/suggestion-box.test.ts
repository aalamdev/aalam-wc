import { fixture, expect, html, triggerFocusFor } from "@open-wc/testing";
import "../src/suggestion-box.js";

describe("SuggestionBox", () => {
    it("should render input box", async () => {
        const el = await fixture(html`<aalam-sgn-box> </aalam-sgn-box>`);
        const input = el.shadowRoot?.querySelector("input");
        expect(input).to.exist;
    });

    it("should render input box with id 'sgn-input'", async () => {
        const el = await fixture(html`<aalam-sgn-box>
            
        </aalam-sgn-box>`);
        const input1 = el.shadowRoot?.getElementById("sgn-input");
        expect(input1).to.exist;
    });

    it("should handle focus and display of #sgn-container", async () => {
        let el = await fixture(html`<aalam-sgn-box></aalam-sgn-box>`);
        let input = el.shadowRoot?.querySelector("input");
        let dd = el.shadowRoot?.querySelector("#sgn-container");
        expect(dd?.style.display).to.equal("none");
        input?.focus();
        await el.updateComplete;
        expect(dd?.style.display).to.equal("block");

        el = await fixture(
            html`<aalam-sgn-box
                ><div slot="sgn-empty">
                    This is the empty block
                </div></aalam-sgn-box
            >`
        );
        input = el.shadowRoot?.querySelector("input");
        dd = el.shadowRoot?.querySelector("#sgn-container");
        expect(dd?.style.display).to.equal("none");
        input?.focus();
        await el.updateComplete;
        expect(dd?.style.display).to.equal("block");
    });

    it("should render #sgn-container", async () => {
        const el = await fixture(html`<aalam-sgn-box></aalam-sgn-box>`);
        const container = el.shadowRoot?.getElementById("sgn-container");
        expect(container).to.exist;
    });

    it("should render #private-item", async () => {
        const el = await fixture(html`<aalam-sgn-box></aalam-sgn-box>`);
        const privateitem = el.shadowRoot?.getElementById("private-item");
        expect(privateitem).to.exist;
    });

    it("should update suggestions on input event", async () => {
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
        input.value = "thi";
        input.dispatchEvent(
            new Event("input", { bubbles: true, composed: true })
        );
        await el.updateComplete;

        expect(el.filtered_list.length).to.equal(1);
        expect(el.filtered_list[0].name).to.equal("thiruvarur");
    });

    it("should update suggestions using setSuggestion", async () => {
        const el = await fixture(
            html`
                <aalam-sgn-box>
                    <div slot="sgn-item-template">{name}</div>
                </aalam-sgn-box>
            `
        );
        const input = el.shadowRoot?.querySelector("input");
        input.value = "thi";
        input.dispatchEvent(
            new Event("input", { bubbles: true, composed: true })
        );

        // Simulate a server response or any other source of suggestions
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
    });

    it("should navigate suggestions with keyboard", async () => {
        // keyboard event arrow down and arrow up
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

        const input = el.shadowRoot?.querySelector("input");
        if (!input) throw new Error("Input element not found");

        input.value = "test";
        input.dispatchEvent(
            new Event("input", { bubbles: true, composed: true })
        );
        await el.updateComplete;

        input.focus();
        await triggerFocusFor(input);

        const arrowDownEvent = new KeyboardEvent("keydown", {
            key: "ArrowDown",
            bubbles: true,
            composed: true,
        });
        input.dispatchEvent(arrowDownEvent);
        await el.updateComplete;

        expect(el.index).to.equal(0);

        input.dispatchEvent(arrowDownEvent);
        await el.updateComplete;

        expect(el.index).to.equal(1);
    });

    it("should select a suggestion with Enter key", async () => {
        // Enter test case
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

        // Simulate typing in the input
        input.value = "test";
        input.dispatchEvent(
            new Event("input", { bubbles: true, composed: true })
        );
        await el.updateComplete;

        // Simulate pressing ArrowDown key
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

        expect(el.private_items.length).to.equal(6); // Initially loaded 5, then added 1 more
        loadmoreItem?.click();
        el.appendSuggestion(
            [
                { name: "test6" },
                {
                    name: "test7",
                },
            ],
            true
        );
        await el.updateComplete;
        expect(el.private_items.length).to.equal(8);

        loadmoreItem?.click();
        el.appendSuggestion(
            [
                { name: "test6" },
                {
                    name: "test7",
                },
            ],
            false
        );
        await el.updateComplete;
        expect(el.private_items.length).to.equal(10);
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
        console.log(el.shadowRoot?.innerHTML);
        const highlightedElements =
            el.shadowRoot?.querySelectorAll(".sgn-highlight");
        highlightedElements.forEach((highlightedElement) => {
            expect(highlightedElement.textContent).to.equal("st");
        });
    });
});
