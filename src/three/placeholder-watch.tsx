import { extend } from '@react-three/fiber';
import { BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, TorusGeometry } from 'three';

extend({ BoxGeometry, CylinderGeometry, Group, Mesh, MeshStandardMaterial, TorusGeometry });

const gold = '#c8ad78';

/** Illustrative proportions only. All parts remain assembled and motionless. */
export function PlaceholderWatch() {
  return <group name="PlaceholderWatch" rotation={[0.16, -0.28, -0.16]} scale={0.67}>
    <mesh name="Case" rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.9, 0.88, 0.24, 64]} />
      <meshStandardMaterial color={gold} metalness={0.65} roughness={0.3} />
    </mesh>
    <mesh name="Caseback" position-z={-0.14} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.79, 0.79, 0.06, 48]} />
      <meshStandardMaterial color="#858580" metalness={0.65} roughness={0.45} />
    </mesh>
    <mesh name="Bezel" position-z={0.13}>
      <torusGeometry args={[0.81, 0.085, 12, 64]} />
      <meshStandardMaterial color={gold} metalness={0.7} roughness={0.24} />
    </mesh>
    <mesh name="Dial" position-z={0.13} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.75, 0.75, 0.025, 64]} />
      <meshStandardMaterial color="#202c2b" metalness={0.15} roughness={0.65} />
    </mesh>
    {Array.from({ length: 12 }, (_, index) =>
      <group key={index} rotation-z={-index * Math.PI / 6}>
        <mesh name={'HourMarker' + index} position={[0, 0.64, 0.16]}>
          <boxGeometry args={[index % 3 === 0 ? 0.045 : 0.025, 0.105, 0.015]} />
          <meshStandardMaterial color="#eee1c4" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>
    )}
    <group name="HourHand" rotation-z={Math.PI / 3}>
      <mesh position={[0, 0.19, 0.19]}>
        <boxGeometry args={[0.065, 0.46, 0.02]} />
        <meshStandardMaterial color="#eee1c4" metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
    <group name="MinuteHand" rotation-z={-Math.PI / 3}>
      <mesh position={[0, 0.26, 0.215]}>
        <boxGeometry args={[0.04, 0.6, 0.02]} />
        <meshStandardMaterial color="#eee1c4" metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
    <group name="SecondHand" rotation-z={Math.PI * 0.85}>
      <mesh position={[0, 0.22, 0.24]}>
        <boxGeometry args={[0.014, 0.68, 0.012]} />
        <meshStandardMaterial color="#cfa479" roughness={0.5} />
      </mesh>
    </group>
    <mesh name="HandPin" position-z={0.26} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.055, 0.055, 0.035, 20]} />
      <meshStandardMaterial color={gold} metalness={0.5} roughness={0.3} />
    </mesh>
    <mesh name="Crystal" position-z={0.28} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[0.745, 0.745, 0.012, 48]} />
      <meshStandardMaterial color="#e1ecea" transparent opacity={0.06} depthWrite={false} roughness={0.15} />
    </mesh>
    <mesh name="Crown" position={[0.99, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.115, 0.115, 0.21, 24]} />
      <meshStandardMaterial color={gold} metalness={0.6} roughness={0.35} />
    </mesh>
    {([-1, 1] as const).map(side => <group key={side} name={side === 1 ? 'UpperStrap' : 'LowerStrap'}>
      <mesh position={[0, side * 1.48, -0.045]}>
        <boxGeometry args={[0.74, 1.26, 0.13]} />
        <meshStandardMaterial color="#594332" roughness={0.95} />
      </mesh>
      {[-1, 1].map(edge => <mesh key={edge} name="Lug" position={[edge * 0.43, side * 0.86, -0.005]} rotation-z={-edge * side * 0.12}>
        <boxGeometry args={[0.13, 0.42, 0.2]} />
        <meshStandardMaterial color={gold} metalness={0.6} roughness={0.35} />
      </mesh>)}
    </group>)}
  </group>;
}
