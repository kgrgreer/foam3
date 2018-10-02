foam.CLASS({
  package: 'net.nanopay.kotak',
  name: 'PaymentResponse',

  properties: [
    {
      class: 'String',
      name: 'messageId',
    },
    {
      class: 'String',
      name: 'statusCd'
    },
    {
      class: 'String',
      name: 'statusRem'
    },
    {
      class: 'String',
      name: 'resRF1'
    },
    {
      class: 'String',
      name: 'resRF2'
    },
    {
      class: 'String',
      name: 'resRF3'
    },
    {
      class: 'String',
      name: 'instRefNo'
    },
    {
      class: 'String',
      name: 'instStatusCd'
    },
    {
      class: 'String',
      name: 'instStatusRem'
    },
    {
      class: 'String',
      name: 'error'
    },
    {
      class: 'String',
      name: 'code'
    },
    {
      class: 'String',
      name: 'reason'
    },
    {
      class: 'String',
      name: 'invalidField'
    },
    {
      class: 'String',
      name: 'submittedFieldValue'
    }
  ]
});
