import path from 'path';
import { merge } from 'lodash-es';
import { ok as assert } from 'uvu/assert';
import * as wikirefs from 'wikirefs';
import type { CompileContext, HtmlExtension } from 'micromark-util-types';
import type { Token } from 'micromark/dev/lib/initialize/document';

import type { WikiEmbedData, WikiRefsOptions } from '../util/types';
import type { DefaultsWikiRefs, DefaultsWikiEmbeds }  from '../util/defaults';
import { defaultsWikiRefs, defaultsWikiEmbeds } from '../util/defaults';


export function htmlWikiEmbeds(opts: Partial<WikiRefsOptions>): HtmlExtension {
  const fullOpts: DefaultsWikiRefs & DefaultsWikiEmbeds = merge(defaultsWikiRefs(), defaultsWikiEmbeds(), opts);

  // note: enter/exit keys should match a token name
  return {
    enter: {
      wikiEmbed: enterWikiEmbed,
    },
    exit: {
      wikiEmbedFileNameTxt: exitFileNameTxt,
      wikiEmbed: exitWikiEmbed,
    }
  };

  function enterWikiEmbed (this: CompileContext): void {
    let stack: WikiEmbedData[] = this.getData('WikiEmbedStack') as unknown as WikiEmbedData[];
    if (!stack) this.setData('WikiEmbedStack', (stack = []));
    stack.push({} as WikiEmbedData);
  }

  function exitFileNameTxt (this: CompileContext, token: Token): void {
    const filename: string = this.sliceSerialize(token);
    const stack: WikiEmbedData[] = this.getData('WikiEmbedStack') as unknown as WikiEmbedData[];
    const current: WikiEmbedData = top(stack);
    current.filename = filename;
    if (fullOpts.resolveDocType) {
      const resolvedDocType: string | undefined = fullOpts.resolveDocType(filename);
      current.doctype = resolvedDocType ? resolvedDocType : '';
    }
  }

  // an element like this should be built:

  // markdown embeds:
  // 
  // <p>
  // <div class="embed-wrapper">
  //   <div class="embed-title">
  //     <a class="wiki embed doctype__doctype" href="/tests/fixtures/embed-doc" data-href="/tests/fixtures/embed-doc">
  //       embedded document
  //     </a>
  //   </div>
  //   <div class="embed-link">
  //     <a href="/tests/fixtures/embed-doc" data-href="/tests/fixtures/embed-doc">
  //       <i class="link-icon"></i>
  //     </a>
  //   </div>
  //   <div class="embed-content">
  //     <p>Here is some content.</p>
  //   </div>
  // </div>
  // </p>

  // media embeds (audio, img, video):

  // audio:
  // 
  // <p>
  //  <span class="embed-media" src="audio.mp3" alt="audio.mp3">
  //    <audio class="embed-audio" controls src="/tests/fixtures/audio.mp3"></audio>
  //  </span>
  // </p>

  // image:
  // 
  // <p>
  //  <span class="embed-media" src="image.png" alt="image.png">
  //    <img class="embed-image" src="/tests/fixtures/image.png">
  //  </span>
  // </p>

  // video:
  // 
  // <p>
  //  <span class="embed-media" src="video.mp4" alt="video.mp4">
  //    <video class="embed-audio" controls src="/tests/fixtures/video.mp4"></video>
  //  </span>
  // </p>

  function exitWikiEmbed (this: CompileContext): void {
    const wikiEmbed: WikiEmbedData | undefined = (this.getData('WikiEmbedStack') as unknown as WikiEmbedData[]).pop();
    assert((wikiEmbed !== undefined), 'in exitWikiEmbed(): problem with \'WikiEmbedData\'');
    // init vars
    const filename: string | null = wikiEmbed.filename;
    assert((filename !== null), 'in exitWikiEmbed(): \'filename\' was null');
    const filenameSlug: string = filename.trim().toLowerCase().replace(/ /g, '-');//.replace(/[^\w-]+/g, '');
    const mediaExt: string = path.extname(filename).toLowerCase();
    const mime: string = path.extname(filename).replace('.', '').toLowerCase();
    // resolvers
    const htmlHref: string | undefined = fullOpts.resolveHtmlHref(filename);
    const htmlText: string             = (fullOpts.resolveHtmlText(filename) !== undefined) ? fullOpts.resolveHtmlText(filename) : filename;
    const doctype : string             = (fullOpts.resolveDocType && (fullOpts.resolveDocType(filename) !== undefined))          ? fullOpts.resolveDocType(filename)  : '';
    ////
    // media
    // open : wikiembed
    this.tag('<p>');
    if (wikirefs.isMedia(filename)) {
      // inner
      // audio
      if (wikirefs.CONST.EXTS.AUD.has(mediaExt)) {
        this.tag(`<span class="${fullOpts.cssNames.embedMedia}" src="${fullOpts.baseUrl + filenameSlug}" alt="${filenameSlug}">`);
        if (!htmlHref) { 
          this.tag(`<audio class="${fullOpts.cssNames.embedAudio}" controls type="audio/${mime}"></audio>`);
        } else {
          this.tag(`<audio class="${fullOpts.cssNames.embedAudio}" controls type="audio/${mime}" src="${fullOpts.baseUrl + htmlHref}"></audio>`);
        }
      // image
      } else if (wikirefs.CONST.EXTS.IMG.has(mediaExt)) {
        this.tag(`<span class="${fullOpts.cssNames.embedMedia}" src="${fullOpts.baseUrl + filenameSlug}" alt="${filenameSlug}">`);
        if (!htmlHref) {
          this.tag(`<img class="${fullOpts.cssNames.embedImage}">`);
        } else {
          this.tag(`<img class="${fullOpts.cssNames.embedImage}" src="${fullOpts.baseUrl + htmlHref}">`);
        }
      // video
      } else if (wikirefs.CONST.EXTS.VID.has(mediaExt)) {
        this.tag(`<span class="${fullOpts.cssNames.embedMedia}" src="${fullOpts.baseUrl + filenameSlug}" alt="${filenameSlug}">`);
        if (!htmlHref) {
          this.tag(`<video class="${fullOpts.cssNames.embedVideo}" controls type="video/${mime}"></video>`);
        } else {
          this.tag(`<video class="${fullOpts.cssNames.embedVideo}" controls type="video/${mime}" src="${fullOpts.baseUrl + htmlHref}"></video>`);
        }
      } else {
        // note: this is probably not technically possible (due to 'wikirefs.isMedia()' check)
        this.tag(`<span class="${fullOpts.cssNames.embedMedia} ${fullOpts.cssNames.invalid}">`);
        this.raw('media error');
      }
      // close
      this.tag('</span>');
      this.tag('</p>');
    ////
    // markdown
    } else {
      // open : wrapper
      this.tag(`<div class="${fullOpts.cssNames.embedWrapper}">`);

      // open : title
      this.tag(`<div class="${fullOpts.cssNames.embedTitle}">`);
      if (!htmlHref) {
        this.tag(`<a class="${fullOpts.cssNames.wiki} ${fullOpts.cssNames.embed} ${fullOpts.cssNames.invalid}">`);
      } else {
        // build css string
        const cssClassArray: string[] = [];
        cssClassArray.push(fullOpts.cssNames.wiki);
        cssClassArray.push(fullOpts.cssNames.embed);
        // '<doctype>'
        if (doctype.length > 0) {
          const docTypeSlug: string = doctype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          cssClassArray.push(fullOpts.cssNames.doctype + docTypeSlug);
        }
        const css: string = cssClassArray.join(' ');
        this.tag(`<a class="${css}" href="${fullOpts.baseUrl + htmlHref}" data-href="${fullOpts.baseUrl + htmlHref}">`);
      }
      // inner : title
      this.raw(htmlText);
      // close : title
      this.tag('</a>');
      this.tag('</div>');

      // open : embed link
      this.tag(`<div class="${fullOpts.cssNames.embedLink}">`);
      if (!htmlHref) {
        this.tag(`<a class="${fullOpts.cssNames.embedLinkIcon} ${fullOpts.cssNames.invalid}">`);
      } else {
        this.tag(`<a class="${fullOpts.cssNames.embedLinkIcon}" href="${fullOpts.baseUrl + htmlHref}" data-href="${fullOpts.baseUrl + htmlHref}">`);
      }
      // inner : embed link
      this.tag(`<i class="${fullOpts.cssNames.linkIcon}"></i>`);
      // close : embed link
      this.tag('</a>');
      this.tag('</div>');

      // open : embed content
      this.tag(`<div class="${fullOpts.cssNames.embedContent}">`);
      // inner : embed content
      const htmlContent: string | undefined = fullOpts.resolveEmbedContent(filename);
      if (!htmlContent) {
        this.raw(fullOpts.embeds.errorContent + '\'' + filename + '\'');
      } else {
        this.raw(htmlContent);
      }
      // close : embed content
      this.tag('</div>');
      // close : wrapper
      this.tag('</div>');

      // close : wikiembed
      this.tag('</p>');
    }
  }

  // util

  function top<T>(stack: T[]): T {
    return stack[stack.length - 1];
  }
}
