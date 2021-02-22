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
  package: 'net.nanopay.contacts',
  name: 'AFEXCNBeneficiaryCapability',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions',
  ],

  messages: [
    { name: 'INVALID_PURPOSE_CODE',  message: 'Select a purpose of payment' }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.Phone',
      name: 'phone',
      autoValidate: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeCode',
      name: 'purposeCode',
      label: 'Purpose of payment',
      view: function(_, x) {
        return foam.u2.view.ChoiceView.create({
          dao: x.purposeCodeDAO.where(x.data.EQ(net.nanopay.tx.PurposeCode.COUNTRY, 'CN')),
          placeholder: '--',
          objToChoice: function(purposeCode) {
            return [purposeCode.code, purposeCode.description];
          }
        });
      },
      validationPredicates: [
        {
          args: ['purposeCode'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.contacts.AFEXCNBeneficiaryCapability.PURPOSE_CODE, '--');
          },
          errorString: this.INVALID_PURPOSE_CODE
        }
      ]
    }
  ],
});
