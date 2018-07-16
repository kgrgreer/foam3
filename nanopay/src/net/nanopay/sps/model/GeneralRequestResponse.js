foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'GeneralRequestResponse',
  extends: 'net.nanopay.sps.utils.ResponsePacket',

  properties: [
    {
      class: 'Int',
      name: 'msgType',
    },
    {
      class: 'Int',
      name: 'packetType'
    },
    {
      class: 'Int',
      name: 'messageModifierCode'
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
      name: 'itemID'
    },
    {
      class: 'String',
      name: 'batchID'
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
      name: 'clerkID'
    },
    {
      class: 'String',
      name: 'localTransactionTime'
    },
    {
      class: 'String',
      name: 'originalRequestStatus'
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
list.add(LOCAL_TRANSACTION_TIME);
list.add(ORIGINAL_REQUEST_STATUS);
}
        `);
      }
    }
  ]
});
