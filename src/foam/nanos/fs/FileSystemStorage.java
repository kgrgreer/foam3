/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.fs;

import foam.util.SafetyUtil;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;

public class FileSystemStorage
  extends AbstractStorage
{

  public FileSystemStorage() {
    super();
  }

  public FileSystemStorage (String root) {
    super(root);
  }

  @Override
  protected FileSystem getFS() {
    return FileSystems.getDefault();
  }

  @Override
  protected Path getRootPath() {
    FileSystem fs = getFS();
    if ( fs == null ) return null;
    return SafetyUtil.isEmpty(resourceDir_) ? fs.getPath("") : fs.getPath(resourceDir_);
  }

  @Override
  protected Path getPath(String name) {
    FileSystem fs = getFS();
    if ( fs == null ) return null;
    return SafetyUtil.isEmpty(resourceDir_) ? fs.getPath(name) : fs.getPath(resourceDir_, name);
  }

  public BasicFileAttributes getFileAttributes(String name) {

    try {
      Path file = this.getPath(name);
      BasicFileAttributes attr =
          Files.readAttributes(file, BasicFileAttributes.class);
      return attr;
    } catch ( java.io.IOException e ) {
      return null;
    }
  }
}
