foam.CLASS({
  package: 'net.nanopay.admin.predicate',
  name: 'IsCurrentUser',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the userId is the current user id.',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject'
  ],

  properties: [
    {
      class: 'Long',
      name: 'userId'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        return obj instanceof X
          && getUserId() > 0
          && getUserId() == ((Subject) ((X) obj).get("subject")).getUser().getId();
      `
    }
  ]
});
