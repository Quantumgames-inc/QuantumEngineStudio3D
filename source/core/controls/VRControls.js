"use strict";

/**
 * VRControl is used to get input from an HDM device.
 * 
 * An object can be attached to the VRControls object to be automatically updated with the HDM Movement.
 *
 * @class VRControls
 * @constructor
 * @module VirtualReality
 * @author mrdoob (http://mrdoob.com)
 * @author dmarcos (https://github.com/dmarcos)
 * @param {Object3D} object  Object to be attached.
 * @param {Function} onError onError callback.
 */
function VRControls(object, onError)
{
	this.vrInput = null;
	this.scale = 1; //Scale from real units to world units
	this.standing = false;
	this.userHeight = 1.7; //Meters
	this.object = null;

	if(object !== undefined)
	{
		this.object = object;
	}

	//Position and rotation matrix
	this.position = new THREE.Vector3();
	this.quaternion = new THREE.Quaternion();

	//Self pointer
	var self = this;

	//Get VR Display devices
	if(navigator.getVRDisplays !== undefined)
	{
		navigator.getVRDisplays().then(gotVRDevices);
	}

	//Return VR display devices
	function gotVRDevices(devices)
	{
		//Get first VRDisplay found
		for(var i = 0; i < devices.length; i ++)
		{
			if(("VRDisplay" in window && devices[i] instanceof VRDisplay) || ("PositionSensorVRDevice" in window && devices[i] instanceof PositionSensorVRDevice))
			{
				self.vrInput = devices[i];
				break;
			}
		}

		//If no display found call onError
		if(!self.vrInput)
		{
			if(onError)
			{
				onError("VR input not available");
			}
		}
	}
}

/**
 * Update VRControls object state.
 * 
 * @method update
 */
VRControls.prototype.update = function()
{
	if(this.vrInput !== null)
	{
		var pose = this.vrInput.getPose();

		//Orientation
		if(pose.orientation !== null)
		{
			this.quaternion.fromArray(pose.orientation);
		}

		//Position
		if(pose.position !== null)
		{
			this.position.fromArray(pose.position);
		}
		else
		{
			this.position.set(0, 0, 0);
		}

		//If standing mode enabled
		if(this.standing)
		{
			this.position.y += this.userHeight;
		}

		//Scale
		this.position.multiplyScalar(this.scale);

		if(this.object !== null)
		{
			this.object.position.copy(this.position);
			this.object.quaternion.copy(this.quaternion);
		}
	}
};

/**
 * Dispose object.
 * 
 * @method dispose
 */
VRControls.prototype.dispose = function()
{
	this.vrInput = null;
};

/**
 * Reset the HDM pose.
 * 
 * @method resetPose
 */
VRControls.prototype.resetPose = function()
{
	if(this.vrInput !== null)
	{
		this.vrInput.resetPose();
	}
};

/**
 * Attach an object to the VRControls.
 *
 * @method attachObject
 * @param {Object3D} Object to be attached.
 */
VRControls.prototype.attachObject = function(object)
{
	this.object = object;
};
