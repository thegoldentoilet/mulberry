/*
 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing,
 software distributed under the License is distributed on an
 "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 KIND, either express or implied.  See the License for the
 specific language governing permissions and limitations
 under the License.
 */

//
//  MainViewController.h
//  Toura
//
//  Created by Daniel Kim on 4/25/12.
//  Copyright __MyCompanyName__ 2012. All rights reserved.
//

#import "MainViewController.h"

#import "PushNotification.h"

@implementation MainViewController

@synthesize launchNotification;


- (BOOL)doesRequest:(NSURLRequest *)request comeFromWebView:(UIWebView *)webView
{
    // sees if the mainDocumentURL of the request matches that of the webView
    // if not, is probably from an iFrame
    return ([[request.mainDocumentURL absoluteString]
             compare:[webView.request.mainDocumentURL absoluteString]]
            == 0);
}


- (id) initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void) didReceiveMemoryWarning
{
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

#pragma mark - View lifecycle

- (void) viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view from its nib.
}

- (void) viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (BOOL) shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    // Return YES for supported orientations
    return [super shouldAutorotateToInterfaceOrientation:interfaceOrientation];
}

/* Comment out the block below to over-ride */
/*
 #pragma CDVCommandDelegate implementation
 
 - (id) getCommandInstance:(NSString*)className
 {
 return [super getCommandInstance:className];
 }
 
 - (BOOL) execute:(CDVInvokedUrlCommand*)command
 {
 return [super execute:command];
 }
 
 - (NSString*) pathForResource:(NSString*)resourcepath;
 {
 return [super pathForResource:resourcepath];
 }
 
 - (void) registerPlugin:(CDVPlugin*)plugin withClassName:(NSString*)className
 {
 return [super registerPlugin:plugin withClassName:className];
 }
 */

#pragma UIWebDelegate implementation


- (void) webViewDidFinishLoad:(UIWebView*) theWebView 
{
    
    // only valid if ___PROJECTNAME__-Info.plist specifies a protocol to handle
    if (self.invokeString)
    {
        // this is passed before the deviceready event is fired, so you can access it in js when you receive deviceready
        NSString* jsString = [NSString stringWithFormat:@"var invokeString = \"%@\";", self.invokeString];
        [theWebView stringByEvaluatingJavaScriptFromString:jsString];
    }
    
    // Disable phone number detection
    [theWebView setDataDetectorTypes: UIDataDetectorTypeLink & UIDataDetectorTypeAddress];
    
    //Now that the web view has loaded, pass on the notfication
    if (self.launchNotification) {
        PushNotification *pushHandler = [self getCommandInstance:@"PushNotification"];
        
        //NOTE: this drops payloads outside of the "aps" key
        pushHandler.notificationMessage = [launchNotification objectForKey:@"aps"];
        
        //clear the launchNotification
        self.launchNotification = nil;
    }
    
    
    // Black base color for background matches the native apps
    theWebView.backgroundColor = [UIColor blackColor];
    
	return [super webViewDidFinishLoad:theWebView];
    
}

/* Comment out the block below to over-ride */
/*
 
 - (void) webViewDidStartLoad:(UIWebView*)theWebView 
 {
 return [super webViewDidStartLoad:theWebView];
 }
 
 - (void) webView:(UIWebView*)theWebView didFailLoadWithError:(NSError*)error 
 {
 return [super webView:theWebView didFailLoadWithError:error];
 }
 
 - (BOOL) webView:(UIWebView*)theWebView shouldStartLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
 {
 return [super webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType];
 }
 */


/**
 * Overriding in __App__Delegate.m
 * if this is viable, find a nicer API and merge into PhoneGap/Callback/Cordova edge
 *
 * programmatic iframe creations open in main webview
 * user interactions open in Safari
 */

- (BOOL)webView:(UIWebView *)theWebView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType
{
    BOOL superValue = [ super webView:theWebView shouldStartLoadWithRequest:request navigationType:navigationType ];
    BOOL inIframe = ![self doesRequest:request comeFromWebView:theWebView];
    BOOL fromUserInteraction = (navigationType == UIWebViewNavigationTypeLinkClicked || navigationType == UIWebViewNavigationTypeFormSubmitted);
    
    NSURL *url = [request URL];
    
    NSLog(@"url is %@", url);
    NSLog(@"inIframe is %@", (inIframe ? @"true" : @"false"));
    NSLog(@"request.mainDocumentURL = %@", [request.mainDocumentURL absoluteString]);
    NSLog(@"webview.request.mainDocumentURL = %@", [theWebView.request.mainDocumentURL absoluteString]);
    
    // if in iframe and has user interaction
    if (inIframe && fromUserInteraction) {
        [[UIApplication sharedApplication] openURL:url];
        return NO;
    }
    
    // otherwise, fall back to super
    return superValue;
}

- (void)dealloc
{
    launchNotification = nil;
    [super dealloc];
}

@end
