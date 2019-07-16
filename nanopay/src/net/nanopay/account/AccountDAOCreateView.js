/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountDAOCreateView',
  extends: 'foam.comics.v2.DAOCreateView',

  requires: [
    'net.nanopay.account.DigitalAccount'
  ],
  
  documentation: `
    A configurable view to create an instance of a specified model
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpecWithJava',
      name: 'viewView',
      expression: function() {
        return {
          class: 'foam.u2.view.FObjectView',
          choices: [
              ['net.nanopay.account.AggregateAccount', 'Aggregate account'],
              ['net.nanopay.account.DigitalAccount', 'Digital account'],
              ['net.nanopay.account.ShadowAccount', 'Shadow account']
          ],
        };
      }
    },
    {
      name: 'data',
      preSet: function(_, n) {
        if ( n.cls_ === net.nanopay.account.Account ) return this.DigitalAccount.create();
        return n;
      }      
    }
  ],

  actions: [
    {
      name: 'save',
      code: function() {
        this.data.owner = this.__subContext__.user.id;
        this.config.dao.put(this.data).then(o => {
          this.data = o;
          this.finished.pub();
          this.stack.back();
        }, e => {
          this.throwError.pub(e);
        });
      }
    },
  ],
});
