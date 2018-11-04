// TODO: Save the meshes after intersection to a file
import csg from '../../replaced-modules/three-js-csg/index.js'

import makTeapot from './test-imports/teapot.js'

// `trampoline` is an optimization to prevent stack overflows while using recursion on large sets
const trampoline = fn => {
  let result = fn()
  while (typeof result === 'function') {
    result = result()
  }
}

// `parameters` the initial input to generate the voxel field
const parameters = {
  // for the teapot demo use 2 | 3 segments and 40 voxel size
  voxelSize: 80, // 40 // 200
  width: 800
}

const createVoxels = async ({
  THREE,
  scene,
}) => {

  // MaleHead.obj
  const loader = new THREE.ObjectLoader()
  // load a resource
  const head = await new Promise((resolve, reject) => {
    loader.load(
      // resource URL
      'assets/low-poly-skull.json',
      // called when resource is loaded
      object => {
        object.children[0].scale.x = 15
        object.children[0].scale.y = 15
        object.children[0].scale.z = 15

        object.children[1].scale.x = 15
        object.children[1].scale.y = 15
        object.children[1].scale.z = 15

        const headGeometry = object.children[0].geometry

        headGeometry.computeBoundingBox();

        resolve(object)
        // console.log(object, center)
        // scene.add(object)
      },
      xhr => console.log((xhr.loaded / xhr.total * 100) + '% loaded'),
      err => console.log('An error happened', err) || reject(err)
    )
  })


  const ThreeBSP = csg(THREE)
  // `color` will be used in each mesh material
  const color = new THREE.Color();

  // `voxels` will be used to store the voxels, pivots, and other details on a per voxel level
  // { mesh, pivot, drop, startPosition }
  const voxels = []

  // for the teapot demo use 2 | 3 segments and 40 voxel size
  const {
    voxelSize,
    width
  } = parameters
  const half = width / 2

  // `sphere` is a temporary mesh to intersect with the voxel group
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(half, 30, 30),
    new THREE.MeshBasicMaterial({
      // color: 0xFFFFFF,
      // wireframe: true
      opacity: 0,
      transparent: true
    }));

  // `teapot` is a temporary mesh to intersect with the voxel group
  // This mesh is based on a BufferGeometry and is much more complex than the sphere
  const teapot = makTeapot({
    THREE,
    size: width / 4,
    segments: 3
  })
  // scene.add(teapot) // if you need to see the teapot

  // `plane` the plane that will cut the voxel group
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.2, width * 1.2, 2), new THREE.MeshBasicMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
    // wireframe: true
  }));
  // initial plane values
  plane.rotation.x = 200
  plane.rotation.y = 200
  plane.position.set(-half / 2, 0, 0)
  scene.add(plane);

  // `testCamera` will be used to test the position of a voxel relative to the center of the stage
  const testCamera = new THREE.PerspectiveCamera(40, window.innerWidth / (window.innerHeight / 2), 1, 1000);
  testCamera.rotation.x = 200
  testCamera.rotation.y = 200
  testCamera.position.set(-half / 2, 0, 0)

  // `counter` the count of voxels placed
  let counter = 0
  // `total` the number of voxels to place
  const total = Math.floor(width / voxelSize) ** 3

  // fills out a cube with voxels
  // uses a basic recursive traversal pattern
  // iterates along the x axis placing voxels until it has reached a distance
  // then increment the axis position
  const fillAxisRow = (distances = {
    x: 0,
    y: 0,
    z: 0
  }) => {
    // this table of if statements will change the axis to iterate
    if (distances.x < width) {
      counter += 1
      console.log(`placing ${counter} of ${total}`)
      const {
        x,
        y,
        z
      } = distances
      const geometry = new THREE.BoxGeometry(voxelSize, voxelSize, voxelSize)

      const vx = (x / width) + 0.5
      const vy = (y / width) + 0.5
      const vz = (z / width) + 0.5

      // color.setRGB(vx, vy, vz)
      color.setRGB(100, 100, 100)

      const material = new THREE.MeshBasicMaterial({
        color: color,
        // wireframe: true
      })
      const cube = new THREE.Mesh(geometry, material)

      cube.position.set(x - half, y - half, z - half)

      // const sBSP = new ThreeBSP(teapot);
      const skullBase = new ThreeBSP(head.children[0]);
      const voxelBase = new ThreeBSP(cube);

      const skullSub = voxelBase.intersect(skullBase);
      const skullVoxelMesh = skullSub.toMesh();

      skullVoxelMesh.material = material

      const pivot = new THREE.Group()

      var box = new THREE.Box3().setFromObject(skullVoxelMesh);

      // If it is completely not in the shape area, don't put it in the array
      if (box.min.x !== -Infinity && box.min.x !== Infinity) {
        voxels.push({
          startPosition: new THREE.Vector3(x - half, y - half, z - half),
          mesh: skullVoxelMesh,
          pivot
        })
        pivot.add(skullVoxelMesh)
        scene.add(pivot);
      }

      // must return a function to trampoline
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

  // return values required to calculate animation
  return {
    voxelGroup: voxels,
    testCamera,
    plane,
    width,
    head
  }
}

export default createVoxels