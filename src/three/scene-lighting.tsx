import { extend } from '@react-three/fiber';
import { AmbientLight, DirectionalLight, HemisphereLight, RectAreaLight } from 'three';

import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
RectAreaLightUniformsLib.init();
extend({ AmbientLight, DirectionalLight, HemisphereLight, RectAreaLight });

export function SceneLighting({ studio = false }: { studio?: boolean }) {
  if (studio) return <>
    <hemisphereLight args={['#f3f0e7', '#1c2530', 0.12]} />
    <rectAreaLight color="#fff7eb" intensity={0.3} width={3} height={5} position={[-2, 3, 5]} rotation={[-0.4, -0.3, 0]} />
    <rectAreaLight color="#e8f0ff" intensity={0.35} width={1} height={4} position={[3, 1, 2]} rotation={[0, 0.9, 0]} />
  </>;
  return <>
    <ambientLight intensity={0.5} />
    <hemisphereLight args={['#f5f5f0', '#514431', 1.2]} />
    <directionalLight position={[3, 4, 5]} intensity={3} color="#fff0d1" />
    <directionalLight position={[-4, 1, -2]} intensity={2} color="#a8bed1" />
  </>;
}
