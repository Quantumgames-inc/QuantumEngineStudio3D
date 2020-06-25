import {Texture} from "../../texture/Texture.js";
import {CubeTexture} from "../../texture/CubeTexture.js";
import {Scene} from "../Scene.js";
import {Program} from "../Program.js";
import {Object3D, PerspectiveCamera, Vector3, WebGLCubeRenderTarget, RGBFormat, LinearFilter, CubeCamera as TCubeCamera} from "three";

/**
 * Reflection probes are used to create CubeTextures dinamically.
 *
 * These CubeTextures can be attributed to materials programatically.
 * 
 * @class CubeCamera
 * @extends {Object3D}
 * @module Misc
 */
function CubeCamera(near, far, resolution, autoUpdate)
{
	Object3D.call(this);

	this.name = "cubecamera";
	this.type = "CubeCamera";

	/**
	 * CubeCamera near plane.
	 * @property near
	 * @type {number}
	 */
	this.near = (near !== undefined) ? near : 1e-2;

	/**
	 * CubeCamera far plane.
	 * @property far
	 * @type {number}
	 */
	this.far = (far !== undefined) ? far : 1e4;

	/**
	 * Resolution of each face. Should be a power of 2 (32, 64, 128, ...).
	 * @property resolution
	 * @type {number}
	 */
	this.resolution = (resolution !== undefined) ? resolution : 256;

	/**
	 * Auto update indicates if the cube camera is updated automatically each frame.
	 * 
	 * @property autoUpdate
	 * @type {boolean}
	 */
	this.autoUpdate = (autoUpdate !== undefined) ? autoUpdate : false;

	/**
	 * Array of 6 cameras used to render each face of the cube.
	 * @property cameras
	 * @type {Array}
	 */
	this.cameras = [];
	for(var i = 0; i < 6; i++)
	{
		var camera = new PerspectiveCamera(90, 1, this.near, this.far);
		camera.parent = this;
		this.cameras.push(camera);
	}

	this.cameras[0].up.set(0, -1, 0);
	this.cameras[0].lookAt(new Vector3(1, 0, 0));
	this.cameras[1].up.set(0, -1, 0);
	this.cameras[1].lookAt(new Vector3(-1, 0, 0));
	this.cameras[2].up.set(0, 0, 1);
	this.cameras[2].lookAt(new Vector3(0, 1, 0));
	this.cameras[3].up.set(0, 0, -1);
	this.cameras[3].lookAt(new Vector3(0, -1, 0));
	this.cameras[4].up.set(0, -1, 0);
	this.cameras[4].lookAt(new Vector3(0, 0, 1));
	this.cameras[5].up.set(0, -1, 0);
	this.cameras[5].lookAt(new Vector3(0, 0, -1));

	/**
	 * WebGL cube render target to where the scene is rendered.
	 * @property target
	 * @type {WebGLCubeRenderTarget}
	 */
	this.renderTarget = new WebGLCubeRenderTarget(this.resolution,
	{
		format: RGBFormat,
		magFilter: LinearFilter,
		minFilter: LinearFilter,
		generateMipmaps: false
	});


	var self = this;
	Object.defineProperties(this,
	{
		/**
		 * CubeTexture generated by this CubeCamera.
		 *
		 * Can be attached to materials as envMap.
		 * 
		 * @property cube
		 * @type {CubeTexture}
		 */
		cube:
		{
			get: function(){return self.renderTarget.texture;},
			set: function(value){}
		}
	});

	this.scene = null;
	this.renderer = null;
}

TCubeCamera = CubeCamera;
CubeCamera = CubeCamera;

CubeCamera.prototype = Object.create(Object3D.prototype);

/**
 * Initialize CubeCamera object.
 * 
 * Gets the attached scene and the renderer in use.
 *
 * @method initialize
 */
CubeCamera.prototype.initialize = function()
{
	var node = this;
	while(node.parent !== null)
	{
		node = node.parent;
		if(node instanceof Scene)
		{
			this.scene = node;
		}
		else if(node instanceof Program)
		{
			this.renderer = node.renderer;
		}
	}

	Object3D.prototype.initialize.call(this);
};


/**
 * Update CubeCamera object.
 *
 * If autoUpdate is set to true the CubeCamera updates the CubeTexture automatically.
 * 
 * @method update
 */
CubeCamera.prototype.update = function(delta)
{
	if(this.autoUpdate)
	{
		this.updateCubeMap(this.renderer, this.scene);
	}

	Object3D.prototype.update.call(this, delta);
};


/**
 * Set the CubeCamera resolution.
 *
 * @method setResolution
 * @param {number} resolution CubeCamera resolution (per face). Should be a 2 pot.
 */
CubeCamera.prototype.setResolution = function(resolution)
{
	this.resolution = resolution;
	this.renderTarget.setSize(resolution, resolution);
};

/**
 * Clear cube camera render target.
 *
 * @method clear
 */
CubeCamera.prototype.clear = function(renderer, color, depth, stencil)
{
	var currentRenderTarget = renderer.getRenderTarget();

	for(var i = 0; i < 6; i++)
	{
		renderer.setRenderTarget(this.renderTarget, i);
		renderer.clear(color, depth, stencil);
	}

	renderer.setRenderTarget(currentRenderTarget);
};

/**
 * Render new cube faces. 
 * 
 * Should be called every time a change in the scene is made.
 *
 * @method updateCubeMap
 * @param {WebGLRenderer} renderer Renderer to be used.
 * @param {Scene} scene Scene to be renderer.
 */
CubeCamera.prototype.updateCubeMap = function(renderer, scene)
{
	var autoClear = renderer.autoClear;
	renderer.autoClear = false;

	// Backup current render target
	var currentRenderTarget = renderer.getRenderTarget();

	// Disable to render the cube faces
	var generateMipmaps = this.renderTarget.texture.generateMipmaps;
	this.renderTarget.texture.generateMipmaps = false;

	for(var i = 0; i < 6; i++)
	{
		if(i === 5)
		{
			this.renderTarget.texture.generateMipmaps = generateMipmaps;
		}
		this.cameras[i].updateMatrixWorld();
		renderer.setRenderTarget(this.renderTarget, i);
		renderer.clear(true, true, true);
		renderer.render(scene, this.cameras[i]);
	}

	// Restore renderer
	renderer.autoClear = autoClear;
	renderer.setRenderTarget(currentRenderTarget);
};

CubeCamera.prototype.toJSON = function(meta)
{
	var data = Object3D.prototype.toJSON.call(this, meta);

	data.object.near = this.near;
	data.object.far = this.far;
	data.object.resolution = this.resolution;
	data.object.autoUpdate = this.autoUpdate;

	return data;
};
export {CubeCamera};