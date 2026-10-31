
import * as THREE from 'three'
import { createCourt } from './render/Court'
import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('找不到 #app 元素')
}

app.innerHTML = `
  <div class="game">
    <div class="game-title">匹克球對決 2.5D</div>
    <div id="game-canvas"></div>
    <div class="game-hint">第一版：3D 匹克球場</div>
  </div>
`

const container = document.querySelector<HTMLDivElement>(
  '#game-canvas',
)!

// 建立 3D 場景
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x101b29)

// 建立攝影機：從自己這邊的後上方觀看
const camera = new THREE.PerspectiveCamera(
  45,
  1,
  0.1,
  100,
)

camera.position.set(9, 12, 16)
camera.lookAt(0, 0, 0)

// 建立渲染器
const renderer = new THREE.WebGLRenderer({
  antialias: true,
})

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2),
)

container.appendChild(renderer.domElement)

// 加入燈光
scene.add(new THREE.AmbientLight(0xffffff, 1.5))

const sunlight = new THREE.DirectionalLight(
  0xffffff,
  2,
)
sunlight.position.set(5, 12, 8)
scene.add(sunlight)

// 加入匹克球場
const court = createCourt()
scene.add(court)

// 球場外的地板
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 35),
  new THREE.MeshStandardMaterial({
    color: 0x253c42,
    roughness: 1,
  }),
)

ground.rotation.x = -Math.PI / 2
ground.position.y = -0.03
scene.add(ground)

// 自動調整畫面大小，支援手機
function resize(): void {
  const width = container.clientWidth
  const height = container.clientHeight

  camera.aspect = width / height

  // 手機直式畫面時，拉遠鏡頭
  const isPortrait = width < height
  camera.position.set(
    isPortrait ? 14 : 9,
    isPortrait ? 20 : 12,
    isPortrait ? 26 : 16,
  )
  camera.lookAt(0, 0, 0)

  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

window.addEventListener('resize', resize)
resize()

// 繪製場景
renderer.render(scene, camera)
