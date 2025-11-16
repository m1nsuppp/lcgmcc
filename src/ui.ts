import type * as THREE from 'three';
import { vectorToString, calculateAngle, radToDeg } from './utils';

export class UIPanel {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'info-panel';
    this.setupStyles();
    document.body.appendChild(this.container);
  }

  private setupStyles(): void {
    this.container.style.position = 'absolute';
    this.container.style.top = '20px';
    this.container.style.left = '20px';
    this.container.style.padding = '20px';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.container.style.color = '#ffffff';
    this.container.style.fontFamily = 'monospace';
    this.container.style.fontSize = '14px';
    this.container.style.borderRadius = '8px';
    this.container.style.minWidth = '300px';
    this.container.style.lineHeight = '1.6';
    this.container.style.zIndex = '1000';
  }

  public update(
    vectorA: THREE.Vector3,
    vectorB: THREE.Vector3,
    sum: THREE.Vector3,
    dot: number,
    cross: THREE.Vector3
  ): void {
    const angle = calculateAngle(vectorA, vectorB);

    this.container.innerHTML = `
      <div style="margin-bottom: 15px;">
        <h3 style="margin: 0 0 10px 0; color: #4CAF50;">3D Vector Visualizer</h3>
        <p style="margin: 5px 0; font-size: 12px; color: #aaa;">
          Drag the spheres to modify vectors
        </p>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="color: #ff4444; font-weight: bold;">Vector A: ${vectorToString(vectorA)}</div>
        <div style="color: #888; font-size: 12px;">Length: ${vectorA.length().toFixed(3)}</div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="color: #4444ff; font-weight: bold;">Vector B: ${vectorToString(vectorB)}</div>
        <div style="color: #888; font-size: 12px;">Length: ${vectorB.length().toFixed(3)}</div>
      </div>

      <hr style="border: none; border-top: 1px solid #444; margin: 15px 0;" />

      <div style="margin-bottom: 12px;">
        <div style="color: #ffff00; font-weight: bold;">A + B = ${vectorToString(sum)}</div>
        <div style="color: #888; font-size: 12px;">Length: ${sum.length().toFixed(3)}</div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="color: #00ffff; font-weight: bold;">Dot Product (A · B)</div>
        <div style="color: #fff; margin-left: 10px;">Value: ${dot.toFixed(3)}</div>
        <div style="color: #888; font-size: 12px; margin-left: 10px;">
          Angle: ${radToDeg(angle).toFixed(2)}°
        </div>
      </div>

      <div style="margin-bottom: 12px;">
        <div style="color: #ff00ff; font-weight: bold;">Cross Product (A × B)</div>
        <div style="color: #fff; margin-left: 10px;">${vectorToString(cross)}</div>
        <div style="color: #888; font-size: 12px; margin-left: 10px;">
          Length: ${cross.length().toFixed(3)}
        </div>
        <div style="color: #888; font-size: 12px; margin-left: 10px;">
          Perpendicular to both A and B
        </div>
      </div>
    `;
  }
}
