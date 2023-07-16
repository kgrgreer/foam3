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

const I_DESCS = {
  ADC:   'ADC',
  ADD:   'ADD',
  AND:   'AND',
  ASR:   'ASR',
  BIC:   'BIC',
  BLX:   'BLX',
  BX:    'BX',
  CMN:   'CMN',
  CMP:   'CMP',
  CPY:   'CPY',
  EOR:   'EOR',
  LDR:   'LDR',
  LDRB:  'LDRB',
  LDRH:  'LDRH',
  LDRSB: 'LDRSB',
  LDRSH: 'LDRSH',
  LSL:   'LSL',
  LSR:   'LSR',
  MOV:   'MOV',
  MUL:   'MUL',
  MVN:   'MVN',
  NEG:   'NEG',
  ORR:   'ORR',
  ROR:   'ROR',
  SBC:   'SBC',
  STR:   'STR',
  STRB:  'STRB',
  STRH:  'STRH',
  SUB:   'SUB',
  TST:   'TST',
  SXTH:  'SXTH',
  SXTB:  'SXTB',
  UXTH:  'UXTH',
  UXTB:  'UXTB',
  REV:   'REV',
  REV16: 'REV16',
  REVSH: 'REVSH',
  PUSH:  'PUSH',
  POP:   'POP',
  'SETEND LE': 'Set Endian to Little Endian',
  'SETEND BE': 'Set Endian to Big Endian',
  CPSIE: 'CPSIE',
  SPSID: 'SPSID',
  BKPT:  'BKPT',
  STMIA: 'STMIA',
  LDMIA: 'LDMIA',
  B:     'B',
  SWI:   'SWI',
  BL:    'BL'
};
/*
cond codes:
EQ,NE,CS/HS,CC/LO,MI,PL,VS,VC,HI,LS,GE,LT,GT,LE // ,{AL}
*/

const COND_CODES = `
EQ,EQual (last result zero),Z == 1
NE,Not Equal (last result nonzero),Z == 0
{CS|HS} Carry Set,unsigned Higher or Same (following a compare),C == 1
{CC|LO} Carry Clear,unsigned LOwer (follwing a comparison),C == 0
MI,MInus (last result negative),N==1
PL,PLus (last result greater than or equal to zero),N == 1
VS,V flag Set (signed overflow on last result),V == 1
VC,V flag Clear (no signed overflow on last result),V == 0
HI,unsigned HIgher (following a comparison),C == 1 && Z == 0
LS,unsigned Lower or Same (following a comparison),c == 0 || Z == 1
GE,signed Greater than or Equal,N == V
LT,signed Less Than,N != V
GT,signed Greater Than,N == V && Z == 0
LE,signed Less than or Equal,N != V || Z == 1
AL,Always,true
`.trim().split('\n');

const INSTRUCTIONS_ = `
LSL|LSR,0000,op,immed5,Lm,Ld
ASR,00010,immed5,Lm,Ld
ADD|SUB,000110,op,Lm,Ln,Ld
ADD|SUB,000111,op,immed3,Ln,Ld
MOV|CMP,0010,op,Ld/Ln,immed8
ADD|SUB,0011,op,Ld,immed8
AND|EOR|LSL|LSR,01000000,op,Lm/Ls,Ld
ASR|ADC|SBC|ROR,01000001,op,Lm/Ls,Ld
TST|NEG|CMP|CMN,01000010,op,Lm,Ld/Ln
ORR|MUL|BIC|MVN,01000011,op,Lm,Ld
CPY,0100011000,Lm,Ld
ADD|MOV,010001,op,001,Hm&7,Ld
ADD|MOV,010001,op,010,Lm,Hd&7
ADD|MOV,010001,op,011,Hm&7,Hd&7
CMP,0100010101,Hm&7,Ln
CMP,0100010110,Lm,Hn&7
CMP,010001011,Hm&7,Hn&7
BX|BLX,01000111,op,Rm,000
LDR,01001,Ld,immed8
STR|STRH|STRB|LDRSB,01010,op,Lm,Ln,Ld
LDR|LDRH|LDRB|LDRSH,01011,op,Lm,Ln,Ld
STR|LDR,0110,op,immed5,Ln,Ld
STRB|LDRB,0111,op,immed5,Ln,Ld
STRH|LDRH,1000,op,immed5,Ln,Ld
STR|LDR,1001,op,Ld,immed8
ADD,1010,pc|sp,Ld,immed8
ADD|SUB,10110000,op,immed7
SXTH|SXTB|UXTH|UXTB,10110010,op,Lm,Ld
REV|REV16||REVSH,10111010,op,Lm<Ld
PUSH|POP,1011,op,10,R,register_list
SETEND LE|SETEND BE,101101100101,op,000
CPSIE|SPSID,10110110011,op,0a,i,f
BKPT,10111110,immed8
STMIA|LDMIA,1100,op,Ln,register_list
BEQ|BNE|BCS|BCC|BMI|BPL|BVS|BVC|BHI|BLS|BGE|BLT|BGT|BLE,1101,op,eightbitoffset
SWI,11011110,x
B,0,elevenbitoffset
BLX,11101,unsignedtenbitoffset
BL,11111,unsignedelevenbitoffset
`.trim().split('\n');

INSTRUCTIONS_.forEach(i => {
  var a  = i.split(',');
  var is = a[0].split('|');

  is.forEach((m, i) => {
    if ( ! m ) return;
    var b = foam.Array.clone(a);
    b[0] = m;
    var op_i = b.indexOf('op');
    if ( op_i != -1 ) {
      b[op_i] = i.toString(2).padStart(Math.ceil(Math.log2(is.length)), '0');
    }
    I_DESCS[b[0]] = b[0];
    console.log(b);
  });
});
const INSTRUCTIONS = [];

console.log(I_DESCS);

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
