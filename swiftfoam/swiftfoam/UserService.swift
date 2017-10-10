//
//  UserService.swift
//  swiftfoam
//
//  Created by Kenny Kan on 2017-10-03.
//  Copyright © 2017 nanoPay Corporation. All rights reserved.
//

public class UserService: Service {
  public static let instance: UserService = UserService()

  // Helps determine type of error to handle on frontend
  public enum UserError: ServiceErrorProtocol {
    case IncorrectCredentials
    case UpdateFailed
    case UserAlreadyExists
    case UserNotFound
    case UserNotLoggedIn
    case UserUnverifiedEmail
    case UserUnverifiedPhone
    func description() -> String {
      switch(self) {
        case .IncorrectCredentials:
          return "Incorrect email or password."
        case .UpdateFailed:
          return "Could not update user. Please try again."
        case .UserAlreadyExists:
          return "User already exists. Please try a different email."
        case .UserNotFound:
          return "Could not find user."
        case .UserNotLoggedIn:
          return "Please log in again."
        case .UserUnverifiedEmail:
          return "User's email is not verfied. Verify your email and try again."
        case .UserUnverifiedPhone:
          return "User's telephone number has not been verified. Verify the number and try again."
      }
    }
  }

  private var loggedInUser: User?

  init() {
    super.init(withURL: ServiceURL.User)
  }

  public func register(user: User,
                       putDispatchQueue: DispatchQueue = DispatchQueue.global(qos: .background),
                       callbackDispatchQueue: DispatchQueue = DispatchQueue.main,
                       callback: @escaping (Any?) -> Void)
  {
    putDispatchQueue.async {
      // TODO: Check if user already exists
      do {
        let placedUser = (try self.dao.put(user)) as? User
        callbackDispatchQueue.async {
          callback(placedUser)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        callbackDispatchQueue.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  public func login(withUsername username: String,
                    andPassword pass: String,
                    callback: @escaping (Any?) -> Void)
  {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        // TODO: Get user from DAO and place into self.loggedInUser
        let pred = self.X.create(And.self, args: [
          "args": [
            self.X.create(Eq.self, args: [
              "arg1": User.classInfo().axiom(byName: "email"),
              "arg2": username,
            ]),
            self.X.create(Eq.self, args: [
              "arg1": User.classInfo().axiom(byName: "password"),
              "arg2": pass,
            ])
          ]
        ])

        let userSink = (try? self.dao.`where`(pred).skip(0).limit(1).select(ArraySink())) as! ArraySink

        guard userSink.array.count > 0 else {
          // User Not Found.
          DispatchQueue.main.async {
            callback(UserError.IncorrectCredentials)
          }
          return
        }

        guard (self.loggedInUser = userSink.array[0] as? User) != nil else {
          // Could not convert item in array into User
          DispatchQueue.main.async {
            callback(ServiceError.Failed)
          }
          return
        }

//        guard self.isUserVerifiedEmail() else {
//          // lets the front end know the logged in user hasn't verified their email
//          DispatchQueue.main.async {
//            callback(UserError.UserUnverifiedEmail)
//          }
//          return
//        }
//        guard self.isUserVerifiedPhone() else {
//          // lets the front end know the logged in user hasn't verified their phone
//          DispatchQueue.main.async {
//            callback(UserError.UserUnverifiedPhone)
//          }
//          return
//        }

        callback(self.loggedInUser)
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  /*
   * loggedInUser is private, thus a user cannot modify it unless the user has logged
   * in properly. Therefore, this function should be used to check if there is a valid
   * user logged in
   */
  public func isUserLoggedIn() -> Bool {
    return loggedInUser != nil
  }

  public func getLoggedInUser() -> User? {
    return loggedInUser
  }

  public func isUserVerifiedEmail() -> Bool {
    guard isUserLoggedIn() else { return false; }
    return false; // TEMP as we dont have verified field
  }

  public func isUserVerifiedPhone() -> Bool {
    guard isUserLoggedIn() else { return false; }
    return false; // TEMP as we dont have verified field
  }

  public func isUserFullyVerified() -> Error? {
    guard isUserLoggedIn()      else { return UserError.UserNotLoggedIn }
    guard isUserVerifiedEmail() else { return UserError.UserUnverifiedEmail }
    guard isUserVerifiedPhone() else { return UserError.UserUnverifiedPhone }
    return nil
  }

  public func update(user: User, callback: @escaping (Any?) -> Void) {
    guard isUserLoggedIn() else {
      callback(UserError.UserNotLoggedIn)
      return
    }
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        guard let updatedUser = (try self.dao.put(user)) as? User else {
          DispatchQueue.main.async {
            callback(ServiceError.Failed)
          }
          return
        }
        DispatchQueue.main.async {
          callback(updatedUser)
        }
      } catch let e {
        NSLog(((e as? FoamError)?.toString()) ?? "Error!")
        DispatchQueue.main.async {
          callback(ServiceError.Failed)
        }
      }
    }
  }

  public func get(userWithId id: Int, callback: @escaping (Any?) -> Void) {

  }

  public func get(userWithEmail email: String, callback: @escaping (Any?) -> Void) {

  }

  public func logout() {
    self.loggedInUser = nil
  }
}
