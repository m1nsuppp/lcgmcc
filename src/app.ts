import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VectorArrow } from './vector-arrow';
import { UIPanel } from './ui';

export class VectorVisualizer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private ui: UIPanel;

  // 벡터들
  private vectorA: VectorArrow;
  private vectorB: VectorArrow;
  private vectorSum: VectorArrow;
  private vectorCross: VectorArrow;

  // 드래그 상태
  private isDragging = false;
  private selectedVector: VectorArrow | null = null;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private dragPlane: THREE.Plane;
  private dragPlaneNormal: THREE.Vector3;

  constructor(canvas: HTMLCanvasElement) {
    // Scene 설정
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a1a);

    // Camera 설정
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // Renderer 설정
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // OrbitControls 설정
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // UI Panel
    this.ui = new UIPanel();

    // 레이캐스터 및 마우스
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragPlane = new THREE.Plane();
    this.dragPlaneNormal = new THREE.Vector3(0, 1, 0);

    // 좌표축 그리드 추가
    this.setupScene();

    // 벡터 초기화
    const origin = new THREE.Vector3(0, 0, 0);
    this.vectorA = new VectorArrow(
      origin,
      new THREE.Vector3(2, 1, 0),
      { color: 0xff4444, label: 'Vector A' }
    );
    this.vectorB = new VectorArrow(
      origin,
      new THREE.Vector3(0, 2, 1),
      { color: 0x4444ff, label: 'Vector B' }
    );
    this.vectorSum = new VectorArrow(
      origin,
      new THREE.Vector3(0, 0, 0),
      { color: 0xffff00, label: 'A + B' }
    );
    this.vectorCross = new VectorArrow(
      origin,
      new THREE.Vector3(0, 0, 0),
      { color: 0xff00ff, label: 'A × B' }
    );

    this.vectorA.addToScene(this.scene);
    this.vectorB.addToScene(this.scene);
    this.vectorSum.addToScene(this.scene);
    this.vectorCross.addToScene(this.scene);

    // 초기 계산
    this.updateVectorOperations();

    // 이벤트 리스너
    this.setupEventListeners();

    // 애니메이션 시작
    this.animate();
  }

  private setupScene(): void {
    // 그리드 헬퍼
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    this.scene.add(gridHelper);

    // 축 헬퍼
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);

    // 조명 (선택사항, 더 나은 시각화를 위해)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 10, 7);
    this.scene.add(directionalLight);
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp.bind(this));
  }

  private handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onPointerDown(event: PointerEvent): void {
    this.updateMousePosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 드래그 가능한 구들 확인
    const spheres = [this.vectorA.sphere, this.vectorB.sphere];
    const intersects = this.raycaster.intersectObjects(spheres);

    if (intersects.length > 0) {
      this.isDragging = true;
      this.controls.enabled = false;

      // 어떤 벡터가 선택되었는지 확인
      if (intersects[0].object === this.vectorA.sphere) {
        this.selectedVector = this.vectorA;
      } else if (intersects[0].object === this.vectorB.sphere) {
        this.selectedVector = this.vectorB;
      }

      // 드래그 평면 설정
      this.dragPlaneNormal.copy(this.camera.position).normalize();
      this.dragPlane.setFromNormalAndCoplanarPoint(
        this.dragPlaneNormal,
        intersects[0].point
      );
    }
  }

  private onPointerMove(event: PointerEvent): void {
    this.updateMousePosition(event);

    if (this.isDragging && this.selectedVector) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersection = new THREE.Vector3();

      if (this.raycaster.ray.intersectPlane(this.dragPlane, intersection)) {
        // 새로운 벡터 계산 (원점에서 교점까지)
        const newVector = intersection.clone().sub(this.selectedVector.origin);
        this.selectedVector.update(newVector);
        this.updateVectorOperations();
      }
    }
  }

  private onPointerUp(): void {
    this.isDragging = false;
    this.selectedVector = null;
    this.controls.enabled = true;
  }

  private updateMousePosition(event: PointerEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private updateVectorOperations(): void {
    const a = this.vectorA.vector;
    const b = this.vectorB.vector;

    // 벡터 덧셈
    const sum = a.clone().add(b);
    this.vectorSum.update(sum);

    // 내적
    const dot = a.dot(b);

    // 외적
    const cross = a.clone().cross(b);
    this.vectorCross.update(cross);

    // UI 업데이트
    this.ui.update(a, b, sum, dot, cross);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
