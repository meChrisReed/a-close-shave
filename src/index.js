// TODO: only import the parts that are needed
import * as THREE from 'three'

import injectStats from './inject-stats.js'
import init from "./scene/init.js"

injectStats()

const {
  camera,
  scene,
  renderer,
  voxelGroup,
  testCamera,
  width,
  plane
} = init(THREE)

let mouse = {
  x: 0,
  y: 0
}

document.querySelector("body").addEventListener('mousemove', e => {
  const xProportion = e.clientX / window.innerWidth
  const yProportion = (e.clientY / window.innerHeight)
  const x = (xProportion - 0.5) * 1000;
  const y = -(yProportion - 0.5) * 1000;

  const xRotation = (xProportion - 0.5) * 10
  const yRotation = (yProportion - 0.5) * 10
  plane.position.set(x, y, 0)
  plane.rotation.x = xRotation
  plane.rotation.y = yRotation
  testCamera.rotation.x = xRotation
  testCamera.rotation.y = yRotation
  testCamera.position.set(x, y, 0)
})

const animate = () =>
  requestAnimationFrame(animate) && render()

const render = () => {

  const time = Date.now() * 0.001
  const rotationX = time * 0.2
  const rotationY = time * 0.5
  for (let n = 0; n < voxelGroup.length; n++) {
    const cube = voxelGroup[n]

    if (!cube.drop) {
      cube.pivot.rotation.x = rotationX
      cube.pivot.rotation.y = rotationY
    }

    cube.mesh.updateMatrixWorld();
    cube.pivot.updateMatrixWorld();
    testCamera.updateMatrixWorld();
    testCamera.updateProjectionMatrix();

    var targetPosition = new THREE.Vector3();
    targetPosition = targetPosition.setFromMatrixPosition(cube.mesh.matrixWorld);

    var lookAt = testCamera.getWorldDirection(new THREE.Vector3(0, 0, 0));
    var cameraPos = new THREE.Vector3().setFromMatrixPosition(testCamera.matrixWorld);
    var pos = targetPosition.sub(cameraPos);

    const behind = (pos.angleTo(lookAt)) > (Math.PI / 2);

    if (behind) {
      const vx = (cube.mesh.position.x * width) - 0.5
      const vy = (cube.mesh.position.y * width) - 0.5
      const vz = (cube.mesh.position.z * width) - 0.5

      cube.mesh.material.color.setRGB(vx, vy, vz)
      cube.drop = true
      // cube.pivot.updateMatrix()
    } else {
      const vx = (cube.mesh.position.x / width) + 0.5
      const vy = (cube.mesh.position.y / width) + 0.5
      const vz = (cube.mesh.position.z / width) + 0.5

      cube.mesh.material.color.setRGB(vx, vy, vz)
    }

    if (cube.drop) {
      cube.pivot.position.y -= 5
      if (
        cube.pivot.position.x <= cube.startPosition.y - 1000 ||
        cube.pivot.position.x >= cube.startPosition.y + 1000 ||
        cube.pivot.position.y <= cube.startPosition.y - 1000 ||
        cube.pivot.position.y >= cube.startPosition.y + 1000 ||
        cube.pivot.position.z <= cube.startPosition.y - 1000 ||
        cube.pivot.position.z >= cube.startPosition.y + 1000
      ) {
        cube.drop = false
        cube.pivot.position.set(0, 0, 0)
      }
    }
  }


  renderer.render(scene, camera)

}

animate()