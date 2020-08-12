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
      message: 'Please select a nature code.',
    }
  ],

  properties: [
    {
      name: 'natureCode',
      class: 'Reference',
      of: 'net.nanopay.country.br.NatureCode',
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
          dao: x.natureCodeDAO.where(x.data.AND(
            x.data.NEQ(net.nanopay.country.br.NatureCode.CODE, ''),
            x.data.EQ(net.nanopay.country.br.NatureCode.COUNTRY, 'BR')
          )),
          placeholder: 'Please select',
          objToChoice: function(natureCode) {
            return [natureCode.code, natureCode.name];
          }
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
    }
  ]
});
