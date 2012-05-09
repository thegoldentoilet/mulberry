//
//  TouraAppDelegate.h
//  Toura
//
//  Created by Gregory Jastrab on 1/5/11.
//  Copyright Toura, LLC. 2011. All rights reserved.
//

#import <UIKit/UIKit.h>

#ifdef CORDOVA_FRAMEWORK
  #import <Cordova/CDVViewController.h>
#else
  #import "CDVViewController.h"
#endif

@interface TouraAppDelegate : NSObject < UIApplicationDelegate > {
}

// invoke string is passed to your app on launch, this is only valid if you
// edit Toura-Info.plist to add a protocol
// a simple tutorial can be found here :
// http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html

@property (nonatomic, retain) IBOutlet UIWindow* window;
@property (nonatomic, retain) IBOutlet CDVViewController* viewController;

@end

