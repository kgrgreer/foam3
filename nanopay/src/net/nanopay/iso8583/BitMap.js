foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'BitMap',
  extends: 'foam.core.Property',
  flags: ['java'],

  properties: [
    ['javaType', 'net.nanopay.iso8583.FixedBitSet'],
    ['javaValue', 'null'],
    ['javaInfoType', 'net.nanopay.iso8583.AbstractBitMapPropertyInfo'],
    ['javaJSONParser', 'new net.nanopay.iso8583.BitMapParser()']
  ]
});
