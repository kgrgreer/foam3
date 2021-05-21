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
  package: 'net.nanopay.tx.bmo',
  name: 'BmoSFTPCredential',

  axioms: [ foam.pattern.Singleton.create() ],

  properties: [
    {
      class: 'Boolean',
      name: 'enable'
    },
    {
      class: 'Boolean',
      name: 'skipSendFile'
    },
    {
      class: 'String',
      name: 'mailboxId'
    },
    {
      class: 'String',
      name: 'password'
    },
    {
      class: 'String',
      name: 'host'
    },
    {
      class: 'Int',
      name: 'port'
    },
    {
      class: 'String',
      name: 'sendLoginId'
    },
    {
      class: 'String',
      name: 'receiptFileLoginId'
    },
    {
      class: 'String',
      name: 'receiveLoginId'
    },
    {
      class: 'String',
      name: 'creditReportLoginId'
    },
    {
      class: 'String',
      name: 'debitReportLoginId'
    }
  ]
});
