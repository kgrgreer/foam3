/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package net.nanopay.settings;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ListSink;
import foam.nanos.http.WebAgent;
import net.nanopay.model.TermsAndConditions;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import static foam.mlang.MLang.*;

import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

public class TermsAndConditionsWebAgent
        implements WebAgent {

  @Override
  public void execute(X x) {
    HttpServletRequest  request  = x.get(HttpServletRequest.class);
    HttpServletResponse response = x.get(HttpServletResponse.class);
    DAO                 tcDAO    = (DAO) x.get("termsAndConditionsDAO");
    String              version  = request.getParameter("version");
    TermsAndConditions  terms;
    PrintWriter         out      = null;
    try {
      out = new PrintWriter(new OutputStreamWriter(response.getOutputStream(), StandardCharsets.ISO_8859_1), true);
    } catch (IOException e) {
      e.printStackTrace();
    }

    if ( version.equals("") ) {
      ListSink listSink = (ListSink) tcDAO.orderBy(new foam.mlang.order.Desc(TermsAndConditions.ID)).limit(1).select(new ListSink());

      terms = (TermsAndConditions) listSink.getData().get(0);
    } else {
      terms = (TermsAndConditions) tcDAO.find(EQ(TermsAndConditions.ID,Long.valueOf(version)));
    }
    out.println(terms.getBody());
  }
}

