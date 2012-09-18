/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2006-2011 Worklight, Ltd.
 */

package com.phonegap.plugins.adMob;

import org.json.JSONArray;
import org.json.JSONException;
import android.os.Handler;
import com.google.ads.*;
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
	
	private AdView adView;
	
	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		PluginResult result = null;
		
		if(CREATE_BANNER.equals("createBanner")) {
			result = this.createBanner(data);
		}
		else if(LOAD_BANNER.equals("loadBanner")) {
			result = this.loadBanner(data); 
		}
		else if(MOVE_BANNER.equals("moveBanner")) {
			result = this.moveBanner(data);
		}
		else if(DELETE_BANNER.equals("deleteBanner")) { 
			result = this.deleteBanner(data);
		}
		else {
			result = new PluginResult(Status.INVALID_ACTION);			
		}
		return result;
	}

	private PluginResult createBanner(JSONArray data) {
		//set publisher id as adUnitId
		//initialize banner
		String publisherId = null;	
		try {
			publisherId = data.getString(0);
		} catch (JSONException e) {
			return new PluginResult(Status.JSON_EXCEPTION);
		}

		Activity act = ((Activity)this.ctx.getContext());
		adView = new AdView(act, AdSize.BANNER, publisherId);
		//adView.setAdListener(this);
		LinearLayout layout = (LinearLayout)act.findViewById(R.id.mainLayout);           
        layout.addView((adView));         
        layout.setHorizontalGravity(android.view.Gravity.CENTER_HORIZONTAL);        
        AdRequest request = new AdRequest();   
        adView.loadAd(request);            

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
		return new PluginResult(Status.OK);
	}
}