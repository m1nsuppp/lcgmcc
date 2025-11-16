import * as THREE from 'three';

export interface VectorArrowOptions {
  color?: number;
  headLength?: number;
  headWidth?: number;
  label?: string;
}

export class VectorArrow {
  public vector: THREE.Vector3;
  public origin: THREE.Vector3;
  public arrow: THREE.ArrowHelper;
  public sphere: THREE.Mesh;
  public label: string;
  private color: number;

  constructor(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    options: VectorArrowOptions = {}
  ) {
    this.origin = origin.clone();
    this.vector = direction.clone();
    this.label = options.label ?? 'Vector';
    this.color = options.color ?? 0xff0000;

    const length = this.vector.length();
    const dir = this.vector.clone().normalize();
    const headLength = options.headLength ?? Math.min(length * 0.2, 0.3);
    const headWidth = options.headWidth ?? Math.min(length * 0.15, 0.2);

    // 화살표 생성
    this.arrow = new THREE.ArrowHelper(
      dir,
      this.origin,
      length,
      this.color,
      headLength,
      headWidth
    );

    // 끝점에 구 추가 (드래그 조작용)
    const sphereGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: this.color });
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.updateSpherePosition();
  }

  /**
   * 벡터 업데이트
   */
  public update(newVector: THREE.Vector3): void {
    this.vector.copy(newVector);
    const length = this.vector.length();
    const dir = this.vector.clone().normalize();

    if (length > 0) {
      this.arrow.setDirection(dir);
      this.arrow.setLength(length, Math.min(length * 0.2, 0.3), Math.min(length * 0.15, 0.2));
    }

    this.updateSpherePosition();
  }

  /**
   * 원점 업데이트
   */
  public updateOrigin(newOrigin: THREE.Vector3): void {
    this.origin.copy(newOrigin);
    this.arrow.position.copy(this.origin);
    this.updateSpherePosition();
  }

  /**
   * 구 위치 업데이트
   */
  private updateSpherePosition(): void {
    const endPoint = this.origin.clone().add(this.vector);
    this.sphere.position.copy(endPoint);
  }

  /**
   * Scene에 추가
   */
  public addToScene(scene: THREE.Scene): void {
    scene.add(this.arrow);
    scene.add(this.sphere);
  }

  /**
   * Scene에서 제거
   */
  public removeFromScene(scene: THREE.Scene): void {
    scene.remove(this.arrow);
    scene.remove(this.sphere);
  }

  /**
   * 벡터의 끝점 가져오기
   */
  public getEndPoint(): THREE.Vector3 {
    return this.origin.clone().add(this.vector);
  }

  /**
   * 색상 변경
   */
  public setColor(color: number): void {
    this.color = color;
    this.arrow.setColor(color);
    (this.sphere.material as THREE.MeshBasicMaterial).color.setHex(color);
  }
}
