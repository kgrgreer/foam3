package net.nanopay.security;

class SecurityTestUtil {

  static boolean IsSoftHSMInstalled() {
    try {
      return new ProcessBuilder("softhsm2-util", "--help").start().waitFor() == 0;
    } catch ( Throwable t ) {
      return false;
    }
  }

  static boolean ResetSoftHSM() {
    try {
      // delete existing test token, ignoring errors
      new ProcessBuilder("softhsm2-util",
        "--delete-token", "--token", "SecurityTestUtil")
        .inheritIO().start().waitFor();
    } catch ( Throwable t ) {
      t.printStackTrace();
    }

    try {
      // create new test token
      Process process = new ProcessBuilder("softhsm2-util",
        "--init-token", "--slot", "0",
        "--label", "SecurityTestUtil",
        "--so-pin", "test",
        "--pin", "test")
        .inheritIO()
        .start();

      // wait for process to finish
      if ( process.waitFor() != 0 ) {
        throw new RuntimeException("Failed to initialize token: \"SecurityTestUtil\"");
      }

      return true;
    } catch ( Throwable t ) {
      t.printStackTrace();
      return false;
    }
  }
}
