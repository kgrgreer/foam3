/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
