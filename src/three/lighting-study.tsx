import { extend } from '@react-three/fiber';
import { AmbientLight, DirectionalLight, HemisphereLight, IcosahedronGeometry, Mesh, MeshStandardMaterial } from 'three';

extend({ AmbientLight, DirectionalLight, HemisphereLight, IcosahedronGeometry, Mesh, MeshStandardMaterial });

/** A small lighting reference, deliberately not a placeholder watch model. */
export function LightingStudy() {
  return <>
    <ambientLight intensity={0.5} />
    <hemisphereLight args={['#f5f5f0', '#514431', 1.2]} />
    <directionalLight position={[3, 4, 5]} intensity={3} color="#fff0d1" />
    <directionalLight position={[-4, 1, -2]} intensity={2} color="#a8bed1" />
    <mesh rotation={[0.2, 0.4, 0.1]}>
      <icosahedronGeometry args={[1.15, 0]} />
      <meshStandardMaterial color="#e2c692" roughness={0.5} metalness={0.25} flatShading />
    </mesh>
  </>;
}
