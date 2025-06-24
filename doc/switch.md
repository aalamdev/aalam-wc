# Toggle Switch
#### Tag Name:

`<aalam-switch>`

#### Description:

This produces a switch that toggles from left to right.

#### Attributes:
| Name   | Values                        | Description                                                                                                                                                              |
|--------|-------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| status | `String value - either “on” \|\`| “off” | If it's “on” - the switch will be on the right side. If it's “off” the switch will be on the left side.                              |
| style  | CSS style value               | Following attributes are accepted <br><br>**width**: The width of the switch. Only pixel values are supported. Default 28px. <br>**height**: The height of the switch. Only pixel values are supported. Default 16px. |

#### Methods:

No Methods.

#### Events:
| Name     | Description |
|----------|-------------|
| `change` | This event will be generated whenever the switch’s status changes. |

#### CSS Parts:
| Name             | Description                                           |
|------------------|-------------------------------------------------------|
| `switch-container` | This is the container of the switch.                 |
| `switch-dial`      | This is the ball that moves left/right within the container. |

