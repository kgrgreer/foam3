//
//  TokenGenService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-30.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class TokenGenService: Service {
  public var service: ClientTokenService!

  override init(withURL: ServiceURLs.ServiceURL) {
    super.init(withURL: withURL)
    self.service = X.create(ClientTokenService.self)!
    self.service.delegate = dao.delegate
  }

  public func generateToken(callback: @escaping (Any?) -> Void) {
    guard UserService.instance.isUserLoggedIn() else {
      callback(UserService.UserError.UserNotLoggedIn)
      return
    }

    DispatchQueue.global(qos: .userInitiated).async {
      do {
        guard let token = try self.service.generateToken(UserService.instance.getLoggedInUser()!) else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        DispatchQueue.main.async {
          callback(token)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  public func processToken(withCode code: String, callback: @escaping (Any?) -> Void) {
    guard UserService.instance.isUserLoggedIn() else {
      callback(UserService.UserError.UserNotLoggedIn)
      return
    }

    DispatchQueue.global(qos: .userInitiated).async {
      do {
        guard let success = try self.service.processToken(UserService.instance.getLoggedInUser()!, code) else {
          DispatchQueue.main.async {
            callback(ServiceError.ConversionFailed)
          }
          return
        }

        DispatchQueue.main.async {
          callback(success)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }
}
