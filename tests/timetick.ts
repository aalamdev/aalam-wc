import { fixture, expect, html, oneEvent} from '@open-wc/testing';
import {AalamTimetick} from "../src/timetick";
import { sendMouse } from '@web/test-runner-commands';

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
                'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
describe('aalam-timetick', () => {
    it('is defined', async () => {
        const el = await fixture(html`
<aalam-timetick elapseat ="00:00:00 jan 01 2025"></aalam-timetick>`);
        expect(el).to.be.an.instanceof(AalamTimetick);
        const el1=document.createElement("aalam-timetick");
        expect(el1).to.be.an.instanceof(AalamTimetick);
        });
    });

    it('timecount', async () => {
        let now = new Date();
        let gap_days = 100;
        let future = new Date(now.getTime() + gap_days*24*3600*1000);
        const el = await fixture (`
<center>
    <aalam-timetick elapseat = "${future.getHours()}:${
                                future.getMinutes()}:${
                                future.getSeconds()} ${
                                months[future.getMonth()]} ${
                                future.getDate()} ${
                                future.getFullYear()}">
        <div slot = "tt-tick">
            <span data-timetick="year"></span><br/>Year
            <span data-timetick="month"></span><br/>Mon
            <span data-timetick="week"></span><br/>Week
            <span data-timetick="day"></span><br/>Day
            <span data-timetick="hour"></span><br/>Hrs
            <span data-timetick="min"></span><br/>Mins
            <span data-timetick="sec"></span><br/>Sec
        </div>
        <div slot="tt-elapsed">
            <span data-msg="msg">TIME IS UP</span>
        </div>
    </aalam-timetick>
</center>`);
        let ttick = el.querySelector("aalam-timetick");
        let spans = ttick.querySelectorAll('span');
        expect(spans.length).to.be.above(0);

        expect(spans[0].textContent).to.equal('00');
        expect(spans[1].textContent).to.equal('03');
        expect(spans[2].textContent).to.equal('01');
        expect(spans[3].textContent).to.equal('02');
        expect(spans[4].textContent).to.equal('00');

        let elapsed_listener = oneEvent(ttick,"tick")
        let elapsed_event = await elapsed_listener;
        expect(spans[7].textContent).to.equal("TIME IS UP");
    });

    it('timecount wihtout year & month', async () => {
        let now = new Date();
        let gap_days = 33;
        let future = new Date(now.getTime() + gap_days*24*3600*1000);
        const el = await fixture (`
<center>
    <aalam-timetick elapseat = "${future.getHours()}:${
                                future.getMinutes()}:${
                                future.getSeconds()} ${
                                months[future.getMonth()]} ${
                                future.getDate()} ${
                                future.getFullYear()}">
        <div slot = "tt-tick">
            <span data-timetick="week"></span><br/>Week
            <span data-timetick="day"></span><br/>Day
            <span data-timetick="hour"></span><br/>Hrs
            <span data-timetick="min"></span><br/>Mins
            <span data-timetick="sec"></span><br/>Sec
        </div>
        <div slot="tt-elapsed">
            <span data-msg="msg">TIME IS UP</span>
        </div>
    </aalam-timetick>
</center>`);
        let ttick = el.querySelector("aalam-timetick");
        let spans = ttick.querySelectorAll('span');
        expect(spans.length).to.be.above(0);

        expect(spans[0].textContent).to.equal('04');
        expect(spans[1].textContent).to.equal('04');
        expect(spans[2].textContent).to.equal('00');

        let elapsed_listener = oneEvent(ttick,"tick")
        let elapsed_event = await elapsed_listener;
        expect(spans[5].textContent).to.equal("TIME IS UP")
    });

    it('timecount wihtout year, month & week ', async () => {
        let now = new Date();
        let gap_days = 370;
        let future = new Date(now.getTime() + gap_days*24*3600*1000);
        const el = await fixture (`
<center>
    <aalam-timetick elapseat = "${future.getHours()}:${
                                    future.getMinutes()}:${
                                    future.getSeconds()} ${
                                    months[future.getMonth()]} ${
                                    future.getDate()} ${
                                    future.getFullYear()}">
        <div slot = "tt-tick">
            <span data-timetick="day"></span><br/>Day
            <span data-timetick="hour"></span><br/>Hrs
            <span data-timetick="min"></span><br/>Mins
            <span data-timetick="sec"></span><br/>Sec
        </div>
        <div slot="tt-elapsed">
            <span data-msg="msg">TIME IS UP</span>
        </div>
    </aalam-timetick>
</center>`);
        let ttick = el.querySelector("aalam-timetick");
        let spans = ttick.querySelectorAll('span');
        expect(spans.length).to.be.above(0);

        expect(spans[0].textContent).to.equal('369');
        expect(spans[1].textContent).to.equal('00');

        let elapsed_listener = oneEvent(ttick,"tick")
        let elapsed_event = await elapsed_listener;
        expect(spans[4].textContent).to.equal("TIME IS UP");
    });
