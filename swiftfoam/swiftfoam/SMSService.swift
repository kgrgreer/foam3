//
//  SMSService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-25.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class SMSService: Service {
  public static let instance: SMSService = SMSService()

  public var service: ClientTokenService!

  // Helps determine type of error to handle on frontend
  public enum SMSError: ServiceErrorProtocol {
    case InvalidCode
    public func description() -> String {
      switch(self) {
      case .InvalidCode:
        return "Invalid Code Used"
      }
    }
  }

  init() {
    super.init(withURL: ServiceURL.SMS)
    service = X.create(ClientTokenService.self)!
    service.delegate = dao.delegate
  }

  public func generateToken(forUser user: User, callback: @escaping (Any?) -> Void) {
    guard UserService.instance.isUserLoggedIn() else {
      callback(UserService.UserError.UserNotLoggedIn)
      return
    }

    DispatchQueue.global(qos: .userInitiated).async {
      guard let token = self.service.generateToken(user) as? String else {
        DispatchQueue.main.async {
          callback(ServiceError.ConversionFailed)
        }
        return
      }

      DispatchQueue.main.async {
        callback(token)
      }
    }
  }

  public func processToken(forUser user: User, withCode code: String, callback: @escaping (Any?) -> Void) {
    guard UserService.instance.isUserLoggedIn() else {
      callback(UserService.UserError.UserNotLoggedIn)
      return
    }

    guard code.characters.count == 4 else {
      callback(SMSError.InvalidCode)
      return
    }

    DispatchQueue.global(qos: .userInitiated).async {
      guard let success = self.service.processToken(user, code) as? Bool else {
        DispatchQueue.main.async {
          callback(ServiceError.ConversionFailed)
        }
        return
      }

      DispatchQueue.main.async {
        callback(success)
      }
    }
  }
}
