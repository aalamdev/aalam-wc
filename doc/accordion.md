[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)
# Accordion

#### Tag Name:

`<aalam-accordion>`

#### Description:

This element builds an accordion

#### Attributes:
| Name         | Values                       | Description |
|--------------|------------------------------|-------------|
| togglesel    | String<br>`Default: .acc-title `| The selector of the accordion item to monitor to toggle that respective accordion. |
| bodysel      | String<br>`Default: .acc-body`  | The selector of the accordion item which needs to be expanded and collapsed. This element should be a sibling to the togglesel element. |
| activecls    | String<br>`Default: acc-active` | The class name to be added to the accordion item (parent of body and heading) when its selected. This class name will be removed from the item when the item collapses. |
| nocloseall   | Boolean<br>`Default : false `   | When present, it will not close all the items even when triggered. The last remaining opened item will remain open. |
| nomultiple   | Boolean<br>`Default : false `   | If present, it will not allow more than one item to be opened at any instant. If a new item is toggled to open, the previously open element will collapse. |
| animationDur | Number<br>`Default: 200 `       | The number of milliseconds for the animation. If it's 0, then the toggling will not be animated. |

#### Methods:
| Prototype              | Description                             |
|------------------------|-----------------------------------------|
| `toggle(index: number)` |Toggle (open/close) the element at index. |

#### Events:
| Name            | Description                     |
|-----------------|---------------------------------|
| `itemopened`    | Raised when an item is opened.  |
| `itemcollapsed` | Raised when an item is closed.  |

#### Notes:

When this element is getting created, the accordion items with “activecls” will be opened and the rest of them remain closed. If nomultiple is set, then the first accordion item with the activecls will be opened and rest will be collapsed.

#### Example

`<aalam-accordion>`

`<div>`

`<div class=”acc-title”>Title 1</div>`

`<div class=”acc-body”>Body 1</div>`

`</div>`

`<div>`

`<div class=”acc-title”>Title 2</div>`

`<div class=”acc-body”>Body 2</div>`

`</div>`

`<div>`

`<div class=”acc-title”>Title 3</div>`

`<div class=”acc-body”>Body 3</div>`

`</div>`

`</aalam-accordion>`
