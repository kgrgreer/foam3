/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'RemoveSink',
  extends: 'foam.dao.AbstractSink',
  flags: ['js', 'java'],

  implements: [
    'foam.core.ContextAware'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.core.X'
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    }
  ],

  methods: [
    {
      name: 'put',
      args: [
        {
          type: 'Object',
          name: 'obj'
        },
        {
          type: 'foam.core.Detachable',
          name: 'sub'
        }
      ],
      code: function (obj, sub) {
        this.dao.remove_(this.__context__, obj)
      },
      javaCode: `
        getDao().remove_(getX(), (FObject) obj);
      `
    }
  ]
});