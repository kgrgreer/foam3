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
      name: 'symbols',
      factory: function() {
        return function(alt, sym, seq1, seq, literalIC, repeat, str, optional, plus, range, anyChar, notChars) {
          return {
            START: repeat(sym('line'), '\n'),

            line: seq(sym('number'), ' ', sym('statement')),

            statement: str(repeat(notChars('\n'))),

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
              str(repeat(alt(range('a', 'z'), range('A', 'Z'), range('0', '9')))))),

            string: str(repeat(anyChar()))
          };
        }
      }
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
    }
  ],

  methods: [
  ],

  templates: [
    {
      name: 'jsGenerator',
      args: [ 'lines' ],
      template: `
      // Compiled from BASIC to JS
      async function main() {
        var _line = -1
        while ( true ) switch ( _line ) {
          -1:
          <% for ( var i = 0 ; i < lines.length ; i++ ) {
            var line = lines[i];
          %>
          <%=line[0]%>: <%=line[2]%>
          <%}%>
        }
      }
      `
    }
  ],

  actions: [
    {
      name: 'compile',
      code: function() {
        var ret = this.Compiler.create().parseString(this.sourceCode.trim());
        if ( ret ) {
          this.targetCode = this.jsGenerator(ret);
        }
        console.log(ret);
      }
    },
    {
      name: 'run',
      code: function() {
      }
    }
  ]
});
