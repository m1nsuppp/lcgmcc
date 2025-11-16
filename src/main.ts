import './style.css';
import { VectorVisualizer } from './app';

const canvas = document.querySelector<HTMLCanvasElement>('#canvas');

if (!canvas) {
  throw new Error('Canvas element not found');
}

new VectorVisualizer(canvas);
