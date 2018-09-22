foam.CLASS({
  package: 'net.nanopay.security',
  name: 'HexString',
  extends: 'foam.core.Property',
  flags: ['java'],

  properties: [
    ['javaType', 'byte[]'],
    ['javaValue', 'null'],
    ['javaInfoType', 'net.nanopay.security.AbstractHexStringPropertyInfo'],
    ['javaJSONParser', 'new net.nanopay.security.HexStringParser()']
  ]
});
