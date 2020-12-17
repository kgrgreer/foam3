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
  package: 'net.nanopay.flinks.model',
  name: 'AccountWithDetailModel',
  extends: 'net.nanopay.flinks.model.AccountModel',

  documentation: 'model for the Flinks account with detail model',

  imports: [ 'accountDAO as bankAccountDAO' ],

  properties: [
    {
      // type: 'net.nanopay.flinks.model.HolderModel',
      // javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      // javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.HolderModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.HolderModel',
      name: 'Holder'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.AccountTransactionModel',
      name: 'Transactions'
    },
    {
      class: 'String',
      name: 'TransitNumber'
    },
    {
      class: 'String',
      name: 'InstitutionNumber'
    },
    {
      class: 'String',
      name: 'Type'
    },
    {
      class: 'String',
      name: 'Title'
    },
    {
      class: 'String',
      name: 'AccountNumber'
    }
  ]
});
