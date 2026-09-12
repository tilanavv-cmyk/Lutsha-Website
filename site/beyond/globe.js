(() => {
  const mount = document.querySelector('#beyond-globe');
  const shell = document.querySelector('.beyond-globe-shell');
  const routeLabel = document.querySelector('#beyond-route-label');
  const rotationToggle = document.querySelector('#beyond-rotation-toggle');
  const homeButton = document.querySelector('#beyond-home');

  if (!mount || !shell || !window.Globe) return;

  const origin = { name: 'South Africa', lat: -30.5595, lng: 22.9375, color: '#f4b56b', size: .44 };
  const destinations = [
    { name: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219, color: '#70dfd2' },
    { name: 'Accra', country: 'Ghana', lat: 5.6037, lng: -.187, color: '#72d4ff' },
    { name: 'London', country: 'United Kingdom', lat: 51.5072, lng: -.1276, color: '#e95765' },
    { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405, color: '#70dfd2' },
    { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, color: '#f4b56b' },
    { name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.209, color: '#e95765' },
    { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, color: '#72d4ff' },
    { name: 'Beijing', country: 'China', lat: 39.9042, lng: 116.4074, color: '#e95765' },
    { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, color: '#4d82e8' },
    { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, color: '#70dfd2' },
  ];
  const routes = destinations.map((destination, index) => ({
    startLat: origin.lat,
    startLng: origin.lng,
    endLat: destination.lat,
    endLng: destination.lng,
    color: [origin.color, destination.color],
    altitude: .16 + (index % 4) * .04,
  }));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let rotating = !reducedMotion;

  const globe = window.Globe()(mount)
    .backgroundColor('rgba(0,0,0,0)')
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .atmosphereColor('#72d4ff')
    .atmosphereAltitude(.17)
    .showGraticules(true)
    .pointsData([origin, ...destinations.map((destination) => ({ ...destination, size: .22 }))])
    .pointLat('lat').pointLng('lng').pointColor('color').pointAltitude(.018).pointRadius('size')
    .pointLabel((place) => `<div style="padding:7px 9px"><strong>${place.name}</strong>${place.country ? `<br><span style="opacity:.72">${place.country}</span>` : '<br><span style="opacity:.72">Origin</span>'}</div>`)
    .arcsData(routes)
    .arcColor('color').arcAltitude('altitude').arcStroke(.42)
    .arcDashLength(.45).arcDashGap(.22).arcDashInitialGap(() => Math.random()).arcDashAnimateTime(2400)
    .ringsData([origin])
    .ringColor(() => (time) => `rgba(244,181,107,${1 - time})`).ringMaxRadius(4).ringPropagationSpeed(1.7).ringRepeatPeriod(900)
    .labelsData(destinations)
    .labelLat('lat').labelLng('lng').labelText('name').labelColor(() => '#f7fbff')
    .labelDotRadius(.2).labelSize(.85).labelAltitude(.02).labelResolution(2);

  const focusPlace = (place) => {
    globe.pointOfView({ lat: place.lat, lng: place.lng, altitude: 1.7 }, reducedMotion ? 0 : 1000);
    routeLabel.innerHTML = `<span aria-hidden="true"></span>${place.country ? `South Africa → ${place.name}, ${place.country}` : 'South Africa · our starting point'}`;
  };
  globe.onPointClick(focusPlace).onLabelClick(focusPlace);
  globe.controls().autoRotate = rotating;
  globe.controls().autoRotateSpeed = .55;
  globe.controls().enableDamping = true;
  globe.controls().dampingFactor = .07;

  const resize = () => {
    const size = shell.clientWidth;
    globe.width(size).height(size);
  };
  resize();
  globe.pointOfView({ lat: -13, lng: 18, altitude: 1.95 }, 0);
  shell.classList.add('is-interactive');

  rotationToggle?.addEventListener('click', () => {
    rotating = !rotating;
    globe.controls().autoRotate = rotating;
    rotationToggle.textContent = rotating ? 'Pause rotation' : 'Resume rotation';
    rotationToggle.setAttribute('aria-pressed', String(!rotating));
  });
  homeButton?.addEventListener('click', () => focusPlace(origin));
  window.addEventListener('resize', resize, { passive: true });
})();
