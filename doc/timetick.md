[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)
## Time Ticker
#### Tag Name:

`<aalam-timetick>`

#### Description:

This element shows a time ticker displaying the amount of time pending to elapse.

#### Attributes:
| Name     | Values | Description                                                                                                                                                       |
|----------|--------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `elapseat` | String | A string format that can be understood by Date.pare() - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse              |

#### Slots:
| Name       | Description                                                                                                                                                                                                                                                                                                                                                                    |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `tt-tick`    | Slot where the regular ticker is present. Element that needs updates should carry a data attribute **“data-timetick”** with the value either one of [“year”, “month”, “week”, “day” “hour”, “min”, “sec”] <br><br>Every unit is calculated relatively compared to the higher order of the flow. For example, when year, and day are present, and month is not present - Then the number of days will be the days remaining after the number of full years. Whereas if month is present in that situation the days will be the number of days left over after the number of full months. |
| `tt-elapsed` | The content to show when the time has elapsed.|

#### Events:
| Name    | Description                                                                                                                                                            |
|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `elapsed` | Raised when the time has elapsed.                                                                                                                                      |
| `tick`    | Raised for every second till the time get elapsed. <br><br>The detail will have the following fields:<br>`{ year: <number>, month: <number>, week: <number>, day: <number>, hour: <number>, min: <number>, sec: <number> }` |



