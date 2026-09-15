/**
 * MEDIA TÉCNICA EN DESARROLLO DE SOFTWARE
 * laptop3d.js - Escena 3D WebGL con Three.js
 * 
 * Animación en bucle 3D de una laptop elegante y futurista abriéndose suavemente.
 * Al abrirse, una interfaz holográfica translúcida se proyecta desde la pantalla hacia arriba,
 * mostrando bloques de código interactivos, conexiones de bases de datos animadas y elementos web dinámicos.
 * Acabados mate y detalles en vidrio (glassmorphism), iluminación ambiental cyberpunk sutil o tech corporativo limpio,
 * cámara con rotación orbital lenta de 360 grados, estética profesional y educativa.
 */

(function () {
  'use strict';

  let container;

  // Variables principales de Three.js
  let scene, camera, renderer;
  let laptopBase, screenHingeGroup, screenMesh, screenDisplay;
  let HINGE_ANGLE_CLOSED, HINGE_ANGLE_OPEN;
  let hologramGroup, codePlane, dbGroup, beamMesh, particlesSystem;
  let animatedNodes = [];
  let clock = new THREE.Clock();

  // Variables de interacción y rotación orbital
  let isUserInteracting = false;
  let mouseX = 0, mouseY = 0;
  let targetRotationX = 0.25;
  let targetRotationY = 0;
  let currentRotationX = 0.25;
  let currentRotationY = 0;
  let autoOrbitSpeed = 0.005;

  function startWhenReady() {
    if (typeof THREE === 'undefined') {
      setTimeout(startWhenReady, 50);
      return;
    }
    container = document.getElementById('laptop-3d-canvas');
    if (!container) {
      setTimeout(startWhenReady, 50);
      return;
    }
    init();
    animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startWhenReady);
  } else {
    startWhenReady();
  }

  function init() {
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // 1. Escena
    scene = new THREE.Scene();

    // 2. Cámara
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.8);
    camera.lookAt(0, 0.6, 0);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Luces
    createLighting();

    // 5. Laptop 3D Procedural
    createLaptop();

    // 6. Proyección Holográfica
    createHologram();

    // 7. Base de suelo Tech & Partículas
    createTechFloorAndParticles();

    // 8. Eventos de interacción
    setupEvents();
  }

  /* ==========================================================================
     ILUMINACIÓN
     ========================================================================== */
  function createLighting() {
    // Luz ambiental azul profunda
    const ambientLight = new THREE.AmbientLight(0x0e2454, 1.2);
    scene.add(ambientLight);

    // Luz principal corporativa blanca/azulada
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.6);
    mainLight.position.set(4, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // Rim light cyan (acento cyberpunk sutil)
    const rimLight = new THREE.DirectionalLight(0x00d2ff, 1.8);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // Luz puntual dentro del holograma que proyecta luz reactiva sobre la laptop
    const holoPointLight = new THREE.PointLight(0x00d2ff, 2.2, 5);
    holoPointLight.position.set(0, 1.6, 0.2);
    scene.add(holoPointLight);
  }

  /* ==========================================================================
     MODELO PROCEDURAL DE LA LAPTOP FUTURISTA
     ========================================================================== */
  function createLaptop() {
    const baseGroup = new THREE.Group();

    // Material mate azul marino / grafito para el chasis
    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x0c1a36,
      metalness: 0.85,
      roughness: 0.28
    });

    // Material de borde cyan brillante
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x00d2ff,
      emissive: 0x00d2ff,
      emissiveIntensity: 0.6,
      roughness: 0.2
    });

    // 1. Base inferior
    const baseGeom = new THREE.BoxGeometry(3.6, 0.14, 2.4);
    laptopBase = new THREE.Mesh(baseGeom, chassisMaterial);
    laptopBase.position.y = 0.07;
    laptopBase.receiveShadow = true;
    laptopBase.castShadow = true;
    baseGroup.add(laptopBase);

    // Borde brillante en los laterales de la base
    const baseEdgeGeom = new THREE.BoxGeometry(3.62, 0.02, 2.42);
    const baseEdge = new THREE.Mesh(baseEdgeGeom, accentMaterial);
    baseEdge.position.y = 0.07;
    baseGroup.add(baseEdge);

    // 2. Teclado Chiclet Retroiluminado
    const keyboardCanvas = document.createElement('canvas');
    keyboardCanvas.width = 512;
    keyboardCanvas.height = 256;
    const ctx = keyboardCanvas.getContext('2d');

    // Fondo del teclado
    ctx.fillStyle = '#060d1f';
    ctx.fillRect(0, 0, 512, 256);

    // Dibujar teclas con brillo cyan
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#0a1738';

    const rows = 5;
    const cols = 14;
    const keyW = 30;
    const keyH = 26;
    const gap = 5;
    const startX = 14;
    const startY = 18;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let x = startX + c * (keyW + gap);
        let y = startY + r * (keyH + gap);
        let w = keyW;

        // Teclas especiales más anchas
        if (r === 4 && c === 4) w = keyW * 4.5;
        if (r === 4 && c > 4 && c < 8) continue;

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, w, keyH, 4);
        } else {
          ctx.rect(x, y, w, keyH);
        }
        ctx.fill();
        ctx.stroke();

        // Pequeño texto simulado
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 5, y + 6, 8, 2);
        ctx.fillStyle = '#0a1738';
      }
    }

    const keyboardTexture = new THREE.CanvasTexture(keyboardCanvas);
    const keyboardMat = new THREE.MeshStandardMaterial({
      map: keyboardTexture,
      roughness: 0.4,
      metalness: 0.3,
      emissive: 0x004488,
      emissiveIntensity: 0.4
    });

    const keyboardMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 1.2),
      keyboardMat
    );
    keyboardMesh.rotation.x = -Math.PI / 2;
    keyboardMesh.position.set(0, 0.145, -0.2);
    baseGroup.add(keyboardMesh);

    // 3. Trackpad Glassmorphism
    const trackpadMat = new THREE.MeshStandardMaterial({
      color: 0x132752,
      roughness: 0.15,
      metalness: 0.9,
      emissive: 0x00d2ff,
      emissiveIntensity: 0.15
    });
    const trackpadMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 0.65),
      trackpadMat
    );
    trackpadMesh.rotation.x = -Math.PI / 2;
    trackpadMesh.position.set(0, 0.145, 0.72);
    baseGroup.add(trackpadMesh);

    scene.add(baseGroup);

    // 4. Bisagra y Pantalla (Pantalla móvil)
    screenHingeGroup = new THREE.Group();
    screenHingeGroup.position.set(0, 0.14, -1.2); // Posición del eje de rotación

    // Cilindro de bisagra
    const hingeGeom = new THREE.CylinderGeometry(0.045, 0.045, 3.4, 16);
    hingeGeom.rotateZ(Math.PI / 2);
    const hingeMesh = new THREE.Mesh(hingeGeom, chassisMaterial);
    screenHingeGroup.add(hingeMesh);

    // Marco exterior de la pantalla
    const screenLidGeom = new THREE.BoxGeometry(3.6, 2.3, 0.08);
    screenMesh = new THREE.Mesh(screenLidGeom, chassisMaterial);
    screenMesh.position.set(0, 1.15, 0.04);
    screenMesh.castShadow = true;
    screenHingeGroup.add(screenMesh);

    // Superficie de la pantalla (Display interactivo/código)
    const screenTextureCanvas = document.createElement('canvas');
    screenTextureCanvas.width = 512;
    screenTextureCanvas.height = 320;
    const sCtx = screenTextureCanvas.getContext('2d');

    // Fondo pantalla
    sCtx.fillStyle = '#020617';
    sCtx.fillRect(0, 0, 512, 320);

    // Header terminal
    sCtx.fillStyle = '#0f1f42';
    sCtx.fillRect(0, 0, 512, 32);
    sCtx.fillStyle = '#ef4444';
    sCtx.beginPath(); sCtx.arc(16, 16, 5, 0, Math.PI*2); sCtx.fill();
    sCtx.fillStyle = '#f59e0b';
    sCtx.beginPath(); sCtx.arc(32, 16, 5, 0, Math.PI*2); sCtx.fill();
    sCtx.fillStyle = '#10b981';
    sCtx.beginPath(); sCtx.arc(48, 16, 5, 0, Math.PI*2); sCtx.fill();

    sCtx.font = 'bold 13px monospace';
    sCtx.fillStyle = '#00d2ff';
    sCtx.fillText('terminal@media-tecnica-software:~$ ./iniciar_futuro.sh', 70, 21);

    // Líneas de código en pantalla
    sCtx.font = '12px monospace';
    sCtx.fillStyle = '#38bdf8';
    sCtx.fillText('> Conectando a Base de Datos MySQL... [OK]', 20, 65);
    sCtx.fillStyle = '#ffffff';
    sCtx.fillText('> Inicializando Servidor Node.js...   [ONLINE]', 20, 95);
    sCtx.fillStyle = '#a3e635';
    sCtx.fillText('> Cargando Módulos de Inteligencia Artificial...', 20, 125);
    sCtx.fillStyle = '#f43f5e';
    sCtx.fillText('const estudiante = new FuturoDesarrollador();', 20, 165);
    sCtx.fillStyle = '#00d2ff';
    sCtx.fillText('estudiante.construirProyectos();', 20, 195);
    sCtx.fillStyle = '#94a3b8';
    sCtx.fillText('// ¡Listo para innovar en Medellín y el mundo!', 20, 230);

    const screenTexture = new THREE.CanvasTexture(screenTextureCanvas);
    const displayMat = new THREE.MeshBasicMaterial({
      map: screenTexture
    });

    const displayGeom = new THREE.PlaneGeometry(3.35, 2.05);
    screenDisplay = new THREE.Mesh(displayGeom, displayMat);
    screenDisplay.position.set(0, 1.15, 0.082);
    screenHingeGroup.add(screenDisplay);

    // Ángulos de la pantalla respecto a la bisagra:
    // En Three.js, rotación X = 0° es posición vertical (90° respecto a la base).
    // Para cerrar hacia la base (90° de la vertical), el ángulo X aumenta hacia +90°.
    // Ángulo semi-cerrado sobrando 10° respecto a la base: 90° - 10° = 80°.
    HINGE_ANGLE_CLOSED = THREE.MathUtils.degToRad(80); // Sobrando 10° respecto a la base (90° - 10° = 80°)
    HINGE_ANGLE_OPEN = THREE.MathUtils.degToRad(-12);   // 102° abierta respecto a la base (90° - (-12°) = 102°)

    // Inicialmente ángulo semi-cerrado para la animación (sobrando 10° con la base)
    screenHingeGroup.rotation.x = HINGE_ANGLE_CLOSED;

    scene.add(screenHingeGroup);
  }

  /* ==========================================================================
     PROYECCIÓN HOLOGRÁFICA (CÓDIGO, BASE DE DATOS Y ELEMENTOS WEB)
     ========================================================================== */
  function createHologram() {
    hologramGroup = new THREE.Group();
    hologramGroup.position.set(0, 0.4, -0.3);

    // 1. Haz de luz volumétrico piramidal translúcido
    const beamGeom = new THREE.CylinderGeometry(2.4, 0.6, 2.5, 4, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      wireframe: false
    });
    beamMesh = new THREE.Mesh(beamGeom, beamMat);
    beamMesh.position.y = 1.3;
    beamMesh.rotation.y = Math.PI / 4;
    hologramGroup.add(beamMesh);

    // 2. Tarjeta Holográfica de Código Flotante (Glassmorphism)
    const codeCanvas = document.createElement('canvas');
    codeCanvas.width = 512;
    codeCanvas.height = 300;
    const cCtx = codeCanvas.getContext('2d');

    // Estilo translúcido glassmorphism con borde cyan brillante
    cCtx.fillStyle = 'rgba(6, 18, 48, 0.88)';
    cCtx.fillRect(0, 0, 512, 300);
    cCtx.strokeStyle = '#00d2ff';
    cCtx.lineWidth = 4;
    cCtx.strokeRect(4, 4, 504, 292);

    // Barra superior estilo macOS / Dev
    cCtx.fillStyle = 'rgba(0, 210, 255, 0.2)';
    cCtx.fillRect(4, 4, 504, 38);
    cCtx.fillStyle = '#00d2ff';
    cCtx.font = 'bold 15px monospace';
    cCtx.fillText('{ } software_project.ts - Media Tecnica', 24, 28);

    // Código con colores syntax highlighting
    cCtx.font = '14px monospace';
    cCtx.fillStyle = '#f43f5e';
    cCtx.fillText('async function', 24, 75);
    cCtx.fillStyle = '#38bdf8';
    cCtx.fillText('desarrollarTalento(estudiante) {', 140, 75);

    cCtx.fillStyle = '#94a3b8';
    cCtx.fillText('  // Creando el software del futuro', 24, 105);

    cCtx.fillStyle = '#a3e635';
    cCtx.fillText('  const habilidades = ["Web", "BD", "IA", "Logica"];', 24, 135);

    cCtx.fillStyle = '#00d2ff';
    cCtx.fillText('  await estudiante.aprender({ modo: "Práctico" });', 24, 165);

    cCtx.fillStyle = '#f59e0b';
    cCtx.fillText('  return { exito: true, salario: "$$$ Global" };', 24, 195);

    cCtx.fillStyle = '#38bdf8';
    cCtx.fillText('}', 24, 225);

    cCtx.fillStyle = '#10b981';
    cCtx.fillText('● Compilado en Medellín: Valle del Software', 24, 265);

    const codeTexture = new THREE.CanvasTexture(codeCanvas);
    const codePlaneMat = new THREE.MeshBasicMaterial({
      map: codeTexture,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });

    codePlane = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.3), codePlaneMat);
    codePlane.position.set(-0.35, 1.7, 0.2);
    codePlane.rotation.y = THREE.MathUtils.degToRad(8);
    hologramGroup.add(codePlane);

    // 3. Base de Datos Holográfica 3D (Cilindros de datos apilados con anillos giratorios)
    dbGroup = new THREE.Group();
    dbGroup.position.set(1.15, 1.45, 0.4);

    const discGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.12, 24);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x00d2ff,
      emissive: 0x004488,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.75,
      metalness: 0.8,
      roughness: 0.2
    });

    const discWireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });

    for (let i = 0; i < 3; i++) {
      const disc = new THREE.Mesh(discGeom, discMat);
      disc.position.y = i * 0.18;
      const wire = new THREE.Mesh(discGeom, discWireMat);
      disc.add(wire);
      dbGroup.add(disc);
    }

    // Anillo orbital exterior alrededor de la base de datos
    const ringGeom = new THREE.RingGeometry(0.52, 0.58, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.18;
    dbGroup.add(ringMesh);
    dbGroup.userData.ring = ringMesh;

    hologramGroup.add(dbGroup);

    // 4. Conexiones animadas entre la base de datos y la interfaz de código
    createDataConnections();

    // 5. Elementos Web Dinámicos Flotantes (Badges 3D)
    createFloatingWebElements();

    scene.add(hologramGroup);
  }

  /* Conexiones de datos (Tubos/Splines brillantes) */
  function createDataConnections() {
    const points = [
      new THREE.Vector3(0.75, 1.6, 0.3),
      new THREE.Vector3(0.2, 1.8, 0.4),
      new THREE.Vector3(-0.2, 1.5, 0.2)
    ];
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeom = new THREE.TubeGeometry(curve, 20, 0.015, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    hologramGroup.add(tubeMesh);

    // Nodos / Pulsos de datos que viajan a través de la línea
    for (let i = 0; i < 3; i++) {
      const nodeGeom = new THREE.SphereGeometry(0.04, 12, 12);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        blending: THREE.AdditiveBlending
      });
      const node = new THREE.Mesh(nodeGeom, nodeMat);
      hologramGroup.add(node);
      animatedNodes.push({
        mesh: node,
        curve: curve,
        progress: i * 0.33,
        speed: 0.008
      });
    }
  }

  /* Widgets web flotantes */
  function createFloatingWebElements() {
    // Mini Widget 1: UI Toggle / API OK Card
    const widgetCanvas = document.createElement('canvas');
    widgetCanvas.width = 256;
    widgetCanvas.height = 128;
    const wCtx = widgetCanvas.getContext('2d');

    wCtx.fillStyle = 'rgba(2, 6, 23, 0.9)';
    wCtx.fillRect(0, 0, 256, 128);
    wCtx.strokeStyle = '#38bdf8';
    wCtx.lineWidth = 3;
    wCtx.strokeRect(3, 3, 250, 122);

    wCtx.fillStyle = '#10b981';
    wCtx.beginPath();
    wCtx.arc(30, 40, 10, 0, Math.PI * 2);
    wCtx.fill();

    wCtx.font = 'bold 18px sans-serif';
    wCtx.fillStyle = '#ffffff';
    wCtx.fillText('API Status: 200 OK', 55, 46);

    wCtx.font = '14px monospace';
    wCtx.fillStyle = '#00d2ff';
    wCtx.fillText('⚡ 60 FPS • WebGL 3D', 30, 85);
    wCtx.fillStyle = '#94a3b8';
    wCtx.fillText('Base de Datos Sync: 100%', 30, 80);

    const widgetTex = new THREE.CanvasTexture(widgetCanvas);
    const widgetMat = new THREE.MeshBasicMaterial({
      map: widgetTex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const widgetMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), widgetMat);
    widgetMesh.position.set(-0.8, 2.5, 0.1);
    widgetMesh.rotation.y = THREE.MathUtils.degToRad(-10);
    hologramGroup.add(widgetMesh);
    hologramGroup.userData.widget = widgetMesh;

    // Mini Cubos Tech flotantes (React/HTML/Data tokens)
    const tokenGeom = new THREE.OctahedronGeometry(0.12);
    const tokenMat = new THREE.MeshStandardMaterial({
      color: 0x00d2ff,
      emissive: 0x0055aa,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.1
    });

    const token1 = new THREE.Mesh(tokenGeom, tokenMat);
    token1.position.set(0.9, 2.4, -0.2);
    hologramGroup.add(token1);
    hologramGroup.userData.token1 = token1;

    const token2 = new THREE.Mesh(tokenGeom, tokenMat);
    token2.position.set(-1.1, 1.2, 0.4);
    hologramGroup.add(token2);
    hologramGroup.userData.token2 = token2;
  }

  /* ==========================================================================
     SUELO TECH Y SISTEMA DE PARTÍCULAS ASCENDENTES
     ========================================================================== */
  function createTechFloorAndParticles() {
    // Anillos concéntricos en el suelo
    const floorRingGeom = new THREE.RingGeometry(1.8, 2.7, 48);
    const floorRingMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    });
    const floorRing = new THREE.Mesh(floorRingGeom, floorRingMat);
    floorRing.rotation.x = -Math.PI / 2;
    floorRing.position.y = -0.01;
    scene.add(floorRing);

    // Partículas holográficas flotantes (Cyber-dust)
    const particleCount = 90;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.5;
      positions[i * 3 + 1] = Math.random() * 3.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;

      velocities.push({
        vy: 0.005 + Math.random() * 0.01,
        initialY: positions[i * 3 + 1]
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pMaterial = new THREE.PointsMaterial({
      color: 0x00d2ff,
      size: 0.055,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    particlesSystem = new THREE.Points(geometry, pMaterial);
    particlesSystem.userData.velocities = velocities;
    scene.add(particlesSystem);
  }

  /* ==========================================================================
     INTERACTIVIDAD Y CONTROL ORBITAL
     ========================================================================== */
  function setupEvents() {
    window.addEventListener('resize', onWindowResize, false);

    container.addEventListener('pointerdown', (e) => {
      isUserInteracting = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      isUserInteracting = false;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isUserInteracting) {
        // Parallax sutil con el movimiento del ratón
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        if (nx >= -1.5 && nx <= 1.5 && ny >= -1.5 && ny <= 1.5) {
          targetRotationY += nx * 0.001;
          targetRotationX = THREE.MathUtils.clamp(0.25 + ny * 0.15, 0.05, 0.55);
        }
        return;
      }

      const deltaX = e.clientX - mouseX;
      const deltaY = e.clientY - mouseY;

      targetRotationY += deltaX * 0.008;
      targetRotationX = THREE.MathUtils.clamp(targetRotationX + deltaY * 0.008, 0.05, 0.65);

      mouseX = e.clientX;
      mouseY = e.clientY;
    });
  }

  function onWindowResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  /* ==========================================================================
     BUCLE DE ANIMACIÓN
     ========================================================================== */
  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // 1. Ciclo en bucle suave de apertura y visualización de la laptop
    // Ciclo completo de 10 segundos
    const cycleTime = elapsedTime % 10.0;
    let targetHingeAngle;
    let hologramScale;

    if (cycleTime < 2.5) {
      // Fase 1: Se abre suavemente desde el ángulo de reposo (sobrando 10° con la base) hasta abierta
      const progress = cycleTime / 2.5;
      const ease = Math.sin((progress * Math.PI) / 2); // Ease out
      targetHingeAngle = THREE.MathUtils.lerp(HINGE_ANGLE_CLOSED, HINGE_ANGLE_OPEN, ease);
      hologramScale = Math.max(0.001, (progress - 0.2) / 0.8);
    } else if (cycleTime < 8.0) {
      // Fase 2: Totalmente abierta (102° con la base), el holograma brilla con máxima actividad
      targetHingeAngle = HINGE_ANGLE_OPEN;
      hologramScale = 1.0;
    } else if (cycleTime < 9.5) {
      // Fase 3: Se cierra suavemente hasta quedar sobrando un ángulo de 10° con la base
      const progress = (cycleTime - 8.0) / 1.5;
      const ease = (1 - Math.cos(progress * Math.PI)) / 2; // Smoothstep
      targetHingeAngle = THREE.MathUtils.lerp(HINGE_ANGLE_OPEN, HINGE_ANGLE_CLOSED, ease);
      hologramScale = Math.max(0.001, 1.0 - progress * 1.2);
    } else {
      // Fase 4: Pausa breve semi-cerrada (sobrando 10°) antes de abrirse nuevamente
      targetHingeAngle = HINGE_ANGLE_CLOSED;
      hologramScale = 0.001;
    }

    // Suavizar el movimiento de apertura de la bisagra
    if (screenHingeGroup) {
      screenHingeGroup.rotation.x = THREE.MathUtils.lerp(
        screenHingeGroup.rotation.x,
        targetHingeAngle,
        0.08
      );
    }

    // Escalar la proyección holográfica según la apertura
    if (hologramGroup) {
      hologramGroup.scale.set(hologramScale, hologramScale, hologramScale);
      hologramGroup.visible = hologramScale > 0.05;

      // Leve oscilación flotante (levitación suave)
      const floatOffset = Math.sin(elapsedTime * 2.0) * 0.04;
      hologramGroup.position.y = 0.4 + floatOffset;

      if (codePlane) {
        codePlane.rotation.z = Math.sin(elapsedTime * 1.5) * 0.02;
      }

      if (dbGroup) {
        dbGroup.rotation.y = elapsedTime * 0.8;
        if (dbGroup.userData.ring) {
          dbGroup.userData.ring.rotation.z = -elapsedTime * 1.2;
        }
      }

      if (hologramGroup.userData.widget) {
        hologramGroup.userData.widget.position.y = 2.5 + Math.cos(elapsedTime * 1.8) * 0.05;
      }

      if (hologramGroup.userData.token1) {
        hologramGroup.userData.token1.rotation.x = elapsedTime * 1.5;
        hologramGroup.userData.token1.rotation.y = elapsedTime * 2.0;
      }

      if (hologramGroup.userData.token2) {
        hologramGroup.userData.token2.rotation.y = -elapsedTime * 1.8;
        hologramGroup.userData.token2.rotation.z = elapsedTime * 1.2;
      }
    }

    // 2. Pulso de datos que viajan entre la base de datos y el código
    if (animatedNodes.length > 0) {
      animatedNodes.forEach((node) => {
        node.progress = (node.progress + node.speed) % 1.0;
        const pt = node.curve.getPoint(node.progress);
        node.mesh.position.copy(pt);
      });
    }

    // 3. Partículas ascendentes de ciber-polvo
    if (particlesSystem) {
      const pos = particlesSystem.geometry.attributes.position.array;
      const vels = particlesSystem.userData.velocities;
      for (let i = 0; i < vels.length; i++) {
        pos[i * 3 + 1] += vels[i].vy;
        if (pos[i * 3 + 1] > 3.2) {
          pos[i * 3 + 1] = 0.1;
        }
      }
      particlesSystem.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Cámara orbital lenta de 360 grados continua + interacción de usuario
    if (!isUserInteracting) {
      targetRotationY += autoOrbitSpeed;
    }

    currentRotationY = THREE.MathUtils.lerp(currentRotationY, targetRotationY, 0.05);
    currentRotationX = THREE.MathUtils.lerp(currentRotationX, targetRotationX, 0.05);

    // Aplicar coordenadas esféricas para la rotación de 360 grados de la cámara
    const radius = 6.2;
    camera.position.x = radius * Math.sin(currentRotationY) * Math.cos(currentRotationX);
    camera.position.y = radius * Math.sin(currentRotationX) + 0.6;
    camera.position.z = radius * Math.cos(currentRotationY) * Math.cos(currentRotationX);
    camera.lookAt(0, 0.8, 0);

    renderer.render(scene, camera);
  }

})();
