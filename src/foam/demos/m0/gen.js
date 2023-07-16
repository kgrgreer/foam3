/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 /*
 cond codes:
 EQ,NE,CS/HS,CC/LO,MI,PL,VS,VC,HI,LS,GE,LT,GT,LE // ,{AL}
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
