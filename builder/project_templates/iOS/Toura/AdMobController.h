//
//  AdMobController.h
//
//  Created by Robert Wallstrom on 11/28/11.
//  Copyright (c) 2011 Smithimage. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "GADBannerViewDelegate.h"
#import <Foundation/Foundation.h>
#ifdef PHONEGAP_FRAMEWORK
#import <Cordova/CDVPlugin.h>
#else
#import "Cordova/CDVPlugin.h"
#endif

@class GADRequest;

@interface AdMobController : CDVPlugin
<GADBannerViewDelegate> {
    GADBannerView *adBanner_;
}

@property(nonatomic, retain) GADBannerView *adBanner;
@property (nonatomic, copy) NSString *siteId;

- (GADRequest *)createRequest;

- (void) createBanner:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) loadBanner:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) moveBanner:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (void) deleteBanner:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;
- (CGRect) createRectangle: (NSMutableDictionary*) options;
- (void) setLocation:(GADRequest**) request withDict: (NSMutableDictionary*) options;


@end
