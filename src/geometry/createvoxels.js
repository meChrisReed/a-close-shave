import csg from 'three-js-csg'

const trampoline = fn => {
  let result = fn()
  while (typeof result === 'function') {

    result = result()
  }
}

const createVoxels = ({
  THREE,
  scene,
}) => {
  const ThreeBSP = csg(THREE)
  // const geometry = new THREE.BufferGeometry();

  // WARNING: FOR loop mutates i, positions, and colors
  // required for performance
  // const positions = [];
  // const colors = [];

  const color = new THREE.Color();
  const group = new THREE.Group();

  const voxelSize = 100

  const width = 800
  const half = width / 2 // particles spread in the cube

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(400, 10, 10),
    new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      wireframe: true
    }));

  const fillAxisRow = (distances = {
    x: 0,
    y: 0,
    z: 0
  }) => {
    if (distances.x < width) {
      const {
        x,
        y,
        z
      } = distances
      const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize)

      const vx = (x / width) + 0.5
      const vy = (y / width) + 0.5
      const vz = (z / width) + 0.5

      color.setRGB(vx, vy, vz)
      const material = new THREE.MeshBasicMaterial({
        color: color,
        // wireframe: true
      })
      const cube = new THREE.Mesh(geometry, material)

      cube.position.set(x - half, y - half, z - half)

      const sBSP = new ThreeBSP(sphere);
      const bBSP = new ThreeBSP(cube);

      const sub = bBSP.intersect(sBSP);
      const newMesh = sub.toMesh();

      newMesh.material = material


      group.add(newMesh)
      return () => fillAxisRow({
        x: distances.x + voxelSize,
        y: distances.y,
        z: distances.z
      })
    } else if (distances.y < width) {
      return () => fillAxisRow({
        x: 0,
        y: distances.y + voxelSize,
        z: distances.z
      })
    } else if (distances.z < width) {
      return () => fillAxisRow({
        x: 0,
        y: 0,
        z: distances.z + voxelSize
      })
    }
  }

  trampoline(fillAxisRow)
  scene.add(group);
  scene.add(sphere)

  return {
    points: group
  }
}

export default createVoxels