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
  package: 'net.nanopay.country.br.tx',
  name: 'NatureCodeLineItem',
  extends: 'net.nanopay.tx.TransactionLineItem',

  implements: [
    'foam.mlang.Expressions',
  ],

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  messages: [
    {
      name: 'INVALID_NATURE_CODE',
      message: 'Please select a nature code',
    }
  ],

  properties: [
    {
      name: 'natureCode',
      class: 'String',
      label: 'Nature Code',
      required: true,
      validationPredicates: [
        {
          args: ['natureCode'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.country.br.tx.NatureCodeLineItem.NATURE_CODE, '');
          },
          errorString: 'Please select a nature code.'
        }
      ],
      view: function(args, x) {
        return foam.u2.view.ChoiceView.create({
          dao: x.natureCodeDAO,
          placeholder: 'Please select',
          objToChoice: function(natureCode) {
            return [natureCode.operationType, natureCode.name];
          }
        });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.country.br.NatureCodeData',
      name: 'natureCodeData',
      factory: function() {
        return net.nanopay.country.br.NatureCodeData.create();
      },
      javaFactory: 'return new net.nanopay.country.br.NatureCodeData();'
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
      readVisibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'note',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'sourceAccount',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'destinationAccount',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'amount',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'currency',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'reversable',
      createVisibility: 'HIDDEN',
      readVisibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'requiresUserInput',
      value: true
    },
    {
      name: 'quoteOnChange',
      value: true
    }
  ],

  methods: [
    function validate() {
      if ( this.natureCode === '' ) {
        throw this.INVALID_NATURE_CODE;
      }
    },
    {
      name: 'getCode',
      type: 'String',
      code: function() {
        return this.natureCode + this.natureCodeData.payerType
          + this.natureCodeData.approvalType
          + this.natureCodeData.payeeType
          + this.natureCodeData.groupCode;
      },
      javaCode: `
        StringBuilder str = new StringBuilder();
        str.append(getNatureCode());
        str.append(getNatureCodeData().getPayerType());
        str.append(getNatureCodeData().getApprovalType());
        str.append(getNatureCodeData().getPayeeType());
        str.append(getNatureCodeData().getGroupCode());
        return str.toString();
      `
    }
  ]
});
