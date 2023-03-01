// // todo: add test to illustrate that metadata will be called regardless if 'filenameToHREF'/'filenametoHTMLContent' found anything.
// import assert from 'node:assert/strict';
// var sinon = require("sinon");

// import micromark from "micromark/lib";

// import { WikiRefsOptions } from '../src/types';
// import { syntaxWikiRefs, htmlWikiRefs } from '../src';

// import { makeMockOptsForRenderOnly } from './test-config';


// var mockOpts: any;
// var fakeFileOpts: any;
// var fakeAddAttribute: any;
// var fakeAddLink: any;
// var fakeGetFilenameFromEnv: any;

// describe('wikirefs with metadata', function () {

//   beforeEach(() => {
//     function mockFlush() {};
//     function mockAddAttribute() {};
//     function mockAddLink() {};
//     mockOpts = {
//       filenameToHTMLContent: () => 'Root',
//       filenameToHREF: () => '/root',
//       getFilenameFromEnv: () => 'root',
//       fileOpts: mockFlush,
//       addAttribute: mockAddAttribute,
//       addLink: mockAddLink,
//     };
//     fakeFileOpts = sinon.replace(mockOpts, "fileOpts", sinon.fake.returns());
//     fakeAddAttribute = sinon.replace(mockOpts, "addAttribute", sinon.fake.returns());
//     fakeAddLink = sinon.replace(mockOpts, "addLink", sinon.fake.returns());
//   });

//   it('inline untyped; basic', () => {
//     micromark('[[blank.a]].', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeAddLink.called, true);
//     assert.deepStrictEqual(fakeAddLink.getCall(0).args, ['', 'root', 'blank.a']);
//   });

//   it('inline typed; basic', () => {
//     micromark(':linktype::[[blank.a]].', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeAddLink.called, true);
//     assert.deepStrictEqual(fakeAddLink.getCall(0).args, ['linktype', 'root', 'blank.a']);
//   });

//   it('block single; basic', () => {
//     micromark('linktype::[[blank.a]]\n', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeAddAttribute.called, true);
//     assert.deepStrictEqual(fakeAddAttribute.getCall(0).args, ['linktype', 'root', 'blank.a']);
//   });

//   it('block multi-link; basic', () => {
//     micromark('linktype::[[blank.a]],[[blank.b]],[[blank.c]]\n', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeAddAttribute.called, true);
//     assert.deepStrictEqual(fakeAddAttribute.getCall(0).args, ['linktype', 'root', 'blank.a']);
//     assert.deepStrictEqual(fakeAddAttribute.getCall(1).args, ['linktype', 'root', 'blank.b']);
//     assert.deepStrictEqual(fakeAddAttribute.getCall(2).args, ['linktype', 'root', 'blank.c']);
//   });

//   it('block multi-type, multi-link; basic', () => {
//     micromark('linktype1::[[blank.a]],[[blank.b]],[[blank.c]]\nlinktype2::\n- [[blank.a]]\n- [[blank.b]]\n- [[blank.c]]\n', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     // first round
//     assert.deepStrictEqual(fakeAddAttribute.getCall(0).args, ['linktype1', 'root', 'blank.a']);
//     assert.deepStrictEqual(fakeAddAttribute.getCall(1).args, ['linktype1', 'root', 'blank.b']);
//     assert.deepStrictEqual(fakeAddAttribute.getCall(2).args, ['linktype1', 'root', 'blank.c']);
//     // second round
//     assert.deepStrictEqual(fakeAddAttribute.getCall(3).args, ['linktype2', 'root', 'blank.a']);
//     assert.deepStrictEqual(fakeAddAttribute.getCall(4).args, ['linktype2', 'root', 'blank.b']);
//     assert.deepStrictEqual(fakeAddAttribute.getCall(5).args, ['linktype2', 'root', 'blank.c']);
//   });

//   it('flush before renders', () => {
//     // first round //
//     micromark('[[blank.b]].', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeFileOpts.called, true);
//     assert.strictEqual(fakeAddLink.called, true);
//     assert.deepStrictEqual(fakeAddLink.getCall(0).args, ['', 'root', 'blank.b']);
//     assert.strictEqual(fakeFileOpts.calledBefore(fakeAddLink), true);

//     // second round //
//     micromark('[[blank.a]].', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeFileOpts.called, true);
//     assert.deepStrictEqual(fakeAddLink.getCall(1).args, ['', 'root', 'blank.a']);
//     assert.strictEqual(fakeFileOpts.calledBefore(fakeAddLink), true);
//   });

// });

// describe('wikilinks without metadata', () => {

//   beforeEach(() => {
//     mockOpts = {
//       filenameToHTMLContent: () => 'Root',
//       filenameToHREF: () => '/root',
//       getFilenameFromEnv: () => 'root',
//     };
//     fakeGetFilenameFromEnv = sinon.replace(mockOpts, "getFilenameFromEnv", sinon.fake.returns());
//     // md = markdown().use(wikilinks, mockOpts);
//     // env = { absPath: '/tests/fixtures/root.md' };
//   });

//   it('inline untyped; basic', () => {
//     micromark('[[blank.a]].', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeGetFilenameFromEnv.called, false);
//   });

//   it('inline typed; basic', () => {
//     micromark(':linktype::[[blank.a]].', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeGetFilenameFromEnv.called, false);
//   });

//   it('block single; basic', () => {
//     micromark('linktype::[[blank.a]]\n', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeGetFilenameFromEnv.called, false);
//   });

//   it('block multi-link; basic', () => {
//     micromark('linktype::[[blank.a]],[[blank.b]],[[blank.c]]\n', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeGetFilenameFromEnv.called, false);
//   });

//   it('block multi-type, multi-link; basic', () => {
//     micromark('linktype1::[[blank.a]],[[blank.b]],[[blank.c]]\nlinktype2::\n- [[blank.a]]\n- [[blank.b]]\n- [[blank.c]]\n', {
//       extensions: [syntaxWikiRefs(mockOpts)],
//       htmlExtensions: [htmlWikiRefs()]
//     });
//     assert.strictEqual(fakeGetFilenameFromEnv.called, false);
//   });

// });
