import './style.css';
import { VectorVisualizer } from './app';
import { CameraPlayground } from './camera-playground';

const canvas = document.querySelector<HTMLCanvasElement>('#canvas');

if (!canvas) {
  throw new Error('Canvas element not found');
}

// URL 파라미터로 앱 선택 (예: ?app=camera)
const params = new URLSearchParams(window.location.search);
const appType = params.get('app') || 'vector';

if (appType === 'camera') {
  new CameraPlayground(canvas);
} else {
  new VectorVisualizer(canvas);
}

// 앱 선택 메뉴 추가
const menu = document.createElement('div');
menu.style.position = 'absolute';
menu.style.top = '20px';
menu.style.left = '50%';
menu.style.transform = 'translateX(-50%)';
menu.style.zIndex = '2000';
menu.style.display = 'flex';
menu.style.gap = '10px';

const createButton = (text: string, href: string, active: boolean) => {
  const button = document.createElement('a');
  button.href = href;
  button.textContent = text;
  button.style.padding = '10px 20px';
  button.style.backgroundColor = active ? '#4CAF50' : '#333';
  button.style.color = 'white';
  button.style.textDecoration = 'none';
  button.style.borderRadius = '5px';
  button.style.fontFamily = 'monospace';
  button.style.fontSize = '14px';
  button.style.fontWeight = 'bold';
  button.style.transition = 'background 0.3s';

  button.addEventListener('mouseenter', () => {
    if (!active) {
      button.style.backgroundColor = '#555';
    }
  });

  button.addEventListener('mouseleave', () => {
    if (!active) {
      button.style.backgroundColor = '#333';
    }
  });

  return button;
};

menu.appendChild(createButton('Vector Visualizer', '?app=vector', appType === 'vector'));
menu.appendChild(createButton('Camera Playground', '?app=camera', appType === 'camera'));

document.body.appendChild(menu);
