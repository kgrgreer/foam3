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
  package: 'net.nanopay.retail',
  name: 'PreventDuplicateDeviceDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'net.nanopay.retail.model.Device',
    
    'static foam.mlang.MLang.*'
  ],

  messages: [
    { name: 'DUPLICATE_DEVICE_WITH_SAME_NAME_ERROR_MSG', message: 'Device with same name already provisioned' },
    { name: 'DUPLICATE_DEVICE_WITH_SAME_SERIAL_NUMBER_ERROR_MSG', message: 'Device with same serial number already provisioned' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PreventDuplicateDeviceDAO(DAO delegate) {
            this(null, delegate);
          }
        
          public PreventDuplicateDeviceDAO(X x, DAO delegate) {
            super(x);
            setDelegate(delegate);
          }   
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Device device = (Device) obj;
        boolean newDevice = ( getDelegate().find(device.getId()) == null );

        if ( newDevice ) {
          Count count = new Count();
          DAO deviceDAO = getDelegate();

          // prevent registration of device with same device name
          count = (Count) deviceDAO.where(AND(
              EQ(Device.OWNER, device.getOwner()),
              EQ(Device.NAME, device.getName())
          )).limit(1).select(count);
          if ( count.getValue() == 1 ) {
            throw new RuntimeException(DUPLICATE_DEVICE_WITH_SAME_NAME_ERROR_MSG);
          }

          // prevent registration of device with same serial number
          count = new Count();
          count = (Count) deviceDAO.where(AND(
              EQ(Device.OWNER, device.getOwner()),
              EQ(Device.SERIAL_NUMBER, device.getSerialNumber())
          )).limit(1).select(count);
          if ( count.getValue() == 1 ) {
            throw new RuntimeException(DUPLICATE_DEVICE_WITH_SAME_SERIAL_NUMBER_ERROR_MSG);
          }
        }

        return super.put_(x, obj);
      `
    }
  ]
});

