export let warningIssued: boolean = false;

export function remarkV13Warning(context: any): boolean {
  if (
    !warningIssued &&
    ((context.Parser &&
      context.Parser.prototype &&
      context.Parser.prototype.blockTokenizers) ||
      (context.Compiler &&
        context.Compiler.prototype &&
        context.Compiler.prototype.visitors))
  ) {
    warningIssued = true;
    console.warn(
      '[remark-wikirefs] Warning: please upgrade to remark 13 to use this plugin'
    );
  }
  return warningIssued;
}

// todo: 'remark-parse` v10+
