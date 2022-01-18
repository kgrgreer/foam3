/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.detail',
  name: 'AbstractDetailView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.detail.ReferencePath'
  ],

  imports: [
    'referencePath?'
  ],

  exports: [
    'subReferencePath as referencePath'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.u2.detail.ReferencePath',
      name: 'subReferencePath',
      expression: function (data) {
        return this.ReferencePath.create({
          current: data,
          parent: this.referencePath
        });
      }
    }
  ]
});
