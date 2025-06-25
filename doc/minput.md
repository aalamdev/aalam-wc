[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)
## Managed Input
#### Tag Name:

`<aalam-minput>`

#### Description:

This element lets you choose a date/month/year/time or a range from a calendar setup.

#### Attributes:
| Name             | Values | Description |
|------------------|--------|-------------|
| `order`          | String | This can never be empty. When set, it will contain the order of the input fields that are needed. For example for an input box that reads dd/mm/yyyy hh:mm:ss, the order will be like<br>Date,month,year,hour,minutes,secs<br><br>For each of the names in the order, there will be a data attribute preset that describes about each of the data value |
| `data-<order-item>` | String |For each of the items in the order, a data attribute is needed.Value will be similar to how style values are set but with the following fields:<br><br>- `type`: `number` \| `text`<br>- `ph`: Placeholder value<br>- `chars`:If set, it will expect this number of characters to be input before moving to the other input field<br>- `sepnxt`: Separator to be placed between this and the next input field<br>- `gapnxt`:Spacing between this and the next input field<br>- `nmax`:The maximum number that can be input. only applicable for type = number;<br>- `nmin`:The minimum number that can be input. only applicable for type = number;<br>- `choices`: The list of valid inputs separated by “,”(comma).time<br>- `loop`: Set to 1 to loop between the nmax and nmin on Arrow keys. Only applicable for number type.<br><br>If there are more than one item has the same specification, then they all can have a common data attribute with a common prefix in their name and the data attribute like data-`<prefix>* `|
| `value`          | String |Set in the CSS format, a key value for each of the order items. |

#### Events:
| Name     | Description |
|----------|-------------|
| `change` | Whenever an input field changes and it hits the char limit and is moved to another input field, this event will be raised. The event will have an attribute detail. Which is an object with the following fields<br>{<br>**changed:** The name of the field that changed<br><br>**old_val:** The value that was prior to this change<br><br>**new_val:** The value that's currently set for this field  <br><br>**all:** This is an object with keys from the entire input fields and their corresponding value<br>}|

#### CSS Parts:
| Name       | Description |
|------------|-------------|
| `inp-field` | Denotes the input field for each item specified in the `order` attribute. |
