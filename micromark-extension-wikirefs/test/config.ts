import type { TestFileData } from 'wikirefs-spec';
import { fileDataMap } from 'wikirefs-spec';

import { WikiRefsOptions } from '../src/util/types';

// mockOpts

export function makeMockOptsForRenderOnly (): Partial<WikiRefsOptions> {
  return {
    resolveHtmlText: (filename: string): (string | undefined) => {
      const fileItem: any = fileDataMap.find((fileData: TestFileData) => fileData.filename === filename);
      return fileItem?.title?.toLowerCase();
    },
    resolveHtmlHref: (filename: string): (string | undefined) => {
      const fileItem: any = fileDataMap.find((fileData: TestFileData) => fileData.filename === filename);
      return fileItem?.href;
    },
  };
}
