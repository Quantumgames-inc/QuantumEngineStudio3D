function DirectionalLight(hex, intensity)
{
	THREE.DirectionalLight.call(this, hex, intensity);

	this.name = "directional_light";
	
	this.castShadow = true;
	
	this.shadow.camera.near = 0;
	this.shadow.camera.far = 5000;
	this.shadow.camera.left = -10;
	this.shadow.camera.right = 10;
	this.shadow.camera.top = 10;
	this.shadow.camera.bottom = -10;

	this.shadow.mapSize.width = 2048;
	this.shadow.mapSize.height = 2048;
}

//Function Prototype
DirectionalLight.prototype = Object.create(THREE.DirectionalLight.prototype);
DirectionalLight.prototype.icon = "editor/files/icons/lights/directional.png";

//Runtime functions
DirectionalLight.prototype.update = update;
DirectionalLight.prototype.initialize = initialize;

//Initialize
function initialize()
{
	for(var i = 0; i < this.children.length; i++)
	{
		if(this.children[i].initialize !== undefined)
		{
			this.children[i].initialize();
		}
	}
}

//Update State
function update()
{
	for(var i = 0; i < this.children.length; i++)
	{
		if(this.children[i].update !== undefined)
		{
			this.children[i].update();
		}
	}
}
