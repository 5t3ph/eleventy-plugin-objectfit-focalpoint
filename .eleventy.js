const sharp = require("sharp");
const fetch = require("node-fetch");

const imgPos = async (siteInputPath, image, width, height) => {
  let input = `${siteInputPath}${image}`;

  if (input.includes("http")) {
    input = await fetch(image).then((resp) => resp.buffer());
  }

  const baseImage = sharp(input);
  const imageInfo = {};

  return await baseImage.metadata().then(function (metadata) {
    imageInfo["trueHeight"] = metadata.height;
    imageInfo["trueWidth"] = metadata.width;

    return baseImage
      .resize(width, height, {
        position: sharp.strategy.entropy,
      })
      .toBuffer({ resolveWithObject: true })
      .then(({ info }) => {
        imageInfo["x"] = info.cropOffsetLeft;
        imageInfo["y"] = info.cropOffsetTop;

        return imageInfo;
      });
  });
};

module.exports = (eleventyConfig, options) => {
  eleventyConfig.addPassthroughCopy("img");

  const defaults = {
    defaultAspectRatio: "5/3",
    defaultWidth: 800,
    defaultHeight: 480,
    imageClasses: "image",
    siteInputPath: ".",
  };

  const {
    defaultAspectRatio,
    defaultWidth,
    defaultHeight,
    imageClasses,
    siteInputPath,
  } = {
    ...defaults,
    ...options,
  };

  eleventyConfig.addNunjucksAsyncShortcode(
    "objectFitFocalPoint",
    async function ({ image, width, height, ratio }) {
      ratio = !ratio && !width && !height ? defaultAspectRatio : ratio;
      width = parseFloat(width) || defaultWidth;
      height = parseFloat(height) || defaultHeight;

      const baseWidth = width;
      const baseHeight = height;

      if (ratio) {
        const aspectRatio = ratio.split("/");
        width = aspectRatio[0] * 100;
        height = aspectRatio[1] * 100;
      }

      let { x, y, trueWidth, trueHeight } = await imgPos(
        siteInputPath,
        image,
        width,
        height
      );

      x = x >= 0 ? x : x * -1;
      y = y >= 0 ? y : y * -1;

      let percentX = 0;
      let percentY = 0;

      if (x > 0) {
        percentX =
          x > width ? ((baseWidth / trueWidth) * x) / baseWidth : x / width;
        percentX = (percentX * 100).toFixed(2);
      }

      if (y > 0) {
        percentY =
          y > height
            ? ((baseHeight / trueHeight) * y) / baseHeight
            : y / height;
        percentY = (percentY * 100).toFixed(2);
      }

      const focalPoint = `object-position: ${percentX}% ${percentY}%;`;
      const ratioProps = ratio ? `height: auto; aspect-ratio: ${ratio};` : "";

      return `<img class="${imageClasses}" src="${image}" width="${baseWidth}" height="${baseHeight}" style="${focalPoint} ${ratioProps}" >`;
    }
  );
};
