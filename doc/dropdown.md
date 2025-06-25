[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)
## Dropdown
#### Tag Name:

`<aalam-dropdown>`

#### Description:

This element creates a drop down toggle

#### Attributes:
| Name         | Values | Description |
|--------------|--------|-------------|
| `animation`  | String (default: `""`) |The string value can be either of one format<br>**Format 1:** <br>show`<revealanimation-name>`;hide:`<conceal-animation-name>`<br>**Format 2:**<br>`<reveal-animation-name>`<br>Reveal Animation name is one among<br><br>**reveal-x** - The dropdown will be revealed from left to right or right to left whichever is appropriate.<br>**reveal-y** - The dropdown will be revealed from top to bottom or bottom to top whichever is appropriate for the dropdown position<br>**fade-in** - The dropdown’s opacity moves from 0 to 1<br><br>Conceal Animation name is one among<br>**conceal-x** - Dropdown body is closing in the x direction (left to right or right to left)<br>**conceal-y** - Dropdown body is closing in the y direction (top to bottom or bottom to top)<br>**fade-out** - Dropdown’s opacity moves from 1 to 0.<br>If either “show” or “hide” is missing in format 1, the body will not be animated at the respective occasion.<br>If format 2 is chosen, this implies the animation to be used while showing the body and the corresponding opposite animation will be used while hiding. |
| `animationDur` | Number (default: `100`) |The number of milliseconds for the animation. |
| `closesel`   | String (default: `dd-close`) | If a click event is raised from an element inside the dropdown with a selector matching “closesel”, the dropdown will be closed. |
| `boundsel`   | String (default: `""`) |If the dropdown needs to be positioned relative to a parent element of the toggler, the selector of that element has to be set here. |
| `mode`       | Enum: `hover` \| `click` (default: `click`) | The toggle action for the dropdown. When mode == hover, then dropdown will be shown when the toggler is hovered upon and the will be hidden, when the mouse pointer goes out of the dropdown or the toggler element. |
| `position`   | Enum `bottom-left`,`bottom-left`, `bottom-right`, `top-left`, `top-right`, `top`, `bottom`, `left`, `right`, `right-bottom`, `right-top`, `left-bottom`, `left-top` <br> default: bottom-left|The position of the dropdown relative to the toggler.<br><br>bottom-right means, the dropdown should be shown below the bottom of the toggler and the right end of the dropdown should be in the same line as the right of the toggler.<br><br>right-bottom means, the dropdown should be shown at the right side of the toggler and the top of the dropdown and top of the toggler are aligned.<br>top, bottom - Means the dropdown is aligned to the boundary and the body of the dropdown should be aligned to the center of the x limit|
| `noflip`     | Boolean (default: `false`) | When set, the dropdown will not be flipped due to space constraints.|
| `offset`     | Number (default: `0`) | The gap between the dropdown and the toggler|

#### Methods:
| Prototype | Description         |
|-----------|---------------------|
| `show()`  | Show the dropdown.  |
| `hide()`  | Hide the dropdown.  |

#### Events:
| Name  | Description                  |
|-------|------------------------------|
| show  | Raised when the dropdown is shown  |
| hide  | Raised when the dropdown is hidden |

#### Slots:
| Name       | Description             |
|------------|-------------------------|
|` dd-toggler `| This is the toggle initiator |
|` dd-body  `  | The dropdown body       |

#### Note:

Can use [https://floating-ui.com/docs/offset](https://floating-ui.com/docs/offset) for positioning
