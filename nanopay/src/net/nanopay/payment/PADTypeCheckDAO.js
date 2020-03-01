foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PADTypeCheckDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'net.nanopay.tx.alterna.*',
    'net.nanopay.tx.bmo.cico.*',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
  Transaction transaction = (Transaction) obj;
  DAO dao = (DAO) x.get("padTypeDAO");

  PADType padType = PADTypeLineItem.getPADTypeFrom(x, transaction);

  if ( padType != null && padType.getId() > 0 ) {
    PADType padTypeFind = (PADType) dao.inX(x).find(EQ(PADType.ID, padType.getId()));
    if ( padTypeFind == null ) {
      throw new RuntimeException("Unsupported PAD type code: " + padType.getId() );
    }
  }
  
  return super.put_(x, obj);
    `
    }
  ]
});
