import onWindowResize from "./onWindowResize.js"
import createVoxels from "../geometry/createvoxels.js"

const init = (THREE) => {

  // set up the basic scene
  const camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 5, 3500)
  camera.position.x = 400;
  camera.position.y = 400;
  camera.position.z = 2750

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0Xf0f0f0)
  scene.fog = new THREE.Fog(0x050505, 2000, 3500)

  camera.lookAt(scene.position);

  var size = 1000;
  var divisions = 10;

  // var gridHelper = new THREE.GridHelper(size, divisions);
  // scene.add(gridHelper);

  const {
    voxelGroup,
    testCamera,
    width,
    plane
  } = createVoxels({
    THREE,
    scene
  })

  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const container = document.body
  container.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize({
    camera,
    renderer
  }), false);

  return {
    camera,
    scene,
    renderer,
    voxelGroup,
    testCamera,
    width,
    plane
  }

}

export default init