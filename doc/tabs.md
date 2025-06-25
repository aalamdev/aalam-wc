[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)
## Tab Switch
#### Tag Name:

`<aalam-tabs>`

#### Description:

This element creates a tab switcher.

#### Attributes:
| Name         | Values | Description |
|--------------|--------|-------------|
| animation    | String<br>`Default: “”` | The string value can be either of one format<br>**Format 1:**<br>show:&lt;animation-name&gt;;hide:&lt;animation-name&gt;<br>**Format 2:**<br>&lt;animation-name&gt;<br><br>**Animation name is one among**<br>b2t - Body moves from bottom to top<br>t2b - Body from top to bottom<br>l2r - Left to right<br>r2l - Right to left<br>fade - Changing in opacity.<br><br>If either “show” or “hide” is missing in format 1, the body will not be animated at the respective occasion.<br>If format 2 is chosen, this implies the animation to be used while showing the body and the corresponding opposite animation will be used while hiding. |
| `animationDur` | Number<br>`Default: 100` | The number of milliseconds for the animation. |
| `activecls`    | String<br>`Default: tab-active` | The class name to be added to the active tab’s title and body. |
| fashion      | String<br>`Default: s:row` | CSS dimension which describes the gap between slider items for different screen dimensions. It is of the following format<br>&lt;screen-size&gt;:&lt;value&gt;;&lt;screen-size&gt;:&lt;value&gt;<br><br>**Screen size** - s, m, l, xl and 2xl<br>If a value is set for lower screen, the same value will be used for higher screen till a value is set for a much higher screen size<br><br>The value can be one of the following<br>**row** - title appears first and body below it.<br>**column** - title and body are in a grid, width auto.<br>**accordion** - tabs function like an accordion. |
| `colsize`      | String<br>`Default title:30%;body:70%` | The size of the columns to be used when displayed in column fashion |
|` boundsel`     | String<br>`Default: null` | Used by the overlay fashion to determine the size and position of the overlay based on a reference element whose bounds will be overlaid upon. |
| `closesel`     | String<br>`Default: .tab-close` | Used by the overlay fashion. When the tab body is shown in an overlay, the overlay |




#### Methods:
| Prototype             | Description                          |
|-----------------------|--------------------------------------|
| `show(index: number)` | Toggles to reveal the tab at the specified index. |

#### Events:
| Name   | Description |
|--------|-------------|
| `change` | Whenever a tab is switched, this event will be raised. Event.detail will be in the following format<br> {`index: The active index`,`tab_header_el: The active title element`,`**tab_body_el:** The active body element`<br>}<br>This event will be raised after the hide animation and show animation gets over.|
|`show`|Raised when a tab is getting opened before the show animation. Event.detail will be in the format as mentioned in the change event.|
|`hide`|Raised when a tab is getting hidden before the hide animation. Event.detail will be in the format as mentioned in the change event.|

#### Slots:
| Name       | Description |
|------------|-------------|
| `tab-title` | This is the tab title. Each child in this slot represents an individual tab title. |
| `tab-body`  | This is the tab body. Each child in this slot corresponds to a tab content section that is shown when its respective title is selected. |

#### Notes:
When this element is getting created, the first title/body with “activecls” will be shown. If none of the tab title/body had this class, then the first tab will be automatically shown.

#### Example

`<aalam-tabs fashion=”s:accordion;s:row;md:column”>`

`<div slot=”tab-title”>Title 1</div>`

`<div slot=”tab-body”>Body 1</div>`

  

`<div slot=”tab-title”>Title 2</div>`

`<div slot=”tab-body”>Body 2</div>`

  

`<div slot=”tab-title”>Title 3</div>`

`<div slot=”tab-body”>Body 3</div>`

  

`<div slot=”tab-title”>Title 4</div>`

`<div slot=”tab-body”>Body 4</div>`

`</aalam-tabs>`

