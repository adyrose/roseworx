import * as THREE from 'three';

import {rwxResizeTrack} from '../common/rwxEventTracking';

class rwxMatrix {
	constructor(parent=false, lights, fov=70, nv=0.1, fv=1000)
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
		if(this.hasParent)
		{
			this.parent.style.height = "100%";
			this.parent.style.width = "100%";
		}
		this.calculateBounds();
		this.createCamera();
		this.createScene();
		lights && this.createLights();
		this.meshes = [];
		this.standardGeo = new THREE.BoxGeometry( 2, 2, 2 );
		this.standardMat = lights ? new THREE.MeshStandardMaterial() : new THREE.MeshNormalMaterial({flatShading:true});
		this.addShape(this.standardGeo, this.standardMat);
		this.createRenderer();
		if(!window.rwx.resizeTracking){window.rwx.resizeTracking = new rwxResizeTrack();}
		window.rwx.resizeTracking.add(()=>this.resize(), 'bracketsAnimation');
	}

	getVisibleBoundsAtDepth(depth) {
	  const cameraOffset = this.camera.position.z;
	  if ( depth < cameraOffset ) depth -= cameraOffset;
	  else depth += cameraOffset;
	  const vFOV = this.camera.fov * Math.PI / 180; 
	  const height = Math.tan( vFOV / 2 ) * Math.abs( depth );
	  const width = height * this.camera.aspect;
	  return {
	  	xmin: -width,
	  	xmax: width,
	  	ymin: -height,
	  	ymax: height
	  };
	}


	unhook()
	{
		window.removeEventListener('resize', this.resize);
		this.renderer.setAnimationLoop(null);
	}

  createLights()
  {
    this.directLight = new THREE.DirectionalLight( 0x505050, 0.9 );
    this.directLight.position.set(10 , 10, 15);
    this.scene.add( this.directLight );
    this.ambience = new THREE.AmbientLight( 0xe65c00, 0.75 );
    this.scene.add( this.ambience );
    const helper = new THREE.DirectionalLightHelper( this.directLight, 5 );
    this.scene.add(helper);
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
		this.camera.position.z = 10;
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

	addShape(geo, mat, r=true)
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