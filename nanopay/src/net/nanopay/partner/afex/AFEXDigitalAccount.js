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
  package: 'net.nanopay.partner.afex',
  name: 'AFEXDigitalAccount',
  extends: 'net.nanopay.account.DigitalAccount',
  label: 'AFEX Digital Account',
  documentation: `AFEX internal Digital Account. stores the balanceID of the user. for tracking afex internal customer balances and transactions. BalanceID used for afex api calls`,

  javaImports: [
    'foam.core.Currency',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.List',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.LifecycleState'
  ],

  properties: [
    {
      name: 'denomination',
      value: 'CAD',
      updateVisibility: 'RO'
    },
    {
      name: 'balanceID',
      class: 'String',
    },
  ],

 /* axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`


        `);
      }
    }
  ]*/
});
