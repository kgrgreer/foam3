foam.CLASS({
  package: 'net.nanopay.onboarding.model',
  name: 'Question',

  documentation: 'Describes a single question as part of a Questionnaire',

  properties: [
    {
      class: 'String',
      name: 'question',
      documentation: 'Describes the question'
    },
    {
      class: 'String',
      name: 'response',
      documentation: 'Describes the answer'
    }
  ]
});