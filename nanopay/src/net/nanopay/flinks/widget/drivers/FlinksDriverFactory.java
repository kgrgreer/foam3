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

package net.nanopay.flinks.widget.drivers;

import foam.core.*;
import foam.dao.DAO;
import foam.lib.csv.CSVOutputter;
import foam.lib.json.OutputterMode;
import foam.nanos.boot.NSpec;
import foam.nanos.dig.exception.*;
import foam.nanos.dig.*;
import foam.nanos.http.*;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

import net.nanopay.flinks.widget.FlinksException;

import java.io.PrintWriter;
import java.util.List;
import javax.servlet.http.HttpServletResponse;

public class FlinksDriverFactory
{
  public static FlinksDriver create(X x, String tag) {
    
    if ( SafetyUtil.isEmpty(tag) ) {
      throw new FlinksException("tag is required to create FlinksDriver");
    }

    switch ( tag ) {
      case "requestToPay":
        HttpParameters p = x.get(HttpParameters.class);
        String dao = (String) p.get("dao");
        String id = (String) p.get("id");

        return new RequestToPayFlinksDriver.Builder(x)
          .setTag(tag)
          .setDao(dao)
          .setId(id)
          .build();

        default:
          throw new FlinksException("Unexpected tag: " + tag);
    }
  }
}
