/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
package foam.nanos.servlet;

import foam.blob.Blob;
import foam.blob.BlobService;
import foam.blob.FileBlob;
import foam.blob.IdentifiedBlob;
import foam.blob.InputStreamBlob;
import foam.core.X;
import foam.core.XLocator;
import foam.core.ProxyX;
import foam.dao.DAO;
import static foam.mlang.MLang.EQ;
import foam.nanos.fs.File;
import foam.nanos.logger.Logger;
import foam.nanos.logger.Loggers;
import foam.util.SafetyUtil;
import java.io.*;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.batik.transcoder.image.PNGTranscoder;
import org.apache.batik.transcoder.TranscoderInput;
import org.apache.batik.transcoder.TranscoderOutput;
import org.apache.batik.transcoder.TranscoderException;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.text.StringEscapeUtils;

/**
   Load images from jar resource.
   Special support for png requests.  If a matching svg exists,
   convert it to png and store in the fileDAO for subsequent use.
*/
public class ResourceImageServlet
  extends ImageServlet
{
  @Override
  protected void service(HttpServletRequest req, HttpServletResponse resp)
    throws ServletException, IOException
  {
    X      x       = (X) this.getServletConfig().getServletContext().getAttribute("X");
    String request = req.getRequestURI();
    Logger logger  = Loggers.logger(x, this);
    // logger.info("uri", req.getRequestURI());

    try {
      InputStream is       = getClass().getResourceAsStream(request);
      String      fileName = request.replace("images/", "").replaceAll("/", "_");
      if ( request.endsWith(".png") && is == null ) {
        // logger.info("png resource not found");
        DAO fileDAO = ((DAO) x.get("fileDAO")).inX(x);
        File file = (File) fileDAO.find(EQ(File.FILENAME, fileName));
        if ( file == null ) {
          // logger.info("png file not found");
          String svgRequest = request.replaceFirst("\\.png", ".svg");
          is = getClass().getResourceAsStream(svgRequest);
          if ( is != null ) {
            // logger.info("svg resource found");
            TranscoderInput inputSvgImage = new TranscoderInput(is);
            try ( ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream() ) {
              TranscoderOutput outputPngImage  = new TranscoderOutput(pngOutputStream);
              PNGTranscoder    myConverter     = new PNGTranscoder();
              myConverter.transcode(inputSvgImage, outputPngImage);

              Blob blob = new InputStreamBlob(new ByteArrayInputStream(pngOutputStream.toByteArray()), pngOutputStream.size());
              file = new File.Builder(x)
                .setOwner(1) // system
                .setMimeType("image/png")
                .setFilename(fileName)
                .setFilesize(pngOutputStream.size())
                .setData(blob)
                .setSpid("nanopay")
                .build();
              fileDAO.put(file);
              // logger.info("png created");
              file = (File) fileDAO.find(file.getId());
              is = file.inputStream(x);
            } catch ( Exception e ) {
              logger.error(e);
            }
          } else {
            logger.warning("svg image resource not found", req.getRequestURI());
          }
        } else {
          // logger.info("png file found");
          // Query again with ID as FileDataDAO adds FileDataClearSink
          // which strips data and dataString for File tableViews (select).
          // The above EQ results in select limit 1.
          file = (File) fileDAO.find(file.getId());
          is   = file.inputStream(x);
        }
      }
      if ( is != null ) {
        try ( BufferedInputStream bis = new BufferedInputStream(is) ) {
          String ext = EXTS.get(FilenameUtils.getExtension(fileName));
          resp.setContentType(!SafetyUtil.isEmpty(ext) ? ext : DEFAULT_EXT);
          resp.setHeader("Cache-Control", "public, max-age=86400"); // cache for 1 day

          IOUtils.copy(bis, resp.getOutputStream());
          return;
        }
      }
    } catch (Exception e) {
      logger.error(e);
    }

    resp.sendError(resp.SC_NOT_FOUND);
  }
}
