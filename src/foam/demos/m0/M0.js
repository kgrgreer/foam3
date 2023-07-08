/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.m0',
  name: 'Instruction',

  imports: [
    'm0'
  ],

  methods: [
    function emit() {
      this.m0.emit(this);
    },
    function toString() {
      return this.cls_.name + '(' + this.cls_.getAxiomsByclass(foam.core.Property.map(p => p.get(this)).join(',') + ')';
    }
  ]
});

var INSTRS = [
  [ 'MOV', 16, [ 'dst', 'src' ], function() { dst.set(this.m0, src); } ],
  [ 'B',   16, [ 'addr' ],       function() { this.m0.ip = this.addr; } ]
];

INSTRS.forEach(i => foam.CLASS(
  package: 'foam.demos.m0',
  name: i[0],

  properties: i[2],

  methods: [
    a[3]
  ]
));


foam.CLASS({
  package: 'foam.demos.m0',
  name: 'MOV',

  properties: [
    'dst', 'src'
  ],

  methods: [
    function execute() {
      dst.set(this.m0, src);
      this.m0.r15 += 16;
    }
  ]
});

/*
foam.CLASS({
  package: 'foam.demos.m0',
  name: 'ADD',

  properties: [
    'dst', 'amt'
  ],

  methods: [
    function execute() {
      dst.set(this.m0, dst.get() + this.amt);
      this.m0.r15 += 16;
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
    function execute() {
      this.m0.ip = this.addr;
    },
    function toString() {
      return `B(${this.addr})`;
    }
  ]
});
*/


foam.CLASS({
  package: 'foam.demos.m0',
  name: 'M0',
  extends: 'foam.u2.Controller',

  imports: [
    'foam.demos.m0.ADD',
    'foam.demos.m0.B',
    'foam.demos.m0.MOV'
  ],

  exports: [
    'as m0'
  ]

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
    // r0-r3 functions can use without saving
    { class: 'Int', name: 'r0' },
    { class: 'Int', name: 'r1' },
    { class: 'Int', name: 'r2' },
    { class: 'Int', name: 'r3' },
    { class: 'Int', name: 'r4' },
    { class: 'Int', name: 'r5' },
    { class: 'Int', name: 'r6' },
    { class: 'Int', name: 'r7' },
    { class: 'Int', name: 'r8' },  // Unavailable on thumb
    { class: 'Int', name: 'r9' },  // Unavailable on thumb
    { class: 'Int', name: 'r10' }, // Unavailable on thumb
    { class: 'Int', name: 'r11' }, // Unavailable on thumb
    { class: 'Int', name: 'r12', shortName: 'IP' }, // Intraprocedure call scratch register
    { class: 'Int', name: 'r13', shortName: 'SP' }, // Stack Pointer
    { class: 'Int', name: 'r14', shortName: 'LR' }, // Link Register
    { class: 'Int', name: 'r15', shortName: 'PC' }, // Program Counter
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
      this.MOV.create({dst: r, src: n}).emit();
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
      // this.B.create({addr: a}).emit();
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
        this.mem[this.ip].execute();
      }
    }
  ]
});
