foam.CLASS({
  package: 'net.nanopay.meter.compliance.ruler.predicate',
  name: 'NewEqOld',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if NEW_OBJ equals OLD_OBJ.',

  javaImports: [
    'foam.core.FObject',
    'static foam.mlang.MLang.*',
  ],

  properties: [
    {
      name: 'ignores',
      class: 'String',
      documentation: 'Ignored properties separated by comma.',
      value: 'lastModified'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        FObject old = (FObject) OLD_OBJ.f(obj);
        FObject nu  = (FObject) NEW_OBJ.f(obj);
        if ( old == null ) {
          return nu == null;
        }

        old = old.fclone();
        nu = nu.fclone();
        // nullify ignored properties
        for ( String prop : getIgnores().split(",") ) {
          nu.setProperty(prop, null);
          old.setProperty(prop, null);
        }
        return nu.equals(old);
      `
    }
  ]
});
