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
  package: 'net.nanopay.ui.dashboard',
  name: 'DashboardView',
  extends: 'foam.dashboard.view.Dashboard',

  requires: [
    'foam.nanos.menu.Menu',
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      var menuDAO = this.__subContext__.menuDAO.where(this.EQ(this.Menu.PARENT, "dashboard-backoffice"))
      this.select(menuDAO, function(ret) {
        return self.E().tag(ret.handler.view);
      })
    }
  ]
});

