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
    'ctrl',
    'group',
    'stack',
    'user'
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
          of: 'net.nanopay.account.Account',
          dataView: 'net.nanopay.liquidity.ui.account.AccountDetailView'
        };
      }
    },
  ],

  actions: [
    {
      name: 'save',
      isEnabled: function(data, data$errors_, group$id, data$parent, data$name) {
        return ! data$errors_ && (group$id !== 'liquidBasic' || !! data$parent) && !! data$name;
      },
      code: function() {
        var cData = this.data;

        cData = cData.clone();
        cData.lifecycleState = foam.nanos.auth.LifecycleState.PENDING;
        cData.owner = this.__subContext__.user.id;
        cData.enabled = true;

        this.config.dao.put(cData).then((o) => {
          this.data = o;
          this.finished.pub();
          if ( foam.comics.v2.userfeedback.UserFeedbackAware.isInstance(o) && o.userFeedback ){
            var currentFeedback = o.userFeedback;
            while ( currentFeedback ){
              this.ctrl.add(this.NotificationMessage.create({
                message: currentFeedback.message,
                type: currentFeedback.status.name.toLowerCase()
              }));

              currentFeedback = currentFeedback.next;
            }
          } else {
            this.ctrl.add(this.NotificationMessage.create({
              message: `${this.data.model_.label} created.`
            }));
          }

          this.stack.back();
        }, (e) => {
          this.throwError.pub(e);
          
          // TODO: Uncomment this once we turn UserFeedbackException into an actual throwable
          // if ( foam.comics.v2.userfeedback.UserFeedbackException.isInstance(e) && e.userFeedback  ){
          //   var currentFeedback = e.userFeedback;
          //   while ( currentFeedback ){
          //     this.ctrl.add(this.NotificationMessage.create({
          //       message: currentFeedback.message,
          //       type: currentFeedback.status.name.toLowerCase()
          //     }));

          //     currentFeedback = currentFeedback.next;
          //   }
          // } else {
          //   this.ctrl.add(this.NotificationMessage.create({
          //     message: e.message,
          //     type: 'error'
          //   }));
          // }

          if ( e.message === "An approval request has been sent out." ){
            this.ctrl.add(this.NotificationMessage.create({
              message: e.message,
              type: 'success'
            }));
          } else {
            this.ctrl.add(this.NotificationMessage.create({
              message: e.message,
              type: 'error'
            }));
          }
        });
      }
    },
  ],
});
