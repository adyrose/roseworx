import * as THREE from 'three';

class rwxMatrix {
	constructor(parent=null, fov=70, nv=0.01, fv=10)
	{
		this.resize = this.resize.bind(this);
		this.renderScene = this.renderScene.bind(this);
		this.THREE = THREE;
		this.fov = fov;
		this.nv = nv;
		this.fv = fv;
		this.parent = parent ? document.getElementById(parent) : document.body;
		this.hasParent = parent;
		if(!this.parent){console.log(`#${parent} does not exist.`);return;}
		this.calculateBounds();
		this.createCamera();
		this.createScene();
		this.createLights();
		this.meshes = [];
		this.standardMat = new THREE.MeshNormalMaterial({flatShading:true});
		this.addShape();
		this.createRenderer();
		window.addEventListener('resize', this.resize);
	}

  createLights()
  {
    this.directionalLight = new THREE.DirectionalLight( 0x505050, 15 );
    this.directionalLight.position.set(10 , 10, 15);
    this.scene.add( this.directionalLight );
    const light2 = new THREE.AmbientLight( 0x505050, 7 );
    this.scene.add( light2 );
  }

	calculateBounds()
	{
		this.bounds = {
			width: this.hasParent ? this.parent.offsetWidth : window.innerWidth,
			height: this.hasParent ? this.parent.offsetHeight : window.innerHeight,
		};
	}

	createCamera()
	{
		this.camera = new THREE.PerspectiveCamera( this.fov, this.bounds.width / this.bounds.height, this.nv, this.fv );
		this.camera.position.z = 1;
	}

	createScene()
	{
		this.scene = new THREE.Scene();
	}

	addToScene(mesh)
	{
		this.scene.add( mesh );
	}

	destroyDemo()
	{
		let mesh = this.meshes[0].mesh;
		this.meshes.shift();
		this.removeShape(mesh);
	}

	removeShape(obj)
	{
		this.scene.remove(obj);
	}

	addShape(geo=new THREE.BoxGeometry( 0.2, 0.2, 0.2 ), mat=this.standardMat, r=true)
	{
		let mesh = new THREE.Mesh( geo, mat );
		const obj = {
			rotate: r,
			mesh: mesh
		}
		this.addToScene(mesh);
		this.meshes.push(obj);
		return mesh;
	}

	createRenderer()
	{
		this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
		this.renderer.setSize( this.bounds.width, this.bounds.height );
		this.renderer.setAnimationLoop( this.renderScene );
		this.renderer.domElement.style.width = "100%";
		this.parent.appendChild( this.renderer.domElement );	
	}

  resize()
  {
  	this.calculateBounds();
    this.camera.aspect = this.bounds.width / this.bounds.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize( this.bounds.width, this.bounds.height );   
    this.renderer.domElement.style.width = "100%";
  }

	renderScene(time)
	{
		this.animate(time);
		this.renderer.render( this.scene, this.camera );		
	}

	animate(time)
	{
		this.meshes.map((m)=>{
			if(m.rotate)
			{
				m.mesh.rotation.x = time / 2000;
				m.mesh.rotation.y = time / 1000;
			}
			return false;
		})
	}
}

export default rwxMatrix;