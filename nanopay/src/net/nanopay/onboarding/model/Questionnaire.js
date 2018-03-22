foam.CLASS({
  package: 'net.nanopay.onboarding.model',
  name: 'Questionnaire',

  description: 'Describes a number of questions as a whole',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of the questionnaire'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.onboarding.model.Question',
      name: 'questions'
    }
  ]
});
