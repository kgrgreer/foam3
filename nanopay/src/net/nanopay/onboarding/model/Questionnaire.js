foam.CLASS({
  package: 'net.nanopay.onboarding.model',
  name: 'Questionnaire',

  documentation: 'Describes a number of questions as a whole',

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
      name: 'questions',
      documentation: 'Questions associated to questionaire.',
    }
  ]
});
