/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.borders',
  name: 'MultiBorder',
  extends: 'foam.u2.Element',
  documentation: `
    Allows multiple borders to behave as a single border.
  `,

  properties: [
    {
      class: 'Array',
      name: 'borders'
    }
  ],

  methods: [
    function init () {
      let e = this;
      for ( let border of this.borders ) {
        e = e.start(border);
      }
      e.tag('div', null, this.content$);
    }
  ]
});
