/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.m0',
  name: 'M0',
  extends: 'foam.u2.Controller',

  properties: [
    {
      class: 'String',
      name: 'code',
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 60 }
    },
    { name: 'r0' },
    { name: 'r1' },
    { name: 'r2' },
    { name: 'r3' },
    { name: 'r4' },
    { name: 'r5' },
    { name: 'r6' },
    { name: 'r7' },
    { name: 'r8' },
    { name: 'r9' },
    { name: 'r10' },
    { name: 'r11' },
    { name: 'r12' },
    { name: 'r13' },
    { name: 'r14' },
    { name: 'r15' },
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
                this.start('tr').start('th').add('R' + i).end().start('td').add(self['R' + i]);
              }
            }).
          end().
        end().
      end();
    }
  ]
});
