"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { cloudVertex, cloudFragment } from "@/components/earth/earthShaders";

// Sun direction (drives the scene light + atmosphere + cloud shading).
const SUN = new THREE.Vector3(5, 2.2, 4).normalize();
const TILT = 0.41; // ~23.5° axial tilt
const _q = new THREE.Quaternion();
const _sun = new THREE.Vector3();

function Earth({ health }: { health: number }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);

  // Real Blue Marble surface maps (JPG/RGB — no alpha ambiguity).
  const [day, normal, specular] = useTexture([
    "/textures/earth/day.jpg",
    "/textures/earth/normal.jpg",
    "/textures/earth/specular.jpg",
  ]);

  useMemo(() => {
    day.colorSpace = THREE.SRGBColorSpace; // color map
    // normal & specular are data maps — keep linear (default).
    for (const t of [day, normal, specular]) {
      t.anisotropy = 8; // crisp at the limb (fixes "pixely")
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = true;
      t.needsUpdate = true;
    }
  }, [day, normal, specular]);

  // Procedural cloud shader.
  const cloudMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: cloudVertex,
        fragmentShader: cloudFragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uHealth: { value: 0.6 },
          uTime: { value: 0 },
          uLightDir: { value: new THREE.Vector3().copy(SUN) },
        },
      }),
    [],
  );

  const target = Math.min(1, Math.max(0, health / 100));
  const targetRef = useRef(target);
  targetRef.current = target;

  useFrame((_, delta) => {
    const d = Math.min(0.05, delta);
    const ease = Math.min(1, d * 1.4);
    cloudMat.uniforms.uHealth.value += (targetRef.current - cloudMat.uniforms.uHealth.value) * ease;
    cloudMat.uniforms.uTime.value += d;

    if (earthRef.current) earthRef.current.rotation.y += d * 0.045;
    if (cloudRef.current) {
      cloudRef.current.rotation.y += d * 0.062;
      // Sun in cloud-local space (handles tilt + spin) so cloud shading matches.
      cloudRef.current.getWorldQuaternion(_q).invert();
      _sun.copy(SUN).applyQuaternion(_q);
      cloudMat.uniforms.uLightDir.value.copy(_sun);
    }
  });

  return (
    <>
      <group rotation={[0, 0, TILT]}>
        <mesh ref={earthRef}>
          <sphereGeometry args={[1, 128, 128]} />
          <meshPhongMaterial
            map={day}
            specularMap={specular}
            normalMap={normal}
            normalScale={[0.8, 0.8]}
            specular={new THREE.Color("#2b3b50")}
            shininess={16}
          />
        </mesh>
        <mesh ref={cloudRef} material={cloudMat} scale={1.01}>
          <sphereGeometry args={[1, 128, 128]} />
        </mesh>
      </group>
    </>
  );
}

export default function LivingEarth({
  health,
  interactive = true,
  className,
}: {
  health: number;
  interactive?: boolean;
  className?: string;
}) {
  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      // Pull back a touch in the large interactive view so the globe stays
      // framed inside its card; the tight 3.2 keeps the small embeds full.
      camera={{ position: [0, 0, interactive ? 3.8 : 3.2], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05;
      }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.32} />
      <directionalLight position={[SUN.x * 5, SUN.y * 5, SUN.z * 5]} intensity={2.1} />
      <directionalLight
        position={[-SUN.x * 5, -SUN.y * 5, -SUN.z * 5]}
        intensity={0.18}
        color="#3a6bd6"
      />
      <Earth health={health} />
      <OrbitControls
        enablePan={false}
        enableZoom={interactive}
        enableRotate={interactive}
        minDistance={interactive ? 2.6 : 1.7}
        maxDistance={interactive ? 6 : 5}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.5}
        autoRotate={!interactive}
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
}
