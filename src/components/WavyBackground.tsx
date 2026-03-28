import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uImageRes;
  varying vec2 vUv;

  void main() {
    vec2 s = uResolution;
    vec2 i = uImageRes;
    float rs = s.x / s.y;
    float ri = i.x / i.y;
    vec2 newUv = vUv;
    if (rs > ri) {
        newUv.y = (vUv.y - 0.5) * (ri / rs) + 0.5;
    } else {
        newUv.x = (vUv.x - 0.5) * (rs / ri) + 0.5;
    }

    float xDist = sin(newUv.y * 8.0 + uTime * 0.4) * 0.005;
    float yDist = cos(newUv.x * 6.0 + uTime * 0.3) * 0.005;
    vec2 distortedUv = newUv + vec2(xDist, yDist);
    distortedUv.x += sin(uTime * 0.1) * 0.002;
    distortedUv.y += cos(uTime * 0.15) * 0.002;

    vec4 color = texture2D(uTexture, distortedUv);
    
    // Optional subtle vignette to deepen the background focus
    float vignette = 1.0 - length(vUv - 0.5) * 0.5;
    color.rgb *= vignette;
    
    gl_FragColor = color;
  }
`;

interface WavyBackgroundProps {
  imageUrl: string;
}

export const WavyBackground: React.FC<WavyBackgroundProps> = ({ imageUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Texture loading
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        if (materialRef.current) {
          materialRef.current.uniforms.uImageRes.value.set(tex.image.width, tex.image.height);
        }
      }
    );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    // Geometry & Material
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uImageRes: { value: new THREE.Vector2(1920, 1080) }, // Default fallback
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const animate = (time: number) => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value = time * 0.001;
      }
      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(innerWidth, innerHeight);
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(innerWidth, innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (rendererRef.current && containerRef.current) {
        if (containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [imageUrl]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
