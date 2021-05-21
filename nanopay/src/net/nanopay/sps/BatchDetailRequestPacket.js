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
  name: 'BatchDetailRequestPacket',
  extends: 'net.nanopay.sps.RequestPacket',

  properties: [
    {
      class: 'Int',
      name: 'msgType',
      value: 20
    },
    {
      class: 'Int',
      name: 'packetType',
      value: 2030
    },
    {
      class: 'Int',
      name: 'msgModifierCode'
    },
    {
      class: 'String',
      name: 'localTxnTime'
    },
    {
      class: 'String',
      name: 'TID'
    },
    {
      class: 'String',
      name: 'field6NotUsed',
      value: ''
    },
    {
      class: 'String',
      name: 'dateOrBatchId'
    },
    {
      class: 'String',
      name: 'approvalCount',
      documentation: 'Check or electronic approval count'
    },
    {
      class: 'String',
      name: 'approvalAmount',
      documentation: 'Check or electronic approval amount'
    },
    {
      class: 'String',
      name: 'declineCount'
    },
    {
      class: 'String',
      name: 'declineAmount'
    },
    {
      class: 'String',
      name: 'voidCount'
    },
    {
      class: 'String',
      name: 'voidAmount'
    },
    {
      class: 'String',
      name: 'maxDetailItemsPerTransmission'
    },
    {
      class: 'String',
      name: 'syncCounter'
    },
    {
      class: 'String',
      name: 'creditCount'
    },
    {
      class: 'String',
      name: 'creditAmount'
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
    list.add(MSG_MODIFIER_CODE);
    list.add(LOCAL_TXN_TIME);
    list.add(TID);
    list.add(FIELD6NOT_USED);
    list.add(DATE_OR_BATCH_ID);
    list.add(APPROVAL_COUNT);
    list.add(APPROVAL_AMOUNT);
    list.add(DECLINE_COUNT);
    list.add(DECLINE_AMOUNT);
    list.add(VOID_COUNT);
    list.add(VOID_AMOUNT);
    list.add(MAX_DETAIL_ITEMS_PER_TRANSMISSION);
    list.add(SYNC_COUNTER);
    list.add(CREDIT_COUNT);
    list.add(CREDIT_AMOUNT);
  }
        `);
      }
    }
  ]

});
