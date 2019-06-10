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
