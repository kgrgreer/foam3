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
      name: 'program',
      view: { class: 'foam.u2.view.ChoiceView', choices: foam.demos.basic.Programs.PROGRAMS },
      postSet: function(o, n) { this.sourceCode = n.trim(); }
    },
    {
      class: 'Code',
      name: 'sourceCode',
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
