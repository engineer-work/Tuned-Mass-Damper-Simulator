import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Text, CubicBezierLine, Float } from '@react-three/drei';
import * as THREE from 'three';
import { SystemParams, SimulationState } from '../types';

// Declare R3F intrinsic elements to fix TS errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      cylinderGeometry: any;
      primitive: any;
      meshStandardMaterial: any;
      boxGeometry: any;
      gridHelper: any;
      ambientLight: any;
      directionalLight: any;
    }
  }
}

interface SceneProps {
  params: SystemParams;
  state: SimulationState;
}

// --- Materials ---
const CHROME_MAT = new THREE.MeshStandardMaterial({ 
  color: "#ffffff", 
  roughness: 0.1, 
  metalness: 0.95 
});

const BLACK_ANODIZED_MAT = new THREE.MeshStandardMaterial({ 
  color: "#151515", 
  roughness: 0.5, 
  metalness: 0.4 
});

const ALUMINUM_MAT = new THREE.MeshStandardMaterial({ 
  color: "#e2e8f0", 
  roughness: 0.3, 
  metalness: 0.6 
});

const SPRING_STEEL_MAT = new THREE.MeshStandardMaterial({
  color: "#cbd5e1",
  roughness: 0.2,
  metalness: 0.8
});

const BREADBOARD_MAT = new THREE.MeshStandardMaterial({ 
  color: "#0f172a", 
  roughness: 0.6, 
  metalness: 0.2 
});

const HOSE_COLOR = "#2563eb";

// --- Helper Components ---

// Flexible Helical Coupler (Voice Coil to Shaft)
const HelicalCoupler = ({ start, end, width = 0.025 }: { start: THREE.Vector3, end: THREE.Vector3, width?: number }) => {
    const len = start.distanceTo(end);
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    return (
        <group position={mid} rotation={[0, 0, Math.PI/2]}>
            <mesh castShadow>
                <cylinderGeometry args={[width/2, width/2, len, 16]} />
                <primitive object={ALUMINUM_MAT} />
            </mesh>
            {/* Visual cuts for helix */}
            <mesh scale={[1.05, 1, 1.05]}>
                <cylinderGeometry args={[width/2, width/2, len * 0.6, 8, 4, true]} />
                <meshStandardMaterial color="#333" wireframe opacity={0.3} transparent />
            </mesh>
        </group>
    )
}

// The K1 Spring is a thin rod parallel to the shaft in the diagram
// It connects a fixed post to a clamp on the shaft. It bends in an S-shape or arc when shaft moves.
const CantileverSpringK1 = ({ shaftPos }: { shaftPos: number }) => {
    // Geometry based on diagram
    const fixedPostPos = new THREE.Vector3(-0.25, 0.06, 0.12); 
    // The clamp on the shaft moves with shaftPos
    const clampInitialX = -0.15;
    const clampWorldX = clampInitialX + shaftPos;
    const clampConnectPos = new THREE.Vector3(clampWorldX, 0.06, 0.03); // Slightly offset from shaft center

    // We draw a bezier to show the bending rod
    // Start at fixed post, End at moving clamp
    
    return (
        <group>
             {/* Fixed Post Base */}
             <mesh position={[-0.25, 0.03, 0.12]} castShadow>
                <boxGeometry args={[0.04, 0.06, 0.04]} />
                <primitive object={BLACK_ANODIZED_MAT} />
             </mesh>
             {/* Post Top */}
             <mesh position={fixedPostPos} rotation={[0,0,Math.PI/2]}>
                <cylinderGeometry args={[0.01, 0.01, 0.02]} />
                <primitive object={ALUMINUM_MAT} />
             </mesh>

             {/* The Spring Rod */}
             <CubicBezierLine
                start={fixedPostPos}
                end={clampConnectPos}
                midA={[fixedPostPos.x + 0.05, fixedPostPos.y, fixedPostPos.z]} // Tangent out from post (along X)
                midB={[clampConnectPos.x - 0.05, clampConnectPos.y, clampConnectPos.z]} // Tangent into clamp (along X)
                color="#cbd5e1"
                lineWidth={2}
             />
        </group>
    )
}

const PneumaticSystem = () => {
    return (
        <group>
             {/* Air Bearing 1 Hose */}
             <CubicBezierLine
                start={[-0.20, 0.08, 0.02]}
                end={[-0.25, 0.02, 0.25]}
                midA={[-0.20, 0.15, 0.02]}
                midB={[-0.25, 0.10, 0.25]}
                color={HOSE_COLOR}
                lineWidth={3}
             />
              {/* Air Bearing 2 Hose */}
             <CubicBezierLine
                start={[0.15, 0.08, 0.02]}
                end={[0.10, 0.02, 0.25]}
                midA={[0.15, 0.15, 0.02]}
                midB={[0.10, 0.10, 0.25]}
                color={HOSE_COLOR}
                lineWidth={3}
             />
             {/* Manifold block visual */}
             <mesh position={[-0.07, 0.02, 0.25]}>
                <boxGeometry args={[0.4, 0.04, 0.04]} />
                <meshStandardMaterial color="#2563eb" opacity={0.3} transparent />
             </mesh>
        </group>
    )
}

const StaticEnvironment = () => {
    return (
        <group>
            {/* Breadboard */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <boxGeometry args={[1.4, 0.8, 0.02]} />
                <primitive object={BREADBOARD_MAT} />
            </mesh>
            <gridHelper args={[1.4, 28, 0x334155, 0x1e293b]} rotation={[-Math.PI/2, 0, 0]} position={[0, 0.005, 0]} />

            {/* Voice Coil Actuator (Left) */}
            <group position={[-0.55, 0.065, 0]}>
                {/* Heatsink Body */}
                <mesh rotation={[0, 0, -Math.PI/2]} castShadow>
                    <cylinderGeometry args={[0.065, 0.065, 0.14, 8]} />
                    <primitive object={BLACK_ANODIZED_MAT} />
                </mesh>
                {/* Inner coil visual */}
                <mesh rotation={[0, 0, -Math.PI/2]} position={[0.071, 0, 0]}>
                     <cylinderGeometry args={[0.05, 0.05, 0.01]} />
                     <meshStandardMaterial color="#b91c1c" />
                </mesh>
                {/* Mount */}
                <mesh position={[0, -0.065, 0]}>
                    <boxGeometry args={[0.02, 0.04, 0.1]} />
                    <primitive object={ALUMINUM_MAT} />
                </mesh>
            </group>

            {/* Air Bearing Blocks (Fixed) */}
            <group position={[-0.20, 0.06, 0]}>
                 <mesh castShadow>
                    <boxGeometry args={[0.08, 0.09, 0.08]} />
                    <primitive object={BLACK_ANODIZED_MAT} />
                 </mesh>
                 {/* Brass fitting */}
                 <mesh position={[0, 0.045, 0.02]}>
                    <cylinderGeometry args={[0.005, 0.005, 0.02]} />
                    <meshStandardMaterial color="#ca8a04" />
                 </mesh>
            </group>

            <group position={[0.15, 0.06, 0]}>
                 <mesh castShadow>
                    <boxGeometry args={[0.08, 0.09, 0.08]} />
                    <primitive object={BLACK_ANODIZED_MAT} />
                 </mesh>
                 <mesh position={[0, 0.045, 0.02]}>
                    <cylinderGeometry args={[0.005, 0.005, 0.02]} />
                    <meshStandardMaterial color="#ca8a04" />
                 </mesh>
            </group>

            {/* LVDT Sensor (Right) */}
            <group position={[0.6, 0.05, 0]}>
                 <mesh castShadow>
                    <boxGeometry args={[0.08, 0.06, 0.06]} />
                    <primitive object={BLACK_ANODIZED_MAT} />
                 </mesh>
                 <Text position={[0, 0.05, 0]} fontSize={0.02} color="#94a3b8">LVDT</Text>
            </group>
        </group>
    )
}

const MascotScene: React.FC<SceneProps> = ({ params, state }) => {
  const m1Ref = useRef<THREE.Group>(null);
  const m2Ref = useRef<THREE.Group>(null);

  // --- Geometry Constants ---
  const SHAFT_Y = 0.06;
  const SHAFT_RADIUS = 0.012;
  const SHAFT_MAIN_LEN = 0.8;
  
  // Positions
  // state.x1 is deviation from 0.
  // 0 is centered between the air bearings.
  const currentShaftX = state.x1;
  const tmdMountLocalX = 0.40; // End of shaft where TMD mounts
  
  // TMD Geometry
  const bladeHeight = 0.11;
  const bladeEquilibriumX = tmdMountLocalX; // Relative to shaft center
  
  // Dynamic Points for Curves
  // Blade Base: Attached to shaft. Moves with x1.
  const bladeBase = new THREE.Vector3(currentShaftX + tmdMountLocalX, SHAFT_Y, 0);
  
  // Blade Top: Attached to Mass 2. Moves with x2.
  // Visual X position of M2: centered at equilibrium + x2.
  // Equilibrium of M2 is at same X as mount: tmdMountLocalX.
  const m2WorldX = tmdMountLocalX + state.x2;
  const bladeTop = new THREE.Vector3(m2WorldX, SHAFT_Y + bladeHeight, 0);

  // LVDT Core (attached to shaft end)
  const lvdtCoreTip = new THREE.Vector3(currentShaftX + 0.45, SHAFT_Y, 0);
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0.5, 0.4, 0.8]} fov={45} />
      <OrbitControls target={[0.1, 0.1, 0]} maxPolarAngle={Math.PI / 2} minDistance={0.2} maxDistance={2.5} />
      <Environment preset="city" />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[1, 5, 2]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
      
      <StaticEnvironment />
      <PneumaticSystem />
      <CantileverSpringK1 shaftPos={state.x1} />

      {/* --- Dynamic System M1 (Shaft) --- */}
      <group position={[currentShaftX, 0, 0]}>
          {/* Main Shaft Chrome */}
          <mesh rotation={[0, 0, Math.PI/2]} position={[0, SHAFT_Y, 0]} castShadow>
              <cylinderGeometry args={[SHAFT_RADIUS, SHAFT_RADIUS, SHAFT_MAIN_LEN, 32]} />
              <primitive object={CHROME_MAT} />
          </mesh>

          {/* Shaft Collars (Visual details) */}
          <mesh rotation={[0, 0, Math.PI/2]} position={[-0.30, SHAFT_Y, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.015, 16]} />
              <primitive object={BLACK_ANODIZED_MAT} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI/2]} position={[-0.05, SHAFT_Y, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.015, 16]} />
              <primitive object={BLACK_ANODIZED_MAT} />
          </mesh>

          {/* K1 Spring Clamp */}
          <group position={[-0.15, SHAFT_Y, 0]}>
              <mesh rotation={[0, 0, Math.PI/2]}>
                  <cylinderGeometry args={[0.022, 0.022, 0.03, 16]} />
                  <primitive object={BLACK_ANODIZED_MAT} />
              </mesh>
              {/* Little nub for rod connection */}
              <mesh position={[0, 0, 0.022]}>
                   <boxGeometry args={[0.01, 0.01, 0.01]} />
                   <meshStandardMaterial color="#666" />
              </mesh>
          </group>

          {/* TMD Mount Clamp (at end) */}
          <group position={[tmdMountLocalX, SHAFT_Y, 0]}>
               <mesh rotation={[0, 0, Math.PI/2]}>
                  <cylinderGeometry args={[0.022, 0.022, 0.03, 16]} />
                  <primitive object={BLACK_ANODIZED_MAT} />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                   <boxGeometry args={[0.03, 0.02, 0.03]} />
                   <primitive object={ALUMINUM_MAT} />
              </mesh>
          </group>

          {/* LVDT Extension Rod */}
          <mesh rotation={[0, 0, Math.PI/2]} position={[0.45, SHAFT_Y, 0]}>
               <cylinderGeometry args={[0.003, 0.003, 0.1, 8]} />
               <meshStandardMaterial color="#94a3b8" />
          </mesh>
          
          <Text position={[0, 0.1, 0]} fontSize={0.03} color="#2563eb" anchorY="bottom">M1 (Shaft)</Text>
      </group>

      {/* --- Coupler (Connecting Voice Coil to Shaft) --- */}
      {/* Voice coil shaft end fixed at -0.48. Shaft start at x1 - 0.4. */}
      {/* We visualize the coupler stretching/compressing slightly */}
      <HelicalCoupler 
        start={new THREE.Vector3(-0.48, SHAFT_Y, 0)} 
        end={new THREE.Vector3(currentShaftX - 0.4, SHAFT_Y, 0)} 
      />

      {/* --- M2 (TMD) System --- */}
      
      {/* 1. The Blade (Spring K2) */}
      {/* Renders a bent metal strip from shaft clamp to mass block */}
      <CubicBezierLine
         start={bladeBase}
         end={bladeTop}
         midA={[bladeBase.x, bladeBase.y + 0.05, 0]} // Up vertical tangent
         midB={[bladeTop.x, bladeTop.y - 0.05, 0]}   // Down vertical tangent
         color="#cbd5e1"
         lineWidth={3}
      />
      {/* Blade Physical Mesh (Thin Box for volume) - Optional, line is usually cleaner for thin edges */}
      
      {/* 2. The Mass Blocks (M2) */}
      <group position={bladeTop}>
           {/* Two blocks clamped around the blade */}
           <group position={[0, 0.02, 0]}>
                {/* Front Block */}
                <mesh position={[0, 0, 0.025]} castShadow>
                     <boxGeometry args={[0.05, 0.06, 0.04]} />
                     <primitive object={BLACK_ANODIZED_MAT} />
                </mesh>
                {/* Back Block */}
                 <mesh position={[0, 0, -0.025]} castShadow>
                     <boxGeometry args={[0.05, 0.06, 0.04]} />
                     <primitive object={BLACK_ANODIZED_MAT} />
                </mesh>
                {/* Bolts connecting them ("The Eyes") */}
                 <mesh position={[0.015, 0.015, 0.05]} rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.004, 0.004, 0.11]} />
                    <meshStandardMaterial color="#e2e8f0" />
                 </mesh>
                 <mesh position={[-0.015, 0.015, 0.05]} rotation={[Math.PI/2, 0, 0]}>
                    <cylinderGeometry args={[0.004, 0.004, 0.11]} />
                    <meshStandardMaterial color="#e2e8f0" />
                 </mesh>
           </group>
           
           <Text position={[0, 0.08, 0]} fontSize={0.03} color="#dc2626" anchorY="bottom">M2 (TMD)</Text>
      </group>

    </>
  );
};

export const Mascot3D: React.FC<SceneProps> = (props) => {
  return (
    <div className="viewer-3d">
        <div className="viewer-hint">
            <span className="dot dot-green pulse" style={{width: '0.5rem', height: '0.5rem'}}></span>
            3D Interactive • Drag to Rotate
        </div>
        <Canvas shadows dpr={[1, 2]}>
            <MascotScene {...props} />
        </Canvas>
    </div>
  );
};