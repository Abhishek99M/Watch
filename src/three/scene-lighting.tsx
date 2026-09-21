import { extend } from '@react-three/fiber';
import { AmbientLight, DirectionalLight, HemisphereLight } from 'three';

extend({ AmbientLight, DirectionalLight, HemisphereLight });

export function SceneLighting() {
  return <>
    <ambientLight intensity={0.5} />
    <hemisphereLight args={['#f5f5f0', '#514431', 1.2]} />
    <directionalLight position={[3, 4, 5]} intensity={3} color="#fff0d1" />
    <directionalLight position={[-4, 1, -2]} intensity={2} color="#a8bed1" />
  </>;
}
