foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'BatchDetailRequestPacket',
  extends: 'net.nanopay.sps.model.RequestPacket',

  properties: [
    {
      class: 'Int',
      name: 'msgType'
    },
    {
      class: 'Int',
      name: 'packetType'
    },
    {
      class: 'Int',
      name: 'msgModifierCode'
    },
    {
      class: 'String',
      name: 'localTransactionTime'
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
      name: 'optionallyEnteredDate'
    },
    {
      class: 'String',
      name: 'checkApprovalCount'
    },
    {
      class: 'String',
      name: 'checkApprovalAmount'
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
    list.add(LOCAL_TRANSACTION_TIME);
    list.add(TID);
    list.add(FIELD6NOT_USED);
    list.add(OPTIONALLY_ENTERED_DATE);
    list.add(CHECK_APPROVAL_COUNT);
    list.add(CHECK_APPROVAL_AMOUNT);
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
