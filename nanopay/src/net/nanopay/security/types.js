foam.CLASS({
  package: 'foam.core',
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

foam.CLASS({
  package: 'foam.core',
  name: 'HexStringArray',
  extends: 'foam.core.Property',
  flags: ['java'],

  properties: [
    ['javaType', 'byte[][]'],
    ['javaValue', 'null'],
    ['javaInfoType', 'net.nanopay.security.AbstractHexStringArrayPropertyInfo'],
    ['javaJSONParser', 'new net.nanopay.security.HexStringArrayParser()']
  ]
});
