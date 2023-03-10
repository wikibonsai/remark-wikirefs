import path from 'path';
import { merge } from 'lodash-es';
import * as wikirefs from 'wikirefs';
import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
import { Node } from 'mdast-util-from-markdown/lib';
import type { Token } from 'micromark-util-types';
import type {
  DefaultsWikiRefs,
  DefaultsWikiEmbeds,
  WikiRefsOptions,
  WikiEmbedData,
} from 'micromark-extension-wikirefs';

import { defaultsWikiRefs, defaultsWikiEmbeds } from 'micromark-extension-wikirefs';

import type { WikiEmbedNode } from '../util/types';


export function fromMarkdownWikiEmbeds(opts?: Partial<WikiRefsOptions>): FromMarkdownExtension {
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
  } as FromMarkdownExtension;

  function enterWikiEmbed (this: CompileContext, token: Token): void {
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
    this.enter(startWikiEmbedNode as WikiEmbedNode as unknown as Node, token);
  }

  function exitFileNameTxt (this: CompileContext, token: Token): void {
    const filename: string = this.sliceSerialize(token);
    const current: WikiEmbedNode = top(this.stack as Node[] as unknown as WikiEmbedNode[]);
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

  function exitWikiEmbed (this: CompileContext, token: Token): void {
    const wikiEmbed: WikiEmbedNode = this.exit(token)  as Node as unknown as WikiEmbedNode;
    // init vars
    const filename: string | null = wikiEmbed.data.item.filename;
    const filenameSlug: string = filename.trim().toLowerCase().replace(/ /g, '-');//.replace(/[^\w-]+/g, '');
    const mediaExt: string = path.extname(filename).toLowerCase();
    const mime: string = path.extname(filename).replace('.', '').toLowerCase();
    // resolvers
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
        const htmlContent: string | any | undefined = fullOpts.resolveEmbedContent(filename);
        // todo: 'fullOpts.embeds.format' option
        // if (fullOpts.embeds.format === 'string') {
        //   // for raw string
        //   wikiEmbed.children[0].children[2].children = [{
        //     type: 'text',
        //     value: (htmlContent !== undefined)
        //       ? htmlContent
        //       : fullOpts.embeds.errorContent + '\'' + filename + '\'',
        //   }];
        // }
        // if (fullOpts.embeds.format === 'mdast-node') {
        //   // for mdast node
        wikiEmbed.children[0].children[2].children = (htmlContent !== undefined)
          ? [htmlContent]
          : [{
            type: 'text',
            value: fullOpts.embeds.errorContent + '\'' + filename + '\'',
          }];
        // }
      }
    }
  }

  // util

  function top<T>(stack: T[]): T {
    return stack[stack.length - 1];
  }
}
