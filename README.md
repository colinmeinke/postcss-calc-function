## PostCSS calc function

A PostCSS plugin to resolve the
[CSS calc function](http://www.w3.org/TR/css3-values/#calc-notation).

## Installation

```
npm install postcss-calc-function
```

## Usage

### Webpack

```js
...
import calcFunction from 'postcss-calc-function'

export default {
  ...
  postcss: [
    calcFunction()
  ]
}
```

### Input

```css
h1 {
  line-height: calc( 2 * 0.75 );
  padding: calc( 20px * 1.5 ) calc( 20px + 10px );
}
```

### Output

```css
h1 {
  line-height: 1.5;
  padding: 30px 30px;
}
```
