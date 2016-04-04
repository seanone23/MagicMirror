/* global Module */

/* Magic Mirror
 * Module: alert
 *
 * By Paul-Vincent Roll http://paulvincentroll.com
 * MIT Licensed.
 */

Module.register("alert",{
	defaults: {
		// scale|slide|genie|jelly|flip|bouncyflip|exploader
		effect: "slide",
		// scale|slide|genie|jelly|flip|bouncyflip|exploader
		alertEffect: "jelly",
		//time a notification is displayed in seconds
		displayTime: 3500,
		//Position
		position: "center",
		//shown at startup
		welcomeMessage: "Welcome, start was successfull!"
	},
	getScripts: function() {
		return ["classie.js", "modernizr.custom.js", "notificationFx.js"];
	},
	getStyles: function() {
		return ["ns-default.css"];
	},
	showNotification: function(message) {
		message = "<span class=\"thin\" style=\"line-height: 35px; font-size:24px\" color=\"#4A4A4A\">" + message.title + "</span><br /><span class=\"light\" style=\"font-size:28px;line-height: 30px;\">" + message.message + "</span>";
		new NotificationFx({
			message: message,
			layout: "growl",
			effect: this.config.effect,
			ttl: this.config.displayTime
		}).show();
	},
	showAlert: function(params, sender) {
		var self = this;
		//Set standard params if not provided by module
		if (typeof params.timer === "undefined") { params.timer = null; }
		if (typeof params.imageHeight === "undefined") { params.imageHeight = "80px"; }
		if (typeof params.imageUrl === "undefined") {
			params.imageUrl = null;
			image = "";
		} else {
			image = "<img src=\"" + params.imageUrl + "\" height=" + params.imageHeight + " style=\"margin-bottom: 10px;\"/><br />";
		}
		//Create overlay
		var overlay = document.createElement("div");
		overlay.id = "overlay";
		overlay.innerHTML += "<div class=\"black_overlay\"></div>";
		document.body.insertBefore(overlay, document.body.firstChild);

		//If module already has an open alert close it
		if (this.alerts[sender.name]) {
			this.hideAlert(sender);
		}

		message = "<span class=\"light\" style=\"line-height: 35px; font-size:30px\" color=\"#4A4A4A\">" + params.title + "</span><br /><span class=\"thin\" style=\"font-size:22px;line-height: 30px;\">" + params.message + "</span>";
		//Store alert in this.alerts
		this.alerts[sender.name] = new NotificationFx({
			message: image + message,
			effect: this.config.alertEffect,
			ttl: params.timer,
			/* jscs:disable */
			al_no: "ns-alert"
			/* jscs:enable */
		});
		//Show alert
		this.alerts[sender.name].show();
		//Add timer to dismiss alert and overlay
		if (params.timer) {
			setTimeout(function() {
				self.hideAlert(sender);
			}, params.timer);
		}

	},
	hideAlert: function(sender) {
		//Dismiss alert and remove from this.alerts
		this.alerts[sender.name].dismiss();
		this.alerts[sender.name] = null;
		//Remove overlay
		var overlay = document.getElementById("overlay");
		overlay.parentNode.removeChild(overlay);
	},
	setPosition: function(pos) {
		//Add css to body depending on the set position for notifications
		var sheet = document.createElement("style");
		if (pos == "center") {sheet.innerHTML = ".ns-box {margin-left: auto; margin-right: auto;text-align: center;}";}
		if (pos == "right") {sheet.innerHTML = ".ns-box {margin-left: auto;text-align: right;}";}
		if (pos == "left") {sheet.innerHTML = ".ns-box {margin-right: auto;text-align: left;}";}
		document.body.appendChild(sheet);

	},
	notificationReceived: function(notification, payload, sender) {
		if (notification === "SHOW_ALERT") {
			if (typeof payload.type === "undefined") {
				payload.type = "alert";
			}
			if (payload.type == "alert") {
				this.showAlert(payload, sender);
			} else if (payload.type = "notification") {
				this.showNotification(payload);
			}
		} else if (notification === "HIDE_ALERT") {
			this.hideAlert(sender);
		}
	},
	start: function() {
		this.alerts = {};
		this.setPosition(this.config.position);
		if (this.config.welcomeMessage) {
			this.showNotification({title: "MagicMirror Notification", message: this.config.welcomeMessage});
		}
		Log.info("Starting module: " + this.name);
	}
});