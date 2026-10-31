
import * as THREE from 'three'

// All dimensions are in metres.
const WIDTH = 6.096
const LENGTH = 13.4112
const KITCHEN = 2.1336
const LINE_WIDTH = 0.05

export function createCourt(): THREE.Group {
  const court = new THREE.Group()

  const surface = new THREE.Mesh(
    new THREE.PlaneGeometry(WIDTH, LENGTH),
    new THREE.MeshStandardMaterial({
      color: 0x176b9b,
      roughness: 0.85,
    }),
  )
  surface.rotation.x = -Math.PI / 2
  court.add(surface)

  // Non-volley zones on both sides of the net.
  const kitchenMaterial = new THREE.MeshStandardMaterial({
    color: 0x30a5a0,
    roughness: 0.85,
  })

  for (const side of [-1, 1]) {
    const zone = new THREE.Mesh(
      new THREE.PlaneGeometry(WIDTH, KITCHEN),
      kitchenMaterial,
    )
    zone.rotation.x = -Math.PI / 2
    zone.position.set(0, 0.002, side * KITCHEN / 2)
    court.add(zone)
  }

  const white = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  })

  function line(
    x: number,
    z: number,
    width: number,
    depth: number,
  ): void {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, depth),
      white,
    )
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set(x, 0.012, z)
    court.add(mesh)
  }

  // Outer boundary lines.
  line(-WIDTH / 2, 0, LINE_WIDTH, LENGTH)
  line(WIDTH / 2, 0, LINE_WIDTH, LENGTH)
  line(0, -LENGTH / 2, WIDTH, LINE_WIDTH)
  line(0, LENGTH / 2, WIDTH, LINE_WIDTH)

  // Non-volley-zone boundaries.
  line(0, -KITCHEN, WIDTH, LINE_WIDTH)
  line(0, KITCHEN, WIDTH, LINE_WIDTH)

  // Service-court centre lines.
  const serviceLength = LENGTH / 2 - KITCHEN
  for (const side of [-1, 1]) {
    line(
      0,
      side * (KITCHEN + serviceLength / 2),
      LINE_WIDTH,
      serviceLength,
    )
  }

  // Net posts and a slightly sagging net.
  const postHeight = 0.9144
  const centreHeight = 0.8636
  const postMaterial = new THREE.MeshStandardMaterial({
    color: 0x333b45,
  })

  for (const x of [-WIDTH / 2, WIDTH / 2]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, postHeight, 12),
      postMaterial,
    )
    post.position.set(x, postHeight / 2, 0)
    court.add(post)
  }

  const netMaterial = new THREE.MeshBasicMaterial({
    color: 0xe5eaf0,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  })

  const segments = 32
  const vertices: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= segments; i++) {
    const x = -WIDTH / 2 + WIDTH * i / segments
    const sag = 1 - Math.abs(x) / (WIDTH / 2)
    const height = postHeight - (postHeight - centreHeight) * sag

    vertices.push(x, 0.055, 0)
    vertices.push(x, height, 0)

    if (i < segments) {
      const a = i * 2
      indices.push(a, a + 1, a + 2)
      indices.push(a + 1, a + 3, a + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(vertices, 3),
  )
  geometry.setIndex(indices)
  geometry.computeVertexNormals()

  court.add(new THREE.Mesh(geometry, netMaterial))

  return court
}
