/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Count',
  extends: 'foam.dao.AbstractSink',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Sink which counts number of objects put().',

  properties: [
    {
      class: 'Long',
      name: 'value'
    },
    {
      class: 'String',
      name: 'label',
      value: 'Count'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function() { this.value++ },
      swiftCode: 'value+=1',
      javaCode: 'setValue(this.getValue() + 1);'
    },
    {
      name: 'remove',
      code: function() { this.value-- },
      swiftCode: 'value-=1',
    },
    {
      name: 'reset',
      code: function() { this.value = 0 },
      swiftCode: 'value = 0',
    },
    function toString() { return 'COUNT()'; }
  ]
});
