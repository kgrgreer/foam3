/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'KotakCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  documentation: `Hold Kotak Bank specific properties`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction'
  ]

});
