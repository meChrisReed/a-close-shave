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
  // const geometry = new THREE.BufferGeometry();

  // WARNING: FOR loop mutates i, positions, and colors
  // required for performance
  // const positions = [];
  // const colors = [];

  const color = new THREE.Color();
  const group = new THREE.Group();

  const voxelSize = 60

  const width = 500
  const half = width / 2 // particles spread in the cube

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

      cube.position.set(x, y, z)
      group.add(cube)
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
  group.applyMatrix(new THREE.Matrix4().makeTranslation(-half, -half, -half));

  const pivot = new THREE.Object3D();
  pivot.add(group);

  scene.add(pivot);

  return {
    points: pivot
  }
}

export default createVoxels