const ts = require("typescript");

/** Jest only needs this for `@awb/architecture`, which ships as TypeScript. */
module.exports = {
  process(source, filename) {
    const result = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
        jsx: filename.endsWith(".tsx") ? ts.JsxEmit.ReactJSX : ts.JsxEmit.None,
        sourceMap: true,
      },
      fileName: filename,
    });
    return {
      code: result.outputText,
      map: result.sourceMapText ? JSON.parse(result.sourceMapText) : null,
    };
  },
};
