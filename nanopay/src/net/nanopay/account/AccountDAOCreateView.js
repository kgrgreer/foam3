/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountDAOCreateView',
  extends: 'foam.comics.v2.DAOCreateView',

  imports: [
    'stack',
    'ctrl'
  ],

  requires: [
    'net.nanopay.account.DigitalAccount',
    'foam.u2.dialog.NotificationMessage'
  ],

  documentation: `
    A configurable view to create an instance of a specified model
  `,

  messages: [
    {
      name: 'SUCCESS_MESSAGE',
      message: 'An approval request has been created.'
    }
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return {
          class: 'foam.u2.view.FObjectView',
          of: 'net.nanopay.account.Account'
        };
      }
    },
  ],

  actions: [
    {
      name: 'save',
      code: function() {
        var cData = this.data;

        cData = cData.clone();
        cData.lifecycleState = foam.nanos.auth.LifecycleState.PENDING;
        cData.owner = this.__subContext__.user.id;
        cData.enabled = true;

        this.config.dao.put(cData).then((o) => {
          this.data = o;
          this.finished.pub();
          this.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_MESSAGE
          }));
          this.stack.back();
        }, (e) => {
          this.throwError.pub(e);
          this.ctrl.add(this.NotificationMessage.create({
            message: e.message,
            type: 'error'
          }));
        });
      }
    },
  ],
});
