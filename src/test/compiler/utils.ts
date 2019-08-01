import { TraxError } from './../../trax/compiler/types';

export function formatError(err, addLastLine = true) {
    let e = err as TraxError;
    if (err.kind === "#Error") {
        let ls = "\n        ";
        return `${ls}    ${e.origin}: ${e.message}`
            + `${ls}    File: ${e.file} - Line ${e.line} / Col ${e.column}`
            + `${ls}    Extract: >> ${e.lineExtract} <<`
            + `${addLastLine ? ls : ""}`;
    }
    return "Non Trax Error: " + (err.message || err);
}