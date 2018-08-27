foam.INTERFACE({
  package: 'net.nanopay.security.PII',
  name: 'PII',
  javaImports: [
    'org.json.simple.JSONObject'
  ],

  methods: [
    {
      name: 'getPIIData',
      returns: 'JSONObject',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'userID',
          class: 'Long'
        }
      ],
    }
    // TODO - implement method to deletablePII
    // {
    //   name: 'deletePIIData',
    //   returns: 'void',
    // }
  ]
});
