import { useRef, useEffect } from 'react';
import * as THREE from 'three';

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}`;

const GridDistortion = ({
  grid = 15,
  mouse = 0.1,
  strength = 0.15,
  relaxation = 0.9,
  imageSrc,
  className = ''
}) => {
  const containerRef = useRef(null);
  const imageAspectRef = useRef(1);
  const cameraRef = useRef(null);
  const initialDataRef = useRef(null);
  // Refactor mouseState to use useRef for stable reference across renders
  const mouseStateRef = useRef({ x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, vX: 0, vY: 0 });

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Check if renderer.domElement is already appended
    if (!container.contains(renderer.domElement)) {
        container.appendChild(renderer.domElement);
    }

    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    camera.position.z = 2;
    cameraRef.current = camera;

    const uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null },
      uDataTexture: { value: null },
    };

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imageSrc, (loadedTexture) => {
      loadedTexture.minFilter = THREE.LinearFilter;
      imageAspectRef.current = loadedTexture.image.width / loadedTexture.image.height;
      uniforms.uTexture.value = loadedTexture;
      handleResize(); // Resize after texture loads
    });

    const size = grid;
    const data = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 255 - 125;
      data[i * 4 + 1] = Math.random() * 255 - 125;
    }

    initialDataRef.current = new Float32Array(data);

    const dataTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;
    uniforms.uDataTexture.value = dataTexture;

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader,
    });
    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !uniforms.uTexture.value) return; // Add texture check
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width === 0 || height === 0) return; // Avoid division by zero
      const containerAspect = width / height;
      const imageAspect = imageAspectRef.current;
      const camera = cameraRef.current;
      const texture = uniforms.uTexture.value;

      renderer.setSize(width, height);

      // Adjust camera frustum (remains the same)
      const frustumHeight = 1;
      const frustumWidth = frustumHeight * containerAspect;
      camera.left = -frustumWidth / 2;
      camera.right = frustumWidth / 2;
      camera.top = frustumHeight / 2;
      camera.bottom = -frustumHeight / 2;
      camera.updateProjectionMatrix();

      // === Final Corrected Cover Logic ===
      // Determine the scale factor needed to cover the larger dimension
      let scaleFactor;
      if (containerAspect > imageAspect) {
        // View is wider than image: Scale needed to match height
        scaleFactor = frustumHeight / 1; // Plane base height is 1
      } else {
        // View is taller/squarer than image: Scale needed to match width
        scaleFactor = frustumWidth / (1 * imageAspect); // Plane base width is 1, effective width is imageAspect
        // Correction: Plane base width is 1. We need to scale to match frustumWidth.
        scaleFactor = frustumWidth / 1; // Plane base width is 1
      }

      // Apply the scale factor, maintaining image aspect ratio
      const scaleX = scaleFactor * imageAspect;
      const scaleY = scaleFactor * 1;
      
      // We need the plane to be *at least* as big as the frustum in both dimensions.
      // Let's re-think the scale calculation simply:
      const scaleRatio = Math.max(frustumWidth / imageAspect, frustumHeight / 1);
      plane.scale.set(scaleRatio * imageAspect, scaleRatio * 1, 1);


      // Reset texture repeat/offset to default as scaling is handled by the plane geometry
      texture.repeat.set(1, 1);
      texture.offset.set(0, 0);
      // === End Final Corrected Cover Logic ===

      uniforms.resolution.value.set(width, height, 1, 1);
    };

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height; // Invert Y for texture coords
        // Update the ref's current value
        const prevX = mouseStateRef.current.prevX;
        const prevY = mouseStateRef.current.prevY;
        mouseStateRef.current.vX = x - prevX;
        mouseStateRef.current.vY = y - prevY;
        Object.assign(mouseStateRef.current, { x, y, prevX: x, prevY: y });
        // DEBUG LOG - REMOVE
        // console.log('Mouse Move:', { x: x.toFixed(2), y: y.toFixed(2), vX: mouseStateRef.current.vX.toFixed(2), vY: mouseStateRef.current.vY.toFixed(2) });
      };
    
      const handleMouseLeave = () => {
        if (!dataTexture.image?.data || !initialDataRef.current) return;
        // Reset data texture towards initial random state gradually
        const currentData = dataTexture.image.data;
        for (let i = 0; i < size * size * 4; i++) {
          currentData[i] += (initialDataRef.current[i] - currentData[i]) * 0.1; // Adjust relaxation
        }
        dataTexture.needsUpdate = true;
        // Reset the ref's current value
        Object.assign(mouseStateRef.current, { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, vX: 0, vY: 0 });
      };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    
    // Initial resize call
    setTimeout(handleResize, 100); // Delay slightly to ensure layout is stable

    let animationFrameId = null;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;

      // DEBUG LOG - REMOVE
      // if (Math.random() < 0.02) { // Log ~once per second at 60fps
      //     console.log('Animate Loop - Mouse State Ref:', {
      //         x: mouseStateRef.current.x.toFixed(2),
      //         y: mouseStateRef.current.y.toFixed(2),
      //         vX: mouseStateRef.current.vX.toFixed(2),
      //         vY: mouseStateRef.current.vY.toFixed(2)
      //     });
      // }

      if (!dataTexture.image?.data) return;

      const data = dataTexture.image.data;
      for (let i = 0; i < size * size; i++) {
        data[i * 4] *= relaxation;
        data[i * 4 + 1] *= relaxation;
      }

      // Read mouse state from the ref's current value
      const currentMouseState = mouseStateRef.current;
      const gridMouseX = size * currentMouseState.x;
      const gridMouseY = size * currentMouseState.y;
      const maxDist = size * mouse;
      const strengthFactor = strength * 100; // Pre-calculate

      for (let i = 0; i < size; i++) { // corresponds to Y in texture space
        for (let j = 0; j < size; j++) { // corresponds to X in texture space
          const dx = gridMouseX - j;
          const dy = gridMouseY - i;
          const distanceSq = dx * dx + dy * dy;
          const maxDistSq = maxDist * maxDist;

          if (distanceSq < maxDistSq) {
            const index = 4 * (j + size * i);
            const distance = Math.sqrt(distanceSq);
            // Avoid division by zero and excessive force at center
            const power = distance < 0.01 ? maxDist : Math.min(maxDist / distance, 10.0);
            
            // Apply velocity influence using current mouse state from ref
            const deltaX = strengthFactor * currentMouseState.vX * power;
            const deltaY = strengthFactor * currentMouseState.vY * power;
            data[index]     += deltaX;
            data[index + 1] += deltaY; // Ensure Y direction is consistent

            // DEBUG LOG - REMOVE
            // if (Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1) { 
            //     console.log(`Data modified at [${i},${j}]: dX=${deltaX.toFixed(2)}, dY=${deltaY.toFixed(2)}, power=${power.toFixed(2)}`);
            // }
          }
        }
      }

      dataTexture.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      // Remove the canvas from the DOM
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
          containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      dataTexture.dispose();
      texture.dispose(); // Dispose loaded texture
      scene.remove(plane); // Remove mesh from scene
      // console.log('GridDistortion cleaned up');
    };
  }, [grid, mouse, strength, relaxation, imageSrc]); // Dependencies

  return <div ref={containerRef} className={`w-full h-full overflow-hidden ${className}`} />;
};

export default GridDistortion; 