# 학습 포인트: 3D 벡터 시각화기

## 목차
1. [개발자가 배우는 것](#개발자가-배우는-것)
2. [사용자가 배우는 것](#사용자가-배우는-것)
3. [벡터의 핵심 개념](#벡터의-핵심-개념)
4. [구현 코드 상세 설명](#구현-코드-상세-설명)

---

## 개발자가 배우는 것

### 1. Three.js 기본 아키텍처

```typescript
// src/app.ts:23-30
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
```

**학습 포인트:**
- **Scene**: 모든 3D 객체를 담는 컨테이너
- **Camera**: 3D 공간을 바라보는 시점 (FOV 75°, near/far plane)
- **Renderer**: Scene과 Camera를 받아 2D 이미지로 렌더링

### 2. 레이캐스팅 (Raycasting)

```typescript
// src/app.ts:114-121
this.raycaster.setFromCamera(this.mouse, this.camera);
const intersects = this.raycaster.intersectObjects(spheres);

if (intersects.length > 0) {
  // 마우스가 구체를 클릭했다!
}
```

**학습 포인트:**
- 2D 화면 좌표를 3D 공간의 ray로 변환
- Ray와 3D 객체의 교차점 계산
- 이를 통해 3D 객체 선택/조작 구현

**실전 활용:**
- 게임에서 클릭으로 객체 선택
- VR/AR에서 손가락 포인팅
- CAD 프로그램의 객체 피킹

### 3. 드래그 평면 (Drag Plane) 설계

```typescript
// src/app.ts:126-131
this.dragPlaneNormal.copy(this.camera.position).normalize();
this.dragPlane.setFromNormalAndCoplanarPoint(
  this.dragPlaneNormal,
  intersects[0].point
);
```

**학습 포인트:**
- 2D 마우스 이동을 3D 공간 이동으로 변환하는 기법
- 카메라 방향에 수직인 가상 평면 생성
- Ray와 평면의 교차점으로 3D 위치 계산

```
카메라 → [가상 평면] → 벡터 끝점
             ↑
        마우스 ray가
        이 평면과 만나는 점
```

**왜 필요한가?**
마우스는 2D(x, y)지만 3D 공간은 3축(x, y, z). 드래그 시 어느 방향으로 움직일지 모호함을 평면으로 제약하여 해결.

### 4. OrbitControls와 상태 관리

```typescript
// src/app.ts:124
this.controls.enabled = false;  // 드래그 시 카메라 회전 비활성화
```

**학습 포인트:**
- 여러 인터랙션 간 충돌 방지
- 드래그 중에는 OrbitControls 비활성화
- 상태 머신 패턴의 실전 적용

### 5. 반응형 업데이트 패턴

```typescript
// src/app.ts:157-167
private updateVectorOperations(): void {
  const sum = a.clone().add(b);
  const dot = a.dot(b);
  const cross = a.clone().cross(b);

  this.vectorSum.update(sum);
  this.vectorCross.update(cross);
  this.ui.update(a, b, sum, dot, cross);
}
```

**학습 포인트:**
- 단일 책임 원칙: 계산과 표시 분리
- Reactive 패턴: 벡터 변경 → 모든 파생값 자동 업데이트
- UI와 로직의 명확한 분리

---

## 사용자가 배우는 것

### 1. 벡터 덧셈의 기하학적 의미

```
     B
    ↗
   /
  /
 /________→ A
 O

평행사변형 법칙:
A + B = 대각선
```

**시각화로 배우기:**
- 빨간 벡터(A)와 파란 벡터(B)를 조작
- 노란 벡터(A+B)가 실시간 변화
- 평행사변형의 대각선임을 직관적으로 이해

### 2. 내적 (Dot Product)의 의미

#### 수학적 정의

```
A · B = |A| × |B| × cos(θ)
```

#### 기하학적 해석

```
      B
     ↗  θ
    /
   /________→ A

내적 = A의 크기 × (B를 A에 투영한 길이)
```

**앱에서 확인:**
1. 두 벡터가 평행할 때 → 내적 최대
2. 수직일 때 (90°) → 내적 = 0
3. 반대 방향일 때 → 내적 음수

#### 실전 활용

**1) 빛의 밝기 계산 (조명)**
```typescript
// 게임/3D 렌더링에서
const brightness = normal.dot(lightDirection);
// 표면이 빛을 향할수록 밝다
```

**2) 두 방향이 같은지 판단**
```typescript
const isFacingPlayer = enemy.direction.dot(toPlayer) > 0.8;
// 적이 플레이어를 보고 있는가?
```

**3) 투영 계산**
```typescript
// A를 B 방향으로 투영
const projection = B.clone().multiplyScalar(A.dot(B) / B.lengthSq());
// 그림자, 반사 벡터 계산 등
```

### 3. 외적 (Cross Product)의 의미

#### 수학적 정의

```
A × B = |A| × |B| × sin(θ) × n̂

여기서 n̂은 A와 B에 수직인 단위벡터
```

#### 기하학적 해석

```
    A × B (보라색)
      ↑
      |
     B ↗
      /
     /
    /________→ A
   O

외적은 A와 B가 이루는 평면에 수직!
오른손 법칙: A(검지) → B(중지) → A×B(엄지)
```

**앱에서 확인:**
1. 두 벡터를 조작하면 외적 방향이 항상 수직으로 유지
2. 벡터가 평행할 때 → 외적 = 0 (크기 0)
3. 수직일 때 → 외적 크기 최대

#### 외적의 크기 = 평행사변형 넓이

```
|A × B| = 두 벡터가 이루는 평행사변형의 넓이

     B
    /|
   / |  높이 = |B|sin(θ)
  /__|
 O   A
    밑변 = |A|

넓이 = |A| × |B|sin(θ)
```

#### 실전 활용

**1) 법선 벡터 계산 (Normal Vector)**
```typescript
// 삼각형의 법선 구하기
const edge1 = vertex2.clone().sub(vertex1);
const edge2 = vertex3.clone().sub(vertex1);
const normal = edge1.cross(edge2).normalize();
// 3D 모델의 조명 계산에 필수!
```

**2) 회전 방향 판단**
```typescript
// 2D 게임에서 적이 왼쪽/오른쪽에 있는지
const cross = forward.cross(toEnemy);
if (cross.y > 0) {
  // 오른쪽
} else {
  // 왼쪽
}
```

**3) 토크(회전력) 계산**
```typescript
// 물리 시뮬레이션
const torque = position.cross(force);
// 어디를 밀면 물체가 어떻게 회전하는가
```

**4) 카메라 시스템**
```typescript
// 카메라의 right 벡터 계산
const forward = target.clone().sub(cameraPos).normalize();
const up = new THREE.Vector3(0, 1, 0);
const right = forward.cross(up).normalize();
// FPS 게임의 좌우 이동
```

### 4. 단위 벡터 (Normalized Vector)

```typescript
// src/vector-arrow.ts:37
const dir = this.vector.clone().normalize();
```

**개념:**
- 방향은 유지, 길이를 1로 만든 벡터
- `normalize() = vector / length`

**왜 필요한가?**
```typescript
// ❌ 잘못된 예: 속도에 따라 방향이 달라짐
enemy.position.add(directionToPlayer);

// ✅ 올바른 예: 순수한 방향만 사용
const direction = directionToPlayer.normalize();
enemy.position.add(direction.multiplyScalar(speed));
```

**앱에서 관찰:**
- UI 패널에서 각 벡터의 Length 표시
- 길이가 달라도 방향은 유지됨
- ArrowHelper가 방향(normalized)과 길이를 분리하여 처리

---

## 벡터의 핵심 개념

### 벡터란?

**크기와 방향을 가진 물리량**

```
벡터 ≠ 단순 좌표

좌표: "어디"에 있는가
벡터: "어느 방향으로 얼마나" 가는가
```

### 벡터의 표현

```
3D 벡터 v = (x, y, z)

기하학적 의미:
- x: 오른쪽으로 얼마나
- y: 위로 얼마나
- z: 앞으로 얼마나
```

### 왜 컴퓨터 그래픽스에 벡터가 필수인가?

**1. 위치와 이동**
```typescript
position += velocity * deltaTime;
// 위치(벡터) + 속도(벡터) × 시간
```

**2. 회전과 방향**
```typescript
lookAt(target);
// "어디를 바라볼 것인가" = 방향 벡터
```

**3. 조명**
```typescript
brightness = normal · lightDirection;
// 표면 방향과 빛 방향의 관계
```

**4. 물리 시뮬레이션**
```typescript
acceleration = force / mass;
velocity += acceleration * dt;
// 힘, 속도, 가속도 모두 벡터
```

---

## 구현 코드 상세 설명

### 1. VectorArrow 클래스

#### ArrowHelper의 파라미터 이해

```typescript
// src/vector-arrow.ts:41-47
this.arrow = new THREE.ArrowHelper(
  dir,        // 방향 (반드시 normalized!)
  this.origin,// 시작점
  length,     // 길이
  this.color, // 색상
  headLength, // 화살촉 길이
  headWidth   // 화살촉 너비
);
```

**왜 direction은 normalized여야 하나?**
```typescript
// Three.js 내부 구현 (의사 코드)
arrowPosition = origin + (direction * length);

// direction이 normalized 아니면:
// direction = (2, 0, 0), length = 5
// → 실제 길이 = 10! (의도와 다름)
```

#### 동적 업데이트

```typescript
// src/vector-arrow.ts:53-62
public update(newVector: THREE.Vector3): void {
  this.vector.copy(newVector);
  const length = this.vector.length();
  const dir = this.vector.clone().normalize();

  if (length > 0) {
    this.arrow.setDirection(dir);
    this.arrow.setLength(length, ...);
  }

  this.updateSpherePosition();
}
```

**학습 포인트:**
- `copy()` vs `clone()`: 기존 객체 수정 vs 새 객체 생성
- `length > 0` 체크: 제로 벡터는 방향이 없음
- 화살표와 구체를 별도로 업데이트해야 동기화 유지

### 2. 드래그 인터랙션 구현

#### 마우스 좌표 정규화

```typescript
// src/app.ts:151-154
private updateMousePosition(event: PointerEvent): void {
  this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
```

**왜 이렇게 변환하나?**
```
화면 좌표:        정규화된 좌표:
(0, 0) ────→ x   (-1, 1) ────→ x
  │                  │
  │                  │
  ↓ y                ↓ y (반전!)

좌상단 = (0, 0)      좌상단 = (-1, 1)
우하단 = (W, H)      우하단 = (1, -1)
```

Three.js의 raycaster는 정규화된 좌표(-1 ~ 1)를 기대하므로 변환 필수!

#### Ray-Plane 교차 계산

```typescript
// src/app.ts:142-146
if (this.raycaster.ray.intersectPlane(this.dragPlane, intersection)) {
  const newVector = intersection.clone().sub(this.selectedVector.origin);
  this.selectedVector.update(newVector);
}
```

**단계별 이해:**
```
1. Ray 생성
   카메라 → 마우스 커서를 향하는 직선

2. Plane과 교차점 계산
   ray: P(t) = origin + t * direction
   plane: ax + by + cz + d = 0
   → t 값 계산 → 교차점 P

3. 벡터 업데이트
   새 벡터 = 교차점 - 원점
```

### 3. 벡터 연산

#### Vector3 메서드 체이닝

```typescript
// src/app.ts:158-167
const a = this.vectorA.vector;
const b = this.vectorB.vector;

const sum = a.clone().add(b);      // A + B
const dot = a.dot(b);               // A · B
const cross = a.clone().cross(b);   // A × B
```

**주의: clone()을 사용하는 이유**

```typescript
// ❌ 원본이 변경됨!
const sum = a.add(b);
// a가 변경되어 버림!

// ✅ 원본 보존
const sum = a.clone().add(b);
// a는 그대로, sum만 새로 생성
```

**Three.js Vector3 메서드 특징:**
- 대부분의 메서드가 `this`를 반환 → 체이닝 가능
- 원본을 수정하는 "mutable" 방식
- 성능을 위한 설계 (새 객체 생성 비용 감소)

### 4. UI 업데이트 패턴

```typescript
// src/ui.ts:26-76
public update(
  vectorA: THREE.Vector3,
  vectorB: THREE.Vector3,
  sum: THREE.Vector3,
  dot: number,
  cross: THREE.Vector3
): void {
  const angle = calculateAngle(vectorA, vectorB);
  this.container.innerHTML = `...`;
}
```

**설계 선택:**
- 의존성 역전: UI는 Three.js를 직접 몰라도 됨
- 모든 계산된 값을 파라미터로 전달
- UI는 순수하게 "표시"만 담당

**대안적 접근:**
```typescript
// 안티패턴: UI가 계산까지 하면?
public update(vectorA, vectorB) {
  const sum = vectorA.clone().add(vectorB);  // UI가 로직 포함
  // → 테스트 어려움, 책임 분리 실패
}
```

### 5. 애니메이션 루프

```typescript
// src/app.ts:172-177
private animate = (): void => {
  requestAnimationFrame(this.animate);

  this.controls.update();
  this.renderer.render(this.scene, this.camera);
};
```

**requestAnimationFrame의 장점:**
```typescript
// ❌ setInterval 사용 시
setInterval(() => render(), 16);  // 60fps 목표
// 문제: 브라우저가 다른 탭이어도 실행
//       화면 주사율과 동기화 안됨

// ✅ requestAnimationFrame
requestAnimationFrame(animate);
// - 브라우저가 준비될 때만 실행
// - 화면 주사율과 자동 동기화
// - 백그라운드 탭에서는 일시정지
```

**controls.update()가 필요한 이유:**
```typescript
this.controls.enableDamping = true;  // 관성 효과

// 매 프레임마다 update() 호출해야
// damping 효과가 부드럽게 적용됨
```

---

## 다음 단계로 확장하기

### 1. 행렬 변환 학습
```typescript
// 회전 행렬 적용
const rotationMatrix = new THREE.Matrix4();
rotationMatrix.makeRotationY(Math.PI / 4);
vectorA.applyMatrix4(rotationMatrix);
```

### 2. 사원수(Quaternion) 탐구
```typescript
// 짐벌 락 없는 회전
const quaternion = new THREE.Quaternion();
quaternion.setFromAxisAngle(axis, angle);
```

### 3. 벡터장(Vector Field) 시각화
```typescript
// 물리 시뮬레이션: 모든 점에서 힘의 방향
for (let x = 0; x < 10; x++) {
  for (let z = 0; z < 10; z++) {
    const force = calculateForceAt(x, z);
    drawArrow(force);
  }
}
```

---

## 참고 자료

### 수학적 배경
- [Khan Academy - Vectors](https://www.khanacademy.org/math/linear-algebra/vectors-and-spaces)
- [3Blue1Brown - Essence of Linear Algebra](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab)

### Three.js 공식 문서
- [Vector3 API](https://threejs.org/docs/#api/en/math/Vector3)
- [Raycaster](https://threejs.org/docs/#api/en/core/Raycaster)
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls)

### 실전 응용
- [Ray Tracing in One Weekend](https://raytracing.github.io/) - 벡터로 렌더러 만들기
- [Game Physics](https://gafferongames.com/post/integration_basics/) - 물리 엔진의 벡터 활용

---

## 마무리

이 프로젝트를 통해 배운 것:

**개발자 관점:**
- ✅ Three.js의 Scene Graph 아키텍처
- ✅ 3D 인터랙션 구현 (레이캐스팅, 드래그)
- ✅ 반응형 상태 관리 패턴
- ✅ TypeScript로 타입 안전한 3D 코드

**수학 관점:**
- ✅ 벡터 연산의 기하학적 의미
- ✅ 내적/외적의 실전 활용 사례
- ✅ 좌표계 변환 (2D ↔ 3D)

**다음 학습 주제:**
- 행렬 변환 (이동, 회전, 크기)
- 카메라 수학 (뷰/투영 행렬)
- 조명 모델 (Phong, PBR)
- 충돌 감지 알고리즘
