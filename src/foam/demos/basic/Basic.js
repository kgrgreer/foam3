/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// See:
// http://vintage-basic.net/downloads/Vintage_BASIC_Users_Guide.html
// http://vintage-basic.net/games.html
// https://github.com/GReaperEx/bcg
// https://www.roug.org/retrocomputing/languages/basic/morebasicgames
//
// TODO: http://aleclownes.com/2017/02/01/crt-display.html

foam.CLASS({
  package: 'foam.demos.basic',
  name: 'Compiler',
  extends: 'foam.parse.Grammar',

  properties: [
    'currentLine',
    { name: 'vars', factory: function() { return { '_d': true }; } },
    { name: 'defs', factory: function() { return []; } },
    { name: 'data', factory: function() { return []; } },
    { name: 'fors', factory: function() { return {}; } },
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
              sym('def'),
              sym('end'),
              sym('forStep'),
              sym('for'),
              sym('gosub'),
              sym('goto'),
              sym('if'),
              sym('input'),
              sym('let'),
              sym('next'),
              sym('on'),
              sym('print'),
              sym('read'),
              sym('rem'),
              sym('return'),
              str(repeat(notChars(':\n')))),

            data: seq1(1, 'DATA ', repeat(sym('number'), ',')),

            def: seq('DEF ', sym('symbol'), '(', str(repeat(notChars(')'))), ')=', str(repeat(notChars('\n')))),

            end: literal('END', 'return;'),

            for: seq('FOR ', sym('symbol'), '=', str(until(' TO ')), str(repeat(notChars('\n')))),

            forStep: seq('FOR ', sym('symbol'), '=', str(until(' TO ')), str(until(' ')), 'STEP ', sym('number')),

            gosub: seq('GOSUB ', sym('number')),

            goto: seq1(1, 'GOTO ', sym('gotoLine')),

            gotoLine: sym('number'),

            if: seq('IF ', str(until('THEN ')), alt(sym('gotoLine'), str(sym('statements')))),

            input: seq('INPUT ', optional(seq1(0, sym('string'), ';', optional(' '))), repeat(sym('symbol'), ',')),

            let: seq(optional('LET '), sym('symbol'), '=', sym('expression')),

            next: seq1(1, 'NEXT ', sym('symbol')),

            on: seq('ON ', until(' GOTO '), str(repeat(notChars('\n')))),

            print: seq('PRINT', optional(' '), repeat(alt(sym('tab'), sym('expression')), ';'), optional(';')),

            printArg: alt(sym('string'), sym('tab')),

            read: seq1(1, 'READ ', repeat(sym('symbol'), ',')),

            rem: seq1(1, 'REM', str(repeat(notChars('\n')))),

            return: literal('RETURN'),

            string: seq1(1, '"', repeat(notChars('"')), '"'),

            tab: str(seq('TAB(', sym('expression'), ')')),

            expression: str(seq(
              alt(
                seq('(', sym('expression'), ')'),
                seq('-', sym('expression')),
                sym('number'),
                sym('string'),
                sym('fn'),
                sym('symbol')),
              optional(str(seq(alt('+','-','*','/'), sym('expression')))))),

            predicate: str(seq(
              alt(
                seq(sym('expression'), alt('=', literal('<>', '!='),'<=','>=','<','>'), sym('expression')),
                seq('(', sym('predicate'), ')'),
                seq(literal('NOT ', '! '), sym('predicate'))),
              optional(seq(
                alt(literal('AND','&&'),literal('OR', '||')),
                sym('predicate')
              )))),

            fn: str(seq(sym('symbol'), '(', sym('expression'), ')')),

            number: str(seq(
              optional('-'),
              str(alt(
                seq(str(repeat(sym('digit'))), '.', str(plus(sym('digit')))),
                plus(sym('digit')))))),

            digit: range('0', '9'),

            symbol: str(seq(
              alt(range('a', 'z'), range('A', 'Z')),
              str(repeat(alt(range('a', 'z'), range('A', 'Z'), range('0', '9')))),
              optional('$')
            ))
          };
        }
      }
    }
  ],

  methods: [
    function init() {
      var self = this;
      this.addActions({
        lineNumber: function(a) { self.currentLine = a; return a; },
        input: function(a) {
          a[2].forEach(v => self.vars[v] = true);
          return `${a[2][0]} = INPUT(${a[1]});`;
        },
        on: function(a) { return `{ var l = [${a[2]}][${a[1]}]; if ( l ) { _line = l; break; } }`; },
        def: function(a) {
          self.defs.push(`function ${a[1]}(${a[3]}) { return ${a[5]}; }`);
          return '';
        },
        data: function(a) { a.forEach(d => self.data.push(d)); return ''; },
        rem: function(a) { return '// REM' + a; },
        forStep: function(a) {
          self.vars[a[1]] = true;
          self.fors[a[1]] = [self.currentLine, a[4], a[6]];
          return `${a[1]} = ${a[3]}; case ${self.currentLine}.5:`;
        },
        for: function(a) {
          self.vars[a[1]] = true;
          self.fors[a[1]] = [self.currentLine, a[4], 1];
          return `${a[1]} = ${a[3]}; case ${self.currentLine}.5:`;
        },
        next: function(a) {
          var f = self.fors[a[0]];
          return `${a[0]} = ${a[0]} + (${f[2]}); if ( ${a[0]} ${ f[2] > 0 ? '<=' : '>=' } ${f[1]} ) { _line = ${f[0]}.5; break; } `;
        },
        if: function(a) { return `if ( ${a[1]}) { ${a[2]} }`; },
        string: function(a) { return `"${a.join('')}"`; },
        print: function(a) {
          var ret = '';
          function append(s) { ret += ( ret ? ';' : '' ) + s; }
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
        gotoLine: function(l) { return `_line = ${l}; break;`; },
        gosub: function(a) { return `_line = ${a[1]}; _stack.push(${self.currentLine}.5); break; case ${self.currentLine}.5:`; },
        read: function(a) {
          return a.map(s => {
            self.vars[s] = true;
            return `${s} = _data[_d++];`;
          }).join('');
        },
        return: function() { return '_line = _stack.pop(); break;' },
        let: function(a) { self.vars[a[1]] = true; return `${a[1]} = ${a[3]};`; }
      });
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.basic',
  name: 'Basic',

  requires: [ 'foam.demos.basic.Compiler' ],

  constants: {
    LIB: {
      ABS:   function(n) { return Math.abs(n); },
      CLS:   function() { this.output = ''; },
      CHR$:  function(c) { return String.fromCharCode(c); },
      COS:   function(n) { return Math.cos(n); },
      DIM:   function(v, ...dims) {
        function f(v, i, dims) { return i == dims.length ? v : Array(dims[i]).fill().map(a => f(v, i+1, dims)); }
        return f(v, 0, dims);
      },
      EXP:   function(n) { return Math.exp(n); },
      INPUT: function(m) { this.output += m; var ret = prompt(m); this.output += ret + '\n'; return ret; },
      INT:   function(n) { return Math.floor(n); },
      LEFT$: function(s, n) { return s.substring(0, n); },
      LEN:   function(s) { return s.length; },
      MID$:  function(s, b, n) { return s.substring(b-1, b+n); },
      NL:    function() { this.output += '\n'; },
      PRINT: function(s) { this.output += s; },
      RIGHT$:function(s, n) { return s.substring(s.length-n); },
      RND:   function(n) { return Math.random() * n; },
      SIN:   function(n) { return Math.sin(n); },
      SQR:   function(n) { return Math.sqrt(n); },
      TAB:   function(n) {
        var i = this.output.lastIndexOf('\n');
        if ( i == -1 ) i = 0;
        var pos = this.output.length - i;
        this.output += ' '.repeat(Math.max(0, n-pos));
      },
      TAN:   function(n) { return Math.tan(n); }
    }
  },

  properties: [
    {
      name: 'program',
      view: { class: 'foam.u2.view.ChoiceView', choices: foam.demos.basic.Programs.PROGRAMS },
      postSet: function(o, n) { this.sourceCode = n.trim(); }
    },
    { class: 'Code', name: 'sourceCode' },
    { class: 'Code', name: 'targetCode' },
    {
      class: 'String',
      name: 'output',
      width: 80,
      view: { class: 'foam.u2.tag.TextArea', rows: 20 }
    }
  ],

  templates: [
    {
      name: 'jsGenerator',
      args: [ 'data', 'defs', 'vars', 'lines' ],
      template: `<%
        // Add return statement at end of code, if not already present
        if ( lines[lines.length-1][2] !== 'return;' )
          lines.push([[(lines[lines.length-1][0]).valueOf()+1], ' ', 'return;']);
      %>
      // Compiled from BASIC to JS
      async function main(lib) {
        with ( lib ) {
          const _stack = [];
          const _data = [ <%= data.join(',') %> ];<!--
          --><%= defs.join(', ') %>
          <!--
          -->var <%= vars.map(v => v + '=0').join(', ') %>;<!--
          -->
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
          console.log(ret);
        }
      }
    },
    {
      name: 'run',
      code: function() {
        var lib = {};
        this.output = '';
        for ( var key in this.LIB ) lib[key] = this.LIB[key].bind(this);
        try {
          var fn = eval('(' + this.targetCode + ')');
//          for ( var i = 0 ; i < 10 ; i++ ) fn.call(this, lib); this.output = '';
          console.time('run');
          fn.call(this, lib);
        } catch(x) {
          this.output = 'SYNTAX ERROR: ' + x;
        }
        console.timeEnd('run');
      }
    }
  ]
});
