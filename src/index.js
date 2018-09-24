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

  voxelGroup.rotation.x = time * 0.25
  voxelGroup.rotation.y = time * 0.5

  for (let n = 0; n < voxelGroup.children.length; n++) {
    const cube = voxelGroup.children[n]

    cube.updateMatrixWorld();
    testCamera.updateMatrixWorld();
    testCamera.updateProjectionMatrix();

    var targetPosition = new THREE.Vector3();
    targetPosition = targetPosition.setFromMatrixPosition(cube.matrixWorld);

    var lookAt = testCamera.getWorldDirection(new THREE.Vector3(0, 0, 0));
    var cameraPos = new THREE.Vector3().setFromMatrixPosition(testCamera.matrixWorld);
    var pos = targetPosition.sub(cameraPos);

    const behind = (pos.angleTo(lookAt)) > (Math.PI / 2);

    if (behind) {
      const vx = (cube.position.x * width) - 0.5
      const vy = (cube.position.y * width) - 0.5
      const vz = (cube.position.z * width) - 0.5

      cube.material.color.setRGB(vx, vy, vz)
      cube.drop = true
    } else {
      const vx = (cube.position.x / width) + 0.5
      const vy = (cube.position.y / width) + 0.5
      const vz = (cube.position.z / width) + 0.5

      cube.material.color.setRGB(vx, vy, vz)
    }

    if (cube.drop) {
      cube.position.y -= 5
      if (cube.position.y <= cube.startPosition.y - 500) {
        cube.drop = false
        cube.position.set(cube.startPosition.x, cube.startPosition.y, cube.startPosition.z)
      }
    }
  }


  renderer.render(scene, camera)

}

animate()