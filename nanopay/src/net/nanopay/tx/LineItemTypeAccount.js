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
  package: 'net.nanopay.tx',
  name: 'LineItemTypeAccount',
  implements: ['foam.nanos.auth.EnabledAware'],

  documentation: 'Payee, LineItemType, Deposit Account association',

  properties: [
    {
      class: 'String',
      name: 'id',
      tableWidth: 50,
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user',
      required: true,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.userDAO,
          objToChoice: function(o) {
            return [o.id, o.legalName];
          }
        });
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.LineItemType',
      name: 'type',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.lineItemTypeDAO,
          objToChoice: function(o) {
            return [o.id, o.name];
          }
        });
      },
      required: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      required: true,
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO,
          objToChoice: function(o) {
            return [o.id, o.name+' / '+o.description+' ('+o.type+')'];
          }
        });
      }
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of service or good.'
    }
  ]
});
