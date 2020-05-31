foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakPaymentPurposeLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'purposeCode',
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeCode',
      label: 'Purpose of Transfer',
      validationPredicates: [
        {
          args: ['purposeCode'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.bank.INBankAccount.PURPOSE_CODE, '');
          },
          errorString: 'Please enter a Purpose of Transfer.'
        }
      ],
      view: function(args, x) {
        if ( args.mode$.value.name === 'RO' ) {
          return foam.u2.Element.create()
            .start()
              .add(x.data.getPurposeName())
            .end();
        }
        return foam.u2.view.ChoiceWithOtherView.create({
          choiceView: foam.u2.view.ChoiceView.create({
            dao: x.purposeCodeDAO,
            placeholder: 'Please select',
            objToChoice: function(purposeCode) {
              return [purposeCode.code, purposeCode.description];
            }
          }),
          otherKey: 'Other'
        });
      }
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
      value: true
    }
  ],
  methods: [
    function validate() {
      if ( this.purposeCode === '' ) {
        throw 'Purpose of Transfer cannot be empty';
      }
    },
    function getPurposeName() {
      switch ( this.purposeCode ) {
        case 'P0306':
          return 'Payment For Travel';
        case 'P1306':
          return 'Tax Payments In India';
        case 'P0011':
          return 'Repayment of loans';
        case 'P0103':
          return 'Advance payment against imports';
        default:
          return 'Trade transaction';
      }
    }
  ]
});
