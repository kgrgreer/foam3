foam.INTERFACE({
  package: 'net.nanopay.security.pii',
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
          name: 'id',
          class: 'Long',
          documentation: 'id of the user for whom the data is being reported'
        }
      ]
    }
    // TODO - implement method to deletablePII
    // {
    //   name: 'deletePIIData',
    //   returns: 'void',
    // }
  ]
});
