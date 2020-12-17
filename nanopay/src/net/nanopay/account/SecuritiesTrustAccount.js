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
  name: 'SecuritiesTrustAccount',
  extends: 'net.nanopay.account.SecuritiesAccount',

  documentation: 'The base model for storing all individual securities.',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'foam.core.Currency'
  ],

  searchColumns: [
    'name', 'id', 'denomination', 'type'
  ],

  tableColumns: [
    'id',
    'name',
    'type',
    'denomination.name',
    'balance'
  ],

  properties: [

  ],

  methods: [

  ]
});
