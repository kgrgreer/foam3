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
  package: 'net.nanopay.sps',
  name: 'BatchDetailGeneralResponse',
  extends: 'net.nanopay.sps.ResponsePacket',

  properties: [
    {
      class: 'Int',
      name: 'msgType',
      value: 20
    },
    {
      class: 'Int',
      name: 'packetType',
      value: 2031
    },
    {
      class: 'Int',
      name: 'messageModifierCode'
    },
    {
      class: 'String',
      name: 'batchStatusCode',
      documentation: '0 - closed, 1 - open, 2 - no open batch'
    },
    {
      class: 'String',
      name: 'textMsg'
    },
    {
      class: 'String',
      name: 'hostSyncCounter'
    },
    {
      class: 'String',
      name: 'batchId'
    },
    {
      class: 'String',
      name: 'hostApprovalCount',
      documentation: 'Host check or electronic approval count'
    },
    {
      class: 'String',
      name: 'hostApprovalAmount',
      documentation: 'Host check or electronic approval amount'
    },
    {
      class: 'String',
      name: 'hostDeclineCount'
    },
    {
      class: 'String',
      name: 'hostDeclineAmount'
    },
    {
      class: 'String',
      name: 'hostVoidCount'
    },
    {
      class: 'String',
      name: 'hostVoidAmount'
    },
    {
      class: 'String',
      name: 'hostCreditCount'
    },
    {
      class: 'String',
      name: 'hostCreditAmount'
    }
  ],

  javaImports: [
    'java.util.*',
    'foam.core.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
  {
    list = new ArrayList<>();
    list.add(MSG_TYPE);
    list.add(PACKET_TYPE);
    list.add(MESSAGE_MODIFIER_CODE);
    list.add(BATCH_STATUS_CODE);
    list.add(TEXT_MSG);
    list.add(HOST_SYNC_COUNTER);
    list.add(BATCH_ID);
    list.add(HOST_APPROVAL_COUNT);
    list.add(HOST_APPROVAL_AMOUNT);
    list.add(HOST_DECLINE_COUNT);
    list.add(HOST_DECLINE_AMOUNT);
    list.add(HOST_VOID_COUNT);
    list.add(HOST_VOID_AMOUNT);
    list.add(HOST_CREDIT_COUNT);
    list.add(HOST_CREDIT_AMOUNT);
  }
        `);
      }
    }
  ]

});
