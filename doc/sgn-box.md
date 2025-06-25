[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)

# Suggestion Box
#### Tag name
`<aalam-sgn-box>`
#### Description
This is a normal input box which shows suggestions based on the user input

#### Attributes
| Name       | Values                            | Description                                                                                                                                      |
|------------|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| minchar    | Integer value (default: `1`)        | The minimum number of characters to be typed before the suggestions begin.                                                                       |
| listkey    | `String`                            | In case the suggestion is an array of objects, use this key attribute of the object to read and filter from.                                     |
| highlight  | Enum: `"matched" | `"end"      | How to highlight each of the suggestion items. The matched part will be placed in an isolated span tag with a class `.sgn-highlight'.           |
|            |                                   | `matched' - Highlight the matched element.<br>'end' - Highlight the text that follows the matched element.                                       |
| activecls  | String (default: `sgn-active`)    | The class name to be added to the active element in the suggestion list that’s going to be selected. Used to highlight via hover or arrow keys. |
| itemcls    | String (default: `sgn-item`)      | When the suggestion item is a string, it will be appended to the list of suggestions carrying this class name.                                   |
|closesel|String (default:`.dd-close`)|When presenting the dropdown with any elements that when clicked should close the dropdown will carry this selector|

#### Properties:
| Name | Values                  | Description                           |
|------|-------------------------|---------------------------------------|
| list |` String[] \| object[]`    | Predefined list to filter from.       |



#### Methods:                                                                                                                         
   | Prototype                                                      | Description                                                                                                                                           |
|----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `setSuggestions(suggestions: object[], hasMore?: boolean)`    | This will set the suggestion elements. The suggestions will be a string array. The idea is that each suggestion item can either be a string, or a dom string.                |
| `appendSuggestions(suggestions: object[], hasMore?: boolean)`  |This call should append the suggestions to the existing list. Will be used on the load more event.|                                                                   
                                                                                                                                      
#### Events:
| Name     | Description                                                                                      |
|----------|--------------------------------------------------------------------------------------------------|
|` input `   | This will be called when the input value is changed. This will be called only when the input value is more than minChar       |
| `select`   | The suggestion input would be returned as the parameter        |
|` loadmore` | When load more is pressed                                         |

#### Slots:
| Name             | Description                                                                                                                                                                                                                                                                                                                                                                         |
|------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `sgn-input`      | This slot will by default have an input box if unslotted. If slotted, it should have an input element as part of it. Else an exception will be thrown, and the behaviour of the element will be unexpected.                                                                                                                                                                        |
| `sgn-item-template` |The template for the suggestion item. By default it will be presented inside as a string. This is mandatory if the setSuggestion/appendSuggestion is called with a list of objects and the “listKey" property is not set. The templating structure can be followed in the stackoverflow answer - https://stackoverflow.com/a/55538919
| `sgn-empty`      | This slot will be shown in the dropdown when the empty event happens. If there isn't any `sgn-empty` slotted, the dropdown will be shown only after the `minChars` number of characters are typed in.                                                                                                                                                                              |
| `sgn-nomatch`    | This slot will be shown in the dropdown when there are no matches in the predetermined list or `setSuggestion` with an empty list.                                                                                                                                                                                                                                                 |
| `sgn-loadmore`   | This slot will be shown as the last item in the dropdown when the suggestions are more.                                                                                                                                                                                                                                                                                             |
#### CSS Parts
| Name           | Description                                                                                         |
|----------------|-----------------------------------------------------------------------------------------------------|
|` sgn-container`| This part name refers to the suggested dropdown container.                                          |
| `sgn-input`    | This part name applies to the default input element present in the `sgn-input` slot.               |

