import type { WikiEmbedData } from 'micromark-extension-wikirefs';
import type {
  EmbedMediaAudioNode,
  EmbedMediaImageNode,
  EmbedMediaSpanNode,
  EmbedMediaVideoNode,
  EmbedMkdnTitleNode,
  EmbedMkdnLinkNode,
  EmbedMkdnContentNode,
  EmbedMkdnWrapperNode,
  WikiEmbedNode,
} from '../../src/util/types';


// mkdn

export const embedMarkDownNodeSingle: WikiEmbedNode = {
  type: 'wikiembed',
  data: {
    item: {
      doctype: '',
      filename: 'embed-doc',
    } as WikiEmbedData,
    hName: 'p',
  },
  children: [{
    type: 'embed-mkdn-wrapper',
    data: {
      hName: 'div',
      hProperties: {
        className: ['embed-wrapper']
      }
    },
    children: [
      {
        type: 'embed-mkdn-title',
        data: {
          hName: 'div',
          hProperties: {
            className: ['embed-title']
          }
        },
        children: [{
          type: 'a',
          data: {
            hName: 'a',
            hProperties: {
              className: ['wiki', 'embed'],
              dataHref: '/tests/fixtures/embed-doc',
              href: '/tests/fixtures/embed-doc',
            }
          },
          children: [{
            type: 'text',
            value: 'embedded document',
          }]
        }],
      } as EmbedMkdnTitleNode,
      {
        type: 'embed-mkdn-link',
        data: {
          hName: 'div',
          hProperties: {
            className: ['embed-link']
          }
        },
        children: [{
          type: 'a',
          data: {
            hName: 'a',
            hProperties: {
              className: ['embed-link-icon'],
              dataHref: '/tests/fixtures/embed-doc',
              href: '/tests/fixtures/embed-doc',
            }
          },
          children: [{
            type: 'i',
            data: {
              hName: 'i',
              hProperties: {
                className: ['link-icon'],
              }
            }
          }],
        }],
      } as EmbedMkdnLinkNode,
      {
        type: 'embed-mkdn-content',
        data: {
          hName: 'div',
          hProperties: {
            className: ['embed-content']
          }
        },
        children: [{
          type: 'root',
          position: {
            start: { column: 1, line: 1, offset: 0 },
            end: { column: 22, line: 1, offset: 21 },
          },
          children: [{
            type: 'paragraph',
            position: {
              start: { column: 1, line: 1, offset: 0 },
              end: { column: 22, line: 1, offset: 21 },
            },
            children: [{
              type: 'text',
              value: 'Here is some content.',
              position: {
                start: { column: 1, line: 1, offset: 0 },
                end: { column: 22, line: 1, offset: 21 },
              },
            }]
          }],
        }],
      } as EmbedMkdnContentNode,
    ],
  } as EmbedMkdnWrapperNode],
};

export const embedInvalidMarkDownNodeSingle: WikiEmbedNode = {
  type: 'wikiembed',
  data: {
    item: {
      doctype: '',
      filename: 'invalid.abc',
    } as WikiEmbedData,
    hName: 'p',
  },
  children: [{
    type: 'embed-mkdn-wrapper',
    data: {
      hName: 'div',
      hProperties: {
        className: ['embed-wrapper']
      }
    },
    children: [
      {
        type: 'embed-mkdn-title',
        data: {
          hName: 'div',
          hProperties: {
            className: ['embed-title']
          }
        },
        children: [{
          type: 'a',
          data: {
            hName: 'a',
            hProperties: {
              className: ['wiki', 'embed'],
              dataHref: '/tests/fixtures/invalid.abc',
              href: '/tests/fixtures/invalid.abc',
            }
          },
          children: [{
            type: 'text',
            value: 'invalid.abc',
          }]
        }],
      } as EmbedMkdnTitleNode,
      {
        type: 'embed-mkdn-link',
        data: {
          hName: 'div',
          hProperties: {
            className: ['embed-link']
          }
        },
        children: [{
          type: 'a',
          data: {
            hName: 'a',
            hProperties: {
              className: ['embed-link-icon'],
              dataHref: '/tests/fixtures/invalid.abc',
              href: '/tests/fixtures/invalid.abc',
            }
          },
          children: [{
            type: 'i',
            data: {
              hName: 'i',
              hProperties: {
                className: ['link-icon'],
              }
            },
          }],
        }],
      } as EmbedMkdnLinkNode,
      {
        type: 'embed-mkdn-content',
        data: {
          hName: 'div',
          hProperties: {
            className: ['embed-content']
          }
        },
        children: [{
          type: 'text',
          value: 'Error: Content not found for \'invalid.abc\'',
        }],
      } as EmbedMkdnContentNode,
    ],
  } as EmbedMkdnWrapperNode],
};

// media

export const embedMediaAudioNodeSingle: WikiEmbedNode = {
  type: 'wikiembed',
  data: {
    item: {
      doctype: '',
      filename: 'audio.mp3',
    } as WikiEmbedData,
    hName: 'p',
  },
  children: [{
    type: 'embed-media-span',
    data: {
      hName: 'span',
      hProperties: {
        className: ['embed-media'],
        src: 'audio.mp3',
        alt: 'audio.mp3',
      }
    },
    children: [{
      type: 'embed-media-audio',
      data: {
        hName: 'audio',
        hProperties: {
          controls: true,
          className: ['embed-audio'],
          src: '/tests/fixtures/audio.mp3',
          type: 'audio/mp3',
        }
      }
    } as EmbedMediaAudioNode],
  } as EmbedMediaSpanNode],
};

export const embedMediaImageNodeSingle: WikiEmbedNode = {
  type: 'wikiembed',
  data: {
    item: {
      doctype: '',
      filename: 'image.png',
    } as WikiEmbedData,
    hName: 'p',
  },
  children: [{
    type: 'embed-media-span',
    data: {
      hName: 'span',
      hProperties: {
        className: ['embed-media'],
        src: 'image.png',
        alt: 'image.png',
      }
    },
    children: [{
      type: 'embed-media-image',
      data: {
        hName: 'img',
        hProperties: {
          className: ['embed-image'],
          src: '/tests/fixtures/image.png',
        }
      }
    } as EmbedMediaImageNode]
  } as EmbedMediaSpanNode],
};

export const embedMediaVideoNodeSingle: WikiEmbedNode = {
  type: 'wikiembed',
  data: {
    item: {
      doctype: '',
      filename: 'video.mp4',
    } as WikiEmbedData,
    hName: 'p',
  },
  children: [{
    type: 'embed-media-span',
    data: {
      hName: 'span',
      hProperties: {
        className: ['embed-media'],
        src: 'video.mp4',
        alt: 'video.mp4',
      }
    },
    children: [{
      type: 'embed-media-video',
      data: {
        hName: 'video',
        hProperties: {
          controls: true,
          className: ['embed-video'],
          src: '/tests/fixtures/video.mp4',
          type: 'video/mp4',
        }
      }
    } as EmbedMediaVideoNode],
  } as EmbedMediaSpanNode],
};

export const embedNode = {
  mkdn: embedMarkDownNodeSingle,
  invalid: embedInvalidMarkDownNodeSingle,
  audio: embedMediaAudioNodeSingle,
  image: embedMediaImageNodeSingle,
  video: embedMediaVideoNodeSingle,
};
