// TODO: only import the parts that are needed
import * as THREE from 'three'

import injectStats from './inject-stats.js'
import init from "./scene/init.js"

injectStats()

const {
  camera,
  scene,
  renderer,
  points
} = init(THREE)

const animate = () =>
  requestAnimationFrame(animate) && render()

const render = () => {

  const time = Date.now() * 0.001

  points.rotation.x = time * 0.25
  points.rotation.y = time * 0.5

  renderer.render(scene, camera)

}

animate()