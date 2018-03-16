foam.CLASS({
  package: 'net.nanopay.onboarding.model',
  name: 'Questionnaire',

  description: 'Describes a number of questions as a whole',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the questionnaire'
    }
  ]
});
