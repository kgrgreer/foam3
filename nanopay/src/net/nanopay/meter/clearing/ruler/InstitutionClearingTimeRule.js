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
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'InstitutionClearingTimeRule',
  extends: 'net.nanopay.meter.clearing.ruler.ClearingTimeRule',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.payment.Institution',
      name: 'institution',
      required: true,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.institutionDAO,
          placeholder: '--',
          objToChoice: function(institution) {
            return [institution.id, institution.name];
          }
        });
      },
      section: 'basicInfo'
    },
    {
      name: 'action',
      javaGetter: `
        return (x, obj, oldObj, ruler, rule, agency) -> {
          Transaction transaction = (Transaction) obj;
          Account account = findAccount(x, transaction);

          if ( account instanceof BankAccount
            && getInstitution() == ((BankAccount) account).getInstitution()
          ) {
            incrClearingTime(transaction);
          }
        };
      `
    }
  ]
});
