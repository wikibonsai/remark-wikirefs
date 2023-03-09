import path from 'path';
import { merge } from 'lodash-es';
import * as wikirefs from 'wikirefs';

import type { Extension } from 'mdast-util-from-markdown';
import type { Token } from 'micromark-util-types';
import type {
  OptCssNames,
  WikiRefsOptions,
  WikiEmbedData,
  OptEmbed,
} from 'micromark-extension-wikirefs';

import type { WikiEmbedNode } from '../util/types';


// required options
interface ReqOpts {
  resolveHtmlText: (fname: string) => string | undefined;
  resolveHtmlHref: (fname: string) => string | undefined;
  resolveEmbedContent: (fname: string) => any;
  resolveDocType?: (fname: string) => string | undefined;
  baseUrl: string;
  embeds: OptEmbed;
  cssNames: OptCssNames;
}

export function fromMarkdownWikiEmbeds(this: any, opts?: Partial<WikiRefsOptions>): Extension {
  // opts
  const defaults: ReqOpts = {
    resolveHtmlHref: (fname: string) => {
      const extname: string = wikirefs.isMedia(fname) ? path.extname(fname) : '';
      fname = fname.replace(extname, '');
      return '/' + fname.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + extname;
    },
    resolveHtmlText: (fname: string) => fname.replace(/-/g, ' '),
    resolveEmbedContent: (fname: string) => fname + ' embed content',
    baseUrl: '',
    embeds: {
      enable: true,
      title: 'Embed Content',
      errorContent: 'Error: Content not found for ',
    },
    cssNames: {
      // wiki
      wiki: 'wiki',
      invalid: 'invalid',
      // kinds
      attr: 'attr',
      link: 'link',
      type: 'type',
      embed: 'embed',
      reftype: 'reftype__',
      doctype: 'doctype__',
      // embed
      embedWrapper: 'embed-wrapper',
      embedTitle: 'embed-title',
      embedLink: 'embed-link',
      embedContent: 'embed-content',
      embedLinkIcon: 'embed-link-icon',
      linkIcon: 'link-icon',
      embedMedia: 'embed-media',
      embedAudio: 'embed-audio',
      embedDoc: 'embed-doc',
      embedImage: 'embed-image',
      embedVideo: 'embed-video',
    } as OptCssNames,
  };
  const fullOpts: ReqOpts = merge(defaults, opts);

  // note: enter/exit keys should match a token name
  return {
    enter: {
      wikiEmbed: enterWikiEmbed,
    },
    exit: {
      wikiEmbedFileNameTxt: exitFileNameTxt,
      wikiEmbed: exitWikiEmbed,
    }
  } as Extension;

  function enterWikiEmbed (this: any, token: Token) {
    const startWikiEmbedNode: WikiEmbedNode = {
      type: 'wikiembed',
      children: [],
      data: {
        item: {
          doctype: '',
          filename: '',
        } as WikiEmbedData,
        hName: 'p',
      }
    };
    // is accessible via 'this.stack' (see below)
    this.enter(startWikiEmbedNode, token);
  }

  function exitFileNameTxt (this: any, token: Token) {
    const filename: string = this.sliceSerialize(token);
    const current: WikiEmbedNode = top(this.stack);
    current.data.item.filename = filename;
  }

  // hProperties are meant to build an element like this:
  // 
  // markdown embeds:
  // 
  // <p>
  // <div class="embed-wrapper">
  //   <div class="embed-title">
  //     <a class="wikilink embed doctype" href="/tests/fixtures/embed-doc" data-href="/tests/fixtures/embed-doc">
  //       embedded document
  //     </a>
  //   </div>
  //   <div class="embed-link">
  //     <a class="embed-link-icon" href="/tests/fixtures/embed-doc" data-href="/tests/fixtures/embed-doc">
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
  //  <span class="embed-media embed-audio" src="audio.mp3" alt="audio.mp3">
  //    <audio controls src="/tests/fixtures/audio.mp3"></audio>
  //  </span>
  // </p>

  // image:
  // 
  // <p>
  //  <span class="embed-media embed-image" src="image.png" alt="image.png">
  //    <img src="/tests/fixtures/image.png">
  //  </span>
  // </p>

  // video:
  // 
  // <p>
  //  <span class="embed-media embed-audio" src="video.mp4" alt="video.mp4">
  //    <video controls src="/tests/fixtures/video.mp4"></video>
  //  </span>
  // </p>

  // rehype properties:
  // https://github.com/rehypejs/rehype
  // https://github.com/syntax-tree/mdast-util-to-hast

  function exitWikiEmbed (this: any, token: Token) {
    const wikiEmbed: WikiEmbedNode = this.exit(token);

    const filename: string | null = wikiEmbed.data.item.filename;
    const filenameSlug: string = filename.trim().toLowerCase().replace(/ /g, '-');//.replace(/[^\w-]+/g, '');
    const mediaExt: string = path.extname(filename).toLowerCase();
    const mime: string = path.extname(filename).replace('.', '').toLowerCase();

    const htmlHref: string | undefined = fullOpts.resolveHtmlHref(filename);
    const htmlText: string | undefined = fullOpts.resolveHtmlText(filename) ? fullOpts.resolveHtmlText(filename) : filename;
    const doctype : string | undefined = fullOpts.resolveDocType            ? fullOpts.resolveDocType(filename)  : '';

    ////
    // media
    if (wikirefs.isMedia(filename)) {
      wikiEmbed.children.push({
        type: 'embed-media-span',
        children: [],
        data: {
          hName: 'span',
          hProperties: {
            className: [
              fullOpts.cssNames.embedMedia,
            ],
            src: filenameSlug,
            alt: filenameSlug,
          },
        },
      });
      // audio
      if (wikirefs.CONST.EXTS.AUD.has(mediaExt)) {
        wikiEmbed.children[0].children.push({
          type: 'embed-media-audio',
          data: {
            hName: 'audio',
            hProperties: {
              className: [fullOpts.cssNames.embedAudio],
              controls: true,
              type: `audio/${mime}`,
              // src: if 'htmlHref' exists, add below...
            },
          }
        });
      // image
      } else if (wikirefs.CONST.EXTS.IMG.has(mediaExt)) {
        wikiEmbed.children[0].children.push({
          type: 'embed-media-image',
          data: {
            hName: 'img',
            hProperties: {
              className: [fullOpts.cssNames.embedImage],
              // src: if 'htmlHref' exists, add below...
            },
          }
        });
      // video
      } else if (wikirefs.CONST.EXTS.VID.has(mediaExt)) {
        wikiEmbed.children[0].children.push({
          type: 'embed-media-video',
          data: {
            hName: 'video',
            hProperties: {
              className: [fullOpts.cssNames.embedVideo],
              controls: true,
              type: `video/${mime}`,
              // src: if 'htmlHref' exists, add below...
            },
          }
        });
      // invalid ()
      // note: this is probably not technically possible (due to 'wikirefs.isMedia()' check)
      } else {
        wikiEmbed.children[0].data.hProperties.className.push(fullOpts.cssNames.invalid);
        wikiEmbed.children[0].children.push({
          type: 'text',
          value: 'media error',
        });
      }
      if (htmlHref) {
        wikiEmbed.children[0].children[0].data.hProperties.src = fullOpts.baseUrl + htmlHref;
      }
    ////
    // markdown
    } else {
      // embed mkdn wrapper
      wikiEmbed.children.push({
        type: 'embed-mkdn-wrapper',
        children: [],
        data: {
          hName: 'div',
          hProperties: {
            className: [fullOpts.cssNames.embedWrapper],
          },
        },
      });
      // title
      wikiEmbed.children[0].children.push({
        type: 'embed-mkdn-title',
        children: [],
        data: {
          hName: 'div',
          hProperties: {
            className: [fullOpts.cssNames.embedTitle],
          },
        }
      });
      wikiEmbed.children[0].children[0].children.push({
        type: 'a',
        children: [{
          type: 'text',
          value: htmlText,
        }],
        data: {
          hName: 'a',
          hProperties: {
            className: [
              // add below based on 'htmlhref'...
            ],
            // href: if 'htmlHref' exists, add below...
            // dataHref: if 'htmlHref' exists, add below...
          },
        },
      });
      // build css string
      const cssClassArray: string[] = [];
      cssClassArray.push(fullOpts.cssNames.wiki);
      cssClassArray.push(fullOpts.cssNames.embed);
      if (!htmlHref) {
        cssClassArray.push(fullOpts.cssNames.invalid);
      } else {
        // '<doctype>'
        if ((doctype !== null) && (doctype !== undefined) && (doctype.length !== 0)) {
          const docTypeSlug: string = doctype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          cssClassArray.push(fullOpts.cssNames.doctype + docTypeSlug);
        }
        // handle href if it exists
        wikiEmbed.children[0].children[0].children[0].data.hProperties.href     = fullOpts.baseUrl + htmlHref;
        wikiEmbed.children[0].children[0].children[0].data.hProperties.dataHref = fullOpts.baseUrl + htmlHref;
      }
      wikiEmbed.children[0].children[0].children[0].data.hProperties.className  = cssClassArray;
      // link
      wikiEmbed.children[0].children.push({
        type: 'embed-mkdn-link',
        children: [],
        data: {
          hName: 'div',
          hProperties: {
            className: [fullOpts.cssNames.embedLink],
          },
        }
      });
      wikiEmbed.children[0].children[1].children.push({
        type: 'a',
        children: [{
          type: 'i',
          data: {
            hName: 'i',
            hProperties: {
              className: [fullOpts.cssNames.linkIcon],
            }
          }
        }],
        data: {
          hName: 'a',
          hProperties: {
            className: [fullOpts.cssNames.embedLinkIcon],
          },
        },
      });
      if (!htmlHref) {
        wikiEmbed.children[0].children[1].children[0].data.hProperties.className.push(fullOpts.cssNames.invalid);
      } else {
        wikiEmbed.children[0].children[1].children[0].data.hProperties.href      = fullOpts.baseUrl + htmlHref;
        wikiEmbed.children[0].children[1].children[0].data.hProperties.dataHref  = fullOpts.baseUrl + htmlHref;
      }
      // content
      wikiEmbed.children[0].children.push({
        type: 'embed-mkdn-content',
        children: [],
        data: {
          hName: 'div',
          hProperties: {
            className: [fullOpts.cssNames.embedContent],
          },
        }
      });
      // embed content
      if (fullOpts.resolveEmbedContent) {
        const htmlContent: string | undefined = fullOpts.resolveEmbedContent(filename);
        if (!htmlContent) {
          wikiEmbed.children[0].children[2].children = [{
            type: 'text',
            value: fullOpts.embeds.errorContent + '\'' + filename + '\''
          }];
        } else {
          wikiEmbed.children[0].children[2].children = [htmlContent];
        }
      }
    }
  }

  // util

  function top<T>(stack: T[]): T {
    return stack[stack.length - 1];
  }
}
