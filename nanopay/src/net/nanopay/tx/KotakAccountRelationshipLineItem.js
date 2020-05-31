foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakAccountRelationshipLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'accountRelationship',
      class: 'Reference',
      of: 'net.nanopay.tx.AccountRelationship',
      label: 'Relationship with the contact',
      view: {
        class: 'foam.u2.view.ChoiceWithOtherView',
        choiceView: {
          class: 'foam.u2.view.ChoiceView',
          placeholder: 'Please Select',
          choices: [
            'Employer/Employee',
            'Contractor',
            'Vendor/Client',
            'Other'
          ]
        },
        otherKey: 'Other'
      },
      validationPredicates: [
        {
          args: ['accountRelationship'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.bank.INBankAccount.ACCOUNT_RELATIONSHIP, '');
          },
          errorString: 'Please specify your Relationship with the contact.'
        }
      ],
    },
        {
      name: 'id',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'group',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'name',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'type',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'note',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'amount',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'reversable',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN'
    },
    {
      name: 'requiresUserInput',
      readVisibility: 'HIDDEN',
      value: true
    }
  ],

  methods: [
    function validate() {
      if ( this.accountRelationship === '' ) {
        throw 'Relationship with the contact cannot be empty';
      }
    }
  ]
});
