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
  package: 'net.nanopay.support',
  name: 'SupportAccount',

  documentation: `This model represents an account from an external support perspective.`,

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.nanos.auth.Address'
  ],

  imports: [
    'branchDAO',
    'capabilityDAO',
    'countryDAO',
    'institutionDAO',
    'paymentProviderCorridorDAO',
    'supportTransactionDAO'
  ],

  tableColumns: [
    'id',
    'summary',
    'name'
  ],

  sections: [
    {
      name: 'accountInformation'
    },
    {
      name: 'transactions'
    }
  ],

  properties: [
    net.nanopay.account.Account.ID.clone().copyFrom({
      label: 'Account Id',
      section: 'accountInformation',
      order: 1
    }),
    net.nanopay.bank.CABankAccount.SUMMARY.clone().copyFrom({
      label: 'Account Number',
      section: 'accountInformation',
      order: 2
    }),
    net.nanopay.bank.BankAccount.ACCOUNT_NUMBER.clone().copyFrom({
      hidden: true,
      section: 'accountInformation',
    }),
    net.nanopay.bank.BankAccount.BRANCH.clone().copyFrom({
      gridColumns:6,
      visibility: 'RO',
      section: 'accountInformation',
      order: 3
    }),
    net.nanopay.bank.BankAccount.INSTITUTION.clone().copyFrom({
      gridColumns:6,
      visibility: 'RO',
      section: 'accountInformation',
      order: 4
    }),
    net.nanopay.account.Account.NAME.clone().copyFrom({
      gridColumns:6,
      section: 'accountInformation',
      order: 5
    }),
    net.nanopay.account.Account.DENOMINATION.clone().copyFrom({
      label: 'Currency',
      gridColumns:6,
      visibility: 'RO',
      section: 'accountInformation',
      order: 6
    }),
    net.nanopay.account.Account.DESC.clone().copyFrom({
      section: 'accountInformation',
      order: 7
    }),
    net.nanopay.account.Account.CREATED_BY.clone().copyFrom({
      gridColumns:6,
      view: {
        class: 'foam.u2.view.ReferenceView'
      },
      section: 'accountInformation',
      order: 8
    }),
    net.nanopay.account.Account.LAST_MODIFIED_BY.clone().copyFrom({
      gridColumns:6,
      view: {
        class: 'foam.u2.view.ReferenceView'
      },
      section: 'accountInformation',
      order: 9
    }),
    net.nanopay.account.Account.CREATED.clone().copyFrom({
      gridColumns:6,
      section: 'accountInformation',
      order: 10
    }),
    net.nanopay.account.Account.LAST_MODIFIED.clone().copyFrom({
      gridColumns:6,
      section: 'accountInformation',
      order: 11
    }),
    net.nanopay.account.Account.OWNER.clone().copyFrom({
      view: {
        class: 'foam.u2.view.ReferenceView'
      },
      section: 'accountInformation',
      order: 12
    }),
    net.nanopay.account.Account.CREDITS.clone().copyFrom({
      section: 'transactions'
    }),
    net.nanopay.account.Account.DEBITS.clone().copyFrom({
      section: 'transactions'
    })
  ],

  methods: [
    function toSummary() {
      return '(' + this.id + ') ' + this.name + ' ' + this.summary;
    },

    function getCredits() {
      return this.supportTransactionDAO.where(
        this.EQ(net.nanopay.support.SupportTransaction.DESTINATION_ACCOUNT, this.id)
      );
    },

    function getDebits() {
      return this.supportTransactionDAO.where(
        this.EQ(net.nanopay.support.SupportTransaction.SOURCE_ACCOUNT, this.id)
      );
    }
  ]
});
