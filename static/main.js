// static/main.js - Code Factory 3D Scene
(async () => {
  // Fetch API data
  let data = null;
  try {
    const res = await fetch('/api/info', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Failed to load /api/info (${res.status})`);
    data = await res.json();
  } catch (e) {
    console.error(e);
    data = {
      steps: [
        { id: 'code', title: 'Code', desc: 'Your source code (this repo). Push triggers the pipeline.' },
        { id: 'build', title: 'Build', desc: 'Dependencies installed, packaging, Docker image build.' },
        { id: 'test', title: 'Test', desc: 'Unit/integration tests and static analysis.' },
        { id: 'deploy', title: 'Deploy', desc: 'Automated deployment to the chosen target.' }
      ],
      why: [],
      how: [],
      future: []
    };
  }

  // DOM elements
  const whatList = document.getElementById('what-list');
  const whyList = document.getElementById('why-list');
  const howList = document.getElementById('how-list');
  const futureList = document.getElementById('future-list');
  const container = document.getElementById('canvas-container');
  const tooltip = document.getElementById('tooltip');
  const togglePanelBtn = document.getElementById('toggle-panel');
  const resetViewBtn = document.getElementById('reset-view');
  const infoPanel = document.getElementById('info-panel');
  const loadingOverlay = document.getElementById('loading-overlay');
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Populate lists
  const madeItems = [
    "Flask-based portfolio app (this site)",
    "Interactive 3D CI/CD pipeline using Three.js",
    "GitHub Actions CI workflow + Dockerfile"
  ];
  madeItems.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i;
    whatList.appendChild(li);
  });

  data.why.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i;
    whyList.appendChild(li);
  });
  data.how.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i;
    howList.appendChild(li);
  });
  data.future.forEach(i => {
    const li = document.createElement('li');
    li.textContent = i;
    futureList.appendChild(li);
  });

  // Panel toggle
  if (togglePanelBtn && infoPanel) {
    togglePanelBtn.addEventListener('click', () => {
      const isHidden = infoPanel.hasAttribute('hidden');
      if (isHidden) {
        infoPanel.removeAttribute('hidden');
        togglePanelBtn.setAttribute('aria-expanded', 'true');
      } else {
        infoPanel.setAttribute('hidden', '');
        togglePanelBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Three.js setup
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    const title = document.getElementById('panel-title');
    const body = document.getElementById('panel-body');
    if (title) title.textContent = "WebGL not available";
    if (body) body.textContent = "Your browser/device can't render the 3D view. The CI/CD details are still available in text.";
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
    return;
  }

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0e1a, 12, 35);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setSize(1, 1, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 2.5, 12);
  camera.lookAt(0, 0, 0);

  // Lighting
  scene.add(new THREE.HemisphereLight(0x4a5568, 0x0a0e1a, 0.8));
  scene.add(new THREE.AmbientLight(0xffffff, 0.15));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(8, 12, 6);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 40;
  keyLight.shadow.camera.left = -12;
  keyLight.shadow.camera.right = 12;
  keyLight.shadow.camera.top = 12;
  keyLight.shadow.camera.bottom = -8;
  scene.add(keyLight);

  const accentLight1 = new THREE.PointLight(0xf59e0b, 1.5, 20, 2);
  accentLight1.position.set(-6, 3, 4);
  scene.add(accentLight1);

  const accentLight2 = new THREE.PointLight(0x3b82f6, 1.2, 20, 2);
  accentLight2.position.set(6, 2, 4);
  scene.add(accentLight2);

  const accentLight3 = new THREE.PointLight(0x10b981, 1.0, 18, 2);
  accentLight3.position.set(0, -1, 8);
  scene.add(accentLight3);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 20),
    new THREE.ShadowMaterial({ opacity: 0.25 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.5;
  floor.receiveShadow = true;
  scene.add(floor);

  // Factory stations configuration
  const stations = [
    { x: -4.5, y: 0, z: 0, id: 'code', color: 0xf59e0b, icon: '📝' },
    { x: -1.5, y: 0, z: 0, id: 'build', color: 0x3b82f6, icon: '🔨' },
    { x: 1.5, y: 0, z: 0, id: 'test', color: 0x8b5cf6, icon: '🧪' },
    { x: 4.5, y: 0, z: 0, id: 'deploy', color: 0x10b981, icon: '🚀' }
  ];

  const stationGroups = [];
  const pickables = [];
  const gears = [];
  const conveyorBelt = [];

  // Create factory stations
  stations.forEach((station, idx) => {
    const group = new THREE.Group();
    group.position.set(station.x, station.y, station.z);
    group.userData = { id: station.id, index: idx, station };

    // Main platform/base
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.2, 32),
      new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        metalness: 0.3,
        roughness: 0.7
      })
    );
    base.position.y = -0.1;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Station core (box representing the "machine")
    const coreGeom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: station.color,
      metalness: 0.4,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      emissive: station.color,
      emissiveIntensity: 0.3
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    core.position.y = 0.6;
    core.castShadow = true;
    core.receiveShadow = true;
    core.userData = { id: station.id, index: idx, kind: 'station' };
    group.add(core);
    pickables.push(core);

    // Glow effect
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.MeshBasicMaterial({
        color: station.color,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      })
    );
    glow.position.y = 0.6;
    group.add(glow);

    // Rotating gear on top
    const gear = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.15, 16),
      new THREE.MeshStandardMaterial({
        color: 0x374151,
        metalness: 0.8,
        roughness: 0.2
      })
    );
    gear.position.y = 1.35;
    gear.castShadow = true;
    gear.userData = { rotationSpeed: 0.8 + idx * 0.2 };
    group.add(gear);
    gears.push(gear);

    // Gear teeth (decorative)
    for (let i = 0; i < 8; i++) {
      const tooth = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.15, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x4b5563 })
      );
      const angle = (i / 8) * Math.PI * 2;
      tooth.position.set(
        Math.cos(angle) * 0.35,
        1.35,
        Math.sin(angle) * 0.35
      );
      tooth.rotation.y = angle;
      group.add(tooth);
    }

    // Conveyor belt segment
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.1, 0.6),
      new THREE.MeshStandardMaterial({
        color: 0x111827,
        metalness: 0.6,
        roughness: 0.4
      })
    );
    belt.position.y = -0.15;
    belt.castShadow = true;
    belt.receiveShadow = true;
    group.add(belt);
    conveyorBelt.push(belt);

    // Label sprite
    const canvasLabel = document.createElement('canvas');
    canvasLabel.width = 256;
    canvasLabel.height = 128;
    const ctx = canvasLabel.getContext('2d');
    ctx.clearRect(0, 0, canvasLabel.width, canvasLabel.height);
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillStyle = '#f9fafb';
    ctx.textAlign = 'center';
    ctx.fillText(station.icon, 128, 50);
    ctx.font = '700 24px Inter, sans-serif';
    ctx.fillText(station.id.toUpperCase(), 128, 90);
    const tex = new THREE.CanvasTexture(canvasLabel);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sprite.scale.set(2, 1, 1);
    sprite.position.set(0, -1.2, 0);
    group.add(sprite);

    scene.add(group);
    stationGroups.push({ group, core, glow, gear, belt, sprite, station });
  });

  // Conveyor belt connecting stations
  const beltCurve = new THREE.CatmullRomCurve3(
    stations.map(s => new THREE.Vector3(s.x, -0.15, s.z)),
    false,
    'catmullrom',
    0.5
  );
  const beltTube = new THREE.Mesh(
    new THREE.TubeGeometry(beltCurve, 200, 0.3, 16, false),
    new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.5,
      roughness: 0.4
    })
  );
  beltTube.castShadow = true;
  beltTube.receiveShadow = true;
  scene.add(beltTube);

  // Code packages moving on conveyor
  const packages = [];
  for (let i = 0; i < 3; i++) {
    const pkg = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshPhysicalMaterial({
        color: 0xf59e0b,
        metalness: 0.3,
        roughness: 0.4,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.5
      })
    );
    pkg.castShadow = true;
    pkg.userData = { offset: i * 0.33 };
    scene.add(pkg);
    packages.push(pkg);
  }

  // Particle system for factory atmosphere
  const particleCount = 200;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = Math.random() * 8;
    positions[i3 + 2] = (Math.random() - 0.5) * 10;

    const color = new THREE.Color();
    const hue = Math.random() < 0.5 ? 0.1 : 0.6;
    color.setHSL(hue, 0.7, 0.6);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 0.05 + 0.02;
  }

  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem);

  // Interaction
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let hovered = null;
  let selected = null;
  let lastPointerEvent = null;

  function onPointerMove(e) {
    lastPointerEvent = e;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }
  window.addEventListener('pointermove', onPointerMove);

  function setPanelFor(id) {
    const step = data.steps.find(s => s.id === id);
    if (!step) return;
    const title = document.getElementById('panel-title');
    const body = document.getElementById('panel-body');
    if (title) title.textContent = step.title;
    if (body) body.textContent = step.desc;
  }

  function showTooltip(mesh) {
    if (!tooltip || !mesh || !lastPointerEvent) return;
    const step = data.steps.find(s => s.id === mesh.userData.id);
    const label = step ? step.title : mesh.userData.id;
    const desc = step ? step.desc : '';
    tooltip.innerHTML = `<strong>${escapeHtml(label)}</strong>${escapeHtml(desc)}`;

    const rect = container.getBoundingClientRect();
    const x = Math.min(rect.width - 20, Math.max(20, (lastPointerEvent.clientX - rect.left) + 16));
    const y = Math.min(rect.height - 20, Math.max(20, (lastPointerEvent.clientY - rect.top) + 16));
    tooltip.style.transform = `translate(${x}px, ${y}px)`;
  }

  function hideTooltip() {
    if (!tooltip) return;
    tooltip.style.transform = 'translate(-9999px, -9999px)';
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c]));
  }

  function setSelected(mesh) {
    selected = mesh;
    if (selected) setPanelFor(selected.userData.id);
  }

  canvas.addEventListener('click', () => {
    if (!hovered) return;
    setSelected(hovered);
  });

  // Camera controls
  let dragging = false;
  let dragStart = { x: 0, y: 0 };
  let targetRot = { x: 0.15, y: 0 };
  let rot = { x: 0.15, y: 0 };
  let targetZoom = 12;
  let zoom = 12;

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener('pointerup', (e) => {
    dragging = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
  });

  canvas.addEventListener('pointercancel', () => { dragging = false; });

  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = (e.clientX - dragStart.x);
    const dy = (e.clientY - dragStart.y);
    targetRot.y += dx * 0.004;
    targetRot.x += dy * 0.003;
    targetRot.x = Math.max(-0.4, Math.min(0.6, targetRot.x));
    dragStart = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetZoom += e.deltaY * 0.01;
    targetZoom = Math.max(8, Math.min(18, targetZoom));
  }, { passive: false });

  // Reset view
  if (resetViewBtn) {
    resetViewBtn.addEventListener('click', () => {
      targetRot = { x: 0.15, y: 0 };
      targetZoom = 12;
      selected = null;
      setPanelFor('code');
    });
  }

  // Resize
  function resize() {
    const w = container.clientWidth || canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = container.clientHeight || canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  // Scroll tilt
  let scrollTilt = 0;
  window.addEventListener('scroll', () => {
    const max = document.body.scrollHeight - window.innerHeight;
    const p = max > 0 ? (window.scrollY / max) : 0;
    scrollTilt = (p - 0.5) * 0.3;
  }, { passive: true });

  // Animation loop
  const clock = new THREE.Clock();
  
  function animate() {
    const t = clock.getElapsedTime();
    const dt = Math.min(0.05, clock.getDelta());

    // Camera rotation easing
    rot.x += (targetRot.x - rot.x) * (reducedMotion ? 0.05 : 0.1);
    rot.y += (targetRot.y - rot.y) * (reducedMotion ? 0.05 : 0.1);
    zoom += (targetZoom - zoom) * 0.1;

    camera.position.x = Math.sin(rot.y) * zoom;
    camera.position.z = Math.cos(rot.y) * zoom;
    camera.position.y = 2.5 + Math.sin(rot.x) * 3;
    camera.lookAt(0, 0, 0);

    // Station animations
    stationGroups.forEach((sg, i) => {
      const bob = reducedMotion ? 0 : Math.sin(t * 1.5 + i * 0.8) * 0.08;
      sg.group.position.y = sg.station.y + bob;

      // Gear rotation
      if (!reducedMotion) {
        sg.gear.rotation.y += dt * sg.gear.userData.rotationSpeed;
      }

      // Conveyor belt animation
      if (!reducedMotion) {
        sg.belt.position.z += Math.sin(t + i) * 0.001;
      }
    });

    // Moving packages on conveyor
    packages.forEach((pkg, i) => {
      const u = ((t * 0.15 + pkg.userData.offset) % 1);
      beltCurve.getPointAt(u, pkg.position);
      pkg.position.y = -0.15 + 0.2;
      pkg.rotation.y += dt * 2;
      pkg.rotation.x += dt * 1.5;
    });

    // Particle animation
    if (!reducedMotion) {
      const positions = particles.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += dt * 0.1;
        if (positions[i3 + 1] > 8) positions[i3 + 1] = 0;
      }
      particles.attributes.position.needsUpdate = true;
    }

    // Hover detection
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(pickables, false);
    if (intersects.length > 0) {
      if (hovered !== intersects[0].object) {
        hovered = intersects[0].object;
        document.body.style.cursor = 'pointer';
        if (!selected) setPanelFor(hovered.userData.id);
      }
      showTooltip(hovered);
    } else {
      hovered = null;
      document.body.style.cursor = 'auto';
      hideTooltip();
    }

    // Station highlighting
    stationGroups.forEach((sg) => {
      const isSel = selected && sg.core === selected;
      const isHov = hovered && sg.core === hovered;
      const active = isSel || (!selected && isHov);

      const targetScale = active ? 1.15 : 1.0;
      sg.group.scale.x += (targetScale - sg.group.scale.x) * (reducedMotion ? 0.08 : 0.12);
      sg.group.scale.y += (targetScale - sg.group.scale.y) * (reducedMotion ? 0.08 : 0.12);
      sg.group.scale.z += (targetScale - sg.group.scale.z) * (reducedMotion ? 0.08 : 0.12);

      if (active) {
        sg.core.material.emissiveIntensity = 0.8;
        sg.glow.material.opacity = 0.4;
      } else {
        sg.core.material.emissiveIntensity = 0.3;
        sg.glow.material.opacity = 0.2;
      }
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  // Hide loading overlay after a brief delay
  setTimeout(() => {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
  }, 800);

  animate();
})();

/* ===== Global frontend reactivity: scroll reveal + 3D tilt ===== */
(function () {
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal: add .revealed when section enters viewport
  const revealEls = document.querySelectorAll('.reveal[data-reveal]');
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) entry.target.classList.add('revealed');
      });
    },
    { root: null, rootMargin: '0px 0px -40px 0px', threshold: 0.05 }
  );
  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  // 3D tilt: mouse-follow perspective on all [data-tilt] widgets
  if (reducedMotion) return;

  const tiltEls = document.querySelectorAll('[data-tilt]');
  const tiltMaxDeg = 10;
  const tiltPerspective = 1000;
  const tiltLift = 6;

  tiltEls.forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      el.setAttribute('data-tilt-active', '1');
    });
    el.addEventListener('mouseleave', function () {
      el.removeAttribute('data-tilt-active');
      el.style.transform = '';
    });
  });

  document.addEventListener('mousemove', function (e) {
    tiltEls.forEach(function (el) {
      if (!el.hasAttribute('data-tilt-active')) return;
      var rect = el.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      var rotX = -y * tiltMaxDeg;
      var rotY = x * tiltMaxDeg;
      el.style.transform =
        'perspective(' + tiltPerspective + 'px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(' + tiltLift + 'px)';
    });
  });

  // Subtle background parallax
  var bgMesh = document.querySelector('.bg-mesh');
  if (bgMesh) {
    window.addEventListener('scroll', function () {
      var y = window.scrollY * 0.15;
      bgMesh.style.transform = 'translate3d(0, ' + y + 'px, -100px)';
    }, { passive: true });
  }
})();
