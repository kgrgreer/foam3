foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ServiceProviderURL',

  documentation: 'Configure ServiceProvider to apply on User Create based on AppConfig URL',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'spid',
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider'
    },
    {
      name: 'urls',
      class: 'StringArray',
      documentation: 'Array of urls to enforce this spid on',
      factory: function(){
        return  [];
      },
      javaFactory: 'return new String[0];'
    },
  ],

  methods: [
    {
      name: 'validate',
      args: [
        {
          name: 'x', type: 'Context'
        }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
      return ! SafetyUtil.isEmpty(getSpid()) &&
             getUrls().size() > 0;
      `
    },
  ]
});
