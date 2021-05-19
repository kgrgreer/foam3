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
    'notify',
    'stack',
    'user'
  ],

  requires: [
    'foam.log.LogLevel',
    'net.nanopay.account.DigitalAccount',
  ],

  documentation: `
    A configurable view to create an instance of a specified model
  `,

  messages: [
    {
      name: 'SUCCESS_MESSAGE',
      message: 'An approval request has been created'
    }
  ],

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'viewView',
      expression: function() {
        return {
          class: 'foam.u2.view.FObjectView',
          of: 'net.nanopay.account.Account',
          dataView: 'net.nanopay.liquidity.ui.account.AccountDetailView'
        };
      }
    }
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
        cData.owner = this.__subContext__.user.id;
        cData.enabled = true;

        this.config.dao.put(cData).then((o) => {
          this.data = o;
          this.finished.pub();
          if ( foam.comics.v2.userfeedback.UserFeedbackAware.isInstance(o) && o.userFeedback ) {
            var currentFeedback = o.userFeedback;
            while ( currentFeedback ) {
              this.notify(currentFeedback.message, '', this.LogLevel.INFO, true);
              currentFeedback = currentFeedback.next;
            }
          } else {
            this.notify(`${this.data.model_.label} created.`, '', this.LogLevel.INFO, true);
          }

          this.stack.back();
        }, (e) => {
          this.throwError.pub(e);

          if ( e.exception && e.exception.userFeedback  ) {
            var currentFeedback = e.exception.userFeedback;
            while ( currentFeedback ) {
              this.ctrl.notify(currentFeedback.message, '', this.LogLevel.INFO, true);
              currentFeedback = currentFeedback.next;
            }

            this.stack.back();
          } else {
            this.notify(e.message, '', this.LogLevel.ERROR, true);
          }
        });
      }
    },
  ],
});
