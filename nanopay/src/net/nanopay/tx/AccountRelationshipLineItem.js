foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'AccountRelationshipLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.AccountRelationship',
      name: 'accountRelationship',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView', 
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: 'Please select',
          choices: [
            'Employee',
            'Contractor',
            'Client',
            'Other'
          ]
        },
        otherKey: 'Other'
      }
    }
  ]
});
