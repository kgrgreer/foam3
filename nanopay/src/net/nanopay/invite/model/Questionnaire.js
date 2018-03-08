foam.CLASS({
  package: 'net.nanopay.invite.model',
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
``
foam.RELATIONSHIP({
  sourceModel: 'net.nanopay.invite.model.Questionnaire',
  targetModel: 'net.nanopay.invite.model.Question',
  cardinality: '*:*',
  forwardName: 'questions',
  inverseName: 'questionnaires'
});
