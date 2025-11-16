import type * as THREE from 'three';

export type RotationMode = 'euler' | 'quaternion';

export interface CameraControlCallbacks {
  onPositionChange: (x: number, y: number, z: number) => void;
  onEulerRotationChange: (x: number, y: number, z: number) => void;
  onQuaternionRotationChange: (axis: THREE.Vector3, angle: number) => void;
  onLookAtTarget: (x: number, y: number, z: number) => void;
  onModeChange: (mode: RotationMode) => void;
  onReset: () => void;
}

export class CameraControlUI {
  private container: HTMLElement;
  private mode: RotationMode = 'euler';
  private callbacks: CameraControlCallbacks;

  constructor(callbacks: CameraControlCallbacks) {
    this.callbacks = callbacks;
    this.container = document.createElement('div');
    this.container.id = 'camera-control-panel';
    this.setupStyles();
    this.createUI();
    document.body.appendChild(this.container);
  }

  private setupStyles(): void {
    this.container.style.position = 'absolute';
    this.container.style.top = '20px';
    this.container.style.right = '20px';
    this.container.style.padding = '20px';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    this.container.style.color = '#ffffff';
    this.container.style.fontFamily = 'monospace';
    this.container.style.fontSize = '13px';
    this.container.style.borderRadius = '8px';
    this.container.style.minWidth = '320px';
    this.container.style.maxHeight = '90vh';
    this.container.style.overflowY = 'auto';
    this.container.style.zIndex = '1000';
  }

  private createUI(): void {
    this.container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #4CAF50;">Camera Playground</h3>
        <p style="margin: 5px 0; font-size: 11px; color: #aaa;">
          카메라 조작을 실험하고 회전 방식을 비교해보세요
        </p>
      </div>

      <!-- 모드 전환 -->
      <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 5px;">
        <div style="margin-bottom: 10px; font-weight: bold; color: #ffaa00;">회전 모드</div>
        <div style="display: flex; gap: 10px;">
          <button id="mode-euler" style="flex: 1; padding: 8px; background: #4CAF50; border: none; color: white; border-radius: 4px; cursor: pointer; font-family: monospace;">
            Euler 각도
          </button>
          <button id="mode-quaternion" style="flex: 1; padding: 8px; background: #555; border: none; color: white; border-radius: 4px; cursor: pointer; font-family: monospace;">
            Quaternion
          </button>
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: #888;" id="mode-description">
          X, Y, Z 축 회전을 독립적으로 조작
        </div>
      </div>

      <!-- 위치 조작 -->
      <div style="margin-bottom: 20px;">
        <div style="margin-bottom: 10px; font-weight: bold; color: #00ffff;">Position (위치)</div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">X: <span id="pos-x-value">0</span></label>
          <input type="range" id="pos-x" min="-10" max="10" step="0.1" value="5"
                 style="width: 100%; accent-color: #ff0000;">
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Y: <span id="pos-y-value">0</span></label>
          <input type="range" id="pos-y" min="-10" max="10" step="0.1" value="5"
                 style="width: 100%; accent-color: #00ff00;">
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Z: <span id="pos-z-value">0</span></label>
          <input type="range" id="pos-z" min="-10" max="10" step="0.1" value="5"
                 style="width: 100%; accent-color: #0000ff;">
        </div>
      </div>

      <!-- Euler 회전 -->
      <div id="euler-controls" style="margin-bottom: 20px;">
        <div style="margin-bottom: 10px; font-weight: bold; color: #ff00ff;">Euler Rotation (오일러 각)</div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Pitch (X): <span id="euler-x-value">0</span>°</label>
          <input type="range" id="euler-x" min="-180" max="180" step="1" value="0"
                 style="width: 100%; accent-color: #ff0000;">
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Yaw (Y): <span id="euler-y-value">0</span>°</label>
          <input type="range" id="euler-y" min="-180" max="180" step="1" value="0"
                 style="width: 100%; accent-color: #00ff00;">
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Roll (Z): <span id="euler-z-value">0</span>°</label>
          <input type="range" id="euler-z" min="-180" max="180" step="1" value="0"
                 style="width: 100%; accent-color: #0000ff;">
        </div>
      </div>

      <!-- Quaternion 회전 -->
      <div id="quaternion-controls" style="margin-bottom: 20px; display: none;">
        <div style="margin-bottom: 10px; font-weight: bold; color: #ff00ff;">Quaternion Rotation</div>

        <div style="margin-bottom: 10px; font-size: 11px; color: #aaa;">
          회전축 (Axis)
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Axis X: <span id="quat-axis-x-value">0</span></label>
          <input type="range" id="quat-axis-x" min="-1" max="1" step="0.1" value="0"
                 style="width: 100%; accent-color: #ff0000;">
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Axis Y: <span id="quat-axis-y-value">1</span></label>
          <input type="range" id="quat-axis-y" min="-1" max="1" step="0.1" value="1"
                 style="width: 100%; accent-color: #00ff00;">
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Axis Z: <span id="quat-axis-z-value">0</span></label>
          <input type="range" id="quat-axis-z" min="-1" max="1" step="0.1" value="0"
                 style="width: 100%; accent-color: #0000ff;">
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Angle: <span id="quat-angle-value">0</span>°</label>
          <input type="range" id="quat-angle" min="0" max="360" step="1" value="0"
                 style="width: 100%; accent-color: #ffaa00;">
        </div>
      </div>

      <!-- LookAt -->
      <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 5px;">
        <div style="margin-bottom: 10px; font-weight: bold; color: #ffff00;">LookAt Target</div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Target X: <span id="target-x-value">0</span></label>
          <input type="range" id="target-x" min="-10" max="10" step="0.1" value="0"
                 style="width: 100%; accent-color: #ff0000;">
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Target Y: <span id="target-y-value">0</span></label>
          <input type="range" id="target-y" min="-10" max="10" step="0.1" value="0"
                 style="width: 100%; accent-color: #00ff00;">
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; margin-bottom: 3px; font-size: 11px;">Target Z: <span id="target-z-value">0</span></label>
          <input type="range" id="target-z" min="-10" max="10" step="0.1" value="0"
                 style="width: 100%; accent-color: #0000ff;">
        </div>

        <button id="apply-lookat" style="width: 100%; padding: 10px; background: #ffaa00; border: none; color: black; border-radius: 4px; cursor: pointer; font-family: monospace; font-weight: bold; margin-top: 5px;">
          LookAt 적용
        </button>
      </div>

      <!-- 리셋 버튼 -->
      <button id="reset-camera" style="width: 100%; padding: 10px; background: #f44336; border: none; color: white; border-radius: 4px; cursor: pointer; font-family: monospace; font-weight: bold;">
        Reset Camera
      </button>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // 모드 전환
    const modeEulerBtn = this.container.querySelector('#mode-euler') as HTMLButtonElement;
    const modeQuatBtn = this.container.querySelector('#mode-quaternion') as HTMLButtonElement;

    modeEulerBtn.addEventListener('click', () => {
      this.setMode('euler');
    });

    modeQuatBtn.addEventListener('click', () => {
      this.setMode('quaternion');
    });

    // 위치 슬라이더
    this.addSliderListener('pos-x', (value) => {
      const y = parseFloat((this.container.querySelector('#pos-y') as HTMLInputElement).value);
      const z = parseFloat((this.container.querySelector('#pos-z') as HTMLInputElement).value);
      this.callbacks.onPositionChange(value, y, z);
    });

    this.addSliderListener('pos-y', (value) => {
      const x = parseFloat((this.container.querySelector('#pos-x') as HTMLInputElement).value);
      const z = parseFloat((this.container.querySelector('#pos-z') as HTMLInputElement).value);
      this.callbacks.onPositionChange(x, value, z);
    });

    this.addSliderListener('pos-z', (value) => {
      const x = parseFloat((this.container.querySelector('#pos-x') as HTMLInputElement).value);
      const y = parseFloat((this.container.querySelector('#pos-y') as HTMLInputElement).value);
      this.callbacks.onPositionChange(x, y, value);
    });

    // Euler 회전
    this.addSliderListener('euler-x', (value) => {
      const y = parseFloat((this.container.querySelector('#euler-y') as HTMLInputElement).value);
      const z = parseFloat((this.container.querySelector('#euler-z') as HTMLInputElement).value);
      this.callbacks.onEulerRotationChange(value, y, z);
    });

    this.addSliderListener('euler-y', (value) => {
      const x = parseFloat((this.container.querySelector('#euler-x') as HTMLInputElement).value);
      const z = parseFloat((this.container.querySelector('#euler-z') as HTMLInputElement).value);
      this.callbacks.onEulerRotationChange(x, value, z);
    });

    this.addSliderListener('euler-z', (value) => {
      const x = parseFloat((this.container.querySelector('#euler-x') as HTMLInputElement).value);
      const y = parseFloat((this.container.querySelector('#euler-y') as HTMLInputElement).value);
      this.callbacks.onEulerRotationChange(x, y, value);
    });

    // Quaternion 회전
    const updateQuaternion = () => {
      const axisX = parseFloat((this.container.querySelector('#quat-axis-x') as HTMLInputElement).value);
      const axisY = parseFloat((this.container.querySelector('#quat-axis-y') as HTMLInputElement).value);
      const axisZ = parseFloat((this.container.querySelector('#quat-axis-z') as HTMLInputElement).value);
      const angle = parseFloat((this.container.querySelector('#quat-angle') as HTMLInputElement).value);

      // TODO(human): 축 벡터를 정규화하는 로직을 구현하세요
      // 힌트: THREE.Vector3를 사용하여 (axisX, axisY, axisZ)를 정규화하고
      // 정규화된 벡터와 라디안으로 변환한 각도를 콜백에 전달
    };

    this.addSliderListener('quat-axis-x', updateQuaternion);
    this.addSliderListener('quat-axis-y', updateQuaternion);
    this.addSliderListener('quat-axis-z', updateQuaternion);
    this.addSliderListener('quat-angle', updateQuaternion);

    // LookAt
    const applyLookAtBtn = this.container.querySelector('#apply-lookat') as HTMLButtonElement;
    applyLookAtBtn.addEventListener('click', () => {
      const x = parseFloat((this.container.querySelector('#target-x') as HTMLInputElement).value);
      const y = parseFloat((this.container.querySelector('#target-y') as HTMLInputElement).value);
      const z = parseFloat((this.container.querySelector('#target-z') as HTMLInputElement).value);
      this.callbacks.onLookAtTarget(x, y, z);
    });

    // Reset
    const resetBtn = this.container.querySelector('#reset-camera') as HTMLButtonElement;
    resetBtn.addEventListener('click', () => {
      this.callbacks.onReset();
    });
  }

  private addSliderListener(id: string, callback: (value: number) => void): void {
    const slider = this.container.querySelector(`#${id}`) as HTMLInputElement;
    const valueSpan = this.container.querySelector(`#${id}-value`) as HTMLSpanElement;

    slider.addEventListener('input', () => {
      const value = parseFloat(slider.value);
      valueSpan.textContent = value.toFixed(1);
      callback(value);
    });
  }

  private setMode(mode: RotationMode): void {
    this.mode = mode;
    this.callbacks.onModeChange(mode);

    const eulerControls = this.container.querySelector('#euler-controls') as HTMLDivElement;
    const quatControls = this.container.querySelector('#quaternion-controls') as HTMLDivElement;
    const modeEulerBtn = this.container.querySelector('#mode-euler') as HTMLButtonElement;
    const modeQuatBtn = this.container.querySelector('#mode-quaternion') as HTMLButtonElement;
    const modeDesc = this.container.querySelector('#mode-description') as HTMLDivElement;

    if (mode === 'euler') {
      eulerControls.style.display = 'block';
      quatControls.style.display = 'none';
      modeEulerBtn.style.background = '#4CAF50';
      modeQuatBtn.style.background = '#555';
      modeDesc.textContent = 'X, Y, Z 축 회전을 독립적으로 조작';
    } else {
      eulerControls.style.display = 'none';
      quatControls.style.display = 'block';
      modeEulerBtn.style.background = '#555';
      modeQuatBtn.style.background = '#4CAF50';
      modeDesc.textContent = '회전축과 각도로 회전 표현 (짐벌락 없음)';
    }
  }

  public updateInfo(info: string): void {
    // 추가 정보 표시용 (옵션)
  }
}
