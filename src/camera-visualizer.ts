import * as THREE from 'three';

/**
 * 카메라의 위치, 타겟, 업벡터를 시각화하는 헬퍼
 */
export class CameraVisualizer {
  private positionSphere: THREE.Mesh;
  private targetSphere: THREE.Mesh;
  private forwardArrow: THREE.ArrowHelper;
  private upArrow: THREE.ArrowHelper;
  private rightArrow: THREE.ArrowHelper;
  private viewLine: THREE.Line;

  constructor() {
    // 카메라 위치 표시 (노란 구)
    const positionGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const positionMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    this.positionSphere = new THREE.Mesh(positionGeometry, positionMaterial);

    // 타겟 위치 표시 (빨간 구)
    const targetGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.targetSphere = new THREE.Mesh(targetGeometry, targetMaterial);

    // Forward 화살표 (파란색, -Z 방향)
    this.forwardArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0, 0),
      2,
      0x0000ff,
      0.3,
      0.2
    );

    // Up 화살표 (녹색, Y 방향)
    this.upArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 0),
      1.5,
      0x00ff00,
      0.3,
      0.2
    );

    // Right 화살표 (빨간색, X 방향)
    this.rightArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      1.5,
      0xff0000,
      0.3,
      0.2
    );

    // 카메라에서 타겟으로 가는 선
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffff00,
      linewidth: 2,
      opacity: 0.6,
      transparent: true,
    });
    this.viewLine = new THREE.Line(lineGeometry, lineMaterial);
  }

  /**
   * 카메라 상태에 맞게 시각화 업데이트
   */
  public update(camera: THREE.Camera): void {
    if (!(camera instanceof THREE.PerspectiveCamera)) {
      return;
    }

    const position = camera.position.clone();
    const target = new THREE.Vector3();
    camera.getWorldDirection(target);
    target.multiplyScalar(5).add(position);

    // 위치 구 업데이트
    this.positionSphere.position.copy(position);
    this.targetSphere.position.copy(target);

    // 카메라 로컬 좌표계
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    // 화살표 업데이트
    this.forwardArrow.position.copy(position);
    this.forwardArrow.setDirection(forward);

    this.upArrow.position.copy(position);
    this.upArrow.setDirection(up);

    this.rightArrow.position.copy(position);
    this.rightArrow.setDirection(right);

    // 시선 선 업데이트
    const linePositions = new Float32Array([
      position.x, position.y, position.z,
      target.x, target.y, target.z,
    ]);
    this.viewLine.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(linePositions, 3)
    );
    this.viewLine.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Scene에 추가
   */
  public addToScene(scene: THREE.Scene): void {
    scene.add(this.positionSphere);
    scene.add(this.targetSphere);
    scene.add(this.forwardArrow);
    scene.add(this.upArrow);
    scene.add(this.rightArrow);
    scene.add(this.viewLine);
  }

  /**
   * Scene에서 제거
   */
  public removeFromScene(scene: THREE.Scene): void {
    scene.remove(this.positionSphere);
    scene.remove(this.targetSphere);
    scene.remove(this.forwardArrow);
    scene.remove(this.upArrow);
    scene.remove(this.rightArrow);
    scene.remove(this.viewLine);
  }

  /**
   * 가시성 설정
   */
  public setVisible(visible: boolean): void {
    this.positionSphere.visible = visible;
    this.targetSphere.visible = visible;
    this.forwardArrow.visible = visible;
    this.upArrow.visible = visible;
    this.rightArrow.visible = visible;
    this.viewLine.visible = visible;
  }
}
