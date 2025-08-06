/**
 * THREE.JS HERO V2.5 - Enhanced Water Surface with Caustics & Bubbles
 * Premium features: Caustic overlays, bubble particles, mouse parallax
 */

import * as THREE from 'three';

class WaterHero {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.water = null;
    this.logo = null;
    this.bubbleSystem = null;
    this.causticMesh = null;
    this.clock = new THREE.Clock();
    this.mouse = new THREE.Vector2();
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    this.bubbles = [];
    this.parallaxStrength = 0.1;
    
    this.init();
  }

  init() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x104e8b, 0.1, 200);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 15, 30);
    this.camera.lookAt(0, 0, 0);

    // Renderer setup with performance optimizations
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: window.innerWidth > 768,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Create water surface
    this.createWater();
    
    // Create caustic overlay
    this.createCaustics();
    
    // Create bubble particle system
    this.createBubbleSystem();
    
    // Create floating logo
    this.createLogo();
    
    // Add lighting
    this.addLights();
    
    // Start animation loop
    this.animate();
    
    // Add event listeners
    this.addEventListeners();
  }

  createWater() {
    // Water geometry - optimized grid
    const waterGeometry = new THREE.PlaneGeometry(200, 200, 64, 64);
    
    // Water shader material
    const waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        mouse: { value: this.mouse },
        color1: { value: new THREE.Color(0x104e8b) }, // Bayou blue
        color2: { value: new THREE.Color(0x2f5933) }, // Cypress green
        waveHeight: { value: 0.8 },
        waveSpeed: { value: 0.5 }
      },
      vertexShader: `
        uniform float time;
        uniform float waveHeight;
        uniform float waveSpeed;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float wave(vec2 st, float amplitude, float frequency, float speed) {
          return amplitude * sin(frequency * length(st) - time * speed);
        }

        void main() {
          vUv = uv;
          vec3 pos = position;
          
          // Create multiple wave layers for realistic water movement
          float wave1 = wave(uv * 4.0, waveHeight * 0.5, 2.0, waveSpeed);
          float wave2 = wave(uv * 8.0 + vec2(time * 0.1), waveHeight * 0.3, 3.0, waveSpeed * 1.2);
          float wave3 = wave(uv * 16.0 - vec2(time * 0.05), waveHeight * 0.2, 4.0, waveSpeed * 0.8);
          
          pos.z += wave1 + wave2 + wave3;
          
          // Calculate normal for lighting
          vec3 tangent = vec3(1.0, 0.0, 0.0);
          vec3 bitangent = vec3(0.0, 1.0, 0.0);
          
          float delta = 0.01;
          float heightL = wave((uv + vec2(-delta, 0.0)) * 4.0, waveHeight * 0.5, 2.0, waveSpeed);
          float heightR = wave((uv + vec2(delta, 0.0)) * 4.0, waveHeight * 0.5, 2.0, waveSpeed);
          float heightD = wave((uv + vec2(0.0, -delta)) * 4.0, waveHeight * 0.5, 2.0, waveSpeed);
          float heightU = wave((uv + vec2(0.0, delta)) * 4.0, waveHeight * 0.5, 2.0, waveSpeed);
          
          tangent.z = heightR - heightL;
          bitangent.z = heightU - heightD;
          vNormal = normalize(cross(tangent, bitangent));
          
          vPosition = pos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform vec2 mouse;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        float fresnel(vec3 viewDirection, vec3 normal, float power) {
          return pow(1.0 - abs(dot(viewDirection, normal)), power);
        }

        void main() {
          vec2 st = vUv;
          
          // Create ripples from center and mouse position
          vec2 center = vec2(0.5, 0.5);
          float distFromCenter = distance(st, center);
          float ripple1 = sin(distFromCenter * 20.0 - time * 3.0) * 0.1;
          
          vec2 mouseNorm = mouse * 0.5 + 0.5;
          float distFromMouse = distance(st, mouseNorm);
          float ripple2 = sin(distFromMouse * 15.0 - time * 4.0) * 0.05;
          
          // Combine ripples
          float ripples = ripple1 + ripple2;
          
          // Water color mixing based on depth and fresnel
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnelEffect = fresnel(viewDirection, vNormal, 2.0);
          
          vec3 deepWater = mix(color1, color2, st.x + ripples);
          vec3 shallowWater = mix(color2, vec3(0.4, 0.8, 1.0), fresnelEffect);
          
          vec3 finalColor = mix(deepWater, shallowWater, fresnelEffect);
          
          // Add some sparkle/reflection
          float sparkle = pow(max(0.0, dot(vNormal, normalize(vec3(1.0, 1.0, 1.0)))), 32.0);
          finalColor += sparkle * 0.3;
          
          // Fade edges for infinity pool effect
          float edgeFade = smoothstep(0.0, 0.2, min(min(st.x, 1.0 - st.x), min(st.y, 1.0 - st.y)));
          
          gl_FragColor = vec4(finalColor, 0.8 * edgeFade);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.water = new THREE.Mesh(waterGeometry, waterMaterial);
    this.water.rotation.x = -Math.PI / 2;
    this.water.position.y = -2;
    this.water.receiveShadow = true;
    this.scene.add(this.water);
  }

  createCaustics() {
    // Caustic overlay plane positioned above water
    const causticGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    
    const causticMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        causticStrength: { value: 0.4 },
        causticScale: { value: 8.0 },
        causticSpeed: { value: 0.8 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float causticStrength;
        uniform float causticScale;
        uniform float causticSpeed;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        // Caustic function based on underwater light refraction
        float caustic(vec2 uv, float time) {
          vec2 p = uv * causticScale;
          
          for(int i = 1; i < 5; i++) {
            vec2 newp = p;
            newp.x += 0.6 / float(i) * sin(float(i) * p.y + time * causticSpeed + 0.3 * float(i));
            newp.y += 0.6 / float(i) * sin(float(i) * p.x + time * causticSpeed + 0.3 * float(i));
            p = newp;
          }
          
          vec3 col = vec3(0.5 * sin(3.0 * p.x) + 0.5, 0.5 * sin(3.0 * p.y) + 0.5, sin(p.x + p.y));
          return length(col);
        }

        void main() {
          vec2 st = vUv;
          
          // Create moving caustic patterns
          float caustic1 = caustic(st + vec2(time * 0.1, 0.0), time);
          float caustic2 = caustic(st + vec2(0.0, time * 0.15), time + 1.0);
          
          // Combine caustics
          float causticPattern = (caustic1 + caustic2) * 0.5;
          
          // Create subtle ripple distortion
          vec2 ripple = vec2(
            sin(st.x * 20.0 + time * 2.0) * 0.01,
            sin(st.y * 15.0 + time * 1.5) * 0.01
          );
          
          causticPattern = caustic(st + ripple, time) * causticStrength;
          
          // Blue-green caustic color
          vec3 causticColor = vec3(0.2, 0.6, 0.8) * causticPattern;
          
          // Fade out towards edges
          float edgeFade = smoothstep(0.0, 0.3, min(min(st.x, 1.0 - st.x), min(st.y, 1.0 - st.y)));
          
          gl_FragColor = vec4(causticColor, causticPattern * edgeFade * 0.6);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.causticMesh = new THREE.Mesh(causticGeometry, causticMaterial);
    this.causticMesh.position.set(0, 8, -10);
    this.causticMesh.rotation.x = -Math.PI / 6;
    this.scene.add(this.causticMesh);
  }

  createBubbleSystem() {
    // Create bubble particles with geometry instancing for performance
    const bubbleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const bubbleMaterial = new THREE.MeshPhongMaterial({
      color: 0xaaffff,
      transparent: true,
      opacity: 0.4,
      shininess: 100
    });

    // Create bubble instances
    for (let i = 0; i < 15; i++) {
      const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
      
      // Random starting positions
      bubble.position.set(
        (Math.random() - 0.5) * 80,
        -10 - Math.random() * 20,
        (Math.random() - 0.5) * 80
      );
      
      // Random bubble properties
      bubble.userData = {
        speed: 0.5 + Math.random() * 0.8,
        wobble: Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        scale: 0.5 + Math.random() * 1.5
      };
      
      bubble.scale.setScalar(bubble.userData.scale);
      bubble.castShadow = true;
      
      this.bubbles.push(bubble);
      this.scene.add(bubble);
    }
  }

  createLogo() {
    // Create floating logo geometry (simple ring representing pool)
    const logoGroup = new THREE.Group();
    
    // Outer ring
    const outerRing = new THREE.RingGeometry(3, 3.5, 32);
    const outerMaterial = new THREE.MeshPhongMaterial({
      color: 0xf0b35f,
      transparent: true,
      opacity: 0.9,
      shininess: 100
    });
    const outerMesh = new THREE.Mesh(outerRing, outerMaterial);
    outerMesh.castShadow = true;
    logoGroup.add(outerMesh);
    
    // Inner ring
    const innerRing = new THREE.RingGeometry(2, 2.3, 24);
    const innerMaterial = new THREE.MeshPhongMaterial({
      color: 0x104e8b,
      transparent: true,
      opacity: 0.8,
      shininess: 80
    });
    const innerMesh = new THREE.Mesh(innerRing, innerMaterial);
    innerMesh.position.z = 0.1;
    innerMesh.castShadow = true;
    logoGroup.add(innerMesh);
    
    // Center dot
    const centerGeometry = new THREE.CircleGeometry(0.5, 16);
    const centerMaterial = new THREE.MeshPhongMaterial({
      color: 0x2f5933,
      transparent: true,
      opacity: 0.9
    });
    const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial);
    centerMesh.position.z = 0.2;
    centerMesh.castShadow = true;
    logoGroup.add(centerMesh);
    
    logoGroup.position.set(0, 5, 0);
    logoGroup.rotation.x = -Math.PI / 6; // Slight angle
    this.logo = logoGroup;
    this.scene.add(this.logo);
  }

  addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
    
    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 25);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);
    
    // Rim light for dramatic effect
    const rimLight = new THREE.DirectionalLight(0xf0b35f, 0.3);
    rimLight.position.set(-30, 20, -20);
    this.scene.add(rimLight);
    
    // Point light for logo highlighting
    const logoLight = new THREE.PointLight(0xffffff, 0.5, 20);
    logoLight.position.set(0, 10, 5);
    logoLight.castShadow = true;
    this.scene.add(logoLight);
  }

  addEventListeners() {
    // Mouse movement for interactive ripples and parallax tilt
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // Apply mouse parallax tilt (max 10 degrees)
      const tiltX = this.mouse.y * this.parallaxStrength;
      const tiltY = -this.mouse.x * this.parallaxStrength;
      
      // Apply tilt to scene elements
      if (this.water) {
        this.water.rotation.x = -Math.PI / 2 + tiltX;
        this.water.rotation.z = tiltY;
      }
      
      if (this.causticMesh) {
        this.causticMesh.rotation.x = -Math.PI / 6 + tiltX * 0.5;
        this.causticMesh.rotation.z = tiltY * 0.5;
      }
      
      if (this.logo) {
        this.logo.rotation.x = -Math.PI / 6 + tiltX * 0.3;
        this.logo.rotation.z = tiltY * 0.3;
      }
    });

    // Resize handler
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });

    // Scroll parallax
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.0005;
      
      if (this.camera) {
        this.camera.position.y = 15 + rate * 10;
        this.camera.lookAt(0, rate * 5, 0);
      }
      
      if (this.logo) {
        this.logo.rotation.y += 0.001;
      }
    });
  }

  onWindowResize() {
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Update water shader resolution
    if (this.water) {
      this.water.material.uniforms.resolution.value.x = window.innerWidth;
      this.water.material.uniforms.resolution.value.y = window.innerHeight;
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    const elapsedTime = this.clock.getElapsedTime();
    
    // Update water shader
    if (this.water) {
      this.water.material.uniforms.time.value = elapsedTime;
      this.water.material.uniforms.mouse.value = this.mouse;
    }
    
    // Update caustic overlay
    if (this.causticMesh) {
      this.causticMesh.material.uniforms.time.value = elapsedTime;
    }
    
    // Animate bubble particles (10fps for low CPU usage)
    if (elapsedTime % 0.1 < 0.016) {
      this.bubbles.forEach((bubble, index) => {
        const userData = bubble.userData;
        
        // Move bubble upward
        bubble.position.y += userData.speed * 0.3;
        
        // Add horizontal wobble
        bubble.position.x += Math.sin(elapsedTime * 2 + userData.phase) * userData.wobble;
        bubble.position.z += Math.cos(elapsedTime * 1.5 + userData.phase) * userData.wobble;
        
        // Reset bubble when it reaches the top
        if (bubble.position.y > 25) {
          bubble.position.set(
            (Math.random() - 0.5) * 80,
            -10 - Math.random() * 20,
            (Math.random() - 0.5) * 80
          );
        }
        
        // Subtle size variation
        const sizeVariation = 1 + Math.sin(elapsedTime + userData.phase) * 0.1;
        bubble.scale.setScalar(userData.scale * sizeVariation);
      });
    }
    
    // Animate logo floating
    if (this.logo) {
      this.logo.position.y = 5 + Math.sin(elapsedTime * 0.5) * 1.5;
      this.logo.rotation.y += 0.005;
    }
    
    // Subtle camera movement
    this.camera.position.x = Math.sin(elapsedTime * 0.1) * 2;
    this.camera.lookAt(0, 0, 0);
    
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // Public method to reduce quality for performance
  setLowQuality() {
    if (this.water) {
      this.water.material.uniforms.waveHeight.value = 0.4;
      this.water.material.uniforms.waveSpeed.value = 0.3;
    }
    
    // Reduce caustic intensity on mobile
    if (this.causticMesh) {
      this.causticMesh.material.uniforms.causticStrength.value = 0.2;
      this.causticMesh.material.uniforms.causticScale.value = 4.0;
    }
    
    // Remove some bubbles on mobile for performance
    const bubblestoRemove = this.bubbles.splice(8);
    bubblestoRemove.forEach(bubble => {
      this.scene.remove(bubble);
      bubble.geometry.dispose();
      bubble.material.dispose();
    });
    
    this.renderer.setPixelRatio(1);
  }

  // Clean up resources
  dispose() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.water) {
      this.water.geometry.dispose();
      this.water.material.dispose();
    }
    if (this.causticMesh) {
      this.causticMesh.geometry.dispose();
      this.causticMesh.material.dispose();
    }
    if (this.bubbles) {
      this.bubbles.forEach(bubble => {
        bubble.geometry.dispose();
        bubble.material.dispose();
      });
    }
    if (this.logo) {
      this.logo.children.forEach(child => {
        child.geometry.dispose();
        child.material.dispose();
      });
    }
  }
}

// Initialize when DOM is ready
function initWaterHero() {
  // Check for WebGL support
  if (!window.WebGLRenderingContext) {
    console.warn('WebGL not supported, skipping 3D hero');
    return;
  }

  // Performance check - reduce quality on mobile
  const isMobile = window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
  
  try {
    const waterHero = new WaterHero();
    
    if (isMobile) {
      waterHero.setLowQuality();
    }
    
    // Store reference for cleanup
    window.waterHero = waterHero;
    
  } catch (error) {
    console.warn('Failed to initialize 3D hero:', error);
    // Fallback: hide canvas and show static background
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
      canvas.style.display = 'none';
    }
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWaterHero);
} else {
  initWaterHero();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.waterHero) {
    window.waterHero.dispose();
  }
});

export { WaterHero };