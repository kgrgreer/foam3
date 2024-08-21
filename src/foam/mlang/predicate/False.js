/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'False',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Expression which always returns false.',

  axioms: [ foam.pattern.Singleton.create() ],

  methods: [
    {
      type: 'FObject',
      name: 'fclone',
      javaCode: 'return this;'
    },
    {
      name: 'f',
      code: function f() { return false; },
      javaCode: 'return false;'
    },
    {
      name: 'createStatement',
      type: 'String',
      javaCode: 'return " 1 <> 1 ";',
      code: function() { return "1 <> 1"; }
    },
    {
      name: 'partialEval',
      code: function() { return this },
      javaCode: 'return foam.mlang.MLang.FALSE;'
    }
  ]
});
