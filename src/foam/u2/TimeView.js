/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2',
  name: 'TimeView',
  extends: 'foam.u2.tag.Input',

  documentation: 'View for editing Time values.',

  axioms: [
    { class: 'foam.u2.TextInputCSS' }
  ],

  css: `
    ^ {
      width: fit-content;
    }
  `,

  methods: [
    function render() {
      this.SUPER();
      this.setAttribute('type', 'time');
    }
  ]
});
