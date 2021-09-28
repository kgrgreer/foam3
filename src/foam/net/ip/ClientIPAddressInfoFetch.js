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
    },
    {
      class: 'FObjectProperty',
      name: 'ipAddressInfo',
      of: 'foam.net.ip.IPAddressInfo',
      documentation: 'Contains fetched information from the applied IP Address information provider.',
      factory: function() {
        return this.IPAddressInfo.create();
      }
    }
  ],

  methods: [
    async function fetchIPInfo() {
      this.ipAddressInfo.populateValuesFromJSON(await (await fetch(this.ipInfoProvider)).json());
      return this.ipAddressInfo;
    },
  ],
});
