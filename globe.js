/* ─── 3D GLOBE — WebGL via Three.js CDN ────────────────────────────── */
/* globe.js — loads Three.js, builds an interactive Earth with country hit detection */

(function () {
  'use strict';

  /* ── THREE.JS IMPORT ── */
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
  script.onload = initGlobe;
  document.head.appendChild(script);

  /* Countries as lat/lon bounding boxes – simplified for hit detection */
  const COUNTRIES = [
    { name:'United States', flag:'🇺🇸', region:'North America',  lat:[24,49],   lon:[-125,-66] },
    { name:'Canada',        flag:'🇨🇦', region:'North America',  lat:[42,83],   lon:[-141,-52] },
    { name:'Mexico',        flag:'🇲🇽', region:'North America',  lat:[15,32],   lon:[-118,-87] },
    { name:'Brazil',        flag:'🇧🇷', region:'South America',  lat:[-33,5],   lon:[-74,-34]  },
    { name:'Argentina',     flag:'🇦🇷', region:'South America',  lat:[-55,-22], lon:[-73,-53]  },
    { name:'Colombia',      flag:'🇨🇴', region:'South America',  lat:[-4,12],   lon:[-79,-67]  },
    { name:'Chile',         flag:'🇨🇱', region:'South America',  lat:[-56,-17], lon:[-75,-66]  },
    { name:'Peru',          flag:'🇵🇪', region:'South America',  lat:[-18,-0],  lon:[-81,-68]  },
    { name:'United Kingdom',flag:'🇬🇧', region:'Europe',         lat:[50,61],   lon:[-8,2]     },
    { name:'Germany',       flag:'🇩🇪', region:'Europe',         lat:[47,55],   lon:[6,15]     },
    { name:'France',        flag:'🇫🇷', region:'Europe',         lat:[42,51],   lon:[-5,8]     },
    { name:'Netherlands',   flag:'🇳🇱', region:'Europe',         lat:[51,54],   lon:[3,7]      },
    { name:'Sweden',        flag:'🇸🇪', region:'Europe',         lat:[55,69],   lon:[11,24]    },
    { name:'Norway',        flag:'🇳🇴', region:'Europe',         lat:[57,71],   lon:[4,31]     },
    { name:'Finland',       flag:'🇫🇮', region:'Europe',         lat:[60,70],   lon:[20,32]    },
    { name:'Switzerland',   flag:'🇨🇭', region:'Europe',         lat:[46,48],   lon:[6,11]     },
    { name:'Spain',         flag:'🇪🇸', region:'Europe',         lat:[36,44],   lon:[-9,4]     },
    { name:'Italy',         flag:'🇮🇹', region:'Europe',         lat:[36,47],   lon:[7,18]     },
    { name:'Poland',        flag:'🇵🇱', region:'Europe',         lat:[49,55],   lon:[14,24]    },
    { name:'Russia',        flag:'🇷🇺', region:'Europe/Asia',    lat:[41,82],   lon:[19,180]   },
    { name:'Turkey',        flag:'🇹🇷', region:'Middle East',    lat:[36,42],   lon:[26,45]    },
    { name:'Japan',         flag:'🇯🇵', region:'Asia',           lat:[24,46],   lon:[129,146]  },
    { name:'South Korea',   flag:'🇰🇷', region:'Asia',           lat:[33,39],   lon:[125,130]  },
    { name:'China',         flag:'🇨🇳', region:'Asia',           lat:[18,53],   lon:[74,135]   },
    { name:'India',         flag:'🇮🇳', region:'Asia',           lat:[8,37],    lon:[68,97]    },
    { name:'Singapore',     flag:'🇸🇬', region:'Asia',           lat:[1,2],     lon:[104,104]  },
    { name:'Hong Kong',     flag:'🇭🇰', region:'Asia',           lat:[22,23],   lon:[113,115]  },
    { name:'Thailand',      flag:'🇹🇭', region:'Asia',           lat:[6,21],    lon:[98,106]   },
    { name:'Vietnam',       flag:'🇻🇳', region:'Asia',           lat:[8,23],    lon:[103,110]  },
    { name:'Indonesia',     flag:'🇮🇩', region:'Asia',           lat:[-11,6],   lon:[95,141]   },
    { name:'Malaysia',      flag:'🇲🇾', region:'Asia',           lat:[1,7],     lon:[100,119]  },
    { name:'Philippines',   flag:'🇵🇭', region:'Asia',           lat:[5,20],    lon:[116,127]  },
    { name:'Australia',     flag:'🇦🇺', region:'Oceania',        lat:[-43,-11], lon:[114,154]  },
    { name:'New Zealand',   flag:'🇳🇿', region:'Oceania',        lat:[-47,-34], lon:[167,178]  },
    { name:'South Africa',  flag:'🇿🇦', region:'Africa',         lat:[-35,-22], lon:[17,33]    },
    { name:'Nigeria',       flag:'🇳🇬', region:'Africa',         lat:[4,14],    lon:[3,15]     },
    { name:'Kenya',         flag:'🇰🇪', region:'Africa',         lat:[-5,5],    lon:[34,42]    },
    { name:'Egypt',         flag:'🇪🇬', region:'Africa',         lat:[22,32],   lon:[25,37]    },
    { name:'Morocco',       flag:'🇲🇦', region:'Africa',         lat:[28,36],   lon:[-13,-1]   },
    { name:'Saudi Arabia',  flag:'🇸🇦', region:'Middle East',    lat:[16,32],   lon:[37,56]    },
    { name:'UAE',            flag:'🇦🇪', region:'Middle East',    lat:[22,26],   lon:[51,56]    },
    { name:'Israel',        flag:'🇮🇱', region:'Middle East',    lat:[29,33],   lon:[34,35]    },
    { name:'Pakistan',      flag:'🇵🇰', region:'Asia',           lat:[24,37],   lon:[61,77]    },
    { name:'Bangladesh',    flag:'🇧🇩', region:'Asia',           lat:[21,27],   lon:[88,92]    },
    { name:'Ukraine',       flag:'🇺🇦', region:'Europe',         lat:[44,52],   lon:[22,40]    },
    { name:'Romania',       flag:'🇷🇴', region:'Europe',         lat:[44,48],   lon:[22,30]    },
    { name:'Czech Republic',flag:'🇨🇿', region:'Europe',         lat:[49,51],   lon:[12,18]    },
    { name:'Austria',       flag:'🇦🇹', region:'Europe',         lat:[46,49],   lon:[9,17]     },
    { name:'Belgium',       flag:'🇧🇪', region:'Europe',         lat:[49,52],   lon:[3,6]      },
    { name:'Portugal',      flag:'🇵🇹', region:'Europe',         lat:[37,42],   lon:[-9,-6]    },
    { name:'Denmark',       flag:'🇩🇰', region:'Europe',         lat:[55,58],   lon:[8,15]     },
    { name:'Greece',        flag:'🇬🇷', region:'Europe',         lat:[35,42],   lon:[20,27]    },
    { name:'Hungary',       flag:'🇭🇺', region:'Europe',         lat:[46,48],   lon:[16,23]    },
    { name:'Slovakia',      flag:'🇸🇰', region:'Europe',         lat:[48,50],   lon:[17,22]    },
    { name:'Bulgaria',      flag:'🇧🇬', region:'Europe',         lat:[41,44],   lon:[22,28]    },
    { name:'Serbia',        flag:'🇷🇸', region:'Europe',         lat:[43,46],   lon:[19,23]    },
    { name:'Croatia',       flag:'🇭🇷', region:'Europe',         lat:[42,46],   lon:[13,19]    },
    { name:'Luxembourg',    flag:'🇱🇺', region:'Europe',         lat:[49,50],   lon:[5,6]      },
    { name:'Ireland',       flag:'🇮🇪', region:'Europe',         lat:[51,55],   lon:[-10,-6]   },
    { name:'Iceland',       flag:'🇮🇸', region:'Europe',         lat:[63,67],   lon:[-24,-13]  },
    { name:'Lithuania',     flag:'🇱🇹', region:'Europe',         lat:[54,57],   lon:[21,27]    },
    { name:'Latvia',        flag:'🇱🇻', region:'Europe',         lat:[56,58],   lon:[21,28]    },
    { name:'Estonia',       flag:'🇪🇪', region:'Europe',         lat:[57,60],   lon:[22,28]    },
  ];

  window.GLOBE_COUNTRIES = COUNTRIES;
  window.selectedCountry = null;

  function initGlobe() {
    const THREE = window.THREE;
    const canvas = document.getElementById('globeCanvas');
    const container = document.getElementById('globeContainer');
    if (!canvas || !container) return;

    const W = container.clientWidth;
    const H = container.clientHeight;

    /* ── RENDERER ── */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    /* ── SCENE / CAMERA ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 0, 2.8);

/* ── EARTH SPHERE ── */
    const R = 1.0;
    const geo = new THREE.SphereGeometry(R, 64, 64);

    /* ── PROCEDURAL HOLOGRAPHIC MATERIALS (NO IMAGES) ── */
    
    /* 1. Base Wireframe Sphere */
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending
    });
    const wireGlobe = new THREE.Mesh(geo, wireMat);
    scene.add(wireGlobe);

    /* 2. Procedural Point Cloud (Matrix Earth) */
    const pointsGeo = new THREE.BufferGeometry();
    const dotsCount = 12000;
    const dotsPos = [];
    const dotsColor = [];
    
    for (let i = 0; i < dotsCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / dotsCount);
      const theta = Math.sqrt(dotsCount * Math.PI) * phi;
      
      const pos = new THREE.Vector3(
        R * Math.cos(theta) * Math.sin(phi),
        R * Math.sin(theta) * Math.sin(phi),
        R * Math.cos(phi)
      );
      dotsPos.push(pos.x, pos.y, pos.z);
      
      /* Subtle color variation */
      const c = new THREE.Color(0x00d4ff);
      c.setHSL(0.55 + Math.random() * 0.05, 0.8, 0.4 + Math.random() * 0.2);
      dotsColor.push(c.r, c.g, c.b);
    }
    
    pointsGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotsPos, 3));
    pointsGeo.setAttribute('color', new THREE.Float32BufferAttribute(dotsColor, 3));
    
    const pointsMat = new THREE.PointsMaterial({
      size: 0.015,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    const earthPoints = new THREE.Points(pointsGeo, pointsMat);
    scene.add(earthPoints);
    const earth = earthPoints; // keep ref for rotation

    /* ── Atmosphere glow (Keep existing shader as it's pure code) ── */
    const atmGeo = new THREE.SphereGeometry(R + 0.1, 64, 64);
    const atmMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main(){ vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main(){
          float intensity = pow(0.7 - dot(vNormal, vec3(0,0,1.0)), 4.0);
          gl_FragColor = vec4(0.0, 0.65, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphere = new THREE.Mesh(atmGeo, atmMat);
    scene.add(atmosphere);

    /* Highlight overlay for selected country (Pure color) */
    const hlGeo = new THREE.SphereGeometry(R + 0.02, 64, 64);
    const hlMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending
    });
    const highlight = new THREE.Mesh(hlGeo, hlMat);
    scene.add(highlight);

    /* Dot on selected region */
    const dotGeo = new THREE.SphereGeometry(0.025, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00d4ff });
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.visible = false;
    scene.add(dot);

    /* ── PING MARKERS for major server cities ── */
    const serverCities = [
      { lat:40.7,  lon:-74.0 },  // New York
      { lat:51.5,  lon:-0.1  },  // London
      { lat:48.9,  lon:2.3   },  // Paris
      { lat:52.5,  lon:13.4  },  // Berlin
      { lat:35.7,  lon:139.7 },  // Tokyo
      { lat:22.3,  lon:114.2 },  // Hong Kong
      { lat:1.3,   lon:103.8 },  // Singapore
      { lat:-33.9, lon:151.2 },  // Sydney
      { lat:37.4,  lon:-122.1},  // San Francisco
      { lat:43.7,  lon:-79.4 },  // Toronto
      { lat:55.8,  lon:37.6  },  // Moscow
      { lat:28.6,  lon:77.2  },  // Delhi
      { lat:-23.5, lon:-46.6 },  // São Paulo
      { lat:24.5,  lon:54.4  },  // Abu Dhabi
      { lat:37.6,  lon:127.0 },  // Seoul
    ];

    const pingGroup = new THREE.Group();
    serverCities.forEach(c => {
      const pos = latLonToVec3(c.lat, c.lon, R + 0.015);
      const pg = new THREE.SphereGeometry(0.012, 8, 8);
      const pm = new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.9 });
      const p = new THREE.Mesh(pg, pm);
      p.position.copy(pos);
      pingGroup.add(p);
    });
    earth.add(pingGroup);

    /* ── LIGHTS ── */
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.6);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);
    const ambLight = new THREE.AmbientLight(0x112244, 1.0);
    scene.add(ambLight);

    /* ── STARFIELD ── */
    const starsGeo = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 8000; i++) {
      const r = 80 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    starsGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.3, sizeAttenuation: true });
    scene.add(new THREE.Points(starsGeo, starsMat));

    /* ── MOUSE / DRAG ── */
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotVel = { x: 0, y: 0 };
    let autoRotate = true;

    canvas.addEventListener('mousedown', e => {
      isDragging = true;
      autoRotate = false;
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', e => {
      if (isDragging) {
        isDragging = false;
        /* resume auto-rotate after 3s */
        setTimeout(() => { autoRotate = true; }, 3000);
      }
    });
    window.addEventListener('mousemove', e => {
      if (!isDragging) {
        handleHover(e);
        return;
      }
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      rotVel.x = dy * 0.003;
      rotVel.y = dx * 0.003;
      earth.rotation.x += rotVel.x;
      earth.rotation.y += rotVel.y;
      atmosphere.rotation.x = earth.rotation.x;
      atmosphere.rotation.y = earth.rotation.y;
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('click', handleClick);

    /* Touch support */
    let lastTouch = null;
    canvas.addEventListener('touchstart', e => {
      lastTouch = e.touches[0]; autoRotate = false;
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!lastTouch) return;
      const t = e.touches[0];
      const dx = t.clientX - lastTouch.clientX;
      const dy = t.clientY - lastTouch.clientY;
      earth.rotation.y += dx * 0.005;
      earth.rotation.x += dy * 0.005;
      lastTouch = t;
    }, { passive: true });
    canvas.addEventListener('touchend', () => {
      lastTouch = null;
      setTimeout(() => { autoRotate = true; }, 3000);
    });

    /* Resize */
    window.addEventListener('resize', () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });

    /* ── RAYCASTER ── */
    const raycaster = new THREE.Raycaster();
    const mouse2d = new THREE.Vector2();
    const tooltip = document.getElementById('globeTooltip');
    const tooltipName = document.getElementById('tooltipName');
    const tooltipFlag = document.getElementById('tooltipFlag');

    function getMouseNDC(e) {
      const rect = canvas.getBoundingClientRect();
      mouse2d.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse2d.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function raycastGlobe(e) {
      getMouseNDC(e);
      raycaster.setFromCamera(mouse2d, camera);
      const hits = raycaster.intersectObject(earth);
      if (!hits.length) return null;
      const pt = hits[0].point.clone();
      /* Transform to earth's local frame to account for rotation */
      earth.worldToLocal(pt);
      return cartToLatLon(pt, R);
    }

    function handleHover(e) {
      const ll = raycastGlobe(e);
      if (!ll) { tooltip.classList.remove('visible'); return; }
      const country = findCountry(ll.lat, ll.lon);
      if (country) {
        tooltipFlag.textContent = country.flag;
        tooltipName.textContent = country.name;
        tooltip.classList.add('visible');
        /* position tooltip near cursor */
        const rect = canvas.getBoundingClientRect();
        tooltip.style.left = (e.clientX - rect.left) + 'px';
        tooltip.style.top = (e.clientY - rect.top - 50) + 'px';
        tooltip.style.transform = 'translate(-50%, -100%)';
        tooltip.style.bottom = 'auto';
      } else {
        tooltip.classList.remove('visible');
      }
    }

    function handleClick(e) {
      const ll = raycastGlobe(e);
      if (!ll) return;
      const country = findCountry(ll.lat, ll.lon);
      if (country) {
        window.selectedCountry = country;
        /* place dot */
        const pos = latLonToVec3(ll.lat, ll.lon, R + 0.02);
        earth.localToWorld(pos);
        dot.position.copy(pos);
        dot.visible = true;
        /* highlight flash */
        hlMat.opacity = 0.15;
        setTimeout(() => { hlMat.opacity = 0; }, 600);
        /* open panel */
        if (window.openCountryPanel) window.openCountryPanel(country);
      }
    }

    /* ── ANIMATION LOOP ── */
    const clock = new THREE.Clock();
    let pingT = 0;

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      pingT += delta;

      if (autoRotate) {
        earth.rotation.y += 0.0015;
      }

      /* Ping markers pulsate */
      pingGroup.children.forEach((p, i) => {
        const phase = (pingT * 2 + i * 0.5) % (Math.PI * 2);
        p.material.opacity = 0.4 + 0.5 * Math.abs(Math.sin(phase));
        const s = 1 + 0.3 * Math.sin(phase);
        p.scale.setScalar(s);
      });

      /* Inertia */
      if (!isDragging && !autoRotate) {
        rotVel.x *= 0.95;
        rotVel.y *= 0.95;
        earth.rotation.x += rotVel.x;
        earth.rotation.y += rotVel.y;
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  /* ── HELPERS ── */
  function latLonToVec3(lat, lon, r) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  function cartToLatLon(v, r) {
    const normalized = v.clone().normalize();
    const lat = 90 - (Math.acos(normalized.y) * 180 / Math.PI);
    const lon = (Math.atan2(normalized.z, -normalized.x) * 180 / Math.PI) - 180;
    return { lat, lon };
  }

  function findCountry(lat, lon) {
    const COUNTRIES = window.GLOBE_COUNTRIES;
    if (!COUNTRIES) return null;
    for (let i = COUNTRIES.length - 1; i >= 0; i--) {
      const c = COUNTRIES[i];
      if (lat >= c.lat[0] && lat <= c.lat[1] &&
          lon >= c.lon[0] && lon <= c.lon[1]) {
        return c;
      }
    }
    return null;
  }

  /* Make latLonToVec3 available globally */
  window.latLonToVec3 = latLonToVec3;
})();
