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
  name: 'ExternalTransfer',
  extends: 'net.nanopay.tx.Transfer',
  documentation: 'describes: what amount is added to which account (external)',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ExternalTransfer(String account, long amount) {
            setAmount(amount);
            setAccount(account);
          }
        `);
        cls.extras.push(`
          public ExternalTransfer(String account, long amount, long stage) {
            setAmount(amount);
            setAccount(account);
            setStage(stage);
          }
        `);
      }
    }
  ]
});
