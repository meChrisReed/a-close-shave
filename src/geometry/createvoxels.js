const createVoxels = ({
  particles = 100000,
  THREE,
  scene,
}) => {
  const geometry = new THREE.BufferGeometry();

  // WARNING: FOR loop mutates i, positions, and colors
  // required for performance
  const positions = [];
  const colors = [];

  const color = new THREE.Color();

  // TODO: convert buffers to geometry

  const n = 700,
    n2 = n / 2; // particles spread in the cube

  for (var i = 0; i < particles; i++) {

    // positions

    const x = Math.random() * n - n2
    const y = Math.random() * n - n2
    const z = Math.random() * n - n2

    positions.push(x, y, z);

    // colors

    const vx = (x / n) + 0.5;
    const vy = (y / n) + 0.5;
    const vz = (z / n) + 0.5;

    color.setRGB(vx, vy, vz);

    colors.push(color.r, color.g, color.b);

  }

  geometry.addAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  geometry.computeBoundingSphere();

  //

  const material = new THREE.PointsMaterial({
    size: 100,
    vertexColors: THREE.VertexColors
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    points
  }
}

export default createVoxels