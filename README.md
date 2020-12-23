# xml-trident

> Three-way conversion between XML strings, DOM objects and JSONML representations of a DOM.

**Deprecation warning:** This module is not maintained. Please see [slimdom-sax-parser](https://github.com/wvbe/slimdom-sax-parser) for the DOM parsing, or use the code in [`src/domToJsonml.js`](./src/domToJsonml.js).

## API

```
toString (input: Node|JsonML) : string
```

```
toDom (input: string|JsonML) : DocumentNode
```

```
toJsonml (input: string|Node) : JsonML
```

## JsonML additions

While JsonML only provides an encoding for elements, attributes and text nodes, a secondary goal of this module is to
losslessly convert to-and-fro as much as you want. Therefore some additions to JsonML have been made.

- Elements, attributes, text nodes

    ```xml
    <p class="example">Paragraph</p>
    ```

    ```json
    [
      "p",
      { "class": "example" },
      "Paragraph"
    ]
    ```

- Processing instruction

    ```xml
    <?my-pi as an example ?>
    ```

    ```json
    [
      "?my-pi",
      "as an example "
    ]
    ```

- Comment

    ```xml
    <!-- an XML comment -->
    ```

    ```json
    [
      "!",
      " an XML comment "
    ]
    ```

- Document Type

    ```xml
    <!DOCTYPE html PUBLIC
        "-//W3C//DTD XHTML 1.0 Strict//EN"
        "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    ```

    ```json
    [
      "!DOCTYPE",
      "html",
      "-//W3C//DTD XHTML 1.0 Strict//EN",
      "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"
    ]
    ```

- Document node

    ```xml

    ```

    ```json
    [
      "#document"
    ]
    ```

## Wishlist

- CDATA
