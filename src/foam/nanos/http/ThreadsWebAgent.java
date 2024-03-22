/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.*;
import foam.nanos.session.Session;
import foam.util.SafetyUtil;
import java.io.PrintWriter;
import java.lang.StackTraceElement;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;

/** Display thread information. **/
public class ThreadsWebAgent
  implements WebAgent
{
  public ThreadsWebAgent() {}

  private String removeJavaBaseClass(String str){
    return str.substring(str.lastIndexOf("/") + 1);
  }

  // Return the last non java or sun stack element.
  protected String getMethodName(StackTraceElement[] stackTraceElements) {
    if ( stackTraceElements.length > 0 ) {
      String last = removeJavaBaseClass(stackTraceElements[0].toString());
      for ( int j = 0; j < stackTraceElements.length; j++ ) {
        StackTraceElement element = stackTraceElements[j];
        String name = removeJavaBaseClass(element.toString());
        if ( name.startsWith("foam") ) {
          if ( ! last.startsWith("foam") ) {
            return name + "..." + last;
          }
          return name;
        }
      }
      return last;
    }
    return "Unscheduled";
  }

  public void execute(X x) {
    PrintWriter        out         = x.get(PrintWriter.class);
    HttpServletRequest req         = x.get(HttpServletRequest.class);
    Set<Thread>        threadSet   = Thread.getAllStackTraces().keySet();
    Session            session     = x.get(Session.class);
    Thread[]           threadArray = threadSet.toArray(new Thread[threadSet.size()]);
    boolean            showAll     = "y".equals(req.getParameter("showAll"));

    out.println("<HTML>");
    out.println("<HEAD><TITLE>Threads</TITLE></HEAD>\n");
    out.println("<BODY>");
    if ( showAll ) {
     out.println("<a href=\"?showAll=n&sessionId=" + session.getId() + "\">Hide parked threads.</a>");
    } else {
      out.println("<a href=\"?showAll=y&sessionId=" + session.getId() + "\">Show parked threads.</a>");
    }
    out.println("<br><H1>Threads</H1>\n");
    out.println("<pre>");

    int parkedThreads   = 0;
    int sleepingThreads = 0;
    Map<Thread.State, Integer> threadsInState = new HashMap();
    out.println("<table style=\"width: 100%\">");
    out.println("<tr>");
    out.println("<th style=\"text-align: left\">Thread Name</th>");
    out.println("<th style=\"text-align: left\">State</th>");
    out.println("<th>Last Method Call</th>");
    out.println("</tr>");

    for ( Thread thread : threadArray ) {
      StackTraceElement[] elements   = thread.getStackTrace();
      String              methodName = null;

      if ( elements.length > 0 ) {
        methodName = elements[0].getMethodName();

        switch ( methodName ) {
          case "park":
            parkedThreads += 1;
            if ( showAll ) { break; } else { continue; }
          case "sleep":
            sleepingThreads += 1;
            methodName = getMethodName(elements);
            break;
          default:
            methodName = getMethodName(elements);
            break;
        }
      } else {
        methodName = "Unscheduled";
      }

      out.println("<tr>");
      out.println("<td>");
      out.println("<a href=\"threads?id=" + thread.getId() + "&sessionId=" + session.getId() + "\">" + thread.toString() + "</a>");
      out.println("</td>");
      out.println("<td>");
      out.println(thread.getState());
      Integer count = threadsInState.get(thread.getState());
      if ( count == null ) {
        threadsInState.put(thread.getState(), Integer.valueOf(1));
      } else {
        threadsInState.put(thread.getState(), Integer.valueOf(count.intValue() + 1));
      }
      out.println("</td>");
      out.println("<td>");
      out.println(methodName);
      out.println("</td>");
      out.println("<tr>");
    }
    out.println("</table>");

    out.println("<br><br><H2>Summary</H2>\n");
    out.format("Total Threads : %d ; Parked Threads : %d ; Sleeping Threads : %d ; Other Threads : %d", threadArray.length, parkedThreads, sleepingThreads, (threadArray.length - parkedThreads - sleepingThreads));
    out.format("<br>");
    out.println(threadsInState.keySet().stream().map(key -> key + " : " + threadsInState.get(key)).collect(Collectors.joining(" ; ")));

    String param = req.getParameter("id");
    if ( ! SafetyUtil.isEmpty(param) ) {
      out.println("<br><br><H2>Stack Trace</H2>\n");

      for ( Thread thread : threadArray ) {
        if ( param.equals(String.valueOf(thread.getId())) ) {
          out.println("<b>Thread: " + thread.getName() + "</b>\n");
          StackTraceElement[] elements = thread.getStackTrace();

          if ( elements.length > 0 ) {
            for ( StackTraceElement element : elements ) {
              out.println(element.toString());
            }
          } else {
            out.println("This thread has not started, has started but not yet been scheduled to run, or has terminated.");
          }
          break;
        }
      }
    }

    out.println("</pre></BODY></HTML>");
  }
}
