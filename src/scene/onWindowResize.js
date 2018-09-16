const onWindowResize = ({
  camera,
  renderer
}) => () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

export default onWindowResize