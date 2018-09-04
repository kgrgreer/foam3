//
//  ServiceURL.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class ServiceURLs {
  public enum Host: String {
    case Localhost = "http://localhost:8080/service/"
    case Staging = "http://portal.staging.nanopay.net/service/"
    case Production = "https://portal.nanopay.net/service/"

    case Integration = "https://integration.nanopay.net/service/"

    case CCDemo = "https://foam.demo.nanopay.net/service/"
    case CCStaging = "http://cc.staging.nanopay.net/service/"
    case CCProduction = "https://cc.nanopay.net/service/"

    public func isProductionEnv() -> Bool {
      switch self {
        // Append other production env when we add them to the above cases
        case .Production, .CCProduction:
          return true
        default: return false
      }
    }
  }

  static var hostRoute: Host = .Localhost

  public static func setHostRoute(url: Host) {
    hostRoute = url
  }

  public static func getHostRoute() -> Host {
    return hostRoute
  }
}

extension String: Error {}
