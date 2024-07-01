'use strict';

const {statSync} = require("fs");

function fileExists(pathName){
    // The try-catch here is for Cloudflare Pages, which runs on 
    // Nodejs v12, and doesn't have the "throwIfNoEntry" option
    try{
        return statSync(pathName, {throwIfNoEntry: false});
    }catch(e){
        return undefined;
    }
}

/**
 * This is a modified version of markdown-it-image-lazy-loading
 * I've adapted it to return a <picture> when a webp version of
 * an image exists on disk.
 */
module.exports = function lazy_loading_plugin(md, mdOptions) {
  var defaultImageRenderer = md.renderer.rules.image;

  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    var token = tokens[idx];
    token.attrSet('loading', 'lazy');

    if(!mdOptions || !mdOptions.base_path){
        throw new Error("base_path was not provided");
    }

    const sizeOf = require('image-size');
    const path = require('path');

    let imgSrc = token.attrGet('src');

    // Most images are loaded from /uploads/. However, some images use a path
    // relative to its markdown file (path not starting with a forward slash).
    // In that case, we need to construct a relative path from /src/site/
    if(imgSrc?.substring(0,1) !== '/'){
        imgSrc = path.join(
            path.relative(mdOptions.base_path, path.dirname(env.page.inputPath)),
            imgSrc
        );
    }

    const imgPath = path.join(mdOptions.base_path, imgSrc);
    const dimensions = sizeOf(imgPath);

    token.attrSet('width', dimensions.width);
    token.attrSet('height', dimensions.height);

    // Check if the webP version exists
    const webpPath = imgPath.substring(0, imgPath.length - 3) + 'webp';
    const defaultRender = defaultImageRenderer(tokens, idx, options, env, self);

    if(fileExists(webpPath) !== undefined){
        return `
            <picture loading="lazy" width="${dimensions.width}" height="${dimensions.height}">
                <source srcset="${imgSrc.substring(0, imgSrc.length - 3) + "webp"}" type="image/webp">
                ${defaultRender}
            </picture>
        `;
    }

    return defaultRender; 
  };
};
