/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.servlet;

import foam.core.X;
import foam.util.SafetyUtil;
import foam.nanos.logger.Logger;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.text.StringEscapeUtils;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.io.FileOutputStream;
import java.io.OutputStream;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.TranscoderException;
import java.nio.file.Paths;

public class ImageServlet
  extends HttpServlet
{
  protected static final int                 BUFFER_SIZE = 4096;
  protected static final String              DEFAULT_EXT = "application/octet-stream";
  protected static final Map<String, String> EXTS = new HashMap<String, String>();

  static {
    EXTS.put("js",    "application/javascript");
    EXTS.put("json",  "application/json");
    EXTS.put("class", "application/java-vm");
    EXTS.put("xml",   "application/xml");

    EXTS.put("ico",   "image/x-icon");
    EXTS.put("gif",   "image/gif");
    EXTS.put("png",   "image/png");
    EXTS.put("svg",   "image/svg+xml");

    EXTS.put("java",  "text/x-java-source");
    EXTS.put("csv",   "text/csv");
    EXTS.put("txt",   "text/plain");
    EXTS.put("html",  "text/html");
  }

  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException
  {
    // get path
    String   cwd     = System.getProperty("user.dir");
    String[] paths   = getServletConfig().getInitParameter("paths").split(":");
    String   reqPath = req.getRequestURI().replaceFirst("/?images/?", "/");

    // enumerate each file path
    for ( int i = 0 ; i < paths.length ; i++ ) {
      File src = new File(cwd + "/" + paths[i] + reqPath);
      // Checking that it starts with the CanonicalPath prevents path escaping
      if ( src.isFile() && src.canRead() && src.getCanonicalPath().startsWith(new File(paths[i]).getCanonicalPath()) ) {
        String ext = EXTS.get(FilenameUtils.getExtension(src.getName()));
        try ( BufferedInputStream is = new BufferedInputStream(new FileInputStream(src)) ) {
          resp.setContentType(! SafetyUtil.isEmpty(ext) ? ext : DEFAULT_EXT);
          resp.setHeader("Content-Disposition", "filename=\"" + StringEscapeUtils.escapeHtml4(src.getName()) + "\"");
          resp.setHeader("Cache-Control", "public, max-age=86400"); // cache for 1 day
          resp.setContentLengthLong(src.length());

          IOUtils.copy(is, resp.getOutputStream());
          return;
        }
      }
    }

    if ( reqPath.endsWith(".png") ) {
      for ( int i = 0; i < paths.length; i++ ) {
        File src    = new File(cwd + "/" + paths[i] + reqPath);
        File srcSvg = new File(cwd + "/" + paths[i] + reqPath.replaceFirst("\\.png", ".svg"));
        if ( srcSvg.isFile() && srcSvg.canRead() && srcSvg.getCanonicalPath().startsWith(new File(paths[i]).getCanonicalPath()) ) {

          // convert .svg to .png
          String          svgUriInput   = Paths.get(srcSvg.getPath()).toUri().toURL().toString();
          TranscoderInput inputSvgImage = new TranscoderInput(svgUriInput);
          try ( OutputStream pngOutputStream = new FileOutputStream(src.getPath()) ) {
            TranscoderOutput outputPngImage  = new TranscoderOutput(pngOutputStream);
            PNGTranscoder    myConverter     = new PNGTranscoder();
            myConverter.transcode(inputSvgImage, outputPngImage);
            pngOutputStream.flush();

            String ext = EXTS.get(FilenameUtils.getExtension(src.getName()));
            try ( BufferedInputStream is = new BufferedInputStream(new FileInputStream(src)) ) {
              resp.setContentType(! SafetyUtil.isEmpty(ext) ? ext : DEFAULT_EXT);
              resp.setHeader("Content-Disposition", "filename=\"" + StringEscapeUtils.escapeHtml4(src.getName()) + "\"");
              resp.setHeader("Cache-Control", "public, max-age=86400"); // cache for 1 day
              resp.setContentLengthLong(src.length());

              IOUtils.copy(is, resp.getOutputStream());
              return;
            }
          } catch ( TranscoderException e ) {
            X x = (X) this.getServletConfig().getServletContext().getAttribute("X");
            ((Logger) x.get("logger")).error(e);
          }
        }
      }
    }

    resp.sendError(resp.SC_NOT_FOUND);
  }
}
