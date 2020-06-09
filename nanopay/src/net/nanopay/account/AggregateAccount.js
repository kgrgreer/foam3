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
  package: 'net.nanopay.account',
  name: 'AggregateAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  documentation: 'Calculates balance of all children accounts.',

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.fx.ExchangeRate',
  ],

  requires: [
    'net.nanopay.account.AggregateAccount',
    'net.nanopay.fx.ExchangeRate'
  ],

  properties: [
    {
      name: 'denomination',
      updateVisibility: 'RW'
    },
    {
      name: 'liquiditySetting',
      visibility: 'HIDDEN'
    }
  ]
});

