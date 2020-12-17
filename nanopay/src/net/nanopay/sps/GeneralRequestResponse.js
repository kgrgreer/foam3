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
  name: 'GeneralRequestResponse',
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
      value: 2011
    },
    {
      class: 'Int',
      name: 'msgModifierCode'
    },
    {
      class: 'String',
      name: 'approvalCode'
    },
    {
      class: 'String',
      name: 'textMsg'
    },
    {
      class: 'String',
      name: 'syncCountersIncrement'
    },
    {
      class: 'String',
      name: 'itemId'
    },
    {
      class: 'String',
      name: 'batchId'
    },
    {
      class: 'String',
      name: 'routeCode'
    },
    {
      class: 'String',
      name: 'account'
    },
    {
      class: 'String',
      name: 'checkNum'
    },
    {
      class: 'String',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'invoice'
    },
    {
      class: 'String',
      name: 'clerkId'
    },
    {
      class: 'String',
      name: 'localTxnTime'
    },
    {
      class: 'String',
      name: 'originalRequestStatus'
    }
  ],

  javaImports: [
    'java.util.*'
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
    list.add(APPROVAL_CODE);
    list.add(TEXT_MSG);
    list.add(SYNC_COUNTERS_INCREMENT);
    list.add(ITEM_ID);
    list.add(BATCH_ID);
    list.add(ROUTE_CODE);
    list.add(ACCOUNT);
    list.add(CHECK_NUM);
    list.add(AMOUNT);
    list.add(INVOICE);
    list.add(CLERK_ID);
    list.add(LOCAL_TXN_TIME);
    list.add(ORIGINAL_REQUEST_STATUS);
  }
        `);
      }
    }
  ]
});
