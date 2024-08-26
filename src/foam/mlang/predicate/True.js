/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'True',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Expression which always returns true.',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    {
      type: 'FObject',
      name: 'fclone',
      javaCode: 'return this;'
    },
    {
      name: 'f',
      code: function() { return true; },
      swiftCode: 'return true',
      javaCode: 'return true;'
    },
    {
      name: 'partialEval',
      code: function() { return this },
      javaCode: 'return foam.mlang.MLang.TRUE;'
    }
  ]
});
