import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire, Module } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);

for (const name of ['YouTubeStats', 'YouTubeLatestVideos']) {
    test(`${name} renders safely without credentials or external requests`, () => {
        const file = fileURLToPath(new URL(`../app/components/${name}.tsx`, import.meta.url));
        const source = readFileSync(file, 'utf8');
        const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        const forbidden = [];
        const visit = (node) => {
            if (ts.isIdentifier(node) && ['apiKey', 'fetch', 'localStorage', 'sessionStorage'].includes(node.text)) {
                forbidden.push(node.text);
            }
            ts.forEachChild(node, visit);
        };
        visit(tree);
        assert.equal(forbidden.length, 0, 'Unavailable widget must not accept, store or transmit credentials');
        const code = ts.transpileModule(source, { compilerOptions: {
            module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
        } }).outputText;
        const compiled = new Module(file);
        compiled.filename = file;
        compiled.require = require;
        compiled._compile(code, file);
        const html = renderToStaticMarkup(React.createElement(compiled.exports[name]));
        assert.match(html, /YouTube data is unavailable/);
        assert.doesNotMatch(html, /<input|<button|Live|Loading|API Key/i);
    });
}

test('dashboard does not serialize a Google API key or credential props', () => {
    const source = readFileSync(new URL('../app/dashboard/page.tsx', import.meta.url), 'utf8');
    assert.equal(/AIza[\w-]{30,}/.test(source), false, 'Google API key literal must be absent');
    const tree = ts.createSourceFile('dashboard.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    let credentialProps = 0;
    const visit = (node) => {
        if (ts.isJsxAttribute(node) && /apiKey|token|secret/i.test(node.name.text)) credentialProps++;
        ts.forEachChild(node, visit);
    };
    visit(tree);
    assert.equal(credentialProps, 0, 'Dashboard must not pass credentials into browser props');
});
