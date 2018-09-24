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

  const voxelSize = 80

  const width = 800
  const half = width / 2 // particles spread in the cube

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(half, 15, 15),
    new THREE.MeshBasicMaterial({
      // color: 0xFFFFFF,
      // wireframe: true
      opacity: 0,
      transparent: true
    }));

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.2, width * 1.2, 2), new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
    // wireframe: true
  }));


  plane.rotation.x = 200
  plane.rotation.y = 200
  plane.position.set(-half / 2, 0, 0)

  scene.add(plane);

  const testCamera = new THREE.PerspectiveCamera(40, window.innerWidth / (window.innerHeight / 2), 1, 1000);
  testCamera.rotation.x = 200
  testCamera.rotation.y = 200
  testCamera.position.set(-half / 2, 0, 0)

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
      newMesh.startPosition = new THREE.Vector3(x - half, y - half, z - half)

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
    voxelGroup: group,
    testCamera,
    plane,
    width
  }
}

export default createVoxels