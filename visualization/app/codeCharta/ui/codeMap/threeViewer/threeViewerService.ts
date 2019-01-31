import * as THREE from "three";

export class ThreeViewerService {

    public static SELECTOR = "threeViewerService";

    public renderer: THREE.WebGLRenderer;
    public camera: THREE.PerspectiveCamera;
    public scene: THREE.Scene;
    public map: THREE.Mesh;
    public controls: THREE.OrbitControls;

    public targetDot: THREE.Mesh;

    public rearAlignmentCube: THREE.Mesh;


    init(element: Element) {

        // scene 
        this.scene = new THREE.Scene();

        // scene floor
        var size = 1000;
        var divisions = 1000;
        var gridHelper = new THREE.GridHelper(size, divisions);
        this.scene.add(gridHelper);

        // cube
        this.map = new THREE.Mesh(new THREE.CubeGeometry(200, 200, 200), new THREE.MeshNormalMaterial());
        this.scene.add(this.map);

        // orbit target dot
        this.targetDot = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20), new THREE.MeshNormalMaterial());
        this.scene.add(this.targetDot);

        // alignment cubes
        this.rearAlignmentCube = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10), new THREE.MeshNormalMaterial());
        this.targetDot.add(this.rearAlignmentCube);
        this.rearAlignmentCube.translateZ(-50)

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
        window["setViewDirection"] = this.rotateCameraInVectorDirection.bind(this);
        window["setFrontalView"] = () => this.rotateCameraInVectorDirection(0,0,-1)
        window["setDiagonalFromTopFrontalView"] = () => this.rotateCameraInVectorDirection(0,-1,-1)


    }

    /**
     * This rotates the camera around the controls target (pivot point of orbit controls) 
     * in a way that the camera ends up looking in the same direction as the given vector. 
     * It does not look at the same point, just the direction.
     */
    private rotateCameraInVectorDirection(x, y, z) {

        // remember distance from camera to target
        const distance = this.camera.position.sub(this.controls.target).length();

        // move camera into target
        this.camera.position.x = this.controls.target.x;
        this.camera.position.y = this.controls.target.y;
        this.camera.position.z = this.controls.target.z;

        // look at the correct alignment cube
        const alignmentCube = new THREE.Mesh(new THREE.CubeGeometry(5, 5, 5), new THREE.MeshNormalMaterial());
        this.targetDot.add(alignmentCube);
        alignmentCube.translateX(x)
        alignmentCube.translateY(y)
        alignmentCube.translateZ(z)
        this.camera.lookAt(alignmentCube.getWorldPosition());
        this.targetDot.remove(alignmentCube);

        // move camera back for the original distance
        this.camera.translateZ(distance);

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
