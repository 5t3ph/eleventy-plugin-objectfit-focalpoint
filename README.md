## Eleventy Plugin: Object-Fit Focal Point

> An Eleventy Nunjucks shortcode to provide the functionality of generating an image's `object-position` value in order to keep the focal point in view. [Test drive the results by using the utilty app](https://objectfit-focalpoint.netlify.app/).

This shortcode works in combination with the CSS property `object-fit` which makes an `img` act as it's own container. When assigned the value of `cover`, the image behaves similar to `background-size: cover`.

**Unfamilar with `object-fit`?** [Check out my 2 minute free egghead video >](https://egghead.io/lessons/css-apply-aspect-ratio-sizing-to-images-with-css-object-fit?af=2s65ms)

The shortcode uses the [sharp package resize API](https://sharp.pixelplumbing.com/api-resize) to determine the focal point of an image with [Shannon entropy](https://en.wikipedia.org/wiki/Entropy_%28information_theory%29). It then applies the calculated point as a percentage based on the image's aspect ratio as the value of `object-position`. **When your image container is resized, the focal point is less likely\* to be cropped out of view**.

For best results, an aspect-ratio should be similar to the natural image orientation. For example, `5/3` for an image naturally `1024x768` will have better results than for an image `600x1200`.

\* _Entropy is imperfect and you may not achieve the desired results with every image, particularly with strong light/dark areas_.

## Usage

Install the plugin:

```bash
npm install @11tyrocks/eleventy-plugin-objectfit-focalpoint
```

Then, include it in your `.eleventy.js` config file:

```js
const objectFitFocalPoint = require("@11tyrocks/eleventy-plugin-objectfit-focalpoint");

module.exports = (eleventyConfig) => {
  eleventyConfig.addPlugin(objectFitFocalPoint);
};
```

### Required Image Styles

For the shortcode to fully work, you will need to include the following styles for the related images. The default class is `image` which can be changed by passing a new string to `imageClasses` within the plugin config.

```css
.image {
  /* Required */
  object-fit: cover;

  /* Recommended but not required */
  display: block;
  max-width: 100%;

  /* Optional: Force images to fill their parent container's width */
  width: 100%;
}
```

## Using the Shortcode

**Because the shortcode is async, it is only available for Nunjucks**. If you typically write in Markdown, you can add the following to your frontmatter to be able to use both:

```md
templateEngineOverride: njk, md
```

To use the shortcode, pass in an image path and optionally `width` and `height` values, or an aspect `ratio`.

```js
// Local file - must start with `/`
{% objectFitFocalPoint image="/img/my-image.png", ratio="4/3" %}

// External file - must begin with http or https
// ⚠️ Note that the extra processing may slow down your build
{% objectFitFocalPoint image="https://source.unsplash.com/0kCrlrs8gXg/700x900", width="400", height="300" %}
```

_Note_: It's recommended to always pass in width and height since [browsers now create space while the image loads](https://www.youtube.com/watch?v=4-d_SoCHeWE) based on the expected aspect-ratio created from those values. This helps alleviate jumping of page content, and improves your [Cumulative Layout Shift Core Web Vitals](https://web.dev/cls/) score.

## Config Options

| Option             | Type   | Default   |
| ------------------ | ------ | --------- |
| defaultAspectRatio | string | `'5/3'`   |
| defaultWidth       | int    | `800`     |
| defaultHeight      | int    | `480`     |
| imageClasses       | string | `'image'` |
| siteInputPath      | string | `'.'`     |

At minimum, you may need to update the `siteInputPath` if you have customized your input directory within your Eleventy config. This value _should not_ end with `/`.

Here's an example if your input directory is `src`:

```js
eleventyConfig.addPlugin(objectFitFocalPoint, {
  siteInputPath: "./src",
});
```

## New to Eleventy?

Check out my additional resources at [11ty.Rocks](https://11ty.rocks)
