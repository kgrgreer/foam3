/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakPaymentPurposeLineItem',
  extends: 'net.nanopay.tx.InfoLineItem',

  implements: [
    'foam.mlang.Expressions',
  ],

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  messages: [
    { name: 'DESCRIPTION', message: 'Kotak Payment Purpose' }
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
            return e.NEQ(net.nanopay.tx.KotakPaymentPurposeLineItem.PURPOSE_CODE, '');
          },
          errorString: 'Please enter a Purpose of Transfer.'
        }
      ],
      view: function(args, x) {
        if ( args.mode$.value && args.mode$.value.name === 'RO' ) {
          return foam.u2.Element.create()
            .start()
              .add(x.data.getPurposeName())
            .end();
        }
        return foam.u2.view.ChoiceWithOtherView.create({
          choiceView: foam.u2.view.ChoiceView.create({
            dao: x.purposeCodeDAO.where(x.data.EQ(net.nanopay.tx.PurposeCode.COUNTRY, 'IN')),
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
    },

    function toSummary() {
      return this.DESCRIPTION;
    }
  ]
});
