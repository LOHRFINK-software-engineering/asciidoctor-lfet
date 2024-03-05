# Asciidoctor LFET Extension

[![Build status](https://github.com/LOHRFINK-software-engineering/asciidoctor-lfet/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/LOHRFINK-software-engineering/asciidoctor-lfet/actions/workflows/ci.yaml)
[![npm version](http://img.shields.io/npm/v/asciidoctor-lfet.svg)](https://www.npmjs.com/package/asciidoctor-lfet)

A set of macros for [Asciidoctor.js](https://github.com/asciidoctor/asciidoctor.js) to integrate [lohrfink decision tables](https://www.lohrfink.de/de/startseite/) in your AsciiDoc based documentation!

## Install

### Node.js

Install the dependencies:

```shell
npm i asciidoctor asciidoctor-lfet
```

Create a file named lfet.js with following content and run it:

```javascript
const asciidoctor = require('@asciidoctor/core')()
const lfet = require('asciidoctor-lfet')

const input = 'dt::smallestDecisionTable.lfet[]'

lfet.register(asciidoctor.Extensions) // <1>
console.log(asciidoctor.convert(input, { safe: 'safe' }))

const registry = asciidoctor.Extensions.create()
lfet.register(registry) // <2>
console.log(asciidoctor.convert(input, { safe: 'safe', extension_registry: registry }))
```
**<1>** Register the extension in the global registry

**<2>** Register the extension in a dedicated registry

## Block macro

### Antora

#### AsciiDoc source

```asciidoc
dt::example$smallestDecisionTable.lfet[]
```

#### AsciiDoc generated

|       |               | R01   | R02   |
|-------|---------------|-------|-------|
|C01    | Condition 1   | Y     | N     |
|A01    | Action 1      | X     | -     |
|A02    | Action 2      | -     | X     |
