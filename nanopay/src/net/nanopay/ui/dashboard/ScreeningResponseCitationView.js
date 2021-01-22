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
  name: 'ScreeningResponseCitationView',
  extends: 'foam.dashboard.view.DashboardCitationView',

  requires: [
    'foam.counter.Counter',
    'foam.nanos.auth.User',
    'net.nanopay.meter.report.ScreeningResponseCounter',
    'net.nanopay.meter.report.ScreeningResponseType'
  ],

  methods: [
    function initE() {
      var self = this;
      var responseEnum = this.ScreeningResponseType.VALUES.find(name => { return name == this.data['id']});
      this.on('click', function() {
        self.openFilteredListView(responseEnum);
      })
      .addClass(this.myClass())
      .start()
        .addClass(this.myClass('id'))
        .add(responseEnum.label)
      .end()
      .start()
        .addClass(this.myClass('value'))
        .add(this.data['value'])
      .end()
    },

    function openFilteredListView(obj) {
    var self = this;
      this.__subContext__['counterDAO'].where(this.AND(
        this.EQ(this.Counter.NAME, 'screening_response'),
        this.EQ(this.Counter.KEY, obj)
      )).select(this.GROUP_BY(this.ScreeningResponseCounter.USER_ID, null, null))
        .then(function(ret) {
          var dao = self.__subContext__['userDAO'].where(self.IN(self.User.ID, ret.groupKeys));
          var config = foam.comics.v2.DAOControllerConfig.create({ dao: dao, hideQueryBar: false });
          self.stack.push({
            class: 'foam.comics.v2.DAOBrowserView',
            config: config
          });
        })
    }
  ]
});
