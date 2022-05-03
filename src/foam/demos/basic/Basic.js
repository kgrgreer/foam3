/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// See: https://github.com/GReaperEx/bcg

foam.CLASS({
  package: 'foam.demos.basic',
  name: 'Compiler',
  extends: 'foam.parse.Grammar',

  properties: [
    {
      name: 'vars',
      factory: function() { return {}; }
    },
    {
      name: 'defs',
      factory: function() { return []; }
    },
    {
      name: 'symbols',
      factory: function() {
        return function(alt, sym, seq1, seq, literalIC, repeat, str, optional, plus, range, anyChar, notChars, literal, until) {
          return {
            START: repeat(sym('line'), '\n'),

            line: seq(sym('number'), ' ', sym('statements')),

            statements: repeat(sym('statement'), ':'),

            statement: alt(
              sym('next'),
              sym('if'),
              sym('def'),
              sym('print'),
              sym('let'),
              sym('end'),
              sym('goto'),
              str(repeat(notChars(':\n')))),

            next: seq1(1, 'NEXT ', sym('symbol')),

            if: seq('IF ', str(until('THEN ')), sym('number')),

            def: seq('DEF ', sym('symbol'), '(', str(repeat(notChars(')'))), ')=', str(repeat(notChars('\n')))),

            print: seq('PRINT', optional(' '), repeat(sym('printArg'), ';'), optional(';')),

            printArg: alt(
              sym('string'),
              sym('tab')
            ),

            string: seq1(1, '"', repeat(notChars('"')), '"'),

            tab: str(seq('TAB(', alt(sym('number'), sym('symbol')), ')')), // TODO: make expression

            let: seq(optional('LET '), sym('symbol'), '=', sym('expression')),

            goto: seq('GOTO ', sym('number')),

            end: literal('END', 'return;'),

            expression: str(repeat(notChars(':\n'))),

            expr: alt(
              sym('number'),
              sym('cell'),
              sym('add'),
              sym('sub'),
              sym('mul'),
              sym('div'),
              sym('mod'),
              sym('sum'),
              sym('prod'),
              sym('flow')
            ),

            add:  seq(literalIC('add('),  sym('expr'), ',', sym('expr'), ')'),
            sub:  seq(literalIC('sub('),  sym('expr'), ',', sym('expr'), ')'),
            mul:  seq(literalIC('mul('),  sym('expr'), ',', sym('expr'), ')'),
            div:  seq(literalIC('div('),  sym('expr'), ',', sym('expr'), ')'),
            mod:  seq(literalIC('mod('),  sym('expr'), ',', sym('expr'), ')'),
            sum:  seq1(1, literalIC('sum('),  sym('vargs'), ')'),
            prod: seq1(1, literalIC('prod('), sym('vargs'), ')'),
            flow: seq(literalIC('flow('),  sym('symbol'), ',', sym('symbol'), ')'),

            vargs: repeat(alt(sym('range'), sym('expr')), ','),

            range: seq(sym('col'), sym('row'), ':', sym('col'), sym('row')),

            number: str(seq(
              optional('-'),
              str(alt(
                seq(str(repeat(sym('digit'))), '.', str(plus(sym('digit')))),
                plus(sym('digit')))))),

            cell: seq(sym('col'), sym('row')),

            col: alt(sym('az'), sym('AZ')),

            digit: range('0', '9'),

            az: range('a', 'z'),

            AZ: range('A', 'Z'),

            row: str(repeat(sym('digit'), null, 1, 2)),

            symbol: str(seq(
              alt(range('a', 'z'), range('A', 'Z')),
              str(repeat(alt(range('a', 'z'), range('A', 'Z'), range('0', '9'))))))
          };
        }
      }
    }
  ],

  methods: [
    function init() {
      var self = this;
      this.addActions({
        def: function(a) {
          self.defs.push(`function ${a[1]}(${a[3]}) { return ${a[5]}; }`);
          return '';
        },
        if: function(a) { return `if ( ${a[1]}) { _line = ${a[2]}; break; }`; },
        string: function(a) { return `"${a.join('')}"`; },
        print: function(a) {
          debugger;
          var ret = '';
          function append(s) {
            ret += ( ret ? '.' : '' ) + s;
          }
//          print: seq('PRINT', optional(' '), repeat(sym('printArg'), ';'), optional(';')),
          for ( var i = 0 ; i < a[2].length ; i++ ) {
            var l = a[2][i];
            if ( l.startsWith('TAB') ) {
              append(l);
            } else {
              append('PRINT(' + l + ')');
            }
          }
          if ( ! a[3] ) append('NL()');
          return ret + ';'
        },
        goto: function(a) { return `_line = ${a[1]}; break;`; },
        let: function(a) { self.vars[a[1]] = true; return `${a[1]} = ${a[3]};`; }
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.basic',
  name: 'Basic',
//  extends: 'foam.u2.Controller',

  requires: [ 'foam.demos.basic.Compiler' ],

  properties: [
    {
      class: 'Code',
      name: 'sourceCode',
      value: `
1 PRINT TAB(32);"3D PLOT"
2 PRINT TAB(15);"CREATIVE COMPUTING  MORRISTOWN, NEW JERSEY"
3 PRINT:PRINT:PRINT
5 DEF FNA(Z)=30*EXP(-Z*Z/100)
100 PRINT
110 FOR X=-30 TO 30 STEP 1.5
120 L=0
130 Y1=5*INT(SQR(900-X*X)/5)
140 FOR Y=Y1 TO -Y1 STEP -5
150 Z=INT(25+FNA(SQR(X*X+Y*Y))-.7*Y)
160 IF Z<=L THEN 190
170 L=Z
180 PRINT TAB(Z);"*";
190 NEXT Y
200 PRINT
210 NEXT X
300 END
`
    },
    {
      class: 'Code',
      name: 'targetCode'
    },
    {
      class: 'String',
      name: 'output',
      width: 80,
      view: { class: 'foam.u2.tag.TextArea', rows: 20 }
    }
  ],

  methods: [
  ],

  templates: [
    {
      name: 'jsGenerator',
      args: [ 'defs', 'vars', 'lines' ],
      template: `
      // Compiled from BASIC to JS
      async function main(lib) {
        with ( lib ) {
          <%= defs.join(', ') %>
          var <%= vars.join(', ') %>;
          var _line = <%= lines[0][0]%>;
          while ( true ) switch ( _line ) {
              <% for ( var i = 0 ; i < lines.length ; i++ ) {
              var line = lines[i];
            %><!--
              --><%=line[0]%>: <!--
              --><% for ( var j = 0 ; j < line[2].length ; j++ ) {
                var stmt = line[2][j];
              %><!--
                --><%=stmt%>
              <%}%><!--
            --><%}%>
          }
        }
      }
      `
    }
  ],

  actions: [
    {
      name: 'compile',
      code: function() {
        var compiler = this.Compiler.create();
        var ret = compiler.parseString(this.sourceCode.trim());
        if ( ret ) {
          this.targetCode = this.jsGenerator(compiler.defs, Object.keys(compiler.vars), ret);
        }
        console.log(ret);
      }
    },
    {
      name: 'run',
      code: function() {
        this.output = '';
        this.output = 'done';
      }
    }
  ]
});
