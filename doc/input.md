[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)
## Input box with custom label
#### Tag Name:

`<aalam-md-input>`

#### Description:

This element displays an input box as per the material design with the label inside the empty input box without focus. When the input box gains focus, the label moves to the top of the input box and size becomes small.

#### Attributes:
| Name      | Values                                           | Description                                                                                                                                                     |
|-----------|--------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| label     | String `(default: "Label")`                        | The label for the text field/input box                                                                                                                          |
| mode      | Enum: `filled` \| `outline` \| `normal` <br>Default: `filled` | As per [https://m2.material.io/components/text-fields](https://m2.material.io/components/text-fields)<br>Normal mode will have a label followed by the input box. The label can be slotted at normal-label.                                 |
| color     | String (default: `currentColor`)                 | The color to be used for the outline and label text                                                                                                             |
| disabled  | Boolean                                          | When present, it means the input box will be in disabled state.                                                                                                                       |
| prefix    | String (default: `""`)                           | A prefix text                                                                                                                         |
| suffix    | String (default: `""`)                           | A suffix text                                                                                                                         |
| charcount | Number                                           | When set, it will accept max this number of characters and a char count indication will be shown at the bottom of the input.|

#### Slots:
| Name          | Description                                |
|---------------|--------------------------------------------|
| input         | This is the actual input element            |
| `leading-icon`  | Icon(s) to be shown at the left end         |
| `trailing-icon` | Icon(s) to be shown at the right end        |
| `helper-text`   | The help message to be shown                |
| `normal-label`  | An optional slot to have a custom label for the normal mode |

   #### Note:

This element is displayed as a block element and will occupy the entire width of its parent.The input box width will expand to occupy the space that's remaining after displaying the trailing and leading icons.                                         |
