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

package net.nanopay.tx;

import foam.core.FObject;
import foam.core.Validator;
import foam.core.X;
import foam.nanos.logger.PrefixLogger;
import foam.nanos.logger.Logger;

import java.util.Date;

public class RequestMoneyValidator implements Validator {

  @Override
  public void validate(X x, FObject obj) {

    Logger logger = new PrefixLogger(new Object[] { this.getClass().getSimpleName() }, (Logger) x.get("logger"));
    if ( ! (obj instanceof RequestMoney) ) {
      logger.error("Malformed Request", obj );
      throw new RuntimeException("Malformed Request");
    }
    RequestMoney mr = (RequestMoney) obj;

    if( mr.getRequestId().isEmpty())
      throw new RuntimeException("RequestId missing");
    if( mr.getRequestAmount() <= 0 )
      throw new RuntimeException("RequestAmount must be greater then 0");
    if( mr.getRequestExpiryDate() == null )
      throw new RuntimeException("RequestExpiryDate missing");
    if( mr.getRequestExpiryDate().before(new Date()) )
      throw new RuntimeException("RequestExpiryDate is already past");

    if( mr.getRequesterName().isEmpty())
      throw new RuntimeException("RequesterName missing");
    if( mr.getCustAccount().isEmpty())
      throw new RuntimeException("CustAccount missing");
    if( mr.getCustAccount().length() > 30 )
      throw new RuntimeException("CustAccount exceeds maximum length");

  }
}
