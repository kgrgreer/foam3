// Something is destroying the String.fromCharCode method, so
// it needs to be kept safe up here. Yes; this really happened.
global.fromCharCode = String.fromCharCode;

const util = require('util');
var fs = require('fs');
// Next 28 lines copied from liquid_journal_script.js
var npRoot = __dirname + '/../';

global.FOAM_FLAGS = {
  js: true,
  web: true,
  node: true,
  java: true,
  swift: true,
};

require(npRoot + 'foam3/src/foam.js');
require(npRoot + 'foam3/src/foam/nanos/nanos.js');
require(npRoot + 'foam3/src/foam/support/support.js');

var classloader = foam.__context__.classloader;
[
  npRoot + 'nanopay/src',
].forEach(classloader.addClassPath.bind(classloader));

var old = global.FOAM_FLAGS.src;
var oldRoot = global.FOAM_ROOT;
global.FOAM_FLAGS.src = npRoot + 'nanopay/src/'; // Hacky
require(npRoot + 'nanopay/src/net/nanopay/files.js');
// require(npRoot + 'nanopay/src/net/nanopay/iso20022/files.js');
require(npRoot + 'nanopay/src/net/nanopay/iso8583/files.js');
require(npRoot + 'nanopay/src/net/nanopay/flinks/utils/files.js');
global.FOAM_FLAGS.src = old;
global.FOAM_ROOT = oldRoot;

// Not ideal; for hack to access requires from grammar
global.globalThis = {};

var HELP_TEXT = `Journal Prettify (journal formatting tool)

This script rewrites the specified journal and ensures multiline
formatting is used.

Usage:
  journal_prettify.js <FILE>

Example:
  node ./tools/journal_prettify.js ./nanopay/src/services.jrl
`;

// TODO: replace with parser primitives
foam.CLASS({
  package: 'net.nanopay.toolsfolder',
  name: 'UntilEscaped',
  extends: 'foam.parse.ParserDecorator',

  documentation: `Matches any characters until the terminating pattern,
    unless terminating pattern has a leading escape pattern.
    Consumes and discards the terminating pattern when found.  Fails if termination was never found.`,

  properties: [
    {
      name: 'esc',
      class: 'foam.parse.ParserProperty',
      final: true
    },
    {
      name: 'term',
      class: 'foam.parse.ParserProperty',
      final: true
    }
  ],

  methods: [
    function parse(ps, obj) {
      var ret = [];
      var esc = this.esc;
      var term = this.term;

      while ( ps.valid ) {
        var res;

        if ( res = ps.apply(esc, obj) ) {
          ret.push(res.value);
          ps = res;
          continue;
        }

        if ( res = ps.apply(term, obj) ) {
          return res.setValue(ret);
        }

        ret.push(ps.head);
        ps = ps.tail;
      }
      return undefined;
    },

    function toString() {
      return 'untilEscaped(' + this.SUPER() + ')';
    }
  ]
});

// TODO: Move to foam.parse package
foam.CLASS({
  package: 'net.nanopay.toolsfolder',
  name: 'Implied',

  documentation: `Returns a value without affecting the
    parser state.`,

  properties: [
    {
      name: 'value',
    }
  ],

  methods: [
    function parse(ps) {
      return ps.setValue(this.value);
    },

    function toString() { return 'implied(' + this.SUPER() + ')'; }
  ]
});


foam.LIB({
    name: 'local',
    methods: [
        function chrRange (first, last) {
            var n = last.charCodeAt() + 1 - first.charCodeAt();
            return Array.from(Array(n).keys()).map(
                v => global.fromCharCode(first.charCodeAt()+v))
                .join('');
        }
    ]
});


foam.CLASS({
    package: 'net.nanopay.toolsfolder',
    name: 'RawJournal',
    requires: [
        'net.nanopay.toolsfolder.UntilEscaped',
        'net.nanopay.toolsfolder.Implied'
    ],
    properties: [
        {
            class: 'String',
            name: 'text'
        },
        {
            class: 'Object',
            name: 'result'
        }
    ],
    methods: [
        function init() {
            globalThis = this;
        },

        function testParse () {
            this.journal.parseString(this.text, this.cls_.id);
        },

        function combine(v) {
            vNew = [v[0]];
            if (v.length > 1) {
                vNew = vNew.concat(v[1]);
            }
            return vNew;
        },
    ],
    grammars: [
        {
            name: 'journal',
            symbols: function() {

                var validSymbolStart =
                    local.chrRange('a','z') + local.chrRange('A','Z') + '_';
                var validSymbol = validSymbolStart + local.chrRange('0','9');
                return {
                    "net.nanopay.toolsfolder.RawJournal": seq(
                        repeat(alt(
                            sym('method'),
                            sym('comment'))),
                        eof()),
                    'method': seq1(1, sym('ws'),
                        seq(
                            sym('operation'),
                            seq1(1, '(', sym('json-value'), ')', optional(';')),
                        ),
                        sym('ws')),
                    'operation': chars("pr"),
                    'comment': seq0('//', join(until('\n'))),

                    // https://www.json.org/img/object.png
                    'json-object': seq1(1, '{', optional( seq(
                        sym('json-object-property'), repeat(
                            seq1(2, ',', sym('ws'), sym('json-object-property'))))),
                            // The following line is against the JSON spec, but
                            // nothing is perfect.
                            optional(seq(sym('ws'), ',', sym('ws'))),
                            '}'),
                    'json-object-property': seq(
                        seq1(1, sym('ws'), sym('jsonj-key')),
                        seq1(2, sym('ws'), ':', sym('json-value'))),

                    // https://www.json.org/img/array.png
                    'json-array': seq1(1, '[',
                        optional(seq(
                            sym('json-value'),
                            repeat(seq1(1, ',', sym('json-value')))
                            )), ']'),

                    // https://www.json.org/img/value.png
                    'json-value': seq1(1, sym('ws'),
                        alt(
                            sym('foam-multiline'),
                            sym('json-string'),
                            sym('json-number'),
                            sym('json-object'),
                            sym('json-array'),
                            literal('true', true),
                            literal('false', false),
                            literal('null', null),
                            ), sym('ws')),
                    
                    'jsonj-key': seq1(1, sym('ws'),
                        alt(
                            sym('json-string'),
                            sym('jsonj-symbol')), sym('ws')),
                    
                    'foam-multiline': seq1(1, '"""', join(until('"""'))),
                    
                    // https://www.json.org/img/string.png
                    'json-string': seq1(1, '"', join(
                        globalThis.UntilEscaped.create({
                            esc: sym('json-escape'),
                            term: '"'
                        })
                    )),
                    'jsonj-symbol': seq(
                        chars(validSymbolStart),
                        optional(repeat(chars(validSymbol)))),
                    'json-escape': seq1(1, '\\', alt(
                            '\\',
                            '"',
                            literal('b', "\b"),
                            literal('f', "\f"),
                            literal('n', "\n"),
                            literal('r', "\r"),
                            literal('t', "\t"))),
                    'json-number': alt(
                        seq('-', sym('json-number-unsigned')),
                        seq(
                            globalThis.Implied.create({
                                value: '+'}),
                            seq1(1, optional('+'), sym('json-number-unsigned')))),
                    'json-number-unsigned': alt(
                        seq(
                            sym('json-number-integer'),
                            optional(sym('json-number-fraction')),
                            optional(sym('json-number-exponent'))),
                        seq(
                            '0',
                            optional(sym('json-number-fraction')),
                            optional(sym('json-number-exponent')))),
                    'json-number-integer': seq(
                        chars('123456789'),
                        optional(repeat(chars('0123456789')))),
                    'json-number-fraction': seq1(1,
                        '.',
                        repeat(chars('0123456789'))),

                    // NB: This may look like an error, as 0123e4 is invalid while
                    //     123e04 is valid (i.e. inconsistency between validation of
                    //     two signed integer values)... but actually this is what
                    //     the JSON spec says to do. I don't know why. It's silly.
                    'json-number-exponent': seq1(1,
                        chars('eE'), alt(
                        seq('-', repeat(chars('0123456789'))),
                        seq(
                            globalThis.Implied.create({
                                value: '+'}),
                            seq1(1, optional('+'), repeat(chars('0123456789')))))),

                    'ws': repeat0(alt(' ', '\t', '\r', '\n')),
                }
            },
            actions: {
                "net.nanopay.toolsfolder.RawJournal": function(v) {
                    v = v[0]
                    this.result = v;
                    return v;
                },
                'operation': function(v) {
                    console.log("operation", v);
                    return v;
                },
                'json-escape': function(v) {
                    return v;
                },
                'method': function(v) {
                    var operation = v[0];
                    var jsonString = v[1];
                    console.log("TEST", v);
                    console.log(util.inspect(v[1], {showHidden: false, depth: null}))
                    return v;
                },

                'json-number': function(v) {
                    var n = 0;
                    var strFraction = v[1][1] == null ? '' : v[1][1];
                    var strExponent = v
                    var strN = '' + v[0] + v[1][0] + '.' + strFraction;
                    if (v[1][2] != null) strN += 'e' + v[1][2][0] + v[1][2][1];

                    console.log('strN', strN);

                    n = Number(strN);

                    console.log('number', n);
                    return n
                },

                // Parser helpers (avoided when possible)
                'json-number-integer': function(v) {
                    vNew = [v[0]];
                    if (v.length > 1) {
                        vNew = vNew.concat(v[1]);
                    }
                    return vNew.join('');
                },
                'jsonj-symbol': function(v) {
                    vNew = [v[0]];
                    if (v.length > 1) {
                        vNew = vNew.concat(v[1]);
                    }
                    return vNew.join('');
                },
                'json-number-fraction': function(v) {
                    return v.join('');
                },
                'json-array': function(v) {
                    if (v == null || v.length < 1) return [];
                    vNew = [v[0]];
                    if (v.length > 1) {
                        vNew = vNew.concat(v[1]);
                    }
                    return vNew
                },
                'json-object': function(v) {
                    vNew = [v[0]];
                    if (v.length > 1) {
                        vNew = vNew.concat(v[1]);
                    }

                    var obj = {};
                    for ( var i = 0; i < vNew.length; i++ ) {
                        obj[vNew[i][0]] = vNew[i][1];
                    }
                    return obj;
                },

                'json-value': function(v) {
                    console.log("VALU", v);
                    return v
                },
                'foam-multiline': function(v) {
                    console.log("MULTI", v);
                    return v;
                }
            }
        }
    ]
});

function p(obj) {
    console.log("Found service: " + obj.name);
}

/**
 * reIndent adds or removes spaces from the first non-empty
 * line of s to
 * match the specified amount, then adds or removes the same
 * amount of indentation to the lines which follow.
 * 
 * NB: reIndent assumes indentation with spaces.
 * 
 * @param {int} amount Amount of spaces to add
 * @param {string} s Input string
 * @return {string}
 */
function reIndent(amount, s) {
    var countSpaces = function(line) {
        var nSpaces = 0;
        for ( var i in line ) {
            var c = line[i];
            if (c != ' ') break;
            nSpaces++;
        }
        return nSpaces;
    }
    addRemoveIndent = function(localAmount, line) {
        var originalSpaces = countSpaces(line);

        // Do nothing if we try to remove too many spaces
        if ( localAmount < 0 && localAmount*-1 > originalSpaces ) {
            console.log('[warn] tried to remove too many spaces');
            return line;
        }

        if ( localAmount < 0 ) {
            return line.substring(localAmount);
        }
        return ' '.repeat(localAmount) + line;
    }
    var v = s.split('\n');

    var firstNonEmptyString = '';
    for ( var i in v ) if ( v[i].trim() != '' ) {
        firstNonEmptyString = v[i];
        break;
    }

    console.log("FIRST", firstNonEmptyString);

    var baseIndent = countSpaces(firstNonEmptyString);
    var indentAmount = amount - baseIndent;

    console.log("COUNT", baseIndent);
    console.log("COUNT", indentAmount);

    for ( var i=0; i < v.length; i++ ) {
        var line = v[i];
        v[i] = addRemoveIndent(indentAmount, line);
    }
    return v.join('\n');
}

function blockTrim(s) {
    var v = s.split('\n');
    var leftCount = 0;
    for ( var i in v )
        if ( v[i].trim() == '' ) leftCount++;
        else break;
    
    for ( var i = v.length-1; i >= 0; i-- ) {
        if ( v[i].trim() == '' ) v.pop();
        else break;
    }

    return v.splice(leftCount).join('\n');
}

function looksLikeObject(s) {
    return s.includes('{') && s.includes('}');
}

function addEscapes(s) {
    var newS = '';
    for ( i in s ) {
        var c = s[i];
        if ( "\\\"\n\t".includes(c) ) {
            newS += '\\'
        }
        newS += c;
    }
    return newS;
}

var printObject, printArray;

var printValue = (actionInput, ws) => {
    var strKeyVal = '';
    if ( typeof actionInput !== 'string' ) {
        if ( actionInput === true ) {
            strKeyVal += 'true';
        }
        else if ( actionInput === false ) {
            strKeyVal += 'false';
        }
        else if ( actionInput === null ) {
            strKeyVal += 'null';
        }
        else if ( typeof actionInput === 'object' ){
            if ( Array.isArray(actionInput) ) {
                strKeyVal += printArray(
                    actionInput, ws+'  ');
            } else {
                strKeyVal += printObject(
                    actionInput, ws+'  ');
            }
        }
        else {
            strKeyVal += '' + actionInput;
        }
    } else {
        // TODO: Add escapes
        strKeyVal += '"' + addEscapes(actionInput) + '"';
    }
    return strKeyVal;
};

printArray = (actionInput, ws) => {
    return '[' +
        actionInput.map(v => printValue(v, ws)).join(',')
        + ']';
};

printObject = (actionInput, ws) => {
    var output = '{\n';
    var keyVals = [];
    var unquotedKeyStart =
        local.chrRange('a','z') + local.chrRange('A','Z') + '_';
    var unquotedKeyContinue = unquotedKeyStart + local.chrRange('0','9');
    for ( var k in actionInput ) {
        var keyNeedsQuotes = true;
        if (
            k.length > 0 && unquotedKeyStart.includes(k[0])
        ) {
            var keyNeedsQuotes = false;
            for ( let i = 1 ; i < k.length ; i++ ) {
                if ( ! unquotedKeyContinue.includes(k[i])) {
                    keyNeedsQuotes = true;
                    break;
                }
            }
        }
        var strKeyVal = `${ws}  ${ keyNeedsQuotes ? `"${k}"` : k }: `;

        // For this purpose, hard-coding these specific keys to be
        // rendered as multiline strings is sufficient.
        // TODO: Format object inside client parameter.
        if (
            k == 'serviceScript' ||
            k == 'code' || (
                k == 'client' &&
                looksLikeObject(actionInput[k])
            )
        ) {
            strKeyVal += '\n'+ws+'  """\n'
            strKeyVal += blockTrim(
                reIndent(4, actionInput[k]));
            strKeyVal += '\n'+ws+'  """'
        } else {
            strKeyVal += printValue(actionInput[k], ws);
        }

        keyVals.push(strKeyVal);
    }

    output += keyVals.join(',\n') + '\n';

    output += ws+'}'
    return output;
}

function main() {
    var args = process.argv.slice(2);

    // Exit if no argument is present
    if ( args.length < 1 ) {
        console.log(HELP_TEXT);
        return;
    }

    var fileName = args[0];
    var fileStuff = fs.readFileSync(fileName, 'utf8');
    var rawJournal = net.nanopay.toolsfolder.RawJournal.create();

    rawJournal.text = fileStuff;
    rawJournal.testParse();
    var result = rawJournal.result;
    console.log("PARSING COMPLETE");

    var fileOutput = '';

    // console.log(rawJournal.result);
    for ( var i=0; i < result.length; i++ ) {
        var action = result[i];
        var actionInput = action[1];

        var output = '';

        // output 'p(' or 'r('
        output += action[0] + '(';

        output += printObject(actionInput, '');

        output += ')\n'

        fileOutput += output;
    }

    fs.writeFileSync(fileName, fileOutput);
}

main();
