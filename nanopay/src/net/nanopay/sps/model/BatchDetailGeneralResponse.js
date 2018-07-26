foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'BatchDetailGeneralResponse',
  extends: 'net.nanopay.sps.model.ResponsePacket',

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
      name: 'batchStatusCode'
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
      name: 'batchID'
    },
    {
      class: 'String',
      name: 'hostCheckApprovalCount'
    },
    {
      class: 'String',
      name: 'hostCheckApprovalAmount'
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
    list.add(HOST_CHECK_APPROVAL_COUNT);
    list.add(HOST_CHECK_APPROVAL_AMOUNT);
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
