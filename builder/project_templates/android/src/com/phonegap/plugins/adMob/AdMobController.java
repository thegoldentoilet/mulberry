/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2006-2011 Worklight, Ltd.
 */

package com.phonegap.plugins.adMob;

import android.util.Log;
import org.json.JSONArray;
import org.json.JSONException;
import android.os.Handler;
import com.google.ads.Ad;
import com.google.ads.AdListener;
import com.google.ads.AdRequest;
import com.google.ads.AdSize;
import com.google.ads.AdView;
import android.app.Activity;
import android.widget.LinearLayout;
import com.toura.app2_fake.R;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;

public class AdMobController extends Plugin {
	
	public static final String CREATE_BANNER = "createBanner";
	public static final String LOAD_BANNER = "loadBanner";
	public static final String MOVE_BANNER = "moveBanner";
	public static final String DELETE_BANNER = "deleteBanner";
	public String publisherId = "";
	private AdView adView;
	
	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		Log.w("AdMob", "AdMob plugin executed");

		PluginResult result = null;
		
		if(CREATE_BANNER.equals(action)) {
			Log.w("AdMob", "action = createbanner");
			result = this.createBanner(data);
		}
		else if(LOAD_BANNER.equals(action)) {
			Log.w("AdMob", "action = loadbanner");
			result = this.loadBanner(data); 
		}
		else if(MOVE_BANNER.equals(action)) {
			Log.w("AdMob", "action = move");
			result = this.moveBanner(data);
		}
		else if(DELETE_BANNER.equals(action)) { 
			Log.w("AdMob", "action = delete");
			result = this.deleteBanner(data);
		}
		else {
			result = new PluginResult(Status.INVALID_ACTION);			
		}
		return result;
	}

	private PluginResult createBanner(JSONArray data) {
		Log.w("AdMob", "In createBanner");
		//set publisher id as adUnitId
		//initialize banner
		//final String publisherId = null;	
		try {
			publisherId = data.getString(0);
			Log.w("AdMob", "publisher id = "+publisherId);
		} catch (JSONException e) {
			return new PluginResult(Status.JSON_EXCEPTION);
		}

		final Activity act = ((Activity)this.ctx.getContext());
		Log.w("AdMob", "after getting activity "+ act.toString());
		try {
			act.runOnUiThread( new Runnable() {
				@Override
				public void run() {
					adView = new AdView(act, AdSize.BANNER, publisherId);
					Log.w("AdMob", "after creating adView");
					//adView.setAdListener(this);
					LinearLayout layout = (LinearLayout)act.findViewById(R.id.mainLayout);    //this is ending up null
					Log.w("AdMob", "after layout is created: "+R.id.mainLayout);       
			        layout.addView(adView);    
			        Log.w("AdMob", "after adview is added to layout");     
			        layout.setHorizontalGravity(android.view.Gravity.CENTER_HORIZONTAL);  
			        Log.w("AdMob", "after horz is set");      
			        AdRequest request = new AdRequest();  
			        Log.w("AdMob", "after new adrequest");
			        request.addTestDevice("20F3A378D7A6");			       
			        Log.w("AdMob", "after testdevice is added");
			        adView.loadAd(request);            
					Log.w("AdMob", "after loadAd()");
				}
			});		       
		} catch (Throwable t) {
			Log.w("AdMob", "Inside of catch ERROROROROROROOROROR");
			t.printStackTrace();
		}	
		 return new PluginResult(Status.OK);	
	}

	private PluginResult loadBanner (JSONArray data) {
		//if banner doesn't exist, call createBanner()
		//create request, set testing mode to true
		return new PluginResult(Status.OK);
	}

	private PluginResult moveBanner (JSONArray data) {
		//if banner doesn't exist, call createBanner()
		//animate move of banner
		return new PluginResult(Status.OK);
	}

	private PluginResult deleteBanner (JSONArray data) {
		//remove banner from view
		if(adView != null) {
			Log.w("admob", "in deleteBanner destroying ad");
			adView.destroy();
		}
		return new PluginResult(Status.OK);
	}
}