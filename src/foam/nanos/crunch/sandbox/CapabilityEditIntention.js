foam.CLASS({
  package: 'foam.nanos.crunch.sandbox',
  name: 'CapabilityEditIntention',
  extends: 'foam.nanos.crunch.lite.BaseCapable',
  documentation: `
    Stores UCJs for a capability being editied and its prerequisite
    requirements for a "test run" to make sure requirements are met
    before applying them to the real userCapabilityJunctionDAO.
  `,

  javaImports: [
    'foam.nanos.crunch.CapabilityJunctionPayload'
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      factory: function () {
        return foam.uuid.randomGUID();
      }
    },
    {
      class: 'StringArray',
      name: 'idsUpdated'
    },
    {
      class: 'StringArray',
      name: 'subjectPath'
    }
  ]
});
