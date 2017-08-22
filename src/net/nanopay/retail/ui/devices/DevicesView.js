foam.CLASS({
  package: 'net.nanopay.retail.ui.devices',
  name: 'DevicesView',
  extends: 'foam.u2.Controller',

  documentation: 'View displaying list of Devices provisioned.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 100%;
          background-color: #edf0f5;
        }
        ^ .devicesRow {
          display: inline-block;
          margin-top: 40px;
          width: 100%;
        }
        ^ .devicesContainer {
          width: 992px;
          margin: auto;
        }
        ^ .deviceContentCard {
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
        ^ .foam-u2-ActionView-create {
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

        ^ .foam-u2-ActionView-addDevice {
          background: none;
          outline: none;
          border: none;

          width: 218px;
          height: 100px;
          float: right;

          background-color: #23C2b7;
          letter-spacing: 0.3px;
          color: #FFFFFF;
          border-radius: 2px;
        }

        ^ .foam-u2-ActionView-addDevice span {
          display: block;
          margin-top: 8px;

          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
        }

        ^ .foam-u2-ActionView-addDevice:hover {
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
    'deviceDAO'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.retail.model.Device',
    'foam.u2.dialog.Popup'
  ],

  messages: [
    { name: 'TitleAll',       message: 'All Device(s)' },
    { name: 'TitleActive',    message: 'Active Device(s)' },
    { name: 'TitleDisabled',  message: 'Disabled Device(s)' },
    { name: 'ActionAdd',      message: 'Add a new device' }
  ],

  properties: [
    {
      name: 'dao',
      factory: function() { return this.deviceDAO; }
    },
    'allDevicesCount',
    'activeDevicesCount',
    'disabledDevicesCount',
    'addDeviceForm'
  ],

  methods: [
    function init() {
      this.addDeviceForm = [
        { parent: 'addDevice', id: 'form-addDevice-name',     label: 'Name',      view: { class: 'net.nanopay.retail.ui.devices.form.DeviceNameForm' } },
        { parent: 'addDevice', id: 'form-addDevice-type',     label: 'Type',      view: { class: 'net.nanopay.retail.ui.devices.form.DeviceTypeForm' } },
        { parent: 'addDevice', id: 'form-addDevice-serial',   label: 'Serial #',  view: { class: 'net.nanopay.retail.ui.devices.form.DeviceSerialForm' } },
        { parent: 'addDevice', id: 'form-addDevice-password', label: 'Password',  view: { class: 'net.nanopay.retail.ui.devices.form.DevicePasswordForm' } }
      ];
    },

    function initE() {
      var self = this;
      this.dao.on.sub(this.onDAOUpdate);
      this.onDAOUpdate();
      this
        .addClass(this.myClass())
        .start('div').addClass('devicesContainer')
          .start('div').addClass('devicesRow')
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.retail.ui.shared.contentCard.ContentCard', data: { title: this.TitleAll }, contents$: this.allDevicesCount$ }).addClass('deviceContentCard')
            .end()
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.retail.ui.shared.contentCard.ContentCard', data: { title: this.TitleActive}, contents$: this.activeDevicesCount$ }).addClass('deviceContentCard')
            .end()
            .start('div').addClass('spacer')
              .tag({class: 'net.nanopay.retail.ui.shared.contentCard.ContentCard', data: { title: this.TitleDisabled}, contents$: this.disabledDevicesCount$ }).addClass('deviceContentCard')
            .end()
            .start('div').addClass('spacer')
              .tag(this.ADD_DEVICE, { showLabel: true })
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
                  this.Device.SERIAL_NUMBER,
                  this.Device.STATUS
                ]
              },
              summaryView: this.DeviceTableView.create()
            })
          .end()
        .end()
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
        { name: 'data', factory: function() {return this.deviceDAO}}
      ],

      methods: [
        function initE() {
          this
            .start({
              class: 'foam.u2.view.TableView',
              selection$: this.selection$,
              data: this.data,
              columns: [
                'name', 'type', 'serialNumber', 'status'
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
      code: function() {
        var self = this;
        this.dao.select(this.COUNT()).then(function(count) {
          self.allDevicesCount = count.value;
        });

        var activeDevicesDAO = this.dao.where(this.EQ(this.Device.STATUS, "Active"));
        activeDevicesDAO.select(this.COUNT()).then(function(count) {
          self.activeDevicesCount = count.value;
        });

        var disabledDevicesDAO = this.dao.where(this.EQ(this.Device.STATUS, "Disabled"));
        disabledDevicesDAO.select(this.COUNT()).then(function(count) {
          self.disabledDevicesCount = count.value;
        });
      }
    }
  ],

  actions: [
    {
      name: 'addDevice',
      label: 'Add a new device',
      icon: 'ui/images/ic-plus.svg',
      code: function() {
        this.add(this.Popup.create().tag({class: 'net.nanopay.retail.ui.devices.form.DeviceForm', title: this.ActionAdd, views: this.addDeviceForm }));
      }
    }
  ]
});
