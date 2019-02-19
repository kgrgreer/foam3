foam.CLASS({
  package: 'net.nanopay.security',
  name: 'RandomNonceDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator which randomly generates 128 bits to use as an ID',

  javaImports: [
    'foam.util.SafetyUtil',
    'foam.util.SecurityUtil',
    'org.bouncycastle.util.encoders.Hex'
  ],

  axioms: [
    {
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public RandomNonceDAO(foam.dao.DAO delegate) {
            System.err.println("Direct constructor use is deprecated. Use Builder instead.");
            setDelegate(delegate);
          }
        `);
      }
    }
  ],

  properties: [
    {
      /** The property to set uniquely. */
      class: 'String',
      name: 'property',
      value: 'id'
    },
    {
      type: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'axiom',
      javaFactory: 'return (foam.core.PropertyInfo)(getOf().getAxiomByName(getProperty()));'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        synchronized ( this ) {
          if ( SafetyUtil.isEmpty((String) getAxiom().get(obj)) ) {
            byte[] bytes = new byte[16];
            SecurityUtil.GetSecureRandom().nextBytes(bytes);
            getAxiom().set(obj, Hex.toHexString(bytes));
          }
        }

        return super.put_(x, obj);
      `
    }
  ]
});
