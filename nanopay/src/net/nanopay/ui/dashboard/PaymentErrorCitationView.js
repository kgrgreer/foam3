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
  name: 'PaymentErrorCitationView',
  extends: 'foam.dashboard.view.DashboardCitationView',

  imports: [
    'currencyDAO',
    'accountDAO',
    'stack'
  ],

  requires: [
    'foam.u2.DetailView',
    'foam.counter.Counter',
    'foam.nanos.auth.User',
    'net.nanopay.meter.report.ScreeningResponseCounter',
    'net.nanopay.meter.report.ScreeningResponseType'
  ],

  methods: [
    function initE() {

      var self = this;
      this.currencyDAO.find(this.data['sourceCurrency']).then(function(cur){
        self.accountDAO.find(self.data.sourceAccount).then(function(acc){
          self.on('click', function() {
            self.stack.push(self.DetailView.create({ data: self.data, controllerMode: foam.u2.ControllerMode.VIEW}));
          })
            .addClass(self.myClass())
            .start()
              .start().addClass('amount-container')
                .start('img')
                  .attrs({ src: acc.flagImage })
                  .addClass('flag')
                .end()
                .addClass('amount')
                .add(cur.format(self.data['amount']))
              .end()
              .start()
                .addClass('error-msg')
                .add(self.data.chainSummary.errorCode.summary || 'no error information')
              .end()
            .end()
            .start()
              .addClass('status')
              .add(self.data.chainSummary.status.label)
            .end()
        })
      })
    }
  ],

  css: `
    ^ {
      display: flex;
      justify-content: space-between;
      padding-top: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e4e3e3;
      align-items: center;
    }

    ^ .amount {
      font-weight: 500;
      font-size: 13px;
      color: #5d5b5b;
      display: flex;
      align-items: center;
    }

    ^ img {
      padding-right: 5px;
    }

    ^ .error-msg {
      padding-top: 5px;
      font-size: 11px;
      font-weight: 200;
    }

    ^ .status {
    color: #c73333;
    font-size: 12px;
    font-weight: 400;
    background-color: #fff0f0;
    padding: 5px 10px 5px 10px;
    border-radius: 20px;
    align-items: center;
    display: flex;
    height: fit-content;
    }
  `
});
