[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)
## Date Picker
#### Tag Name:

`<aalam-dtpick>`

#### Description:

This element lets you choose a date/month/year/time or a range from a calendar setup.

#### Attributes:
| Name   | Values | Description |
|--------|--------|-------------|
| value | String<br>`Default: null` | The initial value and the value that’s chosen currently. If its range, the from and end date string is separated by semicolon (;) |
| range | Boolean<br>`Default: false` | Pick a range of type values |
| format | String<br>`Default: DD/MM/YYYY` | The format of the input date units and how to present output date units.<br>DD - denotes date<br>MM - denotes month<br>YYYY - denotes year in four digits<br>hh - denotes hour<br>mm - denotes minutes<br>ss - denotes seconds<br>Based on the format, the type of selection is enabled. If hh is present, it implies time selection, If DD is present, and hh is not present, it implies date selection. If DD is not present & hh is not present and MM is present, it implies month selection. If hh, DD, and MM are not present but YYYY is present, it implies year selection. |
| maxval | String<br>`Default: null` | This denotes the max date/time that can be chosen from the calendar. The date part of the value will be as per the “format” attribute. If time selection is applicable, then the max time value follows the date with a literal T and time in HH:mm:ss format. |
| minval | String<br>`Default: null` | This denotes the minimum date/time value to be chosen from the calendar. The date part of the value will be as per the format attribute. If time selection is applicable, then the min time value follows the date after a literal T and time in HH:mm:ss format |



#### Methods:
| Prototype                                        | Description |
|--------------------------------------------------|-------------|
| `static fromStr(str: string, in_format: string)` | Converts a date string (`str`) into a `Date` object using the specified input format (`in_format`). |
| `static toStr(obj: Date, out_format: string)`    |Static method to convert a date object to string with the out date in the out_format |

#### Events:
| Name     | Description |
|----------|-------------|
| `change` | When a selection is made. The event’s detail attribute will be an object with the following fields.<br>{`date: Date object,value: Date in string format.`}<br>For range based picking the detail will be<br>{`from: date object for the beginning,to: date object for the end.value: Date string from and to separated by semicolon(;)`}|

#### CSS Parts:
| Name                    | Description |
|-------------------------|-------------|
| `cal-title`              | The title element holding the calendar’s month and year |
| `cal-title-month`        | The month part of the ‘cal-title’ element |
| `cal-title-year`          | The year part of the cal-title element |
| `cal-dayhead`             | The block that contains the weekdays |
| `cal-day`                | Denotes the date at each calendar |
| `cal-today `              | Denotes the current day. Added in addition to the cal-day element |
| `cal-selected`            | When a date is selected, this part name will be added in addition to the cal-day element |
| `cal-week  `              | Denotes the week row at each calendar |
| `cal-break-extender-bfr`  | When a calendar’s scroll is broken, this denotes the extender before the breaker. Clickin on this will load 6 months after the last calendar above it. |
| `cal-break-extender-aft`  | This denotes the extenders that come after the breaker. Clicking on this will load 6 months prior to the first calendar that appears below it. |
| `break-block `            | Denotes the breaker itself. |
| `month-title `            | This is the title element that appears before the list of months. This will be the year number. |
| `months-in-year `         | Denotes the block that displays all the months in a year |
| `month-in-year`           | Denotes the individual month element inside the months-in-year |
| `month-this  `            | This denotes the current month in the current year. Added in addition to the month-in-year |
| `years-title `            | This is the title element that appears before the list of years for every two decades |
| `years-range `            | This denotes the entire block containing all the years in a block of years |
| `year-in-years `          | The individual year element inside the “years-range” |
| `year-this `              | This denotes the current year. Added in addition to the year-in-years |
| `dt-input-box `          | The managed input box holder for date |
| `tm-input-box `           | The managed input box holder for time |
| `nav-selector-parent `    | The selector below the input box to easily navigate to another month/year |
| `nav-selecto`            | The individual selector for navigation |
| `nav-selector-month `     | The month navigation selector. Navigates to months of years |
| `nav-selector-year `      | The year navigation selector. Navigates to decades of years to enable easy year selection. |

#### Notes:

If a cal-day, or a month-in-year, or a year-in-years fall in the range of selection, two css variables will be set. Available only when the “range” attribute is set.

`**--selinrange:**` This variable will be 1 when the cell is in range else it will be 0

`**--hovinrange:**` This variable will be 1 when the cell is within the range of hover limits, else it will be 0.
