package net.nanopay.tx.cico;

import foam.blob.Blob;
import foam.blob.BlobService;
import foam.blob.FileBlob;
import foam.blob.IdentifiedBlob;
import foam.blob.InputStreamBlob;
import foam.core.X;
import foam.dao.DAO;
import foam.nanos.alarming.Alarm;
import foam.nanos.alarming.AlarmReason;
import foam.nanos.fs.File;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.FileNotFoundException;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Base64;


public class EFTFileUtil {

  public static File storeEFTFile(X x, java.io.File file, String mimeType) throws FileNotFoundException {
    try {
      FileInputStream in = new FileInputStream(file);
      return storeEFTFile(x, in, file.getName(), Long.valueOf(file.length()), mimeType);
    } catch(Throwable t) {
      throw t;
    }
  }

  public static File storeEFTFile(X x, java.io.File file, String fileName, String mimeType) throws FileNotFoundException {
    try {
      FileInputStream in = new FileInputStream(file);
      return storeEFTFile(x, in, fileName, Long.valueOf(file.length()), mimeType);
    } catch(Throwable t) {
      throw t;
    }
  }

  public static File storeEFTFile(X x, InputStream in, String fileName, Long fileSize, String mimeType) {
    try {
      DAO fileDAO = ((DAO) x.get("fileDAO")).inX(x);
      BlobService blobStore  = (BlobService) x.get("blobStore");
      Blob data = new InputStreamBlob(in, fileSize);
      File file = new File.Builder(x)
          .setMimeType(mimeType)
          .setFilename(fileName)
          .setFilesize(fileSize)
          .setData(data)
          .build();
      return (File) fileDAO.put(file);
    } catch(Throwable t) {
      throw t;
    }
  }

  public static java.io.File getFile(X x, File file) {
    if ( file == null ) return null;

    if ( SafetyUtil.isEmpty(file.getDataString()) ){
      BlobService store = (BlobService) x.get("blobStore");
      FileBlob blob = (FileBlob) store.find(file.getId());
      if ( blob != null ) {
        return blob.getFile();
      }
      ((foam.nanos.logger.Logger) x.get("logger")).error("File not found", file.getId());
      throw new foam.core.FOAMException(new IOException("File not found"));
    } else {
      try {
        InputStreamBlob blob = (InputStreamBlob) file.getData();
        InputStream inputStream = (ByteArrayInputStream) blob.getInputStream();
        byte[] byteArray = new byte[inputStream.available()];
        inputStream.read(byteArray);
        java.io.File tempFile = java.io.File.createTempFile(file.getFilename(), file.getMimeType());
        FileOutputStream fos = new FileOutputStream(tempFile);
        fos.write(byteArray);
        return tempFile;
      } catch(IOException t) {
        Logger logger = (Logger) x.get("logger");
        logger.warning("File", file.getId(), t);
        ((DAO) x.get("alarmDAO")).put(new Alarm.Builder(x)
                                      .setName("EFF Get File")
                                      .setReason(foam.nanos.alarming.AlarmReason.UNSPECIFIED)
                                      .setSeverity(foam.log.LogLevel.ERROR)
                                      .setNote(t.getMessage())
                                      .build());
        throw new foam.core.FOAMException(t);
      }
    }
  }
}
