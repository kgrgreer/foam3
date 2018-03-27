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
import static foam.mlang.MLang.*;
import java.io.PrintWriter;
import java.util.List;

public class TermsAndConditionsWebAgent
        implements WebAgent {

    @Override
    public void execute(X x) {
      PrintWriter        out      = x.get(PrintWriter.class);
      HttpServletRequest request  = x.get(HttpServletRequest.class);
      DAO                tcDAO    = (DAO) x.get("termsAndConditionsDAO");
      String             version  = request.getParameter("version");
      TermsAndConditions terms;
      if ( version.equals("") ) { 
        ListSink listSink = (ListSink) tcDAO.select(new ListSink());
        List     termsList = listSink.getData();
        terms = (TermsAndConditions) termsList.get(termsList.size()-1);
      } else {
        terms = (TermsAndConditions) tcDAO.find(EQ(TermsAndConditions.ID,Long.valueOf(version)));
      }
      out.println(terms.getBody());
    }
}

