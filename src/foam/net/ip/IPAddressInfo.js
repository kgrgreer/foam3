/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 */

 foam.CLASS({
  package: 'foam.net.ip',
  name: 'IPAddressInfo',
  documentation: `Represents information fetched by an IP information provider.`,

  requires: [
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.Region'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'regionDAO'
  ],

  tableColumns: [
    'isp',
    'city',
    'continent',
    'country',
    'region',
    'ipAddress'
  ],

  properties: [
    {
      class: 'String',
      name: 'isp',
      documentation: 'Internet service provider related to IP Address',
    },
    {
      class: 'String',
      name: 'city',
      documentation: `City related to IP Address`
    },
    {
      class: 'String',
      name: 'country',
      documentation: `Country name associated to IP Address`
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryCode',
      documentation: `Country code reference provided by ip address information provider (CA, US, BR etc..)`
    },
    {
      class: 'String',
      name: 'region',
      documentation: `Region name associated to IP Address`,
      postSet: function(o, n) {
        this.regionDAO.find(this.EQ(this.Region.NAME, n)).then(region => {
          this.regionId = region.code;
        });
      }
    },
    {
      class: 'Reference',
      name: 'regionId',
      of: 'foam.nanos.auth.Region',
      documentation: `Region code reference fetched using region name and system regionDAO (CA-ON, US-AZ etc..)`
    },
    {
      class: 'String',
      name: 'continent',
      documentation: `Continent associated to IP Address`
    },
    {
      class: 'String',
      name: 'ipType',
      documentation: `Defines the IP Address type ( Residential, Commercial etc... )`
    },
    {
      class: 'String',
      name: 'organization',
      documentation: `The organization supplying the IP Address`,
    },
    {
      class: 'String',
      name: 'businessName',
      documentation: `Business name associated to IP Address (Not common)`
    },
    {
      class: 'String',
      name: 'businessWebsite',
      documentation: `Business website associated to IP Address (Not common)`
    }
  ],

  messages: [
    { name: 'NO_INTERNET_CONNECTION', message: 'Unable to connect to a valid network to retrieve IP address information from the configured provider.' },
  ],

  methods: [
    async function fetchInfo(url) {
      if ( ! navigator.onLine ) {
        console.warning(this.NO_INTERNET_CONNECTION);
        return;
      }
      var obj = await (await fetch(url)).json();

      this.isp = obj.isp;
      this.ipType = obj.ipType;
      this.city = obj.city;
      this.country = obj.country;
      this.countryCode = obj.countryCode;
      this.region = obj.region;
      this.continent = obj.continent;
      this.businessName = obj.businessName;
      this.businessWebsite = obj.businessWebsite;
      this.organization = obj.org;
      this.ipAddress = obj.query;
    }
  ]
});
