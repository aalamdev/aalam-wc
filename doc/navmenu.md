[🏠 Home](https://github.com/Akilanan/aalam-wc/tree/master/doc)
## Nav Menu
#### Tag Name:

`<aalam-navmenu>`

#### Description:

This element creates a navigation menu. This component auto collapses the menu items into a dropdown when there isn’t enough space for all the menu items.

#### Attributes:
| Name      | Values                  | Description                                                                                      |
|-----------|-------------------------|--------------------------------------------------------------------------------------------------|
| direction | Enum: `first` \| `last` <br>Default: `last` | The direction to collapse from. If `first`, collapsing starts from the first child; if `last`, it starts from the last child with the same priority. |

#### Slots:
| Name           | Description                                                                                                                                                                                                                                                                                                                                                              |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `menu-item`      | The menu items. The menu items can have a data-priority attribute set on them. The higher priority element will be collapsed last than the lower priority elements.<br><br>The menu item can have an attribute<br>**data-proxy:** Which signifies a placeholder within the toggler’s dropdown with the same proxy value. When this menu item can be visible, the the placeholder inside the toggler will be hidden and when its getting collapsed, the placeholder will be shown and this menu item will be hidden.<br><br>In the absence of this attribute the element will be removed from the menu-container and will be put inside the toggler. |
| `toggle-item`    | The collapsed elements will be shown as a dropdown on this menu item. When there is nothing to collapse this would not be displayed                                                                                                                                                                                                                                                          |
| `collapsed-item` |Optional slot - to be displayed as the dropdown body and to be used for elements with following data attributes<br>The collapsed item can have two attribute<br><br>**data-persist:** Which signifies that this entry should not be removed at any cost.<br><br>**data-proxy:** An equivalent proxy item will be present in the expanded view. In this case the item display will be toggle instead of getting removed from the toggler.                                                                                                                    |

#### CSS Parts:
| Name           | Description                                                                                                                                      |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `dd-body`        | The dropdown body that contains the collapsed elements. Styling of collapsed elements is not retained; only their inner HTML is used.          |
| `dd-item`        | The individual collapsed element inside the dropdown.                                                                                           |
| `menu-container` | The container holding the menu items, displayed as a flex-box.                                                                                  |

#### Note:

This element will be effective only when this element is positioned static. ‘Fixed’ or ‘absolute’ positioning will not yield the desired result.
