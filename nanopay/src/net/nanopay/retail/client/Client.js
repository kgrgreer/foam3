foam.CLASS({
  package: 'net.nanopay.retail.client',
  name: 'Client',

  implements: [ 'foam.box.Context' ],

  documentation: 'Retail Service Client',

  requires: [
    'foam.dao.EasyDAO',
    'net.nanopay.retail.model.Device',
    'net.nanopay.retail.model.DeviceStatus'
  ],

  exports: [
    'deviceDAO'
  ],

  properties: [
    {
      name: 'deviceDAO',
      factory: function () {
        return this.EasyDAO.create({
          daoType: 'MDAO',
          of: this.Device,
          cache: true,
          testData: [
            {
              name: 'Ingenico 1', type: 'Terminal', serialNumber: '7D0F5AP3VU529LA', status: this.DeviceStatus.ACTIVE
            },
            {
              name: 'Ciao Tablet', type: 'Android', serialNumber: '59GS8F8A3L5FAQ1', status: this.DeviceStatus.PENDING
            },
            {
              name: 'Merci Pad', type: 'iPad', serialNumber: '0A3H70K5HLA82E4', status: this.DeviceStatus.DISABLED
            }
          ]
        })
        .addPropertyIndex(this.Device.NAME)
        .addPropertyIndex(this.Device.TYPE)
        .addPropertyIndex(this.Device.SERIAL_NUMBER)
        .addPropertyIndex(this.Device.STATUS)
      }
    }
  ]
});