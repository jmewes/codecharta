import * as THREE from "three";

export class ThreeViewerService {

    public static SELECTOR = "threeViewerService";

    public renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;
    public scene: THREE.Scene;
    public map: THREE.Mesh;
    public controls: THREE.OrbitControls;
    public targetDot: THREE.Mesh;

    init(element: Element) {

        // scene 
        this.scene = new THREE.Scene();

        // cube
        this.map = new THREE.Mesh(new THREE.CubeGeometry(200, 200, 200), new THREE.MeshNormalMaterial());
        this.scene.add(this.map);

        // orbit target dot
        this.targetDot = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20), new THREE.MeshNormalMaterial());
        this.scene.add(this.targetDot);


        // lights
        this.scene.add(this.buildLights());

        // camera
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 100, 200000);
        this.camera.position.set(1000, 1000, 1000);
        this.scene.add(this.camera);
        this.camera.lookAt(this.scene.position);

        // renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xeeeedd, 1);

        // orbit
        const OrbitControls = require("three-orbit-controls")(require("three"));
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        // add renderer to DOM
        element.appendChild(this.renderer.domElement);

        // handles resizing the renderer when the window is resized
        window.addEventListener("resize", this.onWindowResize.bind(this), false);

        //add method to window for debugging, use window.setAngle(x,y,z) in chrome console
        window["setAngle"] = this.setMapAngleRelativeToUserView.bind(this);
    }

    private setMapAngleRelativeToUserView(x, y, z) {

        // save old position
        const oldPosition = this.map.position.clone();

        // move to camera target 
        this.map.position.x = this.controls.target.x;
        this.map.position.y = this.controls.target.y;
        this.map.position.z = this.controls.target.z;

        // reset rotation so the map faces the camera, this only is correct in the controls target
        this.map.lookAt(this.camera.position);

        // rotate, maybe we should use matrix or quats
        this.map.rotateX(THREE.Math.degToRad(x));
        this.map.rotateY(THREE.Math.degToRad(y));
        this.map.rotateZ(THREE.Math.degToRad(z));

        // move back to old position
        this.map.position.x = oldPosition.x;
        this.map.position.y = oldPosition.y;
        this.map.position.z = oldPosition.z;

    }

    private buildLights() {
        const lights = new THREE.Group();
        const ambilight = new THREE.AmbientLight(0x707070); // soft white light
        const light1 = new THREE.DirectionalLight(0xe0e0e0, 1);
        light1.position.set(50, 10, 8).normalize();
        light1.castShadow = false;
        light1.shadow.camera.right = 5;
        light1.shadow.camera.left = -5;
        light1.shadow.camera.top = 5;
        light1.shadow.camera.bottom = -5;
        light1.shadow.camera.near = 2;
        light1.shadow.camera.far = 100;
        const light2 = new THREE.DirectionalLight(0xe0e0e0, 1);
        light2.position.set(-50, 10, -8).normalize();
        light2.castShadow = false;
        light2.shadow.camera.right = 5;
        light2.shadow.camera.left = -5;
        light2.shadow.camera.top = 5;
        light2.shadow.camera.bottom = -5;
        light2.shadow.camera.near = 2;
        light2.shadow.camera.far = 100;
        lights.add(ambilight);
        lights.add(light1);
        lights.add(light2);
        return lights;
    }

    onWindowResize() {
        this.scene.updateMatrixWorld(false);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
        this.targetDot.position.x = this.controls.target.x;
        this.targetDot.position.y = this.controls.target.y;
        this.targetDot.position.z = this.controls.target.z;
    }

}
