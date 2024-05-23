import { fixture, expect, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';

import { AalamDatePickerElement } from "../src/dtpick";
import { AalamManagedInputElement } from "../src/minput";

describe('aalam-dtpick', () => {
    it('is defined', async () => {
        const el = await fixture(html` <aalam-dtpick></aalam-dtpick>`);
        expect(el).to.be.an.instanceof(AalamDatePickerElement);

        const el1 = document.createElement("aalam-dtpick");
        expect(el1).to.be.an.instanceof(AalamDatePickerElement);
    });

    const pad = (n:number):string => (n < 10?"0":"")  + n;
    const clickDay = (cal_el, row, col) => {
        let day_cell = cal_el.nextElementSibling.children[row].children[col];
        day_cell.click();
        let dset = day_cell.dataset;
        return [`${pad(dset.d)}/${pad(dset.m)}/${dset.y}`, new Date(dset.y, +dset.m - 1, dset.d)];
    }
    const monthClick = (mon_el, cell) => {
        let e = mon_el.nextElementSibling.children[cell];
        e.click();
        return [+e.dataset.m, +e.dataset.y];
    }
    const yrClick = (yr_el, cell) => {
        let e = yr_el.nextElementSibling.children[cell];
        e.click();
        return +e.dataset.y;
    }
    let updated = async (el) => {
        await el.updated();
        await el.date1_el_dt?.updated();
        await el.date1_el_tm?.updated();
        await el.date2_el_dt?.updated();
        await el.date2_el_tm?.updated();
    };
    /*Test type with and without range*/
    it('check type', async () => {
        let el = await fixture(html` <aalam-dtpick></aalam-dtpick>`);
        expect(el.type).to.be.equal('d')
        expect(el.format).to.be.equal('DD/MM/YYYY')
        expect(el.date1_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date1_el_dt.input_els.length).to.be.equal(3)
        expect(el.date1_el_tm).to.be.equal(null)
        expect(el.date2_el_dt).to.be.equal(null)
        expect(el.date2_el_tm).to.be.equal(null)

        el.range = true;
        await updated(el);
        expect(el.date1_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date1_el_dt.input_els.length).to.be.equal(3)
        expect(el.date2_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date2_el_dt.input_els.length).to.be.equal(3)

        el.setAttribute("format", "MM/YYYY");
        await updated(el);
        expect(el.format).to.be.equal('MM/YYYY');
        expect(el.type).to.be.equal('m');
        expect(el.date1_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date1_el_dt.input_els.length).to.be.equal(2)
        expect(el.date1_el_tm).to.be.equal(null)
        expect(el.date2_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date2_el_dt.input_els.length).to.be.equal(2)

        el.range = false;
        await updated(el);
        expect(el.date1_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date1_el_dt.input_els.length).to.be.equal(2)
        expect(el.date2_el_dt).to.be.equal(null)

        el.setAttribute('format', 'YYYY');
        await updated(el);
        expect(el.format).to.be.equal('YYYY');
        expect(el.type).to.be.equal('y');
        expect(el.date1_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date1_el_dt.input_els.length).to.be.equal(1)
        expect(el.date1_el_tm).to.be.equal(null)
        expect(el.date2_el_dt).to.be.equal(null);

        el.range = true;
        await updated(el);
        expect(el.type).to.be.equal('y');
        expect(el.date1_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date1_el_dt.input_els.length).to.be.equal(1)
        expect(el.date1_el_tm).to.be.equal(null)
        expect(el.date2_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date2_el_dt.input_els.length).to.be.equal(1)

        el.setAttribute("format", "MM/YYYY hh:mm");
        await updated(el);
        expect(el.format).to.be.equal('MM/YYYY hh:mm');
        expect(el.type).to.be.equal('t');
        expect(el.date1_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date1_el_dt.input_els.length).to.be.equal(2)
        expect(el.date1_el_tm).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date1_el_tm.input_els.length).to.be.equal(3)
        expect(el.date2_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date2_el_dt.input_els.length).to.be.equal(2)
        expect(el.date2_el_tm).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date2_el_tm.input_els.length).to.be.equal(3)

        el.range = false;
        await updated(el);
        expect(el.type).to.be.equal('t');
        expect(el.date1_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date1_el_dt.input_els.length).to.be.equal(2)
        expect(el.date1_el_tm).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date1_el_tm.input_els.length).to.be.equal(3)
        expect(el.date2_el_dt).to.be.equal(null)
        expect(el.date2_el_tm).to.be.equal(null)

        el = await fixture(html` <aalam-dtpick format="YYYY@MM"></aalam-dtpick>`);
        expect(el.type).to.be.equal('m')
        expect(el.format).to.be.equal('YYYY@MM')
        expect(el.date1_el_dt).to.be.an.instanceof(AalamManagedInputElement)
        expect(el.date2_el_dt).to.be.equal(null)
    })

    /*Test date format*/
    it('check format', async () => {
        let el = await fixture(html` <aalam-dtpick></aalam-dtpick>`);
        expect(el.type).to.be.equal('d')
        expect(el.format).to.be.equal('DD/MM/YYYY')

        el.format = "YYY";
        await updated(el)
        expect(el.format, "DD/MM/YYYY");
    })

    /*Test with initial value and the observe the change in value*/
    it('check value', async () => {
        let el = await fixture(html` <aalam-dtpick value="31/05/2023"></aalam-dtpick>`);
        expect(el.type).to.be.equal('d')
        expect(el.format).to.be.equal('DD/MM/YYYY')
        expect(el.date1.getDate()).to.equal(31);
        expect(el.date1_el_dt.input_els[0].value).to.be.equal('31');
        expect(el.date1_el_dt.input_els[1].value).to.be.equal('05');
        expect(el.date1_el_dt.input_els[2].value).to.be.equal('2023');

        el.setAttribute("format", "DD/MM/YYYYThh:mm:ss");
        el.setAttribute("value", '04231');
        await updated(el);
        expect(el.date1_el_dt.input_els.length).to.equal(3);
        expect(el.date1_el_tm.input_els.length).to.equal(4);
        expect(el.date1.getDate()).to.equal(31);
        expect(el.date1_el_dt.input_els[0].value).to.be.equal('31');

        el.setAttribute("value", '04/03/2024T00:00:00');
        await updated(el);
        expect(el.date1.getDate()).to.equal(4);
        expect(el.date1_el_dt.input_els.length).to.equal(3);
        expect(el.date1_el_tm.input_els.length).to.equal(4);
        expect(el.date1_el_dt.input_els[0].value).to.be.equal('04');
        expect(el.date1_el_dt.input_els[1].value).to.be.equal('03');
        expect(el.date1_el_dt.input_els[2].value).to.be.equal('2024');
        expect(el.date1_el_tm.input_els[0].value).to.be.equal('12');
        expect(el.date1_el_tm.input_els[1].value).to.be.equal('00');
        expect(el.date1_el_tm.input_els[2].value).to.be.equal('00');
        expect(el.date1_el_tm.input_els[3].value).to.be.equal('AM');

        el.setAttribute('format', 'MM-YYYY');
        el.setAttribute("value", '07/2029');
        await updated(el);
        expect(el.date1_el_dt.input_els.length).to.equal(2);
        expect(el.date1_el_tm).to.equal(null);
        expect(el.date1.getMonth()).to.equal(2);
        expect(el.date1.getFullYear()).to.equal(2024);
        expect(el.date1_el_dt.input_els[0].value).to.be.equal('03');
        expect(el.date1_el_dt.input_els[1].value).to.be.equal('2024');

        el.setAttribute("value", '07-2029');
        await updated(el);
        expect(el.date1_el_dt.input_els.length).to.equal(2);
        expect(el.date1_el_dt.input_els[0].value).to.be.equal('07');
        expect(el.date1_el_dt.input_els[1].value).to.be.equal('2029');
        expect(el.date1.getMonth()).to.equal(6);

        el.range = true;
        await updated(el);
        expect(el.date1_el_dt.input_els.length).to.equal(2);
        expect(el.date1_el_dt.input_els[0].value).to.be.equal('07');
        expect(el.date1_el_dt.input_els[1].value).to.be.equal('2029');
        expect(el.date1.getMonth()).to.equal(6);
        expect(el.date2).to.equal(undefined);

        el.setAttribute("value", '07-2029;09-2028');
        await updated(el);
        expect(el.date1_el_dt.input_els.length).to.equal(2);
        expect(el.date1_el_dt.input_els[0].value).to.be.equal('07');
        expect(el.date1_el_dt.input_els[1].value).to.be.equal('2029');
        expect(el.date1.getMonth()).to.equal(6);
        expect(el.date2).to.equal(undefined);

        el.setAttribute("value", ';09-2028');
        await updated(el);
        expect(el.date2_el_dt.input_els.length).to.equal(2);
        expect(el.date2_el_dt.input_els[0].value).to.be.equal('09');
        expect(el.date2_el_dt.input_els[1].value).to.be.equal('2028');
        expect(el.date2.getMonth()).to.equal(8);
        expect(el.date1).to.equal(null);

        el.setAttribute("format", "YYYY");
        el.setAttribute("value", '2028;');
        await updated(el);
        expect(el.date1_el_dt.input_els.length).to.equal(1);
        expect(el.date1_el_dt.input_els[0].value).to.be.equal('2028');
        expect(el.date1_el_tm).to.equal(null);
        expect(el.date1.getFullYear()).to.equal(2028);
        expect(el.date2).to.equal(null);

        el.setAttribute("format", "DD-MM/YYYYThh:mm:ss");
        el.setAttribute("value", '01-02/2028T00:00:00;');
        await updated(el);
        expect(el.date1_el_dt.input_els.length).to.equal(3);
        expect(el.date1_el_tm.input_els.length).to.equal(4);
        expect(el.date2_el_dt.input_els.length).to.equal(3);
        expect(el.date2_el_tm.input_els.length).to.equal(4);
        expect(el.date1.getFullYear()).to.equal(2028);
        expect(el.date2).to.equal(null);
        expect(el.value).to.equal('01-02/2028T00:00:00;')
        expect(el.current_view).to.equal('d');

        let cal = el.nav_el.querySelector("#" + el._calendars.get(1).id());
        expect(cal).to.not.equal(null);
        let day_cell = cal.nextElementSibling.children[1].children[1];
        day_cell.click();
        let dset1 = day_cell.dataset;
        expect(el.value).to.equal(`${pad(dset1.d)}-${pad(dset1.m)}/${dset1.y}T00:00:00;`)

        cal = el.nav_el.querySelector("#" + el._calendars.get(-1).id());
        expect(cal).to.not.equal(null);
        day_cell = cal.nextElementSibling.children[1].children[1];
        day_cell.click();
        let dset2 = day_cell.dataset;
        expect(el.value).to.equal(`${pad(dset1.d)}-${pad(dset1.m)}/${dset1.y}T00:00:00;${pad(dset2.d)}-${pad(dset2.m)}/${dset2.y}T23:59:59`)

        /*Test value with max and min*/
        let el1 = await fixture(html` <aalam-dtpick value="31/05/2023" maxval="30/03/2022"></aalam-dtpick>`);
        expect(el1.type).to.be.equal('d')
        expect(el1.format).to.be.equal('DD/MM/YYYY')
        expect(el1.date1).to.equal(null);

        el1.setAttribute("value", "03/02/2022")
        await updated(el1);
        expect(el1.date1.getDate()).to.equal(3);
        expect(el1.date1.getMonth()).to.equal(1);
        expect(el1.date1.getFullYear()).to.equal(2022);

        el1.setAttribute("maxval", "03/02/2021")
        await updated(el1);
        expect(el1.date1).to.equal(null);

        el1.range = true;
        el1.setAttribute("minval", '03/01/2022');
        el1.setAttribute("maxval", '03/01/2024');
        el1.setAttribute("value", "03/02/2022;")
        await updated(el1);
        expect(el1.date1.getDate()).to.equal(3);
        expect(el1.date1.getMonth()).to.equal(1);
        expect(el1.date1.getFullYear()).to.equal(2022);

        el1.setAttribute("value", "03/02/2020;03/04/2023")
        await updated(el1);
        expect(el1.date1).to.equal(null);
        expect(el1.date2.getDate()).to.equal(3);
        expect(el1.date2.getMonth()).to.equal(3);
        expect(el1.date2.getFullYear()).to.equal(2023);

        el1.setAttribute('format', 'MM-YYYY')
        el1.setAttribute("minval", "02-2022;")
        el1.setAttribute("maxval", "02-2024;")
        el1.setAttribute("value", "02-2020;04-2024")
        await el1.updated();
        expect(el1.date1).to.equal(null);
        expect(el1.date2).to.equal(null);

        el1.setAttribute("value", "08-2023;01-2023")
        await el1.updated();
        expect(el1.date1.getMonth()).to.equal(7);
        expect(el1.date1.getFullYear()).to.equal(2023);
        expect(el1.date2).to.equal(null)

        el1.setAttribute("value", "08-2023;01-2024")
        await el1.updated();
        expect(el1.date1.getMonth()).to.equal(7);
        expect(el1.date1.getFullYear()).to.equal(2023);
        expect(el1.date2.getMonth()).to.equal(0);
        expect(el1.date2.getFullYear()).to.equal(2024);
    })
    it('check navigation & scroll without limits', async () => {
        /*Check scrolling behaviour without limits*/
        let prnt = await fixture(html`<div style="height:300px;"><aalam-dtpick id="picker"></aalam-dtpick></div>`);
        let el = prnt.querySelector("#picker");
        expect(el.type).to.be.equal('d')

        const today = new Date();
        expect(el._calendars.length).to.be.equal(3)
        expect(el._calendars.get(0).month).to.be.equal(today.getMonth());
        expect(el._calendars.get(1).month).to.be.equal(today.getMonth() + 1);
        expect(el._calendars.get(2).month).to.be.equal(today.getMonth() + 2);

        el.nav_el.scrollTo(0, el.nav_el.scrollTop * -1)
        /*sleeping so that the observer callback is called*/
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._calendars.length).to.be.equal(9)

        el.nav_el.scrollTo(0, el.nav_el.scrollHeight)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._calendars.length).to.be.equal(15)

        let cal = el._calendars.get(-6);
        let cal_el = el.nav_el.querySelector(`#${cal.id()}`);
        expect(cal_el).to.not.equal(null);
        let cal_month_el = cal_el.querySelector(".cal-title-month");
        let cal_year_el = cal_el.querySelector(".cal-title-year");
        expect(cal_month_el).to.not.equal(null);
        expect(cal_year_el).to.not.equal(null);

        cal_year_el.click();
        await el.updated();
        expect(el.current_view).to.be.equal('y');
        expect(el._years.length).to.be.equal(4);
        el.nav_el.scrollTo(0, el.nav_el.scrollTop * -1)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        let tmp = el._years.length;
        expect(el._years.length).to.be.above(6);
        el.nav_el.scrollTo(0, el.nav_el.scrollHeight * 1)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._years.length).to.be.equal(tmp + 5);
        el.nav_el.scrollTo(0, el.nav_el.scrollHeight * 1)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._years.length).to.be.equal(tmp + 10);

        let yr_el = el.nav_el.querySelector("#y" + el._years[el._years.length - 12]);
        expect(yr_el).to.not.equal(null);
        yr_el.nextElementSibling.children[0].click();
        await el.updated();
        expect(el.current_view).to.be.equal('m');
        expect(el._months.length).to.be.equal(4);

        el.nav_el.scrollTo(0, el.nav_el.scrollTop * -1)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._months.length).to.be.equal(10);
        el.nav_el.scrollTo(0, el.nav_el.scrollHeight)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._months.length).to.be.equal(15);
        el.nav_el.scrollTo(0, el.nav_el.scrollHeight)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._months.length).to.be.equal(20);

        let mon_el = el.nav_el.querySelector("#m" + el._months[el._months.length - 12]);
        expect(mon_el).to.not.equal(null);
        mon_el.nextElementSibling.children[4].click();
        await el.updated();
        expect(el.current_view).to.be.equal('d');
        expect(el._calendars.length).to.be.equal(6);

        let bfr = el.nav_el.querySelector(".ext-bfr");
        expect(bfr).to.not.equal(null);
        let aft = el.nav_el.querySelector(".ext-aft");
        expect(aft).to.not.equal(null);
        let blk = el.nav_el.querySelector(".break-block");
        expect(blk).to.not.equal(null);

        bfr.click()
        await el.updated();
        expect(el._calendars.length).to.be.equal(12);
        aft.click()
        await el.updated();
        expect(el._calendars.length).to.be.equal(18);

        /*For month type*/
        el.setAttribute("format", "MM/YYYY")
        await el.updated();
        expect(el.current_view).to.be.equal('m');
        expect(el._months.length).to.be.equal(4);
        mon_el = el.nav_el.querySelector("#m" + el._months[1]);
        expect(mon_el).to.not.equal(null);
        mon_el.nextElementSibling.children[4].click();
        await el.updated();
        expect(el.current_view).to.be.equal('m');

        mon_el.click()
        await el.updated();
        expect(el.current_view).to.be.equal('y');

        /*For year type*/
        el.setAttribute("format", "YYYY")
        await el.updated();
        expect(el.current_view).to.be.equal('y');
        expect(el._years.length).to.be.equal(4);
        yr_el = el.nav_el.querySelector("#y" + el._years[1]);
        expect(yr_el).to.not.equal(null);
        yr_el.nextElementSibling.children[4].click();
        await el.updated();
        expect(el.current_view).to.be.equal('y');
    })
    it('check navigation & scroll with limits', async () => {
        /*Check scrolling behaviour with limits*/
        let today = new Date();
        let min_val = new Date(today.getFullYear(), -7, today.getDate()); /*1 year before*/
        let max_val = new Date(today.getFullYear(), 13, today.getDate()); /*8 mnts after*/
        let fmt = "MM-DD-YYYY"
        let prnt = await fixture(
            html`<div style="height:300px;">
                <aalam-dtpick id="picker-lim" format=${fmt} minval="${AalamDatePickerElement.toStr(min_val, fmt)}"
                    maxval="${AalamDatePickerElement.toStr(max_val, fmt)}"></aalam-dtpick></div>`);
        let el = prnt.querySelector("#picker-lim");
        expect(el.type).to.be.equal('d')

        el.nav_el.scrollTo(0, el.nav_el.scrollTop * -1)
        /*sleeping so that the observer callback is called*/
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._calendars.length).to.be.equal(9)

        el.nav_el.scrollTo(0, el.nav_el.scrollTop * -1)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._calendars.length).to.be.equal(14)

        el.nav_el.scrollTo(0, el.nav_el.scrollTop * -1)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._calendars.length).to.be.equal(14)

        let cal = el.nav_el.querySelector("#" + el._calendars.get(0).id())
        expect(cal).to.not.equal(null);
        expect(+cal.children[0].dataset.m).to.be.equal(min_val.getMonth() + 1);
        expect(+cal.children[0].dataset.y).to.be.equal(min_val.getFullYear());
        let cal_block = cal.nextElementSibling;
        let num_disabled = min_val.getDate() - 1;
        let week = 0;
        let disabled_cells = []
        while (num_disabled > 0) {
            for (let i = 0;i < 7 && num_disabled > 0; i++) {
                let cell = cal_block.children[week].children[i];
                if (cell.dataset.d == "0")
                    continue;
                num_disabled -= 1;
                disabled_cells.push(cell);
            }
            week += 1;
        }
        expect(disabled_cells.length).to.be.equal(min_val.getDate() - 1);
        for (let i = 0; i < disabled_cells.length;i++)
            expect(disabled_cells[i].classList.contains('item-oor')).to.be.true;

        el.nav_el.scrollTo(0, el.nav_el.scrollHeight)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._calendars.length).to.be.equal(20)
        el.nav_el.scrollTo(0, el.nav_el.scrollHeight)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._calendars.length).to.be.equal(21)
        el.nav_el.scrollTo(0, el.nav_el.scrollHeight)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._calendars.length).to.be.equal(21)

        cal = el.nav_el.querySelector("#" + el._calendars.get(-1).id())
        expect(cal).to.not.equal(null);
        expect(+cal.children[0].dataset.m).to.be.equal(max_val.getMonth() + 1);
        expect(+cal.children[0].dataset.y).to.be.equal(max_val.getFullYear());
        cal_block = cal.nextElementSibling;
        num_disabled = (new Date(max_val.getFullYear(), max_val.getMonth() + 1, 0)).getDate() - max_val.getDate();
        week = 0;
        disabled_cells = []
        let num_weeks = el._calendars.get(-1).num_weeks;
        while (week < num_weeks) {
            for (let i = 0;i < 7; i++) {
                let cell = cal_block.children[week].children[i];
                if (cell.dataset.d == "0")
                    continue;
                if (cell.classList.contains("item-oor"))
                    disabled_cells.push(cell);
            }
            week += 1;
        }
        expect(disabled_cells.length).to.be.equal(num_disabled);

        cal.children[1].click()
        let min_base = el._yrsBase(min_val.getFullYear());
        let max_base = el._yrsBase(max_val.getFullYear());
        await el.updated();
        expect(el.current_view).to.be.equal('y');
        expect(el._years.length).to.be.equal(min_base == max_base?1:2)
        el.nav_el.scrollTo(0, el.nav_el.scrollHeight)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._years.length).to.be.equal(min_base == max_base?1:2)
        el.nav_el.scrollTo(0, el.nav_el.scrollTop * -1)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._years.length).to.be.equal(min_base == max_base?1:2)

        let blk = el.nav_el.querySelector("#y" + min_base);
        disabled_cells = [];
        for (let i = 0;i < 20 && i + min_base < min_val.getFullYear(); i++) {
            let cell = blk.nextElementSibling.children[i];
            if (cell.classList.contains("item-oor"))
                disabled_cells.push(cell);
        }
        expect(disabled_cells.length).to.be.equal(min_val.getFullYear() - min_base)

        blk = el.nav_el.querySelector("#y" + max_base);
        disabled_cells = [];
        for (let i = 19;i >= 0 && i + max_base > max_val.getFullYear(); i--) {
            let cell = blk.nextElementSibling.children[i];
            if (cell.classList.contains("item-oor"))
                disabled_cells.push(cell);
        }
        expect(disabled_cells.length).to.be.equal(max_base + 19 - max_val.getFullYear())

        let max_cell = disabled_cells[disabled_cells.length - 1].previousElementSibling;
        expect(+max_cell.dataset.y).to.be.equal(max_val.getFullYear())
        max_cell.click();

        await el.updated();
        expect(el.current_view).to.be.equal('m');
        expect(el._months.length).to.be.equal(3)
        el.nav_el.scrollTo(0, el.nav_el.scrollHeight)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._months.length).to.be.equal(3)
        el.nav_el.scrollTo(0, el.nav_el.scrollTop * -1)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._months.length).to.be.equal(3)

        blk = el.nav_el.querySelector("#m" + min_val.getFullYear());
        disabled_cells = [];
        for (let i = 0;i < 12 && i < min_val.getMonth(); i++) {
            let cell = blk.nextElementSibling.children[i];
            if (cell.classList.contains("item-oor"))
                disabled_cells.push(cell);
        }
        expect(disabled_cells.length).to.be.equal(min_val.getMonth())

        blk = el.nav_el.querySelector("#m" + max_val.getFullYear());
        disabled_cells = [];
        for (let i = 11;i >= 0 && i > max_val.getMonth(); i--) {
            let cell = blk.nextElementSibling.children[i];
            if (cell.classList.contains("item-oor"))
                disabled_cells.push(cell);
        }
        expect(disabled_cells.length).to.be.equal(11 - max_val.getMonth())

        /*For month type*/
        fmt = "MM/YYYY";
        el.setAttribute("format", "MM/YYYY")
        el.setAttribute('minval', AalamDatePickerElement.toStr(min_val, fmt))
        el.setAttribute('maxval', AalamDatePickerElement.toStr(max_val, fmt))
        await el.updated();
        expect(el.current_view).to.be.equal('m');
        expect(el._months.length).to.be.equal(2);
        el.nav_el.scrollTo(0, el.nav_el.scrollHeight)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._months.length).to.be.equal(3);
        el.nav_el.scrollTo(0, el.nav_el.scrollTop * -1)
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._months.length).to.be.equal(3);

        let mon_el = el.nav_el.querySelector("#m" + el._months[1]);
        expect(mon_el).to.not.equal(null);
        mon_el.nextElementSibling.children[3].click();
        await el.updated();
        expect(el.current_view).to.be.equal('m');

        mon_el.click()
        await el.updated();
        expect(el.current_view).to.be.equal('y');

    })
    it("check fromStr", async () => {
        expect(AalamDatePickerElement.fromStr("23421241", "DD123MM")).to.be.equal(null);
        expect(AalamDatePickerElement.fromStr("23429999", "DDMMYYYY").getTime()).to.be.equal(new Date(9999, 41, 23).getTime());
        expect(AalamDatePickerElement.fromStr("2-4/1934", "DD-MM/YYYY").getTime()).to.be.equal(new Date(1934, 3, 2).getTime());
        expect(AalamDatePickerElement.fromStr("4**1934", "MM**YYYY").getTime()).to.be.equal(new Date(1934, 3, 1).getTime());
    });
    it("check toStr", async() => {
        let dt = new Date(2024, 6, 5, 12, 34, 56);
        expect(AalamDatePickerElement.toStr(dt, "DD123MM")).to.be.equal('0512307');
        expect(AalamDatePickerElement.toStr(dt, "DMM")).to.be.equal('D07');
        expect(AalamDatePickerElement.toStr(dt, "DM")).to.be.equal('DM');
    });
    it("check events on click", async () => {
        /*Test the events on clicks*/
        let prnt = await fixture(html`<div style="height:300px;"><aalam-dtpick id="picker"></aalam-dtpick></div>`);
        let el = prnt.querySelector("#picker");
        let evnts = []
        el.addEventListener("change", (event) => {
            evnts.push(event.detail);
        })
        expect(el.type).to.be.equal('d')
        expect(el._calendars.length).to.be.equal(3)

        el.nav_el.scrollTo(0, el.nav_el.scrollTop * -1)
        /*sleeping so that the observer callback is called*/
        await new Promise((resolve) => {setTimeout(() => {resolve()}, 50)});
        expect(el._calendars.length).to.be.equal(9)

        let cal = el._calendars.get(-6);
        let cal_el = el.nav_el.querySelector(`#${cal.id()}`);
        expect(cal_el).to.not.equal(null);

        await el.updated();
        let [exp_val, exp_dt] = clickDay(cal_el, 1, 1)
        expect(el.value).to.equal(exp_val)
        expect(evnts.length).to.equal(1)
        expect(evnts[0].value).to.equal(exp_val)
        expect(evnts[0].date.getTime()).to.equal(exp_dt.getTime());

        evnts = []
        let ret = clickDay(cal_el, 2, 1);
        [exp_val, exp_dt] = ret;
        expect(el.value).to.equal(ret[0])
        expect(evnts.length).to.equal(1)
        expect(evnts[0].value).to.equal(exp_val)
        expect(evnts[0].date.getTime()).to.equal(exp_dt.getTime());

        el.range = true;
        await el.updated();

        evnts = []
        cal = el._calendars.get(-6);
        cal_el = el.nav_el.querySelector(`#${cal.id()}`);
        expect(cal_el).to.not.equal(null);
        let [exp_val2, exp_dt2] = clickDay(cal_el, 3, 1)
        let val = `${exp_val};${exp_val2}`;
        expect(el.value).to.equal(val);
        expect(evnts.length).to.equal(1)
        expect(evnts[0].value).to.equal(val)
        expect(evnts[0].from.date.getTime()).to.equal(exp_dt.getTime());
        expect(evnts[0].to.date.getTime()).to.equal(exp_dt2.getTime());

        evnts = []
        ret = clickDay(cal_el, 4, 1);
        [exp_val, exp_dt] = ret;
        expect(el.value).to.equal(`${exp_val};`);
        expect(evnts.length).to.equal(0)

        ret = clickDay(cal_el, 2, 1);
        [exp_val, exp_dt] = ret;
        expect(el.value).to.equal(`${exp_val};`);
        expect(evnts.length).to.equal(0);

        ret = clickDay(cal_el, 3, 1);
        [exp_val2, exp_dt2] = ret;
        expect(el.value).to.equal(`${exp_val};${exp_val2}`);
        expect(evnts.length).to.equal(1)
        expect(evnts[0].value).to.equal(`${exp_val};${exp_val2}`);

        el.setAttribute("format", "MM@YYYY");
        await el.updated();
        evnts = [];

        let mon_el = el.nav_el.querySelector("#m" + el._months[1]);
        let [m, y] = monthClick(mon_el, 4);
        expect(el.value).to.equal(`${pad(m)}@${y};`);
        expect(evnts.length).to.equal(0);

        let [m1, y1] = monthClick(mon_el, 9);
        expect(el.value).to.equal(`${pad(m)}@${y};${pad(m1)}@${y1}`);
        expect(evnts.length).to.equal(1);
        expect(evnts[0].value).to.equal(`${pad(m)}@${y};${pad(m1)}@${y1}`);
        evnts = [];

        [m, y] = monthClick(mon_el, 6);
        expect(el.value).to.equal(`${pad(m)}@${y};`);
        expect(evnts.length).to.equal(0);

        [m, y] = monthClick(mon_el, 5);
        expect(el.value).to.equal(`${pad(m)}@${y};`);
        expect(evnts.length).to.equal(0);

        el.range = false;
        await el.updated();
        evnts = [];

        mon_el = el.nav_el.querySelector("#m" + el._months[1]);
        [m, y] = monthClick(mon_el, 4);
        expect(el.value).to.equal(`${pad(m)}@${y}`);
        expect(evnts.length).to.equal(1);
        expect(evnts[0].value).to.equal(`${pad(m)}@${y}`);
        evnts = [];

        [m, y] = monthClick(mon_el, 9);
        expect(el.value).to.equal(`${pad(m)}@${y}`);
        expect(evnts.length).to.equal(1);
        expect(evnts[0].value).to.equal(`${pad(m)}@${y}`);

        el.setAttribute("format", "-YYYY-");
        await el.updated();
        evnts = [];

        let yr_el = el.nav_el.querySelector("#y" + el._years[1]);
        y = yrClick(yr_el, 4);
        expect(el.value).to.equal(`-${y}-`);
        expect(evnts.length).to.equal(1);
        expect(evnts[0].value).to.equal(`-${y}-`);
        evnts = [];

        y = yrClick(yr_el, 9);
        expect(el.value).to.equal(`-${y}-`);
        expect(evnts.length).to.equal(1);
        expect(evnts[0].value).to.equal(`-${y}-`);

        el.range = true;
        el.setAttribute("format", "DD/MM/YYYYThh:mm:ss");
        await el.updated();
        evnts = [];

        cal = el._calendars.get(0);
        cal_el = el.nav_el.querySelector(`#${cal.id()}`);
        expect(cal_el).to.not.equal(null);
        [exp_val, exp_dt] = clickDay(cal_el, 3, 1);
        val = `${exp_val}T00:00:00;`;
        expect(el.value).to.equal(val);
        expect(evnts.length).to.equal(0);

        [exp_val, exp_dt] = clickDay(cal_el, 2, 3)
        val = `${exp_val}T00:00:00;`;
        expect(el.value).to.equal(val);
        expect(evnts.length).to.equal(0);

        [exp_val2, exp_dt2] = clickDay(cal_el, 4, 3)
        val = `${exp_val}T00:00:00;${exp_val2}T23:59:59`;
        expect(el.value).to.equal(val);
        expect(evnts.length).to.equal(1)
        expect(evnts[0].value).to.equal(val);
    });
    it("check events on key input", async () => {
        /*Test events with input*/
        let prnt = await fixture(html`<div style="height:300px;"><aalam-dtpick id="picker" format="DD/MM/YYYYThh:mm:ss"></aalam-dtpick></div>`);
        let el = prnt.querySelector("#picker");
        let evnts = []
        el.addEventListener("change", (event) => {
            evnts.push(event.detail);
        })

        let now = new Date()
        el.date1_el_dt.input_els[0].focus();
        await sendKeys({type: "021019"})
        expect(el.date1).to.be.equal(undefined);
        expect(evnts.length).to.be.equal(0);
        expect(el._calendars.length).to.be.equal(3);
        let calid = (cal) => `${pad(cal.month)}${cal.year}`;
        expect(calid(el._calendars.get(0))).to.be.equal(`${pad(now.getMonth())}${now.getFullYear()}`)
        expect(calid(el._calendars.get(1))).to.be.equal(`${pad(now.getMonth() + 1)}${now.getFullYear()}`)
        expect(calid(el._calendars.get(2))).to.be.equal(`${pad(now.getMonth() + 2)}${now.getFullYear()}`)

        await sendKeys({type: "84"})
        expect(el.date1.getTime()).to.be.equal(new Date(1984, 9, 2).getTime());
        expect(evnts.length).to.be.equal(1);
        expect(el._calendars.length).to.be.equal(3);

        evnts = []
        el.date1_el_tm.input_els[0].click();
        await sendKeys({type: "83454"});
        expect(el.date1.getTime()).to.be.equal(new Date(1984, 9, 2, 8, 34, 54).getTime());
        expect(evnts.length).to.be.equal(3);
        expect(el._calendars.length).to.be.equal(3);
        expect(calid(el._calendars.get(0))).to.be.equal(`091984`)
        expect(calid(el._calendars.get(1))).to.be.equal(`101984`)
        expect(calid(el._calendars.get(2))).to.be.equal(`111984`)

        evnts = []
        el.date1_el_dt.input_els[1].click();
        await sendKeys({type: "01"})
        expect(el.date1.getTime()).to.be.equal(new Date(1984, 0, 2, 8, 34, 54).getTime());
        expect(evnts.length).to.be.equal(1);
        expect(el._calendars.length).to.be.equal(3);
        expect(calid(el._calendars.get(0))).to.be.equal(`121983`)
        expect(calid(el._calendars.get(1))).to.be.equal(`011984`)
        expect(calid(el._calendars.get(2))).to.be.equal(`021984`)

        el.setAttribute('range', true);
        await el.updated();
        expect(el._calendars.length).to.be.equal(3);

        let cal = el._calendars.get(1);
        let cal_el = el.nav_el.querySelector(`#${cal.id()}`);
        expect(cal_el).to.not.equal(null);

        evnts = [];
        let [d1_str, d1_dt] = clickDay(cal_el, 2, 4);
        await el.updated();
        d1_dt.setHours(23);d1_dt.setMinutes(59);d1_dt.setSeconds(59);
        expect(evnts.length).to.be.equal(1);
        expect(el.date2.getTime()).to.be.equal(d1_dt.getTime());
        expect(el.date2_el_dt.input_els[0].value).to.be.equal(pad(d1_dt.getDate()));
        expect(el.date2_el_dt.input_els[1].value).to.be.equal(pad(d1_dt.getMonth() + 1));
        expect(el.date2_el_dt.input_els[2].value).to.be.equal(pad(d1_dt.getFullYear()));
        expect(+el.date2_el_tm.input_els[0].value).to.be.equal(11);
        expect(+el.date2_el_tm.input_els[1].value).to.be.equal(59);
        expect(+el.date2_el_tm.input_els[2].value).to.be.equal(59);
        expect(el.date2_el_tm.input_els[3].value).to.be.equal('PM');

        evnts = [];
        [d1_str, d1_dt] = clickDay(cal_el, 1, 4);
        d1_dt.setHours(8);d1_dt.setMinutes(34);d1_dt.setSeconds(54);
        await el.updated();
        expect(el.date1.getTime()).to.be.equal(d1_dt.getTime());
        expect(el.date2).to.be.equal(null);
        for (let i = 0; i < 3; i++) {
            expect(el.date2_el_dt.input_els[i].value).to.be.equal('');
            expect(el.date2_el_tm.input_els[i].value).to.be.equal('');
        }
        expect(evnts.length).to.be.equal(0);

        el.date2_el_dt.input_els[0].click();
        await sendKeys({type: "01022000"})
        el.date2_el_tm.input_els[0].click();
        await sendKeys({type: "050607"});
        await updated(el)
        expect(evnts.length).to.be.equal(4);
        expect(el._calendars.length).to.be.equal(6);
        expect(calid(el._calendars.get(0))).to.be.equal(`121983`)
        expect(calid(el._calendars.get(1))).to.be.equal(`011984`)
        expect(calid(el._calendars.get(2))).to.be.equal(`021984`)
        expect(calid(el._calendars.get(3))).to.be.equal(`012000`)
        expect(calid(el._calendars.get(4))).to.be.equal(`022000`)
        expect(calid(el._calendars.get(5))).to.be.equal(`032000`)

        evnts = [];
        el.date1_el_tm.input_els[0].click()
        await sendKeys({type: "23"})
        expect(evnts.length).to.be.equal(1);
        d1_dt.setHours(2);
        expect(el.date1.getTime()).to.be.equal(d1_dt.getTime());
        expect(el.date2.getTime()).to.be.equal(new Date(2000, 1, 1, 5, 6, 7).getTime());

        el.setAttribute("format", "MM-YYYY");
        await updated(el);

        evnts = [];
        el.date1_el_dt.input_els[1].click();
        await sendKeys({type: "19"})
        expect(evnts.length).to.be.equal(0);

        await sendKeys({type: "99"})
        expect(el.date1_el_dt.input_els[0].value).to.be.equal(pad(d1_dt.getMonth() + 1));
        expect(evnts.length).to.be.equal(1);
        expect(evnts[0].value).to.be.equal(`${pad(d1_dt.getMonth() + 1)}-1999;02-2000`);

        evnts = [];
        await sendKeys({type: "042023"});
        /*This is for the change in month before the year got updated*/
        expect(evnts.length).to.be.equal(1);
        expect(evnts[0].value).to.be.equal(`04-1999;02-2000`);
        for (let i = 0; i < 2; i++)
            expect(el.date2_el_dt.input_els[i].value).to.be.equal('');
        expect(el.date2).to.be.equal(null);
    })
    it("check key input with limits", async () => {
        /*Test key inputs with limits*/
        let el = await fixture(html` <aalam-dtpick format="DD/MM/YYYYThh:mm:ss" minval="31/05/2023T01:02:03" maxval="30/03/2024T04:05:06"></aalam-dtpick>`);
        let evnts = []
        el.addEventListener("change", (event) => {
            evnts.push(event.detail);
        })
        el.date1_el_dt.input_els[0].focus();
        await sendKeys({type: "01011923"});
        el.date1_el_tm.input_els[0].click();
        await sendKeys({type: "040503"});
        expect(evnts.length).to.be.equal(3);
        expect(evnts[0].value).to.be.equal('31/05/2023T01:02:03')
        expect(evnts[1].value).to.be.equal('31/05/2023T04:02:03')
        expect(evnts[2].value).to.be.equal('31/05/2023T04:05:03')

        el._setDate(null, null);
        await updated(el);
        for (let i = 0; i < 3; i++) {
            expect(el.date1_el_dt.input_els[i].value).to.be.equal('');
            expect(el.date1_el_tm.input_els[i].value).to.be.equal('');
        }

        el.date1_el_dt.input_els[0].click();
        evnts = [];
        await sendKeys({type: "01012029"});
        el.date1_el_tm.input_els[0].click();
        el.date1_el_tm.input_els[0].select();
        await sendKeys({type: "040500"});
        /*The 9 will be prevented from entering in*/
        expect(evnts.length).to.be.equal(4);
        expect(evnts[0].value).to.be.equal('31/05/2023T01:02:03')
        expect(evnts[1].value).to.be.equal('31/05/2023T04:02:03')
        expect(evnts[2].value).to.be.equal('31/05/2023T04:05:03')
        expect(evnts[3].value).to.be.equal('31/05/2023T04:05:00')
    })
})
