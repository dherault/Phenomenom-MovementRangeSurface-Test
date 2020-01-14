const canvas = document.getElementById('canvas')
const _ = canvas.getContext('2d')

const width = canvas.width = window.innerWidth
const height = canvas.height = window.innerHeight
const origin = { x: width / 2, y: height / 2 }

/* ---
  PARAMS
--- */

const vertexRadius = 2
const dotRadius = 1

const movementRange = 400
const dotSpacing = movementRange / 100

/* ---
  OBSTACLES
--- */

const obstacles = [
  [
    o({ x: 51, y: -51 }),
    o({ x: -31, y: -151 }),
    o({ x: 141, y: -211 }),
    o({ x: 211, y: -51 }),
  ],
  [
    o({ x: 21, y: -311 }),
    o({ x: -251, y: -411 }),
    o({ x: -251, y: -111 }),
  ],
]

const obstaclesSegments = []

for (let k = 0; k < obstacles.length; k++) {
  const obstacle = obstacles[k]
  const segments = []

  obstacle.forEach((vertex, i) => {
    segments.push([obstacle[i > 0 ? i - 1 : obstacle.length - 1], vertex])
  })

  obstaclesSegments.push(segments)
}

/* ---
  DOTS
--- */

const dots = []

for (let i = -movementRange; i <= movementRange; i += dotSpacing) {
  for (let j = -movementRange; j <= movementRange; j += dotSpacing) {
    const dot = {
      x: origin.x + i,
      y: origin.y + j,
    }

    if (i * i + j * j < movementRange * movementRange && isOutsideOfObstacles(dot)) {
    // if (isOutsideOfObstacles(dot)) {
      dots.push(dot)
    }
  }
}

const originDot = dots.find(dot => dot.x < origin.x + dotSpacing / 2 && dot.x > origin.x - dotSpacing / 2 && dot.y < origin.y + dotSpacing / 2 && dot.y > origin.y - dotSpacing / 2)

const dotHashes = {}

dots.forEach(dot => dotHashes[hashDot(dot)] = true)

/* ---
  HELPERS
--- */

function isOutsideOfObstacles(dot) {
  const segment = [dot, { x: width, y: dot.y }]

  for (let k = 0; k < obstacles.length; k++) {
    const obstacleSegments = obstaclesSegments[k]
    const intersections = new Set()

    for (let i = 0; i < obstacleSegments.length; i++) {
      const obstacleSegment = obstacleSegments[i]

      if (areIntersecting(segment, obstacleSegment)) {
        intersections.add(hashDot(computeIntersection(segment, obstacleSegment)))
      }
    }

    if (intersections.size % 2 !== 0) {
      return false
    }
  }

  return true
}

function areIntersecting([{ x: x1, y: y1 }, { x: x2, y: y2 }], [{ x: x3, y: y3 }, { x: x4, y: y4 }]) {
	// Compute a1, b1, c1, where line joining points 1 and 2
	// is "a1 x + b1 y + c1 = 0".
	const a1 = y2 - y1
	const b1 = x1 - x2
	const c1 = x2 * y1 - x1 * y2

	// Compute r3 and r4.
	const r3 = a1 * x3 + b1 * y3 + c1
  const r4 = a1 * x4 + b1 * y4 + c1

	// Check signs of r3 and r4. If both point 3 and point 4 lie on
	// same side of line 1, the line segments do not intersect.
	if (r3 !== 0 && r4 !== 0 && sameSign(r3, r4)) {
		return false
	}

	// Compute a2, b2, c2
	const a2 = y4 - y3
	const b2 = x3 - x4
	const c2 = x4 * y3 - x3 * y4

	// Compute r1 and r2
	const r1 = a2 * x1 + b2 * y1 + c2
	const r2 = a2 * x2 + b2 * y2 + c2

	// Check signs of r1 and r2. If both point 1 and point 2 lie
	// on same side of second line segment, the line segments do
	// not intersect.
	if (r1 !== 0 && r2 !== 0 && sameSign(r1, r2)) {
		return false
	}

	//Line segments intersect: compute intersection point.
	const denom = a1 * b2 - a2 * b1

	if (denom === 0) { // collinear
    return isBetween(x1, y1, x3, y3, x4, y4) || isBetween(x2, y2, x3, y3, x4, y4)
	}

	// lines intersect
	return true
}

function sameSign(p, q) {
  return p * q > 0
}

function isBetween(x1, y1, x2, y2, x3, y3) {
  return (x1 > x2 && x1 < x3 && y1 > y2 && y1 < y3) || (x1 > x3 && x1 < x2 && y1 > y3 && y1 < y2)
}

function computeIntersection([a, b], [c, d]) {
  const a1 = (b.y - a.y) / (b.x - a.x)
  const a2 = (d.y - c.y) / (d.x - c.x)
  const b1 = a.y - a1 * a.x
  const b2 = c.y - a2 * c.x

  const x = (b1 - b2) / (a2 - a1)
  const y = a1 * x + b1

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
  }
}

function o({ x, y }) {
  return {
    x: x + origin.x,
    y: y + origin.y,
  }
}

function hashDot(dot) {
  return `${dot.x}_${dot.y}`
}

function distance(a, b) {
  return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y))
}

/* ---
  BREATH-FIRST SEARCH
--- */

function handlePropagateClick() {
  const result = []
  const fringe = [[originDot, 0, hashDot(originDot)]]
  const passedDotHashes = {}

  do {
    const [dot, value] = fringe.shift()

    if (value >= movementRange) {
      continue
    }

    result.push(dot)

    drawDot(dot)

    const x = [
      { x: dot.x - dotSpacing, y: dot.y },
      { x: dot.x + dotSpacing, y: dot.y },
      { x: dot.x, y: dot.y - dotSpacing },
      { x: dot.x, y: dot.y + dotSpacing },
      { x: dot.x - dotSpacing, y: dot.y - dotSpacing },
      { x: dot.x + dotSpacing, y: dot.y - dotSpacing },
      { x: dot.x - dotSpacing, y: dot.y + dotSpacing },
      { x: dot.x + dotSpacing, y: dot.y + dotSpacing },
    ]
    .map(neighbouringDot => [neighbouringDot, hashDot(neighbouringDot)])

    const y = x.filter(([neighbouringDot, hash]) => dotHashes[hash] && !passedDotHashes[hash])

    y.forEach(([neighbouringDot, hash]) => {
      passedDotHashes[hash] = true
      fringe.push([neighbouringDot, value + distance(dot, neighbouringDot)])
    })
  } while (fringe.length > 0)
}

/* ---
  DRAW
--- */

function draw() {
  drawOuterCircle()
  drawObstacles()
  drawDots()
  drawDot(originDot)
}

function drawOuterCircle() {
  _.strokeStyle = 'blue'
  _.beginPath()
  _.arc(origin.x, origin.y, movementRange, 0, 2 * Math.PI)
  _.closePath()
  _.stroke()
}

function drawObstacles() {
  _.fillStyle = 'red'
  _.strokeStyle = 'red'

  obstacles.forEach(vertices => {
    vertices.forEach((vertex, i) => {
      _.beginPath()
      _.arc(vertex.x, vertex.y, vertexRadius, 0, 2 * Math.PI)
      _.closePath()
      _.fill()

      const previousVertex = vertices[i === 0 ? vertices.length - 1 : i - 1]

      _.beginPath()
      _.moveTo(previousVertex.x, previousVertex.y)
      _.lineTo(vertex.x, vertex.y)
      _.stroke()
    })
  })
}

function drawDots() {
  _.fillStyle = 'lightgrey'

  dots.forEach(dot => {
    _.beginPath()
    _.arc(dot.x, dot.y, dotRadius, 0, 2 * Math.PI)
    _.closePath()
    _.fill()
  })
}

const dotReserve = {}

function drawDot(dot) {
  const hash = hashDot(dot)

  if (dotReserve[hash]) {
    return console.log('doublon', hash)
  }

  dotReserve[hash] = true

  _.fillStyle = 'green'

  _.beginPath()
  _.arc(dot.x, dot.y, dotRadius, 0, 2 * Math.PI)
  _.closePath()
  _.fill()
}

/* ---
  DOCUMENT
--- */

window.onload = draw

document.getElementById('propagate').onclick = handlePropagateClick
