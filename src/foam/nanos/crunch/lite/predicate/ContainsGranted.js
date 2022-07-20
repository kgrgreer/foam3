foam.CLASS({
  package: 'foam.nanos.crunch.lite.predicate',
  name: 'ContainsGranted',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.nanos.crunch.lite.Capable',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*',
  ],

  properties: [
    {
      class: 'String',
      name: 'capability'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        var x = (X) obj;
        var capableObj = (Capable) x.get("NEW");

        for ( var payload : capableObj.getCapablePayloads() ) {
          if ( ! payload.getCapability().equals(getCapability()) ) continue;
          if ( payload.getStatus() == GRANTED ) return true;
          break;
        }

        return false;
      `
    }
  ],
});
