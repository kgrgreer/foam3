/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ticket',
  name: 'RfiTicket',
  extends: 'foam.nanos.ticket.Ticket',

  documentation: 'Request for information ticket.',

  imports: [
    'appConfig'
  ],

  properties: [
    {
      name: 'type',
      value: 'Request for information',
      section: 'infoSection'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'attachments',
      section: 'infoSection'
    },
    {
      class: 'String',
      name: 'description',
      section: 'infoSection'
    },
    {
      class: 'String',
      name: 'documentType',
      section: 'infoSection'
    },
    {
      class: 'String',
      name: 'url',
      section: 'infoSection',
      visibility: 'RO',
      expression: function(appConfig, loginTokenId) {
        return appConfig.url + '/service/otlogin?otltoken=' + loginTokenId;
      }
    },
    {
      class: 'String',
      name: 'loginTokenId',
      visibility: 'HIDDEN'
    }
  ]

});
