/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
            START: repeat(sym('line'), seq(sym('ws'), '\n')),
            line: seq(sym('lineNumber'), sym('ws'), sym('statements')),
            ws: repeat(' '),
            lineNumber: sym('number'),
            statements: repeat(sym('statement'), seq(optional(' '), ':', optional(' '))),
            statement: alt(
              sym('data'),
              sym('def'),
              sym('dim'),
              sym('end'),
              sym('for'),
              sym('gosub'),
              sym('goto'),
              sym('if'),
              sym('input'),
              sym('next'),
              sym('on'),
              sym('print'),
              sym('read'),
              sym('restore'),
              sym('rem'),
              sym('return'),
              sym('sound'),
              sym('let'),
              str(repeat(notChars(':\n')))), // passthrough Javascript code
            data: seq1(1, 'DATA ', repeat(alt(sym('number'), sym('string')), seq(sym('ws'), ',', sym('ws')))),
            def: seq('DEF ', sym('symbol'), '(', str(repeat(notChars(')'))), ')=', str(repeat(notChars('\n')))),
            dim: seq1(1, 'DIM ', repeat(sym('dimElement'), ',')),
            dimElement: seq(sym('symbol'), '(', repeat(sym('expr'),','), ')'),
            end: alt(literal('END', 'return;'), literal('STOP', 'return;')),
            for: seq('FOR ', sym('symbol'), '=', sym('expr'), sym('ws'), 'TO', sym('ws'), sym('expr'), optional(seq1(3, sym('ws'), 'STEP', sym('ws'), sym('expr')), 1)),
            gosub: seq1(2, 'GOSUB',  sym('ws'), sym('number')),
            goto: seq1(2, 'GOTO', sym('ws'), sym('gotoLine')),
            gotoLine: sym('number'),
            if: seq('IF ', seq1(0, sym('predicate'), sym('ws'), 'THEN', sym('ws')), alt(sym('gotoLine'), str(sym('statements')))),
            input: seq('INPUT ', optional(seq1(0, sym('string'), ';', optional(' '))), repeat(sym('symbol'), ',')),
            let: seq(optional('LET '), sym('lhs'), sym('ws'), '=', sym('ws'), sym('expr')),
            lhs: alt(sym('fn'), sym('symbol')),
            next: seq1(2, 'NEXT', sym('ws'), sym('symbol')),
            on: seq('ON ', until(' GOTO '), str(repeat(notChars('\n')))),
            print: seq('PRINT', optional(' '), optional(sym('printArgs')), optional(alt(';',','))),
            printArgs: seq(sym('expr'), optional(seq(alt(',',';'), sym('printArgs')))),
            read: seq1(2, 'READ', sym('ws'), repeat(sym('lhs'), ',')),
            rem: seq1(1, 'REM', str(repeat(notChars('\n')))),
            sound: seq('SOUND', sym('ws'), sym('expr'), sym('ws'), ',', sym('ws'), sym('expr')),
            restore: literal('RESTORE', '_d = 0;'),
            return: literal('RETURN'),
            string: seq1(1, '"', repeat(notChars('"')), '"'),
            expr: seq(sym('expr1'), optional(seq(alt('+', '-'), sym('expr')))),
            expr1: seq(sym('expr2'), optional(seq(alt('*', '/'), sym('expr1')))),
            expr2: seq(sym('expr3'), optional(seq('^', sym('expr2')))),
            expr3: alt(
              str(seq('(', sym('expr'), ')')),
              str(seq('-', sym('expr3'))),
              sym('number'),
              sym('string'),
              sym('fn'),
              sym('symbol')
            ),
            predicate: str(seq(
              str(alt(
                seq(sym('expr'), sym('ws'), alt(literal('=', '==='), literal('<>', '!='),'<=','>=','<','>'), sym('ws'), sym('expr')),
                seq('(', sym('ws'), sym('predicate'), sym('ws'), ')'),
                seq(literal('NOT', '!'), sym('ws'), sym('predicate')))),
              optional(str(seq(
                sym('ws'),
                alt(literal('AND','&&'), literal('OR', '||')),
                sym('ws'),
                sym('predicate'))
              )))),
            fn: seq(sym('symbol'), '(', repeat(sym('expr'), seq(sym('ws'), ',', sym('ws'))), ')'),
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
        START: function(lines) { return self.jsGenerator(lines).replace(/\n      /g,'\n').substring(1); },
        lineNumber: function(a) { self.currentLine = a; return a; },
        input: function(a) {
          a[2].forEach(v => self.addVar(v));
          return `PRINT(${(a[1] ? a[1].substring(0, a[1].length-1) : '"') + '? "'}); ` + a[2].map((v,i) => `${v} = await INPUT${ v.endsWith('$') ? '$' : ''}();`).join(' ');
        },
        on: function(a) { return `{ var l = [${a[2]}][${a[1]}-1]; if ( l ) { _line = l; break; } }`; },
        def: function(a) {
          self.defs.push(`function ${a[1]}(${a[3]}) { return ${a[5]}; }`);
          return '';
        },
        data: function(a) { a.forEach(d => self.data.push(d)); return ''; },
        dim: function(a) {
          return a.map(e => {
            self.addVar(e[0] + '_A');
            return `${e[0]}_A = DIM(${e[0].endsWith('$') ? '""' : 0},${e[2].join()});`;
          }).join('');
        },
        expr: function(a) { return a[1] ? a[0] + a[1].join('') : a[0]; },
        expr1: function(a) { return a[1] ? a[0] + a[1].join('') : a[0]; },
        expr2: function(a) { return a[1] ? `Math.pow(${a[0]}, ${a[1][1]})` : a[0]; },
        rem: function(a) { return '// REM' + a; },
        fn: function(a) {
          // array lookup
          if ( self.vars[a[0] + '_A'] ) return `${a[0]}_A[${a[2].join('-1][')}-1]`;
          // function call
          return `${a[0]}(${a[2].join()})`;
        },
        for: function(a) {
          self.addVar(a[1]);
          var name = a[1] + self.currentLine + '_';
          self.fors[a[1]] = name;
          return `${a[1]} = ${a[3]}; ${name}END = ${a[7]}; ${name}INCR = ${a[8]}; case '${name}FOR': if ( ! RANGE(${a[1]}, ${name}END, ${name}INCR) ) { _line = '${name}END'; break; }`;
        },
        next: function(a) {
          var name = self.fors[a];
          return `${a} += ${name}INCR; _line = '${name}FOR'; break; case '${name}END':`;
        },
        let: function(a) { return `${a[1]} = ${a[5]};`; },
        sound: function(a) { return `await SOUND(${a[2]},${a[6]});`; },
        lhs: function(v) { self.addVar(v); return v; },
        if: function(a) { return `if ( ${a[1]} ) { ${a[2]} }`; },
        string: function(a) { return `"${a.map(c => (c == '\\') ? '\\\\' : c).join('')}"`; },
        print: function(a) {
          var ret = '';
          function tail(p) {
            if ( ! p ) return;
            var h = p[0], t = p[1];
            ret += h.startsWith('TAB') ? h + ';' : `PRINT(${h});`;
            if ( t ) {
              if ( t[0] === ',' ) ret += 'TAB();';
              tail(t[1]);
            }
          }
          tail(a[2]);
          if ( ! a[3] ) ret += 'NL();'; else if ( a[3] === ',' ) ret += 'TAB();';
          return ret;
        },
        gotoLine: function(l) { return `_line = ${l}; break;`; },
        gosub: function(l) { return `_line = ${l}; _stack.push(${self.currentLine}.5); break; case ${self.currentLine}.5: `; },
        read: function(a) {
          return a.map(s => {
            self.addVar(s);
            return `${s} = _data[_d++];`;
          }).join('');
        },
        return: function() { return '_line = _stack.pop(); break;' }
      });
    },
    function addVar(v) { if ( v.indexOf('[') == -1 ) this.vars[v] = true; }
  ],

  templates: [
    {
      name: 'jsGenerator',
      args: [ 'lines' ],
      template: `
      // Compiled from BASIC to JS
      async function main() {
        const _stack = [];
        const _data = [<%= this.data.join(',') %>];
        <%= this.defs.join(';\\n  ') %>
        var <%= Object.keys(this.vars).map(v => v + '=' + ( v.endsWith('$') ? '""' : 0)).join(', ') %>;<!--
        -->
        var _line = <%= lines[0][0]%>;
        while ( this.status === 'running' ) {
          if ( Math.random() < 0.1 ) await new Promise(r => this.setTimeout(r, 0));
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
          return;
          }
        }
      }`
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.basic',
  name: 'Stdlib',

  methods: [
    function ABS(n) { return Math.abs(n); },
    function ASC(s) { return s.charCodeAt(0); },
    function CHR$(c) { return String.fromCharCode(c); },
    function COS(n) { return Math.cos(n); },
    function DIM(v, ...dims) {
      function f(v, i, dims) { return i == dims.length ? v : Array(dims[i]).fill().map(a => f(v, i+1, dims)); }
      return f(v, 0, dims);
    },
    function EXP(n) { return Math.exp(n); },
    function INPUT() { return this.INPUT$().then(s => parseFloat(s)); },
    function INT(n) { return Math.floor(n); },
    function LEFT$(s, n) { return s.substring(0, n); },
    function LEN(s) { return s.length; },
    function LOG(n) { return Math.log(n); },
    function MID$(s, b, n) { return s.substring(b-1, b+n-1); },
    function NL() { this.out += '\n'; },
    function RANGE(i, end, incr) { return incr > 0 ? i <= end : i >= end },
    function RIGHT$(s, n) { return s.substring(s.length-n); },
    function RND(n) { return Math.random(); },
    function SGN(n) { return Math.sign(n); },
    function SIN(n) { return Math.sin(n); },
    function SOUND(f, d) { this.Beep.create({frequency: 100+4*f, duration: d*60}).play(); return new Promise(r => this.setTimeout(r, d*60)); },
    function SQR(n) { return Math.sqrt(n); },
    function STR$(n) { return n.toString(); },
    function TAB(n) {
      var pos = this.out.length - Math.max(0, this.out.lastIndexOf('\n'));
      n = n === undefined ? pos + ((14 - (pos % 14)) || 14) : Math.round(n);
      this.out += ' '.repeat(Math.max(0, n-pos));
    },
    function TAN(n) { return Math.tan(n); },
    function VAL(s) { return parseFloat(s); }
  ]
});


foam.CLASS({
  package: 'foam.demos.basic',
  name: 'Basic',
  extends: 'foam.u2.Controller',

  requires: [ 'foam.audio.Beep', 'foam.demos.basic.Compiler' ],

  imports: [ 'setTimeout' ],

  constants: { BLOCK_CURSOR: '\u2588' },

  mixins: [ 'foam.demos.basic.Stdlib' ],

  css: `
  body { font-family: sans-serif; }
  button { padding-top: 6px !important; }
  textarea, select { font-size: 14px !important; }
  ^ .property-sourceCode, .property-targetCode {
    display: inline-flex;
    padding: 8px;
    width: 48%;
  }
  ^ .property-program { display: inline-flex; }
  ^ .property-screen {
    background: #121 !important;
    border-radius: 40px;
    color: #0f0 !important;
    font-size: 24px !important;
    line-height: 20px;
    margin: 12px;
    padding: 24px;
    width: auto !important;
  }`,

  properties: [
    {
      name: 'program',
      view: { class: 'foam.u2.view.ChoiceView', choices: foam.demos.basic.Programs.PROGRAMS },
      postSet: function(o, n) { this.sourceCode = n.trim(); }
    },
    { class: 'Code',   name: 'sourceCode' },
    { class: 'Code',   name: 'targetCode' },
    { class: 'String', name: 'inp' },
    { class: 'String', name: 'out',    value: 'READY.\n' },
    { class: 'String', name: 'cursor', value: ' ' },
    {
      class: 'String',
      name: 'screen',
      expression: function(out, inp, cursor) { return out + inp + cursor; },
      view: { class: 'foam.u2.tag.TextArea', rows: 36, cols: 80, mode: foam.u2.DisplayMode.RO }
    },
    { name: 'status' }
  ],

  methods: [
    function render() {
      var self = this;
      this.blink();
      this.addClass(this.myClass()).start().add('Load: ').style({display:'inline-flex', padding: '10px'}).end().add(this.PROGRAM, ' ', this.COMPILE, this.RUN, this.STOP).br().add(this.SOURCE_CODE, this.TARGET_CODE).
      start('center').start(this.SCREEN).
        call(function() {
          self.out$.sub(() => this.el().then(e => e.scrollTop = e.scrollHeight));
          self.status$.sub(this.focus.bind(this));
        }).
        attrs({readonly:true}).
        on('keypress', this.keypress).
        on('keyup',    this.keyup).
      end().end();
    },

    // BIOS:
    function CLS() { this.out = ''; },
    async function INPUT$() {
      this.inp = '';
      return new Promise(r => {
        var l = () => {
          if ( this.inp.endsWith('\n') || this.inp.endsWith(',') ) {
            var ret = this.inp.substring(0, this.inp.length-1);
            this.out += this.inp;
            this.inp = '';
            r(ret);
          } else {
            this.inp$.sub(foam.events.oneTime(l));
          }
        };
        l();
      });
    },
    function PRINT(s) { this.out += typeof s === 'number' ? ` ${s} ` : s; },
  ],

  listeners: [
    {
      name: 'keypress',
      code: function(e) {
        // if ( e.ctrlKey && e.key === 'c' ) throw "TERMINATED"; // TODO: terminate
        this.inp += e.key === 'Enter' ? '\n' : e.key.toUpperCase();
        e.preventDefault();
      }
    },
    {
      name: 'keyup',
      code: function(e) {
        if ( e.key === 'Backspace' ) this.inp = this.inp.substring(0, this.inp.length-1);
        e.preventDefault();
      }
    },
    {
      name: 'blink',
      isMerged: true,
      mergeDelay: 333,
      code: function() {
        this.cursor = this.cursor === this.BLOCK_CURSOR ? ' ' : this.BLOCK_CURSOR;
        this.blink();
      }
    }
  ],

  actions: [
    {
      name: 'compile',
      code: function() {
        this.targetCode = this.Compiler.create().parseString(this.sourceCode.trim()) || '';
      }
    },
    {
      name: 'run',
      isEnabled: function(targetCode) { return !! targetCode; },
      code: async function() {
        try {
          var fn;
          with ( this ) { fn = eval('(' + this.targetCode + ')'); }
          // for ( var i = 0 ; i < 10 ; i++ ) await fn.call(this);
          console.time('run');
          this.CLS();
          this.status = 'running';
          await fn.call(this);
          this.PRINT("\n" + this.OUT.value);
        } catch(x) {
          this.PRINT('SYNTAX ERROR: ' + x);
        } finally {
          this.status = '';
          console.timeEnd('run');
        }
      }
    },
    {
      name: 'stop',
      isEnabled: function(status) { return status === 'running'; },
      code: function() { this.status = ''; }
    }
  ]
});
