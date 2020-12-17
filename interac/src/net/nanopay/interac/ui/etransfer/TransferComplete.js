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
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferComplete',
  extends: 'net.nanopay.interac.ui.etransfer.TransferView',

  documentation: 'Interac transfer completion and loading screen.',

  imports: [
    'complete'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: `
        ^ {
          height: 355px;
        }
        ^ p{
          width: 464px;
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          line-height: 1.45;
          letter-spacing: 0.3px;
          color: #093649;
        }
        ^ h3{
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          font-size: 12px;
          letter-spacing: 0.2px;
          color: #093649;
        }
        ^ h2{
          width: 600px;
          font-size: 14px;
          letter-spacing: 0.4px;
          color: #093649;
        }
        ^ .foam-u2-ActionView-exportButton{
          margin-right: 0
        }
        ^status-check p {
          display: inline-block;
          margin-left: 10px;
          font-size: 12px;
          letter-spacing: 0.2px;
          color: grey;
          margin-top: 5px;
        }
        ^status-check img {
          position: relative;
          top: 5;
          display: none;
        }
        ^status-check-container{
          margin-top: 35px;
          margin-bottom: 35px;
        }
        ^ .show-green{
          color: #2cab70;
        }
        ^status-check-container{
          height: 170px;
        }
        ^status-check{
          height: 32px;
        }
        ^ .show{
          display: inline-block;
        }
        ^ .hide{
          display: none;
        }
        ^ .show-yes{
          display: inline-block;
        }
      `
    })
  ],

  properties: [
    {
      name: 'time',
      value: 0,
      validateObj: function(time) {
        if ( time <= 5 ) return 'Transaction sending...';
      }
    },
    'name'
  ],

  methods: [
    function init() {
      this.tick()
      this.SUPER();

      var self = this;

      this.name = this.viewData.payee.firstName + ' ' + this.viewData.payee.lastName;
      if ( this.invoiceMode ) {
        // if organization exists, change name to organization name.
        if ( this.viewData.payee.organization ) this.name = this.viewData.payee.organization;
      }

      this
        .addClass(this.myClass())
        .start('h2').add('Submitting Payment...').addClass('show').enableClass('hide', this.time$.map(function (value) { return value > 5 })).end()
        .start().addClass('hide').enableClass('show-yes', this.time$.map(function (value) { return value > 5 }) )
          .start('h2').add(this.name, ' has received CAD ', this.viewData.fromAmount.toFixed(2), '.').end()
          .start('h3').add('Reference No. ', this.viewData.transaction.referenceNumber).end()
          .start()
            .start('p')
              .add('The transaction is successfully finished, you can check the status of the payment from home screen at any time.')
            .end()
          .end()
        .end()
        .start().style({ float: 'right'})
          .start(this.EXPORT_BUTTON, { icon: 'images/ic-export.png', showLabel:true })
          .addClass('import-button').addClass('hide')
          .enableClass('show-yes', this.time$.map(function (value) { return value > 5 }) )
          .end()
        .end()
        .start().addClass(this.myClass('status-check-container'))
          .start().addClass(this.myClass('status-check'))
            .start({ class: 'foam.u2.tag.Image', data:'images/c-yes.png'}).enableClass('show-yes', this.time$.map(function (value) { return value > 0 }))
            .start('p').add('Sending Bank Compliance Checks...').enableClass('show-green', this.time$.map(function (value) { return value > 0 })).end()
          .end()
          .start().addClass(this.myClass('status-check'))
            .start({ class: 'foam.u2.tag.Image', data:'images/c-yes.png'}).enableClass('show-yes', this.time$.map(function (value) { return value >  2}))
            .start('p').add('Receiving Bank Compliance Checks...').enableClass('show-green', this.time$.map(function (value) { return value > 2 })).end().end()
          .end()
          .start().addClass(this.myClass('status-check'))
            .start({ class: 'foam.u2.tag.Image', data:'images/c-yes.png'}).enableClass('show-yes', this.time$.map(function (value) { return value > 3 }))
            .start('p').add('Booking FX Rate...').enableClass('show-green', this.time$.map(function (value) { return value > 3 })).end().end()
          .end()
          .start().addClass(this.myClass('status-check'))
            .start({ class: 'foam.u2.tag.Image', data:'images/c-yes.png'}).enableClass('show-yes', this.time$.map(function (value) { return value > 4 }))
            .start('p').add('Generating IMPS Transaction...').enableClass('show-green', this.time$.map(function (value) { return value > 4 })).end().end()
          .end()
          .start().addClass(this.myClass('status-check'))
            .start({ class: 'foam.u2.tag.Image', data:'images/c-yes.png'}).enableClass('show-yes', this.time$.map(function (value) { return value > 5 }))
            .start('p').add('Payment Successful...').enableClass('show-green', this.time$.map(function (value) { if ( value > 5 ) { self.complete = true; return true; } })).end().end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'exportButton',
      label: 'Export',
      code: function(X){
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.interac.ui.modals.ExportModal', transaction: X.viewData.transaction}));
      }
    }
  ],

  listeners: [
    {
      name: 'tick',
      isMerged: true,
      mergeDelay: 400,
      code: function () {
        this.time += 1;
        this.tick();
      }
    }
  ]
});
