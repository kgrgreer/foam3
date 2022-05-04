/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// See:
// http://vintage-basic.net/games.html
// https://github.com/GReaperEx/bcg

foam.CLASS({
  package: 'foam.demos.basic',
  name: 'Compiler',
  extends: 'foam.parse.Grammar',

  properties: [
    'currentLine',
    {
      name: 'vars',
      factory: function() { return {}; }
    },
    {
      name: 'defs',
      factory: function() { return []; }
    },
    {
      name: 'data',
      factory: function() { return []; }
    },
    {
      name: 'fors',
      factory: function() { return {}; }
    },
    {
      name: 'symbols',
      factory: function() {
        return function(alt, sym, seq1, seq, literalIC, repeat, str, optional, plus, range, anyChar, notChars, literal, until, not) {
          return {
            START: repeat(sym('line'), '\n'),

            line: seq(sym('lineNumber'), ' ', sym('statements')),

            lineNumber: sym('number'),

            statements: repeat(sym('statement'), seq(':', optional(' '))),

            statement: alt(
              sym('data'),
              sym('rem'),
              sym('forStep'),
              sym('next'),
              sym('if'),
              sym('def'),
              sym('print'),
              sym('let'),
              sym('end'),
              sym('goto'),
              sym('gosub'),
              sym('return'),
              str(repeat(notChars(':\n')))),

            data: seq1(1, 'DATA ', repeat(sym('number'), ',')),

            rem: seq1(1, 'REM', str(repeat(notChars('\n')))),

            forStep: seq('FOR ', sym('symbol'), '=', str(until(' TO ')), str(until(' STEP ')), sym('number')),

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

            gosub: seq('GOSUB ', sym('number')),

            return: literal('RETURN'),

            end: literal('END', 'return;'),

            expression: str(repeat(notChars(':\n'))),

            number: str(seq(
              optional('-'),
              str(alt(
                seq(str(repeat(sym('digit'))), '.', str(plus(sym('digit')))),
                plus(sym('digit')))))),

            digit: range('0', '9'),

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
        lineNumber: function(a) {
          self.currentLine = a;
          return a;
        },
        def: function(a) {
          self.defs.push(`function ${a[1]}(${a[3]}) { return ${a[5]}; }`);
          return '';
        },
        data: function(a) {
          a.forEach(d => self.data.push(d));
          return '';
        },
        rem: function(a) {
          return '// REM' + a;
        },
        forStep: function(a) {
          self.vars[a[1]] = true;
          self.fors[a[1]] = [self.currentLine, a[4], a[5]];
          return `${a[1]} = ${a[3]}; case ${self.currentLine}.5:`;
        },
        next: function(a) {
          var f = self.fors[a[0]];
          return `${a[0]} = ${a[0]} + (${f[2]}); if ( ${a[0]} ${ f[2] > 0 ? '<=' : '>=' } ${f[1]} ) { _line = ${f[0]}.5; break; } `;
        },
        if: function(a) { return `if ( ${a[1]}) { _line = ${a[2]}; break; }`; },
        string: function(a) { return `"${a.join('')}"`; },
        print: function(a) {
          var ret = '';
          function append(s) {
            ret += ( ret ? ';' : '' ) + s;
          }
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
        gosub: function(a) { return `_line = ${a[1]}; _stack.push(${self.currentLine}.5); break; case ${self.currentLine}.5:`; },
        return: function() { return '_line = _stack.pop(); break;' },
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

  constants: {
    LIB: {
      PRINT: function(s) { this.output += s; },
      NL:    function()  { this.output += '\n'; },
      EXP:   function(n) { return Math.exp(n); },
      SQR:   function(n) { return Math.sqrt(n); },
      INT:   function(n) { return Math.floor(n); },
      SIN:   function(n) { return Math.sin(n); },
      COS:   function(n) { return Math.cos(n); },
      TAN:   function(n) { return Math.tan(n); },
      RND:   function(n) { return Math.random() * n; },
      ABS:   function(n) { return Math.abs(n); },
      TAB:   function(n) {
        var i = this.output.lastIndexOf('\n');
        if ( i == -1 ) i = 0;
        var pos = this.output.length - i;
        this.output += ' '.repeat(n-pos);
      }
    }
  },

  properties: [
    {
      class: 'Code',
      name: 'sourceCode',
      valuex: `
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
`,
value: `
10 PRINT TAB(30);"SINE WAVE"
20 PRINT TAB(15);"CREATIVE COMPUTING  MORRISTOWN, NEW JERSEY"
30 PRINT: PRINT: PRINT: PRINT: PRINT
40 REMARKABLE PROGRAM BY DAVID AHL
50 B=0
100 REM  START LONG LOOP
110 FOR T=0 TO 40 STEP .25
120 A=INT(26+25*SIN(T))
130 PRINT TAB(A);
140 IF B=1 THEN 180
150 PRINT "CREATIVE"
160 B=1
170 GOTO 200
180 PRINT "COMPUTING"
190 B=0
200 NEXT T
999 END
`,
xvalue:`
2 PRINT TAB(33);"LOVE"
4 PRINT TAB(15);"CREATIVE COMPUTING  MORRISTOWN, NEW JERSEY"
6 PRINT: PRINT: PRINT
20 PRINT "A TRIBUTE TO THE GREAT AMERICAN ARTIST, ROBERT INDIANA."
30 PRINT "HIS GREATEST WORK WILL BE REPRODUCED WITH A MESSAGE OF"
40 PRINT "YOUR CHOICE UP TO 60 CHARACTERS.  IF YOU CAN'T THINK OF"
50 PRINT "A MESSAGE, SIMPLE TYPE THE WORD 'LOVE'": PRINT
60 INPUT "YOUR MESSAGE, PLEASE";A$: L=LEN(A$)
70 DIM T$(120): FOR I=1 TO 10: PRINT: NEXT I
100 FOR J=0 TO INT(60/L)
110 FOR I=1 TO L
120 T$(J*L+I)=MID$(A$,I,1)
130 NEXT I: NEXT J
140 C=0
200 A1=1: P=1: C=C+1: IF C=37 THEN 999
205 PRINT
210 READ A: A1=A1+A: IF P=1 THEN 300
240 FOR I=1 TO A: PRINT " ";: NEXT I: P=1: GOTO 400
300 FOR I=A1-A TO A1-1: PRINT T$(I);: NEXT I: P=0
400 IF A1>60 THEN 200
410 GOTO 210
600 DATA 60,1,12,26,9,12,3,8,24,17,8,4,6,23,21,6,4,6,22,12,5,6,5
610 DATA 4,6,21,11,8,6,4,4,6,21,10,10,5,4,4,6,21,9,11,5,4
620 DATA 4,6,21,8,11,6,4,4,6,21,7,11,7,4,4,6,21,6,11,8,4
630 DATA 4,6,19,1,1,5,11,9,4,4,6,19,1,1,5,10,10,4,4,6,18,2,1,6,8,11,4
640 DATA 4,6,17,3,1,7,5,13,4,4,6,15,5,2,23,5,1,29,5,17,8
650 DATA 1,29,9,9,12,1,13,5,40,1,1,13,5,40,1,4,6,13,3,10,6,12,5,1
660 DATA 5,6,11,3,11,6,14,3,1,5,6,11,3,11,6,15,2,1
670 DATA 6,6,9,3,12,6,16,1,1,6,6,9,3,12,6,7,1,10
680 DATA 7,6,7,3,13,6,6,2,10,7,6,7,3,13,14,10,8,6,5,3,14,6,6,2,10
690 DATA 8,6,5,3,14,6,7,1,10,9,6,3,3,15,6,16,1,1
700 DATA 9,6,3,3,15,6,15,2,1,10,6,1,3,16,6,14,3,1,10,10,16,6,12,5,1
710 DATA 11,8,13,27,1,11,8,13,27,1,60
999 FOR I=1 TO 10: PRINT: NEXT I: END
`,
value4:`
10 PRINT TAB(33);"KINEMA"
20 PRINT TAB(15);"CREATIVE COMPUTING  MORRISTOWN, NEW JERSEY"
30 PRINT: PRINT: PRINT
100 PRINT
105 PRINT
106 Q=0
110 V=5+INT(35*RND(1))
111 PRINT "A BALL IS THROWN UPWARDS AT";V;"METERS PER SECOND."
112 PRINT
115 A=.05*V^2
116 PRINT "HOW HIGH WILL IT GO (IN METERS)";
117 GOSUB 500
120 A=V/5
122 PRINT "HOW LONG UNTIL IT RETURNS (IN SECONDS)";
124 GOSUB 500
130 T=1+INT(2*V*RND(1))/10
132 A=V-10*T
134 PRINT "WHAT WILL ITS VELOCITY BE AFTER";T;"SECONDS";
136 GOSUB 500
140 PRINT
150 PRINT Q;"RIGHT OUT OF 3.";
160 IF Q<2 THEN 100
170 PRINT "  NOT BAD."
180 GOTO 100
500 INPUT G
502 IF ABS((G-A)/A)<.15 THEN 510
504 PRINT "NOT EVEN CLOSE...."
506 GOTO 512
510 PRINT "CLOSE ENOUGH."
511 Q=Q+1
512 PRINT "CORRECT ANSWER IS ";A
520 PRINT
530 RETURN
999 END
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
      args: [ 'data', 'defs', 'vars', 'lines' ],
      template: `
      // Compiled from BASIC to JS
      async function main(lib) {
        with ( lib ) {
          const _stack = [];
          const _data = [ <%= data.join(',') %> ];
          <%= defs.join(', ') %>
          <% if ( vars.length ) { %><!--
          -->var <%= vars.join(', ') %>;<!--
          --><% } %>
          var _line = <%= lines[0][0]%>;
          while ( true ) {
            // console.log(_line);
            switch ( _line ) {
            <% for ( var i = 0 ; i < lines.length ; i++ ) {
              var line = lines[i];
              %><!--
              -->case <%=line[0]%>: <!--
              --><% for ( var j = 0 ; j < line[2].length ; j++ ) {
                var stmt = line[2][j];
              %><!--
                --><%=stmt%><!--
              --><%}%>
            <%}%>
            }
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
          this.targetCode = this.jsGenerator(compiler.data, compiler.defs, Object.keys(compiler.vars), ret);
        }
        console.log(ret);
      }
    },
    {
      name: 'run',
      code: function() {
        var lib = {};
        for ( var key in this.LIB ) lib[key] = this.LIB[key].bind(this);
        this.output = 'running\n';
        eval('(' + this.targetCode + ')').call(this, lib);
        this.output += 'done\n';
      }
    }
  ]
});
