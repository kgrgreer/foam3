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

  mixins: [ 'foam.u2.TextInputCSS' ],

  css: `
    ^ {
      height: $inputHeight;
      min-width: 116px;
    }
  `,

  properties: [ ['type', 'time'] ]
});
