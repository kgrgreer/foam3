foam.CLASS({
  package: 'net.nanopay.security.snapshooter',
  name: 'Service',

  documentation: 'Model to hold information about a Service.',

  properties: [
    {
      name: 'name',
      class: 'String',
      documentation: 'The name of the service.'
    },
    {
      name: 'data',
      javaType: 'java.util.List',
      documentation: 'The MDAO that stores the data for the service.'
    }
  ],
});
