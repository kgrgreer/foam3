/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'IsSpid',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `Returns true if user in context is of a spid in the list of spids configured.`,

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'java.util.Arrays'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'spids',
      javaFactory: 'return new String[]{};'
    }
  ],
  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        X x = (X) obj;
        User user = ((Subject) x.get("subject")).getUser();

        if ( user == null ) return false;
        if ( getSpids() == null || getSpids().length == 0 ) return false;

        //check if spid
        return Arrays.stream(getSpids()).anyMatch(user.getSpid()::equals);
      `
    }
  ]
});
