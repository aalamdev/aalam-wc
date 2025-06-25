[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)
## Slider
#### Tag Name:

`<aalam-slider>`

#### Description:

This produces a sliding component that slides its children one after the other horizontally.

#### Attributes:
| Name        | Values | Description |
|-------------|--------|-------------|
| loop        | Boolean<br>`Default : false` | If present, the slider should not end. After the last element, the first element will be shown. Default - false |
| autoslide   | String<br>`Default : null` | Autoslide configuration. The string value will be of the format `dur:<auto sliding interval in milliseconds>;onhover:{pause\|play - Default ‘pause’}`<br>If this attribute is not present or the ‘dur’ is 0, it will not autoslide. |
| center      | Boolean<br>`Default : false` | By default the slider items will be aligned to the left extreme of the container. If this attribute is set the active element will be at the center. |
| sets        | Boolean<br>`Default : false` | When this attribute is present, move the items in sets. If there is a group of items shown, with this attribute, the next/previous possible number of slides will be shown. |
| noguide     | Boolean<br>`Default : false` | If present, it will not show the nav guide. |
| anchorindex | Number<br>`Default : 0` | This attribute will let the application know and set the active element to be shown in the slider. If “center” is set, this would be at the center of the slide; else, this would be at the left most side of the slider. At each and every sliding, this anchor index will change. |
| gap         | String<br>`Default: “s:0px”` | CSS dimension which describes the gap between slider items for different screen dimensions. It is of the following format `<screen-size>:<gap-value>;<screen-size>:<gap-value>`<br>Screen size - s, m, l, xl and 2xl<br>If a value is set for lower screen, the same value will be used for higher screen till a value is set for a much higher screen size |

#### Methods:
| Prototype             | Description |
|-----------------------|-------------|
| `next()`              | Slides to the next element. |
| `prev()`              | Slides to the previous element. |
| `show(index: number)` | Slides to the element at the given index. Index starts from `0` to `items.length - 1`. |

#### Events:
| Name         | Description |
|--------------|-------------|
| `itemshown`  |Raised for each of the item(s) that are shown in the last sliding. The detail attribute of the event has the element that is shown |
| `itemhidden` | Raised for each of the item(s) that are hidden in the last sliding. The detail attribute of the event will have the element that is hiding.|

#### Slots:
| Name             | Description |
|------------------|-------------|
| `slide-item`     | Every item to be slid should be slotted with this name. |
| `nav-prev`       | Clicking this navigates to the previous slide. By default, a right-arrow appears at the right-center of the slider view. |
| `nav-next`       | Clicking this navigates to the next slide. By default, a left-arrow appears at the left-center of the slider view. |
| `nav-guide-item` | If present, this template will be used to create the navigation guides. |

#### CSS Parts:
| Name        | Description |
|-------------|-------------|
| `nav-guide` | This is the guide navigation containing a list of page indicators. Clicking on an indicator will directly navigate to the corresponding slide item. |

#### Notes:

For each of the slide items, an attribute(data-active-ix) value which indicates the distance from the active element. For the active element(s) the data-active-ix = 0 and the item(s) that are next to the active element will have value 1, and the items next to 1 will be 2 and so on.

This attribute will be set on the guide template as well.
