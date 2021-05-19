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
  package: 'net.nanopay.partner.accuity',
  name: 'AccuityBankAccountValidationService',

  documentation: `
    Accuity (Apply Financial) - Validate API.
    Url: "https://applyfinancial.co.uk/products/validate.html".
    Documentation: "https://documents.applyfinancial.co.uk/".
  `,

  implements: [
    'net.nanopay.bank.BankAccountValidationService'
  ],

  imports:[
    'DAO accuityResponseDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.lib.json.MapParser',
    'foam.lib.parse.ParserContextImpl',
    'foam.lib.parse.StringPStream',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.io.IOException',
    'java.net.URI',
    'java.net.http.HttpClient',
    'java.net.http.HttpRequest',
    'java.net.http.HttpRequest.BodyPublishers',
    'java.net.http.HttpResponse.BodyHandlers',
    'java.time.Duration',
    'java.time.LocalDateTime',
    'java.time.ZoneId',
    'java.util.Date',
    'java.util.Map',
    'java.util.regex.*',

    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Int',
      name: 'responseTTL',
      documentation: 'The "time of live" of the response in days.',
      value: 1
    }
  ],

  methods: [
    {
      name: 'authenticate',
      documentation: 'Login and get security token for subsequent requests',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        var credentials = (AccuityCredentials) x.get("accuityCredentials");
        if ( credentials.getValidToken() == null ) {
          var response = send(x,
            "POST", "/validate-api/rest/authenticate",
            "username", credentials.getUsername(), "password", credentials.getPassword());
          var token  = response.get("token");

          if ( ! SafetyUtil.isEmpty(token) && "PASS".equals(response.get("status")) ) {
            credentials.setToken(token);
          } else {
            throw new RuntimeException("AccuityBankAccountValidationService: Invalid token: " + String.valueOf(token));
          }
        }
      `
    },
    {
      name: 'convertToRoutingCode',
      javaCode: `
        authenticate(x);

        var response = getResponse(x,
          "GET", "/validate-api/rest/convert/1.0.1",
          "countryCode", countryCode, "nationalId", nationalId);
        var routingCode = response.get("recommendedNatId");

        if ( SafetyUtil.isEmpty(routingCode) ||
          ! "PASS".equals(response.get("status"))
        ) {
          throw new RuntimeException("Failed Accuity Validation: " + String.valueOf(response.get("comment")));
        }
        return routingCode;
      `
    },
    {
      name: 'convertToSwiftCode',
      javaCode: `
        authenticate(x);

        var response = getResponse(x,
          "GET", "/validate-api/rest/convert/1.0.1",
          "countryCode", countryCode, "accountNumber", iban);
        var swiftCode = response.get("recommendedBIC");

        if ( SafetyUtil.isEmpty(swiftCode) ||
          ! "PASS".equals(response.get("status"))
        ) {
          throw new RuntimeException("Failed Accuity Validation: " + String.valueOf(response.get("comment")));
        }
        return swiftCode;
      `
    },
    {
      name: 'convertToIbanAndSwiftCode',
      javaCode: `
        authenticate(x);

        var response = getResponse(x,
          "GET", "/validate-api/rest/convert/1.0.1",
          "countryCode", countryCode, "nationalId", nationalId, "accountNumber", accountNumber);
        var iban = response.get("recommendedAcct");
        var swiftCode = response.get("recommendedBIC");
        Pattern pattern = Pattern.compile("\\\\((.+)\\\\)");
        Matcher matcher = pattern.matcher(response.get("comment"));
        boolean codeAllowed;
        if ( matcher.find() ) {
          codeAllowed = allowedCodes.contains(matcher.group(1));
        } else {
          codeAllowed = true;
        }

        if ( SafetyUtil.isEmpty(iban) || SafetyUtil.isEmpty(swiftCode) ||
          ! "PASS".equals(response.get("status")) && ! ( "CAUTION".equals(response.get("status")) && codeAllowed )
        ) {
          throw new RuntimeException("Failed Accuity Validation: " + String.valueOf(response.get("comment")));
        }
        return new String[] { iban, swiftCode };
      `
    },
    {
      name: 'getResponse',
      type: 'AccuityAPIResponse',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'method', type: 'String' },
        { name: 'pathname'  , type: 'String' },
        { name: 'params', type: 'String...' }
      ],
      javaCode: `
        var request = new StringBuilder()
          .append(method)
          .append(' ')
          .append(pathname)
          .append(buildUrlParams(null, params))
          .toString();

        // Get from DAO
        AccuityAPIResponse response = (AccuityAPIResponse) getAccuityResponseDAO().find(
          AND(
            EQ(AccuityAPIResponse.REQUEST, request),
            GT(AccuityAPIResponse.EXPIRATION_DATE, new Date())
          )
        );
        if ( response != null ) {
          return response;
        }

        // Send HTTP request
        response = send(x, method, pathname, params);
        if ( ! "PASS".equals(response.get("status")) ) {
          var logger = (Logger) x.get("logger");
          logger.warning("AccuityBankAccountValidationService", request, response.getData());
        }

        // Save to DAO
        response.setRequest(request);
        response.setExpirationDate(
          Date.from(
            LocalDateTime.now()
              .plusDays(getResponseTTL())
              .atZone(ZoneId.systemDefault())
              .toInstant()
          )
        );
        return (AccuityAPIResponse) getAccuityResponseDAO().put(response);
      `
    },
    {
      name: 'buildUrlParams',
      type: 'String',
      args: [
        { name: 'token', type: 'String' },
        { name: 'params', type: 'String...' }
      ],
      javaCode: `
        var sb = new StringBuilder();
        if ( token != null ) {
          sb.append("?token=")
            .append(token);
        }

        var isEmpty = sb.length() == 0;
        for ( int i = 0, j = 1; j < params.length; i+=2, j+=2 ) {
          if ( params[j] != null ) {
            sb.append(isEmpty ? '?' : '&');
            sb.append(params[i])
              .append('=')
              .append(params[j]);
            isEmpty = false;
          }
        }
        return sb.toString();
      `
    },
    {
      name: 'send',
      type: 'AccuityAPIResponse',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'method', type: 'String' },
        { name: 'pathname'  , type: 'String' },
        { name: 'params', type: 'String...' }
      ],
      javaCode: `
        // Prepare URL
        var credentials = (AccuityCredentials) x.get("accuityCredentials");
        var sb = new StringBuilder();
        sb.append(credentials.getBaseUrl())
          .append(pathname)
          .append(buildUrlParams(credentials.getValidToken(), params));

        // Only GET and POST are supported
        if ( ! method.equals("GET")
          && ! method.equals("POST")
        ) {
          throw new RuntimeException("AccuityBankAccountValidationService: " + method + " HTTP method is not supported.");
        }

        // Send HTTP request and parse the response
        try {
          var request = HttpRequest.newBuilder()
            .uri(URI.create(sb.toString()))
            .method(method, BodyPublishers.noBody())
            .build();
          var response = httpClient.send(request, BodyHandlers.ofString());
          if ( response.statusCode() == 200 ) {
            return parseResponse(response.body());
          }

          throw new RuntimeException("AccuityBankAccountValidationService: ("
            + sb.toString() + ") responded " + response.statusCode() + ": "
            + response.body());
        } catch ( IOException | InterruptedException e ) {
          throw new RuntimeException("AccuityBankAccountValidationService: ("
            + sb.toString() + ") failed sending request", e);
        }
      `
    },
    {
      name: 'parseResponse',
      type: 'AccuityAPIResponse',
      args: [
        { name: 's', type: 'String' }
      ],
      javaCode: `
        var ps = new StringPStream(s).apply(
          MapParser.instance(), new ParserContextImpl());

        if ( ps != null ) {
          var response = new AccuityAPIResponse();
          response.setData((Map) ps.value());
          return response;
        }
        return null;
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          protected HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
        `);
      }
    }
  ]
});
