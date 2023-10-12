import { attrboxDataNode } from './astNode-attrbox-data';
import { attrboxNode } from './astNode-attrbox';

import { TestCaseMdastBuilder } from '../types';


export const mdastAttrBoxCases: TestCaseMdastBuilder[] = [
  {
    descr: 'attrbox; single',
    inNodes: [attrboxDataNode['single']],
    outNode: attrboxNode['single'],
  },
  {
    descr: 'attrbox; list',
    inNodes: [attrboxDataNode['list']],
    outNode: attrboxNode['list'],
  },
  {
    descr: 'attrbox; merged',
    inNodes: [
      attrboxDataNode['merge-1a'],
      attrboxDataNode['merge-1b'],
      attrboxDataNode['merge-2c']
    ],
    outNode: attrboxNode['merged'],
  },
];
