[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)
##  Text Loop
#### Tag Name:

`<aalam-txtloop>`

#### Description:

This element loops its children (list of text elements) to show one child for a prefixed interval.

#### Attributes:
| Name          | Values                                           | Description                                                                                                                                                                                                                                                                                                  |
|---------------|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| interval      | Number<br>`Default: 3 `                            | The amount of seconds to wait before changing the text element                                                                                                                                                                                                       |
| showanimation | String<br>`Default: “name:fade;dur:200ms”`         | This value should be a CSS string format with the following parameters;<br>**name:** Animation name, refer to the notes below to see the list of animation<br>**dur:** The duration for which the animation should be played<br>If either of the parameters are not present, then the default value will be used for the other. |
| hideanimation | String<br>`Default:<br>name:fade;dur:200ms:`       | This is similar to the openAnimation, but these values are applicable for animating the hiding sequence                                                                                                                                                               |
| randomize     | Boolean<br>`Default: false`                        | The loop at a random order instead of the order of the child.                                                                                                                                                                                                         |
#### Note:

Following are the valid animation names

**b2t** - Slides bottom to top

**t2b** - Slides top to bottom

**r2l** - Slides from right to left

**l2r** - Slides from left to right

**reveal-b2t** - Body reveals from bottom to top

**reveal-t2b** - Reveals from top to bottom

**reveal-l2r** - Left to right

**reveal-r2l** - Right to left

**fade** - Fade in and fade out based on the context.


#### Events:
| Name   | Description                                                                                                                                                          |
|--------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| change | Raised when a change happens, with the detail having the following data, after the hide animation is completed.<br>{<br>hiding: The index of the child that is being hidden<br>showing: The index of the child that is being shown<br>} |

