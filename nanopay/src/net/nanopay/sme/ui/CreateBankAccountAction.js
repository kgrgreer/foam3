/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.sme.ui',
  name: 'CreateBankAccountAction',
  extends: 'foam.core.Action',

  documentation: 'An action that displays the view to add a model based on the configuration.',

  requires: [
    'net.nanopay.sme.ui.SMEModal'
  ],

  imports: [
    'auth',
    'ctrl',
    'stack',
    'subject'
  ],

  messages: [
    { name: 'ACTION_LABEL', message: 'Add account' },//TODO get it from the journal
  ],

  properties: [
    {
      name: 'label',
      factory: function() {
        return this.ACTION_LABEL;//TODO get it from the jrl
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.comics.v2.DAOControllerConfig',
      name: 'config',
      factory: function() {
        return foam.comics.v2.DAOControllerConfig.create({ dao: this.data });
      }
    },
    {
      class: 'Function',
      name: 'code',
      value: async function(X) {
        X.stack.push(net.nanopay.sme.ui.SMEModal.create({}, X)
        .tag({
          class: this.config.detailView.class,
          data: (foam.lookup(this.config.of.id)).create({}, this),
          useSections: ['clientAccountInformation', 'pad'],
          config: {
            id: { updateVisibility: 'HIDDEN' },
            summary: { updateVisibility: 'HIDDEN' }
          }
        }));
      }
    }
  ]
});
