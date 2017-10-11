foam.CLASS({
  package: 'net.nanopay.retail.ui.devices',
  name: 'DevicesView',
  extends: 'foam.u2.Controller',

  documentation: 'View displaying list of Devices provisioned.',

  imports: [
    'deviceDAO'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 100%;
          background-color: #edf0f5;
        }
        ^ .devicesRow {
          width: 100%;
        }
        ^ .devicesContainer {
          width: 992px;
          margin: auto;
        }
        ^ .deviceContentCard {
          display: inline-block;
          vertical-align: top;
          width: 218px;
          height: 100px;
          margin-right: 30px;
        }
        ^ .actionButton {
          width: 218px;
          height: 100px;
          float: right;
          margin-bottom: 20px;
        }
        ^ .net-nanopay-ui-ActionView-create {
          visibility: hidden;
        }
        ^ table {
          border-collapse: collapse;
          margin: auto;
          width: 992px;
        }
        ^ thead > tr > th {
          font-family: 'Roboto';
          font-size: 14px;
          background-color: rgba(110, 174, 195, 0.2);
          color: #093649;
          line-height: 1.14;
          letter-spacing: 0.3px;
          border-spacing: 0;
          text-align: left;
          padding-left: 15px;
          height: 40px;
        }
        ^ tbody > tr > th > td {
          font-size: 12px;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          padding-left: 15px;
          height: 60px;
        }
        ^ .foam-u2-view-TableView th {
          padding-left: 15px;
          font-family: Roboto;
          font-size: 14px;
          line-height: 1;
          letter-spacing: 0.4px;
          color: #093649;
          font-style: normal;
        }
        ^ .foam-u2-view-TableView td {
          font-family: Roboto;
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          padding-left: 15px;
          font-size: 12px;
          color: #093649;
        }
        ^ tbody > tr {
          height: 60px;
          background: white;
        }
        ^ tbody > tr:nth-child(odd) {
          background: #f6f9f9;
        }

        ^ .net-nanopay-ui-ActionView-addDevice {
          display: inline-block;
          vertical-align: top;
          margin: 0;
          background: none;
          outline: none;
          border: none;
          box-shadow: none;

          width: 218px;
          height: 100px;
          float: right;

          background-color: #23C2b7;
          letter-spacing: 0.3px;
          color: #FFFFFF;
          border-radius: 2px;

          font-weight: 300;
        }

        ^ .net-nanopay-ui-ActionView-addDevice span {
          display: block;
          margin-top: 8px;

          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
        }

        ^ .net-nanopay-ui-ActionView-addDevice:hover {
          background: none;
          cursor: pointer;
          background-color: #20B1A7;
        }

        ^ .foam-u2-dialog-Popup-background {
          pointer-events: none;
          background-color: #edf0f5;
          opacity: 1;
        }

        ^ .foam-u2-dialog-Popup-inner {
          background-color: transparent !important;
        }
      */}
    })
  ],

  imports: [
    'deviceDAO',
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.retail.model.DeviceStatus',
    'net.nanopay.retail.model.Device'
  ],

  messages: [
    { name: 'TitleAll',       message: 'All Device(s)' },
    { name: 'TitleActive',    message: 'Active Device(s)' },
    { name: 'TitleDisabled',  message: 'Disabled Device(s)' },
    { name: 'ActionAdd',      message: 'Add a new device' }
  ],

  properties: [
    'allDevicesCount',
    'activeDevicesCount',
    'disabledDevicesCount',
    { name: 'data', factory: function () { return this.deviceDAO; } }
  ],

  methods: [
    function initE() {
      var self = this;
      this.data.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();

      this
        .addClass(this.myClass())
        .start('div').addClass('devicesContainer')
          .start('div').addClass('devicesRow')
            .start({class: 'net.nanopay.ui.ContentCard', title: this.TitleAll, content$: this.allDevicesCount$ }).addClass('deviceContentCard').end()
            .start({class: 'net.nanopay.ui.ContentCard', title: this.TitleActive, content$: this.activeDevicesCount$ }).addClass('deviceContentCard').end()
            .start({class: 'net.nanopay.ui.ContentCard', title: this.TitleDisabled, content$: this.disabledDevicesCount$ }).addClass('deviceContentCard').end()
            .start(this.ADD_DEVICE, { showLabel: true }).end()
          .end()
        .end()
        .start()
          .tag({
            class: 'foam.u2.ListCreateController',
            dao: this.deviceDAO,
            factory: function() { return self.Device.create(); },
            detailView: {
              class: 'foam.u2.DetailView',
              properties: [
                this.Device.NAME,
                this.Device.TYPE,
                this.Device.STATUS,
                this.Device.SERIAL_NUMBER,
                this.Device.PASSWORD
              ]
            },
            summaryView: this.DeviceTableView.create()
          })
        .end()
    }
  ],

  actions: [
    {
      name: 'addDevice',
      label: 'Add a new device',
      icon: 'images/ic-plus.svg',
      code: function(X) {
        X.stack.push({class: 'net.nanopay.retail.ui.devices.form.DeviceForm'});
      }
    }
  ],

  classes: [
    {
      name: 'DeviceTableView',
      extends: 'foam.u2.View',

      requires: [ 'net.nanopay.retail.model.Device' ],

      imports: [ 'deviceDAO' ],
      properties: [
        'selection',
        { name: 'data', factory: function () { return this.deviceDAO; } }
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              columns: [
                'name', 'type', 'status', 'serialNumber', 'password'
              ]
            }).addClass(this.myClass('table')).end();
        }
      ]
    }
  ],

  listeners: [
    {
      name: 'onDAOUpdate',
      isFramed: true,
      code: function () {
        var self = this;
        this.data.select(this.COUNT()).then(function (count) {
          self.allDevicesCount = count.value;
        });

        this.data.where(this.EQ(this.Device.STATUS, this.DeviceStatus.ACTIVE)).select(this.COUNT()).then(function (count) {
          self.activeDevicesCount = count.value;
        });

        this.data.where(this.EQ(this.Device.STATUS, this.DeviceStatus.DISABLED)).select(this.COUNT()).then(function (count) {
          self.disabledDevicesCount = count.value;
        });
      }
    }
  ]
});
