import * as THREE from 'three';

/**
 * 두 벡터 사이의 각도를 라디안 단위로 계산
 */
export const calculateAngle = (v1: THREE.Vector3, v2: THREE.Vector3): number => {
  const dot = v1.dot(v2);
  const lengthProduct = v1.length() * v2.length();

  if (lengthProduct === 0) {
    return 0;
  }

  return Math.acos(Math.max(-1, Math.min(1, dot / lengthProduct)));
};

/**
 * 라디안을 도 단위로 변환
 */
export const radToDeg = (rad: number): number => {
  return (rad * 180) / Math.PI;
};

/**
 * 벡터를 고정된 소수점 형식으로 문자열 변환
 */
export const vectorToString = (v: THREE.Vector3, decimals = 2): string => {
  return `(${v.x.toFixed(decimals)}, ${v.y.toFixed(decimals)}, ${v.z.toFixed(decimals)})`;
};
