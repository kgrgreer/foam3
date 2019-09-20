foam.CLASS({
  package: 'net.nanopay.accounting',
  name: 'AccountingLog',
  
  javaImports: [
    'java.util.Date'
  ],
  
  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'request'
    },
    {
      class: 'String',
      name: 'response',
    },
    {
      class: 'DateTime',
      name: 'requestTime',
      visibility: 'RO'
    },
    {
      class: 'DateTime',
      name: 'responseTime',
      visibility: 'RO'
    }
  ],

  methods: [
    {
      name: 'logRequest',
      args: [
        {
          name: 'request',
          type: 'String'
        }
      ],
      javaCode: `
      setRequest(request);
      setRequestTime(new Date());
      `
    },
    {
      name: 'logResponse',
      args: [
        {
          name: 'response',
          type: 'String'
        }
      ],
      javaCode: `
      setResponse(response);
      setResponseTime(new Date());
      `
    }
  ],
});
