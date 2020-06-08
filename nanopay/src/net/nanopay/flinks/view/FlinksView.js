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
  package: 'net.nanopay.flinks.view',
  name: 'FlinksView',
  extends: 'foam.u2.Controller',

  documentation: 'View displaying bank Selection',

  messages: [
    { name: 'title', message: 'Connect a new bank account'}
  ],

  properties: [
    {
      class: 'String',
      name: 'p1'
    },
    {
      class: 'Boolean',
      name: 'p2',
      value: true
    }
  ],

  methods: [
    function initE(){
      this.SUPER();
      
      this
        .addClass(this.myClass())
        .start('div')
          .tag(this.AUTH_FORM)
          .tag(this.TEST)
          .tag(this.TACKLE)
          .tag(this.SSLOT)
        .end();
    }
  ],

  actions: [
    {
      name: 'authForm',
      label: 'auth a new bank account',
      code: function(X) {
        X.stack.push({class: 'net.nanopay.flinks.view.form.FlinksForm', isCustomNavigation: true})
      }
    }
  ]
});
