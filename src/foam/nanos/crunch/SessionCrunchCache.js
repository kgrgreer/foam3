foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'SessionCrunchCache',

  javaImports: [
    'java.util.Map',
    'java.util.List'
  ],

  properties: [
    {
      class: 'Int',
      name: 'sequenceId'
    },
    {
      class: 'Object',
      javaType: 'Map<String, List<String>>',
      name: 'prerequisites'
    },
    {
      class: 'Object',
      javaType: 'Map<String, List<String>>',
      name: 'dependants'
    }
  ]
});
