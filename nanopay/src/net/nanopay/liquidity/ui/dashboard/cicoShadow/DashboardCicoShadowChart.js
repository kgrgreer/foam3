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
  package: 'net.nanopay.liquidity.ui.dashboard.cicoShadow',
  name: 'DashboardCicoShadowChart',
  extends: 'org.chartjs.HorizontalBarDAOChartView',

  css: `
    ^container-no-data {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;

      display: flex;
      align-items: center;
      justify-content: center;
    }

    ^message-no-data {
      background-color: white;
      font-size: 16px;
      margin: 0;
      padding: 8px;
      border: solid 1px /*%GREY3%*/ #cbcfd4;
      border-radius: 3px;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'hasDatapoints',
      expression: function(config) {
        if ( ! config.data ) return false;
        return config.data.datasets.length > 0 ? true : false;
      }
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      value: true
    }
  ],

  messages: [
    {
      name: 'LABEL_NO_DATA',
      message: 'Not enough data to graph'
    },
    {
      name: 'LABEL_LOADING',
      message: 'Loading Data...'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.onDetach(this.data$proxy.listen(this.FnSink.create({ fn: this.dataUpdate })));
      this.dataUpdate();
      window.addEventListener('resize', this.onResize);
      this
        .start('div', null, this.parentEl_$)
          .style({
            width: '100%',
            height: '100%',
            position: 'relative'
          })
          .add(this.chart_$)
          .add(this.slot(function( hasDatapoints, isLoading ) {
            return hasDatapoints ? self.E() :
              self.E().addClass(self.myClass('container-no-data'))
                .start('p').addClass(self.myClass('message-no-data'))
                  .callIf(isLoading, function() {
                    this.add(self.LABEL_LOADING);
                  })
                  .callIf(!isLoading, function() {
                    this.add(self.LABEL_NO_DATA)
                  })
                .end();
          }))
        .end();
    }
  ],

  listeners: [
    {
      name: 'dataUpdate',
      isFramed: true,
      code: function () {
        this.isLoading = true;
        this.SUPER();
        this.isLoading = false;
      }
    }
  ]
});
