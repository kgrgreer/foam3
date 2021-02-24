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
    'foam.mlang.Expressions'
  ],

  sections: [
    {
      name: 'additionalInfoSection',
      title: 'Additional Information',
      help: 'Require your most convenient phone number.'
    }
  ],

  messages: [
    { name: 'INVALID_PURPOSE_CODE',  message: 'Select a purpose of payment' },
    { name: 'PLACE_HOLDER', message: 'Please select...' }
  ],

  properties: [
    foam.nanos.auth.User.PHONE_NUMBER.clone().copyFrom({
      section: 'additionalInfoSection',
      label: 'Phone number',
      visibility: 'RW',
      required: true,
      autoValidate: true,
      gridColumns: 12
    }),
    {
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeCode',
      name: 'purposeCode',
      label: 'Purpose of payment',
      section: 'additionalInfoSection',
      gridColumns: 12,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          dao: X.purposeCodeDAO.where(X.data.EQ(net.nanopay.tx.PurposeCode.COUNTRY, 'CN')),
          placeholder: X.data.PLACE_HOLDER,
          objToChoice: function(purposeCode) {
            return [purposeCode.code, X.translationService.getTranslation(foam.locale, purposeCode.description, purposeCode.description)];
          }
        };
      },
      validationPredicates: [
        {
          args: ['purposeCode'],
          predicateFactory: function(e) {
            return e.GT(
              foam.mlang.StringLength.create({
                arg1: net.nanopay.contacts.AFEXCNBeneficiaryCapability.PURPOSE_CODE
              }), 0);
          },
          errorMessage: 'INVALID_PURPOSE_CODE'
        }
      ]
    }
  ],
});
