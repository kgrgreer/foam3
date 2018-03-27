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
import org.jtwig.environment.EnvironmentConfiguration;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import static foam.mlang.MLang.*;
import java.io.PrintWriter;
import java.util.List;

public class TermsAndConditionsWebAgent
        implements WebAgent
{
    protected EnvironmentConfiguration config_;

    @Override
    public void execute(X x) {
        PrintWriter        out      = x.get(PrintWriter.class);
        HttpServletRequest request  = x.get(HttpServletRequest.class);

        DAO                tcDAO    = (DAO) x.get("termsAndConditionsDAO");
        String             version  = request.getParameter("version");
        System.out.println(version);

        System.out.println((((ListSink)tcDAO.select(new ListSink())).getData()).size());

        Long                latest =  Long.valueOf(""+(((ListSink)tcDAO.select(new ListSink())).getData()).size()+"");
        System.out.println(latest);

        tcDAO    =  tcDAO.where(EQ(TermsAndConditions.ID,( !version.equals("null") )?Long.valueOf(version):latest-1));

        ListSink           listSink = (ListSink) tcDAO.select(new ListSink());
        List               termsList = listSink.getData();
        TermsAndConditions terms    = (TermsAndConditions) termsList.get(0);

        System.out.println(termsList.get(termsList.size()-1));
        out.println(terms.getBody());
//                           tcDAO     = tcDAO.where(EQ(TermsAndConditions.ID,version));
//        List               termsList = ((ListSink) tcDAO.select( new ListSink() )).getData();
//        TermsAndConditions terms    = (TermsAndConditions) termsList.get(0);
//        System.out.println(terms.getId());
//        out.print("<html><body><h1>HELLO</h1></body></html>");
//        out.print(terms.getBody());


//         ListSink           listSink = (ListSink) tcDAO.select(new ListSink());
//        List               termsList = listSink.getData();
//        TermsAndConditions terms    = (TermsAndConditions) termsList.get(0);
    }
}

