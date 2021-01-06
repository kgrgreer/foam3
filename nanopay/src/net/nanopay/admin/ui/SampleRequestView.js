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
  package: 'net.nanopay.admin.ui',
  name: 'SampleRequestView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.dig.LinkView'
  ],

  imports: [
    'stack'
  ],

  css: `
    ^ {
      width: 992px;
      margin: auto;
      padding: 40px;
      background: white;
    }
    h1 {
      margin-bottom: 40px;
    }
    .light-roboto-h2 {
      width: 85%;
      white-space: normal;
      line-height: 1.3;
    }
    h2 {
      width: fit-content;
      border-bottom: 1px solid black;
      margin-top: 40px;
    }
    ^ .black-box{
      background: #1e1c3a;
      padding: 20px;
      width: 700px;
    }
    ^ .small-roboto{
      color: white;
      font-size: 14px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.5;
      font-weight: 300;
    }
    ^ .line {
      height: 10px;
      background: /*%BLACK%*/ #1e1f21;
      width: 85%;
    }
    ^ .foam-u2-ActionView-apiLink {
      width: 160px;
      font-size: 20px;
      font-weight: 300;
      line-height: 1;
      color: blue;
      opacity: 0.6;
    }
  `,

  messages: [
    {
      name: 'Title',
      message: 'Sample API Requests'
    },
    {
      name: 'Intro',
      message: 'The following are curl examples of the most common endpoints within the nanopay system. ' +
          'These examples will cover creating and retrieving Users, Accounts & Transactions. ' +
          'Authentication and permission access is based off username and password provided in the request. '
    },
    {
      name: 'UserCreateTitle',
      message: 'Create User'
    },
    {
      name: 'UserCreateInfo',
      message: 'The following creates a user within the nanopay system as a basic user.' +
          'This will allow you to make transactions within the system. A default account ' +
          'will be created in association to the user created.'
    },
    {
      name: 'UserGetTitle',
      message: 'Get Public Users'
    },
    {
      name: 'UserGetInfo',
      message: 'The following request provides all users in the system that have ' +
          'marked themselves a public. These users will appear in various searches within ' +
          'the platform and will be available to send/receive payments.'
    },
    {
      name: 'AccountGetTitle',
      message: 'Get Account'
    },
    {
      name: 'AccountGetInfo',
      message: 'The following request will provide the account associated to' +
          ' the owner ID (User ID) provided. User IDs correlate directly to account IDs.'
    },
    {
      name: 'SendTransactionTitle',
      message: 'Send Transaction (User ID)'
    },
    {
      name: 'SendTransactionInfo',
      message: 'The following request will send a payment to the payee\' default account.'
    },
    {
      name: 'SendTransactionAccountTitle',
      message: 'Send Transaction (Account ID)'
    },
    {
      name: 'SendTransactionAccountInfo',
      message: 'The following request will process a payment based on the provided account.' +
          'The source account provides the payment and destination account will receive the payment.'
    },
    {
      name: 'TransactionGetTitle',
      message: 'Get All Transactions'
    },
    {
      name: 'TransactionGetInfo',
      message: 'The following request will provide all the transactions the user used for authentication' +
          'has access to.'
    },
    {
      name: 'TransactionAccountGetTitle',
      message: 'Get Transactions By Account'
    },
    {
      name: 'TransactionAccountGetInfo',
      message: 'The following request will provide all the transactions related to the provided account ID.'
    },
    {
      name: 'TransactionUserGetTitle',
      message: 'Get Transactions By User'
    },
    {
      name: 'TransactionUserGetInfo',
      message: 'The following request will provide all the transactions related to the provided user ID.'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this.start().addClass(this.myClass())
        .start()
          .start('h1')
            .add(this.Title)
          .end()
          .start()
            .addClass('line')
            .style({ 'margin-bottom': '25px;' })
          .end()
          .start('p').addClass('light-roboto-h2')
            .add(this.Intro)
          .end()
          .startContext({ data: this })
            .start('p').addClass('light-roboto-h2')
              .add('Please refer to the ', this.API_LINK, ' for additional information on utilizing the nanopay API.')
            .end()
          .endContext()
          .start()
            .addClass('line')
            .style({ 'margin-bottom': '25px;' })
          .end()
        .end()
        .start('h2')
          .add(this.UserCreateTitle)
        .end()
        .start('p').addClass('light-roboto-h2')
          .add(this.UserCreateInfo)
        .end()
        .tag({
          class: 'foam.doc.PutRequestView',
          data: {
            n: {
              name: 'userDAO'
            },
            props: '"email":"email@example.com",' +
            ' "password":"somePassword123", ' +
            '"firstName":"John", "lastName":"Smith"'
          }
        })
        .start('h2')
          .add(this.UserGetTitle)
        .end()
        .start('p').addClass('light-roboto-h2')
          .add(this.UserGetInfo)
        .end()
        .tag({
          class: 'foam.doc.GetRequestView',
          data: 'publicUserDAO'
        })
        .start('h2')
          .add(this.AccountGetTitle)
        .end()
        .start('p').addClass('light-roboto-h2')
          .add(this.AccountGetInfo)
        .end()
        .tag({
          class: 'foam.doc.GetRequestView',
          data: 'accountDAO&q=owner=1000'
        })
        .start('h2')
          .add(this.SendTransactionTitle)
        .end()
        .start('p').addClass('light-roboto-h2')
          .add(this.SendTransactionInfo)
        .end()
        .tag({
          class: 'foam.doc.PutRequestView',
          data: {
            n: {
              name: 'transactionDAO'
            },
            props: '"payerId": 1000,' +
            ' "payeeId": 1001, ' +
            '"amount": 100, '+
            '"type": "NONE"'
          }
        })
        .start('h2')
          .add(this.SendTransactionAccountTitle)
        .end()
        .start('p').addClass('light-roboto-h2')
          .add(this.SendTransactionAccountInfo)
        .end()
        .tag({
          class: 'foam.doc.PutRequestView',
          data: {
            n: {
              name: 'transactionDAO'
            },
            props: '"sourceAccount": 1000,' +
            ' "destinationAccount": 1001, ' +
            '"amount": 100, '+
            '"type": "NONE"'
          }
        })
        .start('h2')
          .add(this.TransactionGetTitle)
        .end()
        .start('p').addClass('light-roboto-h2')
          .add(this.TransactionGetInfo)
        .end()
        .tag({
          class: 'foam.doc.GetRequestView',
          data: 'transactionDAO'
        })
        .start('h2')
          .add(this.TransactionAccountGetTitle)
        .end()
        .start('p').addClass('light-roboto-h2')
          .add(this.TransactionAccountGetInfo)
        .end()
        .tag({
          class: 'foam.doc.GetRequestView',
          data: 'transactionDAO&q=sourceAccount=1000%20AND%20destinationAccount=1000'
        })
        .start('h2')
          .add(this.TransactionUserGetTitle)
        .end()
        .start('p').addClass('light-roboto-h2')
          .add(this.TransactionUserGetInfo)
        .end()
        .tag({
          class: 'foam.doc.GetRequestView',
          data: 'transactionDAO&q=payeeId=1000%20AND%20payerId=1000'
        })
      .end();
    }
  ],

  actions: [
    {
      name: 'apiLink',
      label: 'API Documentation',
      code: function() {
        location.hash = 'api-doc';
        this.stack.push({ class: 'foam.doc.ApiBrowser' });
      }
    }
  ]
});
