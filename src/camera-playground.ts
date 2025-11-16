import * as THREE from 'three';
import { CameraVisualizer } from './camera-visualizer';
import { CameraControlUI, type RotationMode } from './camera-control-ui';

export class CameraPlayground {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private viewCamera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private visualizer: CameraVisualizer;
  private ui: CameraControlUI;

  private mode: RotationMode = 'euler';
  private initialPosition: THREE.Vector3;
  private initialRotation: THREE.Euler;

  constructor(canvas: HTMLCanvasElement) {
    // Scene 설정
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);

    // 조작할 카메라 (시각화 대상)
    const fov = 75; // Field of View (시야각)
    const aspect = 1; // 종횡비
    const near = 0.1; // 근평면
    const far = 1000; // 원평면
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    this.initialPosition = this.camera.position.clone();
    this.initialRotation = this.camera.rotation.clone();

    // 뷰 카메라 (우리가 보는 시점)
    const viewFov = 60;
    const viewAspect = window.innerWidth / window.innerHeight;
    const viewNear = 0.1;
    const viewFar = 1000;
    this.viewCamera = new THREE.PerspectiveCamera(viewFov, viewAspect, viewNear, viewFar);
    this.viewCamera.position.set(10, 10, 10);
    this.viewCamera.lookAt(0, 0, 0);

    // Renderer 설정
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Scene 설정
    this.setupScene();

    // 카메라 시각화
    this.visualizer = new CameraVisualizer();
    this.visualizer.addToScene(this.scene);

    // UI 설정
    this.ui = new CameraControlUI({
      onPositionChange: this.handlePositionChange.bind(this),
      onEulerRotationChange: this.handleEulerRotation.bind(this),
      onQuaternionRotationChange: this.handleQuaternionRotation.bind(this),
      onLookAtTarget: this.handleLookAt.bind(this),
      onModeChange: this.handleModeChange.bind(this),
      onReset: this.handleReset.bind(this),
    });

    // 이벤트 리스너
    window.addEventListener('resize', this.handleResize.bind(this));

    // 애니메이션 시작
    this.animate();
  }

  private setupScene(): void {
    // 그리드
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    this.scene.add(gridHelper);

    // 월드 축
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // 참조용 큐브 (원점에 배치)
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    this.scene.add(cube);

    // 조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
  }

  private handlePositionChange(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    this.visualizer.update(this.camera);
  }

  private handleEulerRotation(x: number, y: number, z: number): void {
    // 도 → 라디안 변환
    const xRad = THREE.MathUtils.degToRad(x);
    const yRad = THREE.MathUtils.degToRad(y);
    const zRad = THREE.MathUtils.degToRad(z);

    this.camera.rotation.set(xRad, yRad, zRad);
    this.visualizer.update(this.camera);
  }

  private handleQuaternionRotation(axis: THREE.Vector3, angle: number): void {
    const angleRad = THREE.MathUtils.degToRad(angle);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis, angleRad);

    this.camera.quaternion.copy(quaternion);
    this.visualizer.update(this.camera);
  }

  private handleLookAt(x: number, y: number, z: number): void {
    this.camera.lookAt(x, y, z);
    this.visualizer.update(this.camera);
  }

  private handleModeChange(mode: RotationMode): void {
    this.mode = mode;
  }

  private handleReset(): void {
    this.camera.position.copy(this.initialPosition);
    this.camera.rotation.copy(this.initialRotation);
    this.camera.lookAt(0, 0, 0);
    this.visualizer.update(this.camera);
  }

  private handleResize(): void {
    this.viewCamera.aspect = window.innerWidth / window.innerHeight;
    this.viewCamera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    this.visualizer.update(this.camera);
    this.renderer.render(this.scene, this.viewCamera);
  };
}
