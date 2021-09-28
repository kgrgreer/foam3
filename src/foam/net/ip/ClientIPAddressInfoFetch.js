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

  methods: [
    async function fetchIPInfo(ipAddressInfo) {
      if ( ! this.IPAddressInfo.isInstance(ipAddressInfo) ) {
        throw new Error('Object provided is not an instance of IPAddressInfo');
      }
      ipAddressInfo.populateValuesFromJSON(await (await fetch(this.ipInfoProvider)).json());
      return ipAddressInfo;
    },
  ],
});
