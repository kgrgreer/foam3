/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.net.ip',
  name: 'ClientIPAddressInfoFetch',
  documentation: `
    Fetches IP address info using the method provided by the ipAddress 
  `,

  requires: [
    'foam.net.ip.IPAddressInfo'
  ],

  properties: [
    {
      class: 'URL',
      name: 'ipInfoProvider',
      documentation: `IP information provider url.`
    }
  ],

  messages: [
    { name: 'IS_INSTANCE', message: 'Object provided is not an instance of IPAddressInfo' }
  ],

  methods: [
    async function fetchIPInfo(ipAddressInfo) {
      if ( ! this.ipInfoProvider ) {
        return;
      }
      if ( ! this.IPAddressInfo.isInstance(ipAddressInfo) ) {
        throw new Error(this.IS_INSTANCE);
      }
      await ipAddressInfo.fetchInfo(this.ipInfoProvider);
      return ipAddressInfo;
    },
  ],
});
