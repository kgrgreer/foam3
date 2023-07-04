/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.m0',
  name: 'Instruction',

  methods: [
    function emit(m0) {
      m0.emit(this);
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.m0',
  name: 'MOV',

  properties: [
    'dst', 'src'
  ],

  methods: [
    function execute(m0) {
      dst.set(m0, src);
      m0.r15 += 16;
    },
    function toString() {
      return `MOV(${this.src}, ${this.dst})`;
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.m0',
  name: 'ADD',

  properties: [
    'dst', 'amt'
  ],

  methods: [
    function execute(m0) {
      dst.set(m0, dst.get() + this.amt);
      m0.r15 += 16;
    },
    function toString() {
      return `ADD(${this.src}, ${this.amt})`;
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.m0',
  name: 'B',

  properties: [
    'addr' // TODO: add 'label'
  ],

  methods: [
    function execute(m0) {
      m0.ip = this.addr;
    },
    function toString() {
      return `B(${this.addr})`;
    }
  ]
});


foam.CLASS({
  package: 'foam.demos.m0',
  name: 'M0',
  extends: 'foam.u2.Controller',

  imports: [
    'foam.demos.m0.ADD',
    'foam.demos.m0.B',
    'foam.demos.m0.MOV'
  ],

  properties: [
    {
      name: 'mem',
      factory: () => {}
    },
    {
      name: 'labels',
      factory: () => {}
    },
    {
      class: 'Int',
      name: 'cp'
    },
    {
      class: 'String',
      name: 'code',
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 60 },
      value: `
  MOV(R0, 100);
LABEL('START');
  ADD(R0, 1);
 B('START');
      `
    },
    { class: 'Int', name: 'r0' },
    { class: 'Int', name: 'r1' },
    { class: 'Int', name: 'r2' },
    { class: 'Int', name: 'r3' },
    { class: 'Int', name: 'r4' },
    { class: 'Int', name: 'r5' },
    { class: 'Int', name: 'r6' },
    { class: 'Int', name: 'r7' },
    { class: 'Int', name: 'r8' },
    { class: 'Int', name: 'r9' },
    { class: 'Int', name: 'r10' },
    { class: 'Int', name: 'r11' },
    { class: 'Int', name: 'r12', shortName: 'IP' },
    { class: 'Int', name: 'r13', shortName: 'SP' },
    { class: 'Int', name: 'r14', shortName: 'LR' },
    { class: 'Int', name: 'r15', shortName: 'PC' },
    // CPSR
  ],

  methods: [
    function render() {
      var self = this;
      this.start().
        style({display: 'flex'}).
        start().
          add(this.CODE).
        end().
        start().
          start('table').
            call(function() {
              for ( var i = 0 ; i < 16 ; i++ ) {
                this.start('tr').
                  start('th').add('R' + i).end().
                  start('th').add(self['R' + i].shortName).end().
                  start('td').add(self['R' + i]).end();
              }
            }).
          end().
        end().
      end().
      add(this.RUN).
      start('t3').add('Memory:').end()
      ;
    },

    function emit(instr, opt_size) {
      this.mem[this.cp] = instr;
      this.cp += opt_size || 16;
    },

    function MOV(r, n) {
      this.MOV.create({dst: r, src: n}).emit(this);
    },

    function ADD(r, n) {
      console.log('ADD', r.name, n);
      r.set(this, r.get(this) + n);
      this.r15 += 16;
    },

    function LABEL(n) {
      this.labels[n] = this.cp;
    },

    function B(l) {
      // this.B.create({addr: a}).emit(this);
      this.r15 = l;
    }
  ],

  actions: [
    function compile() {
      with ( this ) {
        eval(this.code);
      }
    },
    function run() {
      this.ip = 0;
      while ( true ) {
        this.mem[this.ip].execute(this);
      }
    }
  ]
});
