foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'BatchDetailRequestPacket',

  properties: [
    {
      class: 'Int',
      name: 'msgNum'
    },
    {
      class: 'Int',
      name: 'packetNum'
    },
    {
      class: 'Int',
      name: 'messageModifierCode'
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
      name: 'notUsed'
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
      class: 'Long',
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
  ]
});
