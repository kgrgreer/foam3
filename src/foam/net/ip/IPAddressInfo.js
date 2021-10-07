/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 */

 foam.CLASS({
  package: 'foam.net.ip',
  name: 'IPAddressInfo',
  documentation: `Represents information fetched by an IP information provider.`,
  ids: ['provider'],

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

  javaImports: [
    'java.io.IOException',
    'foam.core.FObject',
    'foam.lib.json.JSONParser',
    'foam.net.IPSupport',
    'java.net.URI',
    'java.net.http.HttpClient',
    'java.net.http.HttpRequest',
    'java.net.http.HttpRequest.BodyPublishers',
    'java.net.http.HttpResponse',
    'java.net.http.HttpResponse.BodyHandlers',
    'java.time.Duration'
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
      class: 'URL',
      name: 'provider',
      documentation: `Provider of IP address information.`
    },
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
    {
      name: 'fetchInfo',
      type: 'foam.net.ip.IPAddressInfo',
      args: [
        {
          type: 'Context',
          name: 'x'
        }
      ],
      javaCode: `
        String remoteIp = foam.net.IPSupport.instance().getRemoteIp(x);

        HttpRequest request = HttpRequest.newBuilder()
          .uri(URI.create(getProvider() + remoteIp))
          .method("GET", BodyPublishers.noBody())
          .build();

        HttpClient httpClient = HttpClient.newBuilder()
          .connectTimeout(Duration.ofSeconds(10))
          .build();
        try {
          HttpResponse<String> response = httpClient.send(request, BodyHandlers.ofString());

          if ( response.statusCode() == 200 ) {
            JSONParser jsonParser = new JSONParser();
            jsonParser.setX(x);

            var info = (IPAddressInfo) jsonParser.parseString(response.body(), IPAddressInfo.class);
            this.copyFrom(info);
          }
        } catch ( IOException | InterruptedException e ) {
          throw new RuntimeException("Issue fetching IP address information.");
        }
        return this;
      `,
      code: async function() {
        if ( ! navigator.onLine ) {
          console.warning(this.NO_INTERNET_CONNECTION);
          return;
        }
        var obj = await (await fetch(this.provider)).json();
        this.copyObj(obj);
      },
    },
    {
      name: 'copyObj',
      args: [
        {
          type: 'Object',
          name: 'obj'
        }
      ],
      javaCode: `
        // noop
      `,
      code: function(obj) {
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
    }
  ]
});
