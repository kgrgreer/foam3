foam.CLASS({
  package: 'net.nanopay.integration.quick',
  name: 'QuickConfig',
  documentation: 'Abstract Model for Xero Config',
  javaImplements: [
    'com.intuit.oauth2.config.OAuth2Config'
  ],
  properties: [
    {
      class: 'String',
      name: 'OAuth2AppClientId',
      value: 'L0BGm27rIJOzAILPCmvlC9BnTXlWJIAAxxJE13rR877sae0Al3'
    },
    {
      class: 'String',
      name: 'OAuth2AppClientSecret',
      value: 'REa9ITUEDxJRNhz0WfT6atNlMMZKWxUj1iScqCsk'
    },
    {
      class: 'String',
      name: 'OAuth2AppRedirectUri',
      value: 'http://localhost:8080/service/quick'
    },
    {
      class: 'String',
      name: 'IntuitAccountingAPIHost',
      value: 'https://sandbox-quickbooks.api.intuit.com'
    }
  ]
});
