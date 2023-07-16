/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// https://developer.arm.com/documentation/dui0497/a/the-cortex-m0-instruction-set/instruction-set-summary?lang=en
// https://gab.wallawalla.edu/~curt.nelson/cptr380/textbook/advanced%20material/Appendix_B1.pdf
// https://gab.wallawalla.edu/~curt.nelson/cptr380/textbook/advanced%20material/Appendix_B2.pdf

/*
Lm Low register in range r0 to r7
Ln
Ld
Ld/Ln
Lm/Ls
Hm&7 high register  in range r8 to r15 bitwise anded with 7 0b0111, ie. without high-order bit
Rm Register in range r0 to r15
immed5
immed8
register_list, cond< 1110, immed7
*/

foam.CLASS({
  package: 'foam.demos.m0',
  name: 'Instr',

  imports: [
    'm0'
  ],

  methods: [
    function emit() {
      console.log('Emitting: ' + this);
      this.m0.emit(this);
    },
    function toString() {
      return this.cls_.name + '(' + this.cls_.getAxiomsByClass(foam.core.Property).map(p => p.get(this)).join(',') + ')';
    }
  ]
});


var INSTRS = [
  [ 'MOV',   16, [ 'dst', 'src' ],    function() { dst.set(this.m0, src); } ],
  [ 'ADD',   16, [ 'dst', 'amt' ],    function() { dst.set(this.m0, dst.get() + this.amt); } ],
  [ 'SUB',   16, [] ],
  [ 'SUBC',  16, [] ],
  [ 'B',     16, [ 'label', 'addr' ], function() { this.m0.ip = this.addr; } ],
];

// ARITHMETIC: ADD ADC SUB SBC NEG MUL
// CMP CMN
// SHIFT + ROTATION: LSL ASR ROR
// CONDITIONAL CODES: EQ NE CS/HS CC/LO MI PL VS VC HI LS GE LT GT LE AL
// Logical Operators: AND EOR ORR BIC MVN TST
// STACK: PUSH POP
// NOP

INSTRS.forEach(i => foam.CLASS({
  package: 'foam.demos.m0',
  name: i[0],
  extends: 'foam.demos.m0.Instr',

  properties: i[2],

  methods: [
    function execute() {
      a[3]();
      this.m0.r15 += i[1];
    }
  ]
}));


foam.CLASS({
  package: 'foam.demos.m0',
  name: 'M0',
  extends: 'foam.u2.Controller',

  requires: INSTRS.map(i => 'foam.demos.m0.' + i[0] + ' as ' + i[0] + '_I'),

  exports: [
    'as m0'
  ],

  properties: [
    {
      name: 'mem',
      factory: () => []
    },
    {
      name: 'labels',
      factory: function() { return {}; }
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
//    { class: 'Int', name: 'r8' },  // Unavailable on thumb
//    { class: 'Int', name: 'r9' },  // Unavailable on thumb
//    { class: 'Int', name: 'r10' }, // Unavailable on thumb
//    { class: 'Int', name: 'r11' }, // Unavailable on thumb
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
                if ( i == 7 ) i = 11; // Skip 8-11
              }
            }).
          end().
        end().
      end().
      add(this.COMPILE, this.RUN).
      br().
      start('h3').add('Memory:').end()
      ;
    },

    function emit(instr, opt_size) {
      this.mem[this.cp] = instr;
      this.cp += opt_size || 16;
    },

    function MOV(r, n) {
      this.MOV_I.create({dst: r, src: n}).emit();
    },

    function ADD(r, n) {
      this.ADD_I.create({dst: r, amt: n});
    },

    function LABEL(n) {
      this.labels[n] = this.cp;
    },

    function B(l) {
      this.B_I.create({label: l}).emit();
    }
  ],

  actions: [
    function compile() {
      with ( {
        R0:    this.R0,
        R1:    this.R1,
        R2:    this.R2,
        R3:    this.R3,
        R4:    this.R4,
        R5:    this.R5,
        R6:    this.R6,
        R7:    this.R7,
        R12:   this.R12,
        R13:   this.R13,
        R14:   this.R14,
        R15:   this.R15,
        IP:    this.R12,
        SP:    this.R13,
        LR:    this.R14,
        PC:    this.R15,
        ADD:   this.ADD.bind(this),
        B:     this.B.bind(this),
        LABEL: this.LABEL.bind(this),
        MOV:   this.MOV.bind(this),
      } ) {
        console.log('Compiling: ', this.code);
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
