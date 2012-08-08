/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2006-2011 Worklight, Ltd.
 */

package com.phonegap.plugins.adMob;

import org.json.JSONArray;
import org.json.JSONException;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.apache.cordova.api.PluginResult.Status;

public class AdMobController extends Plugin {
	public static final String CREATE_BANNER = "createBanner";
	public static final String LOAD_BANNER = "loadBanner";
	public static final String MOVE_BANNER = "moveBanner";
	public static final String DELETE_BANNER = "deleteBanner";
	public static final String SET_LOCATION = "setLocation";
	public static final String CREATE_RECTANGLE = "createRectangle";
	public static final String CREATE_REQUEST = "createRequest";

	
	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
		PluginResult result = null;
		ValueEnum actionEnum = ValueEnum.fromString(action);
		switch(actionEnum) {
			case CREATE_BANNER: result = createBanner(); break;
			case LOAD_BANNER: result = loadBanner(); break;
			case MOVE_BANNER: result = moveBanner(); break;
			case DELETE_BANNER: result = deleteBanner(); break;
			case SET_LOCATION: result = setLocation(); break;
			case CREATE_RECTANGLE: result = createRectangle(); break;
			case CREATE_REQUEST: result = createRequest(); break;
			default: PluginResult.Status.INVALID_ACTION; break;
		}
		return result;
	}

	private void createBanner(String accountId) {
		//set publisher id as adUnitId
		//initialize banner
	}

	private void loadBanner (String key) {
		//if banner doesn't exist, call createBanner()
		//create request, set testing mode to true
	}

	private void moveBanner (String key) {
		//if banner doesn't exist, call createBanner()
		//animate move of banner
	}

	private void deleteBanner (String key) {
		//remove banner from view
		
	}

	private void setLocation (String key) {
		//to make use of the client location api, not sure if we will use this
		
	}

	private void createRectangle (String key) {
		//determines size of banner ad
		
	}

	private void createRequest (String key) {
		//honestly not really sure how this is used yet.
		
	}
}