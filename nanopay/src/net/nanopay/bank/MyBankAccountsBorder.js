/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.bank',
  name: 'MyBankAccountsBorder',
  extends: 'foam.u2.Element',
  documentation: `
    A border which restricts bankAccountDAO to only custom bank accounts.
  `,
  requires: [
    'net.nanopay.bank.BankAccount'
  ],

  imports: [
    'config as oldConfig',
    'user'
  ],
  exports: [ 'config' ],

  properties: [
    {
      name: 'config',
      factory: function() {
        var config = this.oldConfig.clone();
        //config.dao = this.subject.user.accounts;

        config.dao = config.dao
          .where(
            this.AND(
              this.INSTANCE_OF(this.BankAccount),
              this.EQ(this.BankAccount.OWNER, this.user.id),
            )
          )
          .orderBy(this.BankAccount.CREATED);
        return config;
      }
    }
  ]
});
