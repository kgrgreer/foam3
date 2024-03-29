/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.demos.elementbuilder',
  name: 'Builder',

  properties: [
    {
      class: 'String',
      name: 'html',
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 100 },
      postSet: function(_, html) {
        this.output = html;
      }
    },
    {
      class: 'String',
      name: 'output',
      visibility: 'RO',
      view: { class: 'foam.u2.tag.TextArea', rows: 40, cols: 100 },
    }
  ]
});
