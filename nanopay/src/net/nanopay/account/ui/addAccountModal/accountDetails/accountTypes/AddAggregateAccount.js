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
  package: 'net.nanopay.account.ui.addAccountModal.accountDetails.accountTypes',
  name: 'AddAggregateAccount',

  implements: [
    'foam.mlang.Expressions'
  ],

  documentation: `
    A view for the user to enter the details required to add an Aggregate Account on Liquid
  `,

  exports: [
    'predicatedAccountDAO'
  ],

  imports: [
    'accountDAO',
    'user'
  ],

  requires: [
    'net.nanopay.account.Account'
  ],

  properties: [
    {
      class: 'String',
      name: 'accountName',
      documentation: `
        The name of the new account
      `,
      validateObj: function(accountName) {
        if ( accountName.length === 0 || !accountName.trim() ) {
          return 'Account name is required before proceeding.';
        }
      }
    },
    {
      name: 'predicatedAccountDAO',
      hidden: true,
      documentation: `
        A predicatedAccountDAO which only pulls the accounts from a user's
        business group
      `,
      expression: function(user$id, accountDAO) {
        // only return other accounts in the business group
        // ! uncomment the line below once we figure this out
        // return accountDAO.where(this.EQ(this.Account.OWNER, user$id));
        return accountDAO // ! comment this later on
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'parentAccountPicker',
      targetDAOKey: 'predicatedAccountDAO',
      documentation: `
        A picker to choose parent accounts based on the
        existing accounts of the user by going through the accountDAO
        and grabbing only the digital accounts owned by the user
      `,
      validateObj: function(parentAccountPicker) {
        if ( ! parentAccountPicker ) {
          return 'Please select a parent for this Aggregate Account';
        }
      }
    },
    {
      class: 'String',
      name: 'memo',
      documentation: `
        A text area for the user to write any notes about the account
      `,
      view: {
        class: 'foam.u2.tag.TextArea',
        rows: '8px'
      },
      required: false
    }
  ]
});
