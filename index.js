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
const dotSpacing = movementRange / 50

/* ---
  OBSTACLES
--- */

const obstacles = [
  [
    o({ x: 50, y: -50 }),
    o({ x: -10, y: -150 }),
    o({ x: 140, y: -200 }),
    o({ x: 200, y: -50 }),
  ],
  [
    o({ x: 20, y: -300 }),
    o({ x: -250, y: -400 }),
    o({ x: -250, y: -100 }),
  ],
]

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
      dots.push(dot)
    }
  }
}

function isOutsideOfObstacles(dot) {
  return true
  // const segment = [dot, { x: width, y: dot.y }]

  // for (let k = 0; k < obstacles.length; k++) {
  //   const obstacle = obstacles[k].reduce((a, b) => {

  //   })


  // }
}

/* ---
  HELPERS
--- */

function o({ x, y }) {
  return {
    x: x + origin.x,
    y: y + origin.y,
  }
}

/* ---
  DRAW
--- */

function draw() {
  drawOuterCircle()
  drawObstacles()
  drawDots()
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
  _.fillStyle = 'grey'

  dots.forEach(dot => {
    _.beginPath()
    _.arc(dot.x, dot.y, dotRadius, 0, 2 * Math.PI)
    _.closePath()
    _.fill()
  })
}

window.onload = draw
