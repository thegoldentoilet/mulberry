/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2006-2011 Worklight, Ltd.
 */

package com.phonegap.plugins.adMob;

import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;
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
import com.toura.app2_fake.TouraMainActivity;
import android.view.View;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;

public class AdMobController extends Plugin implements PropertyChangeListener{
	
	public static final String CREATE_BANNER = "createBanner";
	public static final String LOAD_BANNER = "loadBanner";
	public static final String MOVE_BANNER = "moveBanner";
	public static final String DELETE_BANNER = "deleteBanner";
	public String publisherId;
	public String deviceType;
	private AdView adView;
	private TouraMainActivity activity;
	private LinearLayout layout;
	
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
			result = this.deleteBanner();
		}
		else {
			result = new PluginResult(Status.INVALID_ACTION);			
		}
		return result;
	}

	private PluginResult createBanner(JSONArray data) {
		final AdSize size;
		final String orientation;
		
		activity = ((TouraMainActivity)this.ctx.getContext());
		activity.addPropertyChangeListener(this);
		layout = activity.getLayout();
		try {
			publisherId = data.getString(0);
			deviceType = data.getString(1);
			orientation = activity.getOrientation();
			
			if(orientation.equals("landscape")) { //create new banner in landscape mode
				if(deviceType.equals("tablet")) {				
					size = AdSize.IAB_LEADERBOARD;
				} else {
					size = AdSize.IAB_BANNER;
				}
			} else { //portrait
				//create new banner in portrait mode
				if(deviceType.equals("tablet")) {
					size = AdSize.IAB_BANNER;
				} else {
					size = AdSize.BANNER;
				}
			}			
		} catch (JSONException e) {
			return new PluginResult(Status.JSON_EXCEPTION);
		}	
		
		try {
			activity.runOnUiThread( new Runnable() {
				@Override
				public void run() {
					
					if(adView != null) {
						deleteBanner();
					}
					adView = new AdView(activity, size, publisherId);
					//adView.setAdListener(this);					
			        layout.addView(adView);
			        layout.setHorizontalGravity(android.view.Gravity.CENTER_HORIZONTAL);
			        AdRequest request = new AdRequest();			      
			        adView.loadAd(request);
				}
			});		       
		} catch (Throwable t) {			
			t.printStackTrace();
		}	
		return new PluginResult(Status.OK);	
	}

	private PluginResult loadBanner (JSONArray data) {
		return createBanner(data);
	}

	private PluginResult moveBanner (JSONArray data) {
		//shouldn't be needed in Android
		return new PluginResult(Status.OK);
	}

	private PluginResult deleteBanner () {
		//remove banner from view
		if(adView != null) {
		Log.w("AdMob", "in admob deletebanner");			
			try {
				activity.removePropertyChangeListener(this);				
				activity.runOnUiThread( new Runnable() {
					@Override
					public void run() {	
						adView.setVisibility(View.GONE);					
						layout.removeView(adView);
						layout.refreshDrawableState();
						adView.destroy();
						adView = null;
					}
				});				
			} catch(Throwable t) {
				t.printStackTrace();
			}
		}
		return new PluginResult(Status.OK);
	}

	public void propertyChange(PropertyChangeEvent evt) {
		String propName = evt.getPropertyName();
		JSONArray data;
		if( propName.equalsIgnoreCase(activity.PROP_ORIENTATION) ) {
			String oldOrientation = (String)evt.getOldValue();
			String newOrientation = (String)evt.getNewValue();
			data = new JSONArray();
			data.put(publisherId);
			data.put(deviceType);
			data.put(newOrientation);			
			deleteBanner();
			createBanner(data);
		}
	}
}