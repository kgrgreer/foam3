/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.partner.treviso.fx',
  name: 'TrevisoFXService',
  implements: [
    'net.nanopay.fx.FXService',
  ],

  documentation: 'Treviso service for fetching the fx rate from treviso',

  javaImports: [
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.lib.json.JSONParser',
    'foam.mlang.MLang',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.om.OMLogger',
    'foam.util.SafetyUtil',
    'foam.core.Detachable',
    'foam.nanos.dig.exception.UnsupportException',
    'net.nanopay.partner.treviso.fx.Cotacoes',
    'net.nanopay.partner.treviso.fx.EnfoqueResponse',
    'foam.nanos.app.Mode',
    'java.io.IOException',
    'java.net.URLEncoder',
    'java.net.URISyntaxException',
    'java.net.http.HttpClient',
    'java.net.http.HttpRequest',
    'java.net.http.HttpResponse',
    'java.net.URI',
    'java.nio.charset.StandardCharsets',
    'java.time.Duration',
    'java.util.Arrays',
    'java.util.HashMap',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'login',
      class: 'String',
      documentation: 'api log in keys'
    },
    {
      name: 'password',
      class: 'String',
      documentation: 'api password'
    },
    {
      name: 'currencies',
      class: 'StringArray',
      documentation: 'supported currencies'
    },
    {
      class: 'Object',
      of: 'java.net.http.HttpClient',
      name: 'client'
    }
  ],

  methods: [
    {
      name: 'getFXRate',
      type: 'net.nanopay.fx.FXQuote',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'sourceCurrency',
          type: 'String'
        },
        {
          name: 'targetCurrency',
          type: 'String'
        },
        {
          name: 'sourceAmount',
          type: 'Long'
        },
        {
          name: 'destinationAmount',
          type: 'Long'
        },
        {
          type: 'String',
          name: 'fxDirection',
        },
        {
          name: 'valueDate',
          type: 'String'// TODO: investigate why java.util.dat can't be used here
        },
        {
          type: 'Long',
          name: 'user'
        },
        {
          type: 'String',
          name: 'fxProvider'
        }
      ],
      documentation: 'Not supported in the treviso fx service',
      javaCode: `
        // not supported.
        throw new UnsupportException("getFXRate method not supported");
      `
    },
    {
      name: 'acceptFXRate',
      type: 'Boolean',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'quoteId',
          type: 'String'
        },
        {
          type: 'Long',
          name: 'user'
        }
      ],
      documentation: 'Not supported in the treviso fx service',
      javaCode: `
        // not supported.
        throw new UnsupportException("acceptFXRate method not supported");
      `
    },
    {
      name: 'getFXSpotRate',
      type: 'Double',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'sourceCurrency',
          type: 'String'
        },
        {
          name: 'targetCurrency',
          type: 'String'
        },
        {
          type: 'Long',
          name: 'user'
        }
      ],
      documentation: 'Returns the BRL -> USD rate from treviso',
      javaCode: `
        if ( ! SafetyUtil.equals("BRL", sourceCurrency) ) {
          throw new UnsupportException("Unsupported source currency: BRL");
        }
        if ( ! Arrays.asList(getCurrencies()).contains(targetCurrency) ) {
          throw new UnsupportException("Unsupported target currency: "+targetCurrency);
        }

        return getRate(sourceCurrency,targetCurrency);
      `
    },
    {
      name: 'getRate',
      type: 'Double',
      async: true,
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'sourceCurrency',
          type: 'String'
        },
        {
          name: 'targetCurrency',
          type: 'String'
        }
      ],
      javaCode: `
      Logger logger = (Logger) getX().get("logger");
      logger = new PrefixLogger(new Object[]{this.getClass().getSimpleName()}, logger);
      OMLogger omLogger = (OMLogger) getX().get("OMLogger");
      JSONParser jsonParser = new JSONParser();
      HttpClient client = ((HttpClient) getClient());

      if ( client == null ) {
        client = HttpClient.newBuilder()
          .version(HttpClient.Version.HTTP_2)
          .connectTimeout(Duration.ofSeconds(100))
          .build();
      }

      try {  
        Map<String, String> map = new HashMap<>();
        map.put("login", getLogin());
        map.put("senha", getPassword());
        HttpRequest request = HttpRequest.newBuilder()
          .uri(new URI("http://webservice.enfoque.com.br/wstreviso/getdatahistory.asmx/GetQuotes"))
          .POST(ofFormData(map))
          .header("Content-Type", "application/x-www-form-urlencoded")
          .build();
        logger.info("Enfoque getQuote request sent");
        omLogger.log("Enfoque getQuote starting");
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        omLogger.log("Enfoque getQuote  complete");
        if ( response.statusCode() / 100 != 2 ) {
          String errorMsg = response.statusCode() + " " + response.body();
          logger.error(errorMsg);
          throw new RuntimeException(errorMsg);
        }
        logger.info("Enfoque getQuote response: ", response.body());
        Cotacoes cotacoes = (Cotacoes) jsonParser.parseString(response.body(), Cotacoes.class);
        for ( EnfoqueResponse i: cotacoes.getCotacoes() ) {
          if ( i.getCod().equals(targetCurrency + sourceCurrency) ) {
            return 1.0 / Double.valueOf(i.getOvd());
          }
        }
      } catch (IOException | URISyntaxException | InterruptedException e) {
        omLogger.log("Enfoque getToken timeout");
        ((DAO) getX().get("alarmDAO")).put(new Alarm.Builder(getX()).setName("Enfoque getRate").setReason(AlarmReason.TIMEOUT).build());
        logger.error(e);
      }
      throw new RuntimeException("failed to get rate");
      `
    },
    {
      name: 'ofFormData',
      type: 'HttpRequest.BodyPublisher',
      javaThrows: ['java.lang.RuntimeException'],
      args: [
        {
          name: 'data',
          type: 'Map<String, String>'
        }
      ],
      javaCode: `
        var builder = new StringBuilder();
        for (Map.Entry<String, String> entry : data.entrySet()) {
          if (builder.length() > 0) {
            builder.append("&");
          }
          builder.append(URLEncoder.encode(entry.getKey().toString(), StandardCharsets.UTF_8));
          builder.append("=");
          builder.append(URLEncoder.encode(entry.getValue().toString(), StandardCharsets.UTF_8));
        }
        return HttpRequest.BodyPublishers.ofString(builder.toString());
      `
    }
  ]
});
