/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailServiceConfig',

  implements: [
    'foam.nanos.auth.EnabledAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  imports: [
    'emailServiceConfigDAO'
  ],

  topics: [
    'finished',
    'throwError'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.log.LogLevel'
  ],
  
  messages: [
    {
      name: 'SUCCESS_ENABLED',
      message: 'Successfully enabled'
    },
    {
      name: 'SUCCESS_DISABLED',
      message: 'Successfully disabled'
    }
  ],

  tableColumns: [
    'id',
    'enabled',
    'host',
    'port',
    'username',
    'protocol'
  ],

  properties: [
    {
      name: 'id',
      class: 'String',
      value: 'default'
    },
    {
      name: 'enabled',
      class: 'Boolean',
      value: false
    },
    {
      name: 'host',
      class: 'String',
      value: '127.0.0.1'
    },
    {
      name: 'port',
      class: 'String',
      value: '587'
    },
    {
      name: 'username',
      class: 'String',
      value: null
    },
    {
      name: 'password',
      class: 'String',
      value: null
    },
    {
      name: 'authenticate',
      class: 'Boolean',
      value: true
    },
    {
      name: 'starttls',
      class: 'Boolean',
      value: true
    },
    {
      name: 'protocol',
      class: 'String',
      value: 'smtp'
    },
    {
      documentation: 'Relevant to send - Provider imposed rateLimit (per second), at which point they will throttle or block completely for some time window',
      name: 'rateLimit',
      class: 'Long',
      units: 's',
      value: 14 // default for smtp.gmail.com
    },
    {
      name: 'predicate',
      class: 'foam.mlang.predicate.PredicateProperty',
      factory: function () {
        if ( this.protocol === 'imaps' ) {
          return foam.mlang.MLang.EQ(EmailMessage.STATUS, Status.RECEIVED);
        }
        return foam.mlang.MLang.EQ(EmailMessage.STATUS, Status.UNSENT);
      },
      javaFactory: `
        if ( "imaps".equals(getProtocol()) ) {
          return foam.mlang.MLang.EQ(EmailMessage.STATUS, Status.RECEIVED);
        }
        return foam.mlang.MLang.EQ(EmailMessage.STATUS, Status.UNSENT);
      `,
      visibility: 'HIDDEN' // default display is to verbose
    },
    {
      name: 'emailMessageSendDAOKey',
      class: 'String',
      value: 'emailMessageDAO'
    },
    {
      documentation: 'Relevant to fetch/receive',
      name: 'folderName',
      class: 'String',
      value: 'INBOX'
    },
    {
      name: 'processAttachments',
      class: 'Boolean',
      value: true
    },
    {
      documentation: 'Relevant to fetch/receive - delete remote email after receive. When false, emails are marked SEEN.',
      name: 'delete',
      class: 'Boolean',
      value: false
    },
    {
      name: 'emailMessageReceiveDAOKey',
      class: 'String',
      value: 'emailMessageReceivedDAO'
    },
    {
      name: 'pollInterval',
      class: 'Long',
      value: 10000
    },
    {
      name: 'initialDelay',
      class: 'Int',
      value: 60000
    }
  ],
  
  actions: [
    {
      name: 'disable',
      isAvailable: function() {
        return this.enabled;
      },
      code: function(X) {
        var emailServiceConfig = this.clone();
        emailServiceConfig.enabled = false;

        this.emailServiceConfigDAO.put(emailServiceConfig).then(req => {
          this.emailServiceConfigDAO.cmd(this.AbstractDAO.PURGE_CMD);
          this.emailServiceConfigDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          X.notify(this.SUCCESS_DISABLED, '', this.LogLevel.INFO, true);
        }, e => {
          this.throwError.pub(e);
          X.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    },
    {
      name: 'enable',
      isAvailable: function() {
        return ! this.enabled;
      },
      code: function(X) {
        var emailServiceConfig = this.clone();
        emailServiceConfig.enabled = true;

        this.emailServiceConfigDAO.put(emailServiceConfig).then(req => {
          this.emailServiceConfigDAO.cmd(this.AbstractDAO.PURGE_CMD);
          this.emailServiceConfigDAO.cmd(this.AbstractDAO.RESET_CMD);
          this.finished.pub();
          X.notify(this.SUCCESS_ENABLED, '', this.LogLevel.INFO, true);
        }, e => {
          this.throwError.pub(e);
          X.notify(e.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
