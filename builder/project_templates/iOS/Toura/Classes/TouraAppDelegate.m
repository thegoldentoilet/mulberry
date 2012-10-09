//
//  TouraAppDelegate.m
//  Toura
//
//  Created by Gregory Jastrab on 1/5/11.
//  Copyright Toura, LLC. 2011. All rights reserved.
//
#include <sys/xattr.h>

#import "TouraAppDelegate.h"

#import "MainViewController.h"

#ifdef CORDOVA_FRAMEWORK
#import <Cordova/CDVPlugin.h>
#import <Cordova/CDVURLProtocol.h>
#else
#import "CDVPlugin.h"
#import "CDVURLProtocol.h"
#endif

#import "PushNotification.h"

@interface TouraAppDelegate()

- (id)readPlist:(NSString *)fileName;

@end

@implementation TouraAppDelegate

@synthesize window, viewController;

- (id) init
{
    /** If you need to do any extra app-specific initialization, you can do it here
     *  -jm
     **/
    NSHTTPCookieStorage *cookieStorage = [NSHTTPCookieStorage sharedHTTPCookieStorage];
    [cookieStorage setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];

    [CDVURLProtocol registerURLProtocol];

    return [super init];
}

#pragma UIApplicationDelegate implementation

- (BOOL)addSkipBackupAttributeToItemAtURL:(NSURL *)URL
{
    NSLog(@"file path: %@", URL);
    if(![[NSFileManager defaultManager] fileExistsAtPath: [URL path]]) {
        //need to create directory
        NSString* backupPath = [[self applicationDocumentsDirectory] stringByAppendingPathComponent:@"Backups/websqldbs.appdata.db"]; 
        [[NSFileManager defaultManager] createDirectoryAtPath:backupPath attributes:nil];
    }
        const char* filePath = [[URL path] fileSystemRepresentation];
        const char* attrName = "com.apple.MobileBackup";
        u_int8_t attrValue = 1;

        if (SYSTEM_VERSION_LESS_THAN(@"5.1")) {
            NSLog(@"< 5.1");
                    
            int result = setxattr(filePath, attrName, &attrValue, sizeof(attrValue), 0, 0);
            return result == 0;
        } else {
            NSLog(@"5.1 or greater");
            int result = getxattr(filePath, attrName, NULL, sizeof(u_int8_t), 0, 0);
            if (result != -1) {
                // The attribute exists, we need to remove it
                int removeResult = removexattr(filePath, attrName, 0);
                if (removeResult == 0) {
                    NSLog(@"Removed extended attribute on file %@", URL);
                }
            }

            NSError *error = nil;
            BOOL success = [URL setResourceValue: [NSNumber numberWithBool: YES] forKey: NSURLIsExcludedFromBackupKey error: &error];
            
            if(!success){
                NSLog(@"Error excluding %@ from backup %@", [URL lastPathComponent], error);
            }
            
            return success;
        }
    
    return 0;
}

- (NSString *)applicationDocumentsDirectory {
    return [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) lastObject];
}

/**
 * This is main kick off after the app inits, the views and Settings are setup here. (preferred - iOS4 and up)
 */
- (BOOL) application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
{

    NSString* dbPath = [[self applicationDocumentsDirectory] stringByAppendingPathComponent:@"Backups/websqldbs.appdata.db"]; 
    NSURL* dbUrl = [NSURL fileURLWithPath:dbPath];
    [self addSkipBackupAttributeToItemAtURL:dbUrl];
    
    
    application.applicationIconBadgeNumber = 0;

    NSURL* url = [launchOptions objectForKey:UIApplicationLaunchOptionsURLKey];
    NSString* invokeString = nil;

    if (url && [url isKindOfClass:[NSURL class]]) {
        invokeString = [url absoluteString];
        NSLog(@"Toura launchOptions = %@", url);
    }

    CGRect screenBounds = [[UIScreen mainScreen] bounds];
    self.window = [[[UIWindow alloc] initWithFrame:screenBounds] autorelease];
    self.window.autoresizesSubviews = YES;

    CGRect viewBounds = [[UIScreen mainScreen] applicationFrame];

    self.viewController = [[[MainViewController alloc] init] autorelease];
    self.viewController.useSplashScreen = YES;
    self.viewController.wwwFolderName = @"www";
    self.viewController.startPage = @"index.html";
    self.viewController.invokeString = invokeString;
    self.viewController.view.frame = viewBounds;
    // cache notification, if any, until webview finished loading, then process it if needed
    // assume will not receive another message before webview loaded
    ((MainViewController*)self.viewController).launchNotification = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];

    // check whether the current orientation is supported: if it is, keep it, rather than forcing a rotation
    BOOL forceStartupRotation = YES;
    UIDeviceOrientation curDevOrientation = [[UIDevice currentDevice] orientation];

    if (UIDeviceOrientationUnknown == curDevOrientation) {
        // UIDevice isn't firing orientation notifications yet… go look at the status bar
        curDevOrientation = (UIDeviceOrientation)[[UIApplication sharedApplication] statusBarOrientation];
    }

    if (UIDeviceOrientationIsValidInterfaceOrientation(curDevOrientation)) {
        for (NSNumber *orient in self.viewController.supportedOrientations) {
            if ([orient intValue] == curDevOrientation) {
                forceStartupRotation = NO;
                break;
            }
        }
    }

    if (forceStartupRotation) {
        NSLog(@"supportedOrientations: %@", self.viewController.supportedOrientations);
        // The first item in the supportedOrientations array is the start orientation (guaranteed to be at least Portrait)
        UIInterfaceOrientation newOrient = [[self.viewController.supportedOrientations objectAtIndex:0] intValue];
        NSLog(@"AppDelegate forcing status bar to: %d from: %d", newOrient, curDevOrientation);
        [[UIApplication sharedApplication] setStatusBarOrientation:newOrient];
    }

    [self.window addSubview:self.viewController.view];
    [self.window makeKeyAndVisible];

    return YES;
}

// this happens while we are running ( in the background, or from within our own app )
// only valid if Toura-Info.plist specifies a protocol to handle
- (BOOL) application:(UIApplication*)application handleOpenURL:(NSURL*)url
{
    if (!url) {
        return NO;
    }

    // calls into javascript global function 'handleOpenURL'
    NSString* jsString = [NSString stringWithFormat:@"handleOpenURL(\"%@\");", url];
    [self.viewController.webView stringByEvaluatingJavaScriptFromString:jsString];

    // all plugins will get the notification, and their handlers will be called
    [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:CDVPluginHandleOpenURLNotification object:url]];

    return YES;
}

- (void) dealloc
{
    [super dealloc];
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    PushNotification *pushHandler = [self.viewController.commandDelegate getCommandInstance:@"PushNotification"];
    NSDictionary *touraProps = [self readPlist:@"UrbanAirship"];
    NSString *uaHost = [touraProps valueForKey:@"UrbanAirshipHost"];
    NSString *uaKey = [touraProps valueForKey:@"UrbanAirshipKey"];
    NSString *uaSecret = [touraProps valueForKey:@"UrbanAirshipSecret"];
    [pushHandler didRegisterForRemoteNotificationsWithDeviceToken:deviceToken host:uaHost appKey:uaKey appSecret:uaSecret];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
    PushNotification *pushHandler = [self.viewController.commandDelegate getCommandInstance:@"PushNotification"];
    [pushHandler didFailToRegisterForRemoteNotificationsWithError:error];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo {
    NSLog(@"didReceiveNotification");

    // Get application state for iOS4.x+ devices, otherwise assume active
    UIApplicationState appState = UIApplicationStateActive;
    if ([application respondsToSelector:@selector(applicationState)]) {
        appState = application.applicationState;
    }

    // NOTE this is a 4.x only block -- TODO: add 3.x compatibility
    if (appState == UIApplicationStateActive) {
        PushNotification *pushHandler = [self.viewController.commandDelegate getCommandInstance:@"PushNotification"];
        pushHandler.notificationMessage = [userInfo objectForKey:@"aps"];
        [pushHandler notificationReceived];
    } else {
        //save it for later
        ((MainViewController*)self.viewController).launchNotification = userInfo;
    }
}

- (void)applicationDidBecomeActive:(UIApplication *)application {

    NSLog(@"active");

    //zero badge
    application.applicationIconBadgeNumber = 0;

    MainViewController* mainViewController = (MainViewController*) self.viewController;
    if (![self.viewController.webView isLoading] && mainViewController.launchNotification) {
        PushNotification *pushHandler = [self.viewController.commandDelegate getCommandInstance:@"PushNotification"];
        pushHandler.notificationMessage = [mainViewController.launchNotification objectForKey:@"aps"];

        mainViewController.launchNotification = nil;

        [pushHandler performSelectorOnMainThread:@selector(notificationReceived) withObject:pushHandler waitUntilDone:NO];
    }
}

- (id)readPlist:(NSString *)fileName {
    NSData *plistData;
    NSString *error;
    NSPropertyListFormat format;
    id plist;

    NSString *localizedPath = [[NSBundle mainBundle] pathForResource:fileName ofType:@"plist"];
    plistData = [NSData dataWithContentsOfFile:localizedPath];

    plist = [NSPropertyListSerialization propertyListFromData:plistData mutabilityOption:NSPropertyListImmutable format:&format errorDescription:&error];
    if (!plist) {
        NSLog(@"Error reading plist from file '%s', error = '%s'", [localizedPath UTF8String], [error UTF8String]);
        [error release];
    }

    return plist;
}



@end
