import { embedNode } from './astNode-wikiembed';

import { TestCaseMdast } from '../types';


export const mdastWikiEmbedCases: TestCaseMdast[] = [
  // markdown
  // single
  {
    descr: 'wikiembed; markdown; single',
    mkdn: '![[embed-doc]]',
    node: embedNode['mkdn'],
    opts: {},
  },
  {
    descr: 'wikiembed; markdown; single; invalid',
    mkdn: '![[invalid.abc]]',
    node: embedNode['invalid'],
    opts: {},
  },
  // media
  // audio
  {
    descr: 'wikiembed; audio; single',
    mkdn: '![[audio.mp3]]',
    node: embedNode['audio'],
    opts: {},
  },
  // image
  {
    descr: 'wikiembed; image; single',
    mkdn: '![[image.png]]',
    node: embedNode['image'],
    opts: {},
  },
  // video
  {
    descr: 'wikiembed; video; single',
    mkdn: '![[video.mp4]]',
    node: embedNode['video'],
    opts: {},
  },
];
