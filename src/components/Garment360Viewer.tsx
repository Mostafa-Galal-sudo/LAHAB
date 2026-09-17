import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCw,
  Play,
  Pause,
  Sparkles,
  Layers,
  Box,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ProductItem, Theme } from '../types';
import { Language } from '../translations';
import type { ModelPresentation } from '../../shared/pageSchema';

interface Garment360ViewerProps {
  products: ProductItem[];
  language: Language;
  theme?: Theme;
  modelUrl?: string;
  schemaContent?: {
    badge: string;
    title: string;
    description: string;
    model: ModelPresentation;
  };
}

interface LoadedModelMeta {
  fileName: string;
  fileSize: string;
  vertexCount: number;
  polyCount: number;
  isPersistentAsset?: boolean;
}

export const Garment360Viewer: React.FC<Garment360ViewerProps> = ({
  products,
  language,
  theme = 'navy',
  modelUrl = '/assets/models/lahab_drop01_hoodie.obj',
  schemaContent,
}) => {
  const isArabic = language === 'ar';
  const modelPresentation = schemaContent?.model;
  const selectedProduct = products[0] || {
    id: 'hoodie-01',
    weight: '520 GSM FLEECE',
  };

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // 3D Engine State
  const [angle, setAngle] = useState<number>(0);
  const angleRef = useRef<number>(0);
  const [isAutoOrbit, setIsAutoOrbit] = useState<boolean>(schemaContent?.model.autoRotate ?? true);
  const [loadedModelMeta, setLoadedModelMeta] = useState<LoadedModelMeta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [activeModelMode, setActiveModelMode] = useState<'persistent' | 'architectural'>('persistent');

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rotationGroupRef = useRef<THREE.Group | null>(null);
  const persistentModelGroupRef = useRef<THREE.Group | null>(null);
  const defaultGeometryGroupRef = useRef<THREE.Group | null>(null);
  const reqAnimationRef = useRef<number | null>(null);
  const isInteractingRef = useRef<boolean>(false);
  const pointerStartRef = useRef<{ x: number; angle: number }>({ x: 0, angle: 0 });

  // Update angle helper function
  const updateAngle = useCallback((newAngle: number) => {
    angleRef.current = newAngle;
    setAngle(newAngle);
  }, []);

  // Perspective angle descriptors
  const getAngleDescriptor = (deg: number) => {
    if (deg >= 335 || deg < 25) {
      return {
        name: isArabic ? '0° المنظور الأمامي الكامل' : '0° DIRECT FRONT DRAPE',
        note: isArabic
          ? 'تطريز الصدر بالخيوط الذهبية وهيكل القلنسوة المزدوج الثابت بوزن 520 جرام وجيب الكنغر المزدوج'
          : 'Matte gold chest embroidery, reinforced collar and rigid zero-slump hood with seamless kangaroo pouch',
      };
    }
    if (deg >= 25 && deg < 80) {
      return {
        name: isArabic ? '45° زاوية ميل الكتف المنسدل' : '45° THREE-QUARTER DROP',
        note: isArabic
          ? 'انسدال الكتف بمقدار 9 سم مع خياطة مزدوجة معززة لمنع التمدد وقوام بوكسي عريض'
          : '9cm calculated drop-shoulder posture with double-needle locked armhole seams and boxy drape',
      };
    }
    if (deg >= 80 && deg < 140) {
      return {
        name: isArabic ? '90° المنظور الجانبي المعماري' : '90° ARCHITECTURAL PROFILE',
        note: isArabic
          ? 'وقوف النسيج بعيداً عن الجذع لمنح القوام مظهراً مستقيماً وقوياً دون التصاق'
          : 'Structured stand-off from torso eliminating fabric cling across abdomen',
      };
    }
    if (deg >= 140 && deg < 230) {
      return {
        name: isArabic ? '180° المنظور الخلفي وحروف اللهب' : '180° FULL BACK CALLIGRAPHY',
        note: isArabic
          ? 'طباعة حروف اللهب الأرشيفية عريضة النطاق عبر كامل الظهر والأكتاف'
          : 'Full-span flame calligraphy print across shoulder blades with micro-embossed grain',
      };
    }
    return {
      name: isArabic ? '270° منظور زاوية التناغم الحركي' : '270° DYNAMIC REVERSE PROFILE',
      note: isArabic
        ? 'توازن فتحة الخصر المضلعة بسماكة 3 سم مع انسياب الأكمام وتدرج المعصم'
        : 'Sleeve cuff stacking geometry and elasticated heavy ribbed hem tension',
    };
  };

  const currentDescriptor = getAngleDescriptor(angle);

  useEffect(() => {
    setIsAutoOrbit(modelPresentation?.autoRotate ?? true);
  }, [modelPresentation?.autoRotate]);

  const mountObject = useCallback((
    obj: THREE.Object3D,
    targetGroup: THREE.Group,
    meta: Omit<LoadedModelMeta, 'vertexCount' | 'polyCount'>,
    preserveAuthoredMaterials: boolean
  ) => {
    let vertexCount = 0;
    let polyCount = 0;
    const fallbackColor = modelPresentation?.materialColor ?? '#0F1C2D';
    const fleeceMaterial = new THREE.MeshStandardMaterial({ color: fallbackColor, roughness: 0.88, metalness: 0.12, bumpScale: 0.05 });
    obj.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (!preserveAuthoredMaterials) mesh.material = fleeceMaterial;
      else if (modelPresentation?.materialColor) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mesh.material = materials.map((material) => {
          if (!(material instanceof THREE.MeshStandardMaterial) || material.map) return material;
          const clone = material.clone();
          clone.color.set(modelPresentation.materialColor!);
          return clone;
        });
      }
      if (mesh.geometry) {
        mesh.geometry.computeVertexNormals();
        const positions = mesh.geometry.attributes.position;
        if (positions) vertexCount += positions.count;
        polyCount += mesh.geometry.index ? mesh.geometry.index.count / 3 : (positions?.count ?? 0) / 3;
      }
    });
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const normalized = 2.4 / (Math.max(size.x, size.y, size.z) || 1);
    const scale = modelPresentation?.scale ?? [1, 1, 1];
    const position = modelPresentation?.position ?? [0, 0, 0];
    const rotation = modelPresentation?.rotation ?? [0, 0, 0];
    obj.scale.set(normalized * scale[0], normalized * scale[1], normalized * scale[2]);
    obj.position.set(-center.x * normalized + position[0], -center.y * normalized - 0.05 + position[1], -center.z * normalized + position[2]);
    obj.rotation.set(rotation[0], rotation[1], rotation[2]);
    targetGroup.clear();
    targetGroup.add(obj);
    setLoadedModelMeta({ ...meta, vertexCount: Math.round(vertexCount), polyCount: Math.round(polyCount) });
  }, [modelPresentation]);

  // Helper to parse and mount an OBJ string into a specified Three.js Group
  const parseAndMountObj = useCallback((
    objText: string,
    targetGroup: THREE.Group,
    fileName: string,
    fileSizeKB: string,
    isPersistent: boolean = false
  ) => {
    const loader = new OBJLoader();
    const obj = loader.parse(objText);

    // Add gold embroidery emblem highlight onto the chest of the persistent model
    if (isPersistent) {
      const emblemGeo = new THREE.PlaneGeometry(0.32, 0.12);
      const emblemMat = new THREE.MeshStandardMaterial({
        color: 0xd8a065,
        roughness: 0.25,
        metalness: 0.95,
      });
      const emblemMesh = new THREE.Mesh(emblemGeo, emblemMat);
      emblemMesh.position.set(0, 0.15, 0.38);
      obj.add(emblemMesh);
    }

    mountObject(obj, targetGroup, { fileName, fileSize: `${fileSizeKB} KB`, isPersistentAsset: isPersistent }, false);
  }, [mountObject]);

  // Function to load the persistent repository 3D model asset
  const loadPersistent3DAsset = useCallback(async () => {
    setIsModelLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(modelUrl);
      if (!response.ok) {
        throw new Error(`Failed to load persistent model (${response.status})`);
      }
      if (persistentModelGroupRef.current) {
        const fileName = modelUrl.split('/').pop() || 'lahab_drop01_hoodie.obj';
        const sizeKB = ((Number(response.headers.get('content-length')) || 0) / 1024).toFixed(1);
        if (modelPresentation?.format === 'glb') {
          const buffer = await response.arrayBuffer();
          const gltf = await new Promise<Awaited<ReturnType<GLTFLoader['parseAsync']>>>((resolve, reject) => {
            new GLTFLoader().parse(buffer, '', resolve, reject);
          });
          mountObject(gltf.scene, persistentModelGroupRef.current, { fileName, fileSize: `${sizeKB} KB`, isPersistentAsset: true }, true);
        } else {
          parseAndMountObj(await response.text(), persistentModelGroupRef.current, fileName, sizeKB || '34.8', true);
        }
        persistentModelGroupRef.current.visible = true;
      }
      if (defaultGeometryGroupRef.current) {
        defaultGeometryGroupRef.current.visible = false;
      }

      setActiveModelMode('persistent');
      setIsModelLoading(false);
    } catch (err: any) {
      console.warn('Persistent 3D asset fetch fallback to studio mannequin:', err);
      // Fallback gracefully to architectural mannequin
      if (defaultGeometryGroupRef.current && (schemaContent?.model.assetId !== 'asset-model-hoodie-obj')) {
        try {
          const fallback = await fetch('/assets/models/lahab_drop01_hoodie.obj');
          if (fallback.ok && persistentModelGroupRef.current) {
            parseAndMountObj(await fallback.text(), persistentModelGroupRef.current, 'lahab_drop01_hoodie.obj', '34.8', true);
            persistentModelGroupRef.current.visible = true;
            defaultGeometryGroupRef.current.visible = false;
            setActiveModelMode('persistent');
            setLoadError('Selected model unavailable; showing bundled compatibility model.');
            setIsModelLoading(false);
            return;
          }
        } catch { /* use mannequin */ }
      }
      if (defaultGeometryGroupRef.current) {
        defaultGeometryGroupRef.current.visible = schemaContent?.showFallbackMannequin ?? true;
      }
      setActiveModelMode('architectural');
      setIsModelLoading(false);
    }
  }, [modelPresentation?.format, modelUrl, mountObject, parseAndMountObj, schemaContent?.model, schemaContent?.showFallbackMannequin]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 460;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(modelPresentation?.backgroundColor ?? '#0A1422');
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const cameraPosition = modelPresentation?.cameraPosition ?? [0, 0.4, 4.2];
    camera.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and shadow support
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    rendererRef.current = renderer;

    container.replaceChildren();
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting System
    const preset = modelPresentation?.lightingPreset ?? 'studio';
    const levels = preset === 'dramatic' ? [0.35, 3, 2.4, 0.25] : preset === 'softbox' ? [1.2, 1.45, 0.9, 1] : preset === 'neutral' ? [1, 1.5, 1.1, 0.8] : [0.85, 2.2, 1.8, 0.7];
    const ambientLight = new THREE.AmbientLight(preset === 'neutral' ? 0xffffff : 0xd8a065, levels[0]);
    scene.add(ambientLight);

    // Key Light (warm studio white)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, levels[1]);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Rim / Contour Light (cool architectural highlight)
    const rimLight = new THREE.DirectionalLight(0x7ea8d6, levels[2]);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Bottom Fill Light
    const fillLight = new THREE.DirectionalLight(0xd8a065, levels[3]);
    fillLight.position.set(0, -3, 2);
    scene.add(fillLight);

    // 5. Main Rotation Group
    const rotGroup = new THREE.Group();
    scene.add(rotGroup);
    rotationGroupRef.current = rotGroup;

    // Subgroup for persistent repository .obj model
    const persistentGroup = new THREE.Group();
    rotGroup.add(persistentGroup);
    persistentModelGroupRef.current = persistentGroup;

    // Subgroup for architectural studio mannequin & wireframe pedestal
    const defaultGroup = new THREE.Group();
    rotGroup.add(defaultGroup);
    defaultGeometryGroupRef.current = defaultGroup;

    // Build Architectural Studio Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.35, 0.12, 48);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0d1929,
      roughness: 0.4,
      metalness: 0.6,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.4;
    pedestal.receiveShadow = true;
    rotGroup.add(pedestal);

    // Golden Accent Ring around Pedestal
    const ringGeo = new THREE.TorusGeometry(1.28, 0.015, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd8a065,
      roughness: 0.2,
      metalness: 0.9,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.33;
    rotGroup.add(ring);

    // Architectural Torso Silhouette Mannequin (Fallback Display)
    const torsoShape = new THREE.Shape();
    torsoShape.moveTo(-0.7, -0.9);
    torsoShape.lineTo(0.7, -0.9);
    torsoShape.lineTo(0.85, 0.35);
    torsoShape.lineTo(0.5, 0.85);
    torsoShape.lineTo(0.25, 0.95);
    torsoShape.lineTo(-0.25, 0.95);
    torsoShape.lineTo(-0.5, 0.85);
    torsoShape.lineTo(-0.85, 0.35);
    torsoShape.closePath();

    const extrudeSettings = {
      depth: 0.45,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };
    const torsoGeo = new THREE.ExtrudeGeometry(torsoShape, extrudeSettings);
    torsoGeo.center();
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x112136,
      roughness: 0.85,
      metalness: 0.1,
    });
    const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    torsoMesh.position.y = -0.1;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    defaultGroup.add(torsoMesh);

    // Gold Chest Callout Plate on Mannequin
    const plateGeo = new THREE.PlaneGeometry(0.35, 0.12);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0xd8a065,
      roughness: 0.3,
      metalness: 0.85,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 0.25, 0.33);
    defaultGroup.add(plate);

    // Double Ring Orbit Markers
    const outerRingGeo = new THREE.RingGeometry(1.6, 1.62, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xd8a065,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = -1.38;
    rotGroup.add(outerRing);

    // Handle Window Resize via ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Render loop using angleRef to prevent stale state freeze!
    const animate = () => {
      reqAnimationRef.current = requestAnimationFrame(animate);

      if (rotationGroupRef.current) {
        rotationGroupRef.current.rotation.y = THREE.MathUtils.degToRad(angleRef.current);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Automatically load the persistent repository 3D asset on mount!
    loadPersistent3DAsset();

    return () => {
      if (reqAnimationRef.current) cancelAnimationFrame(reqAnimationRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, [loadPersistent3DAsset, modelPresentation]);

  // Synchronize 3D scene background with active theme
  useEffect(() => {
    if (sceneRef.current) {
      const bgColor = modelPresentation?.backgroundColor ?? (theme === 'desert' ? 0xE9E2D2 : 0x0a1422);
      sceneRef.current.background = new THREE.Color(bgColor);
    }
  }, [modelPresentation?.backgroundColor, theme]);

  // Auto Orbit Ticker using requestAnimationFrame logic
  useEffect(() => {
    if (!isAutoOrbit) return;

    let lastTime = performance.now();
    let frameId: number;

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      if (delta >= 40) {
        const speed = Math.max(0.01, Math.abs(modelPresentation?.autoRotateSpeed ?? 1));
        const next = (angleRef.current + speed) % 360;
        updateAngle(next);
        lastTime = currentTime;
      }
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoOrbit, modelPresentation?.autoRotateSpeed, updateAngle]);

  // Switch back to the persistent drop 01 hoodie model
  const handleSwitchToPersistent = () => {
    if (defaultGeometryGroupRef.current) {
      defaultGeometryGroupRef.current.visible = false;
    }
    if (persistentModelGroupRef.current && persistentModelGroupRef.current.children.length > 0) {
      persistentModelGroupRef.current.visible = true;
      setActiveModelMode('persistent');
      setLoadedModelMeta({
        fileName: 'lahab_drop01_hoodie.obj',
        fileSize: '34.8 KB',
        vertexCount: 565,
        polyCount: 1044,
        isPersistentAsset: true,
      });
    } else {
      loadPersistent3DAsset();
    }
    setLoadError(null);
  };

  // Switch to minimal studio mannequin
  const handleSwitchToMannequin = () => {
    if (persistentModelGroupRef.current) {
      persistentModelGroupRef.current.visible = false;
    }
    if (defaultGeometryGroupRef.current) {
      defaultGeometryGroupRef.current.visible = true;
    }
    setActiveModelMode('architectural');
    setLoadedModelMeta(null);
    setLoadError(null);
  };

  // Zoom camera in/out
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const currentZ = cameraRef.current.position.z;
    const delta = direction === 'in' ? -0.5 : 0.5;
    const nextZ = Math.min(Math.max(currentZ + delta, 2.2), 6.5);
    cameraRef.current.position.z = nextZ;
  };

  // Interactive mouse/touch dragging on canvas
  const handlePointerDown = (clientX: number) => {
    if (schemaContent?.allowManualOrbit === false) return;
    isInteractingRef.current = true;
    pointerStartRef.current = { x: clientX, angle: angleRef.current };
    if (isAutoOrbit) setIsAutoOrbit(false);
  };

  const handlePointerMove = (clientX: number) => {
    if (schemaContent?.allowManualOrbit === false) return;
    if (!isInteractingRef.current) return;
    const deltaX = clientX - pointerStartRef.current.x;
    const newAngle = ((pointerStartRef.current.angle + Math.round(deltaX * 0.75)) % 360 + 360) % 360;
    updateAngle(newAngle);
  };

  const handlePointerUp = () => {
    isInteractingRef.current = false;
  };

  return (
    <section
      id="drape-360"
      className="bg-[#09111C] text-[#E2E6E8] px-4 sm:px-8 lg:px-16 py-24 border-t border-[#E2E6E8]/20 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 border border-[#D8A065]/40 px-3 py-1 bg-[#132238]/60 text-xs font-heading text-[#D8A065] tracking-widest uppercase">
            <RotateCw className="w-3.5 h-3.5" />
            <span>{schemaContent?.badge || (isArabic ? 'دراسة القوام بزاوية 360 درجة' : '360° INTERACTIVE GARMENT STUDIO')}</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl text-[#D8A065] uppercase tracking-wide">
            {schemaContent?.title || (isArabic ? 'مجسم الهودي الحقيقي 3D' : 'Real 3D Garment Studio')}
          </h2>

          <p className="font-body text-xs sm:text-sm text-[#E2E6E8]/70 leading-relaxed">
            {schemaContent?.description || (isArabic
              ? 'مجسم ثلاثي الأبعاد حقيقي مدمج لقصة الهودي البوكسي 520 جرام، مع إمكانية فحص تفاصيل النسيج والتدوير بزاوية 360 درجة بحرية.'
              : 'Persistent repository 3D asset featuring the authentic 520 GSM boxy drop-shoulder cut, with live interactive 360° orbit controls and PBR studio lighting.')}
          </p>
        </div>

        {/* 360 3D Visual Stage with Luxury Pedestal Styling */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass-card-luxury border-2 border-[#D8A065]/50 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle,rgba(216,160,101,0.15),transparent_70%)] pointer-events-none" />
          {/* Left / Center Stage: Three.js Canvas Container */}
          <div
            className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-105 sm:min-h-125 select-none rounded-lg overflow-hidden border border-[#E2E6E8]/20 bg-[#0A1422] transition-colors"
            onMouseDown={(e) => handlePointerDown(e.clientX)}
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches[0]) handlePointerDown(e.touches[0].clientX);
            }}
            onTouchMove={(e) => {
              if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
            }}
            onTouchEnd={handlePointerUp}
          >
            {/* Native Three.js WebGL Mount */}
            <div ref={canvasContainerRef} className={`w-full h-full min-h-105 sm:min-h-125 ${schemaContent?.allowManualOrbit === false ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`} />

            {/* Floating Top Bar with Orbit Status & Angle */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
              <div className="bg-[#0D1929]/90 border border-[#D8A065] px-3 py-1 font-mono text-xs text-[#D8A065] shadow-lg flex items-center gap-2 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#D8A065] animate-ping" />
                <span>{angle}° ORBIT PERSPECTIVE</span>
              </div>

              {loadedModelMeta ? (
                <div className="bg-[#132238]/90 border border-[#22c55e]/60 px-3 py-1 font-mono text-[11px] text-[#22c55e] flex items-center gap-1.5 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D8A065]" />
                  <span>
                    3D GARMENT MESH ({loadedModelMeta.polyCount} polys)
                  </span>
                </div>
              ) : (
                <div className="bg-[#132238]/90 border border-[#D8A065]/40 px-3 py-1 font-mono text-[11px] text-[#E2E6E8]/80 backdrop-blur-md">
                  <span>STUDIO MANNEQUIN</span>
                </div>
              )}
            </div>

            {/* Loading Indicator */}
            {isModelLoading && (
              <div className="absolute inset-0 bg-[#0D1929]/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                <div className="w-10 h-10 border-2 border-[#D8A065] border-t-transparent rounded-full animate-spin mb-3" />
                <span className="font-mono text-xs text-[#D8A065] tracking-widest uppercase">
                  {isArabic ? 'جاري معالجة مجسم 3D...' : 'Loading 3D Geometry Asset...'}
                </span>
              </div>
            )}

            {/* Error Toast */}
            {loadError && (
              <div className="absolute top-14 inset-x-4 bg-red-950/90 border border-red-500/60 p-3 text-xs font-body text-red-200 flex items-center justify-between z-20 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{loadError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLoadError(null)}
                  className="text-xs text-red-300 hover:text-white px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Controls Toolbar: Auto-Orbit, Zoom & Switch Mode */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
              <div className="pointer-events-auto flex items-center gap-1.5 bg-[#0D1929]/95 border border-[#E2E6E8]/20 p-1">
                <button
                  type="button"
                  onClick={() => handleZoom('in')}
                  className="p-1.5 text-[#E2E6E8] hover:text-[#D8A065] hover:bg-[#132238] transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom('out')}
                  className="p-1.5 text-[#E2E6E8] hover:text-[#D8A065] hover:bg-[#132238] transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>

                {/* Persistent Model Reload Shortcut */}
                <button
                  type="button"
                  onClick={handleSwitchToPersistent}
                  className={`p-1.5 transition-colors cursor-pointer ${
                    activeModelMode === 'persistent'
                      ? 'text-[#D8A065] bg-[#132238]'
                      : 'text-[#E2E6E8]/70 hover:text-[#D8A065] hover:bg-[#132238]'
                  }`}
                  title={isArabic ? 'إعادة تحميل مجسم الهودي الأصلي' : 'Reload Drop 01 Hoodie 3D'}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pointer-events-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAutoOrbit(!isAutoOrbit)}
                  className="flex items-center gap-2 border border-[#D8A065] bg-[#0D1929]/95 text-[#D8A065] hover:bg-[#D8A065] hover:text-[#0D1929] px-3.5 py-1.5 text-xs font-heading font-bold tracking-wider uppercase transition-all cursor-pointer shadow-md"
                >
                  {isAutoOrbit ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>
                    {isAutoOrbit
                      ? isArabic
                        ? 'إيقاف'
                        : 'PAUSE ORBIT'
                      : isArabic
                      ? 'دوران'
                      : 'AUTO ORBIT'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Model Specs & Angle Scrubber Controls */}
          <div className="lg:col-span-5 space-y-5">
            {/* Model Info Card */}
            <div className="border border-[#D8A065] bg-[#132238]/80 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#D8A065]">
                  <Box className="w-4 h-4" />
                  <span className="font-heading text-xs uppercase tracking-wider">
                    {isArabic ? 'المجسم ثلاثي الأبعاد المدمج' : 'PERSISTENT 3D MODEL ASSET'}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#D8A065] border border-[#D8A065]/40 px-2 py-0.5">
                  AUTHENTIC 3D
                </span>
              </div>

              <p className="font-body text-xs text-[#E2E6E8]/80 leading-relaxed">
                {isArabic
                  ? 'مجسم ثلاثي الأبعاد حقيقي مدمج يجسد هودي LAHAB DROP 01 بقصة البوكسي المنسدلة، مع محرك إضاءة وتطريز ذهبي على الصدر.'
                  : '3D garment asset rendered with calibrated drop-shoulder physics and matte fleece light absorption.'}
              </p>

              {/* Action Buttons: Toggle Model View */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSwitchToPersistent}
                  className={`px-3.5 py-2 text-xs font-heading font-bold cursor-pointer inline-flex items-center gap-1.5 border transition-all ${
                    activeModelMode === 'persistent'
                      ? 'bg-[#D8A065] text-[#0D1929] border-[#D8A065]'
                      : 'bg-[#0D1929] text-[#E2E6E8] border-[#E2E6E8]/30 hover:border-[#D8A065]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'هودي DROP 01 الأصلي' : 'DROP 01 HOODIE'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSwitchToMannequin}
                  className={`px-3 py-2 text-xs font-mono cursor-pointer border transition-all ${
                    activeModelMode === 'architectural'
                      ? 'bg-[#D8A065] text-[#0D1929] border-[#D8A065]'
                      : 'bg-[#0D1929] text-[#E2E6E8]/70 border-[#E2E6E8]/20 hover:text-white'
                  }`}
                >
                  {isArabic ? 'المانيكان المعماري' : 'Studio Mannequin'}
                </button>
              </div>

              {/* Active Model Tech Specs */}
              {loadedModelMeta && (
                <div className="mt-3 p-3 bg-[#0D1929] border border-[#22c55e]/40 text-xs font-mono space-y-1 text-[#E2E6E8]">
                  <div className="flex justify-between">
                    <span className="text-[#D8A065]">File Size:</span>
                    <span>{loadedModelMeta.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#D8A065]">Vertices / Polygons:</span>
                    <span>
                      {loadedModelMeta.vertexCount.toLocaleString()} / {loadedModelMeta.polyCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Angle Slider */}
            <div className="space-y-3 p-5 border border-[#E2E6E8]/20 bg-[#132238]/40">
              <div className="flex items-center justify-between font-heading text-xs">
                <span className="text-[#D8A065] uppercase tracking-wider">
                  {isArabic ? 'تحكم زاوية الرؤية (0° - 360°)' : 'ROTATION DEGREE SCRUBBER'}
                </span>
                <span className="font-mono text-base font-bold text-[#E2E6E8]">
                  {angle}°
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={359}
                value={angle}
                onChange={(e) => {
                  if (isAutoOrbit) setIsAutoOrbit(false);
                  updateAngle(Number(e.target.value));
                }}
                className="w-full accent-[#D8A065] bg-[#0D1929] h-3 rounded-lg cursor-pointer border border-[#E2E6E8]/20"
              />

              {/* Quick Preset Cardinal Angles */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[
                  { deg: 0, label: '0° Front' },
                  { deg: 90, label: '90° Side' },
                  { deg: 180, label: '180° Back' },
                  { deg: 270, label: '270° Side' },
                ].map((item) => (
                  <button
                    key={item.deg}
                    type="button"
                    onClick={() => {
                      if (isAutoOrbit) setIsAutoOrbit(false);
                      updateAngle(item.deg);
                    }}
                    className={`py-1.5 px-2 text-[11px] font-mono border transition-all cursor-pointer ${
                      Math.abs(angle - item.deg) < 15
                        ? 'border-[#D8A065] bg-[#D8A065] text-[#0D1929] font-bold'
                        : 'border-[#E2E6E8]/20 bg-[#0D1929] text-[#E2E6E8]/70 hover:border-[#D8A065]/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Angle Technical Breakdown Card */}
            <div className="border border-[#D8A065]/40 bg-[#132238]/60 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[#D8A065] text-xs font-heading uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>{currentDescriptor.name}</span>
              </div>

              <p className="font-body text-xs sm:text-sm text-[#E2E6E8] leading-relaxed">
                {currentDescriptor.note}
              </p>

              <div className="pt-3 border-t border-[#E2E6E8]/15 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-heading text-[10px] text-[#D8A065] uppercase block">
                    {isArabic ? 'وزن القماش' : 'GRAMMAGE DENSITY'}
                  </span>
                  <span className="font-mono text-[#E2E6E8] font-bold">
                    {selectedProduct.weight}
                  </span>
                </div>
                <div>
                  <span className="font-heading text-[10px] text-[#D8A065] uppercase block">
                    {isArabic ? 'حالة القصة' : 'DRAPE STABILITY'}
                  </span>
                  <span className="font-mono text-[#E2E6E8] font-bold">
                    100% NON-COLLAPSING
                  </span>
                </div>
              </div>
            </div>

            {/* Micro Callout Badge */}
            <div className="flex items-center gap-3 p-3 bg-[#0D1929] border border-[#E2E6E8]/15 text-xs text-[#E2E6E8]/80 font-body">
              <Sparkles className="w-4 h-4 text-[#D8A065] shrink-0" />
              <span>
                {isArabic
                  ? 'مجسم ثلاثي الأبعاد جاهز ومحمّل مسبقاً بدقة هندسية ويدعم فحص التفاصيل وزاوية الإضاءة بحرية.'
                  : 'Pre-loaded persistent 3D geometry with double-ring rotation pedestal and real-time studio light reflection.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Garment360Viewer;
