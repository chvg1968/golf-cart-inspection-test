<template>
  <div class="diagram-drawing-container">
    <div class="drawing-tools">
      <!-- Colores -->
      <div class="color-picker">
        <button 
          v-for="color in colors" 
          :key="color"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
          :class="{ active: currentColor === color }"
        ></button>
      </div>
      
      <!-- Grosores -->
      <div class="line-width-picker">
        <button 
          v-for="width in lineWidths" 
          :key="width"
          @click="selectLineWidth(width)"
          :class="{ active: currentLineWidth === width }"
        >
          <div :style="{ width: `${width * 2}px`, height: `${width * 2}px`, borderRadius: '50%', backgroundColor: 'black' }"></div>
        </button>
      </div>
      
      <!-- Botones de acción -->
      <div class="action-buttons">
        <button @click="undo" title="Deshacer último trazo">↩️</button>
        <button @click="clearCanvas" title="Borrar todo">🗑️</button>
      </div>
    </div>
    
    <canvas 
      ref="drawingCanvas"
      :width="canvasWidth" 
      :height="canvasHeight"
      @mousedown="startDrawing"
      @mousemove="draw"
      @mouseup="stopDrawing"
      @mouseout="stopDrawing"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps({
  backgroundImage: {
    type: String,
    required: true
  },
  canvasWidth: {
    type: Number,
    default: 600
  },
  canvasHeight: {
    type: Number,
    default: 400
  }
})

const emit = defineEmits(['drawing-updated'])

// Colores predefinidos
const colors = ['red', 'blue', 'yellow']
const currentColor = ref(colors[0])

// Grosores de línea
const lineWidths = [1, 3, 5]
const currentLineWidth = ref(lineWidths[1])

const drawingCanvas = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)

// Historial de trazos para deshacer
const drawHistory: ImageData[] = []

const selectColor = (color: string) => {
  currentColor.value = color
}

const selectLineWidth = (width: number) => {
  currentLineWidth.value = width
}

const startDrawing = (e: MouseEvent) => {
  if (!drawingCanvas.value) return

  const canvas = drawingCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Guardar estado actual antes de dibujar
  drawHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height))

  isDrawing.value = true
  draw(e)
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !drawingCanvas.value) return

  const canvas = drawingCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  ctx.beginPath()
  ctx.strokeStyle = currentColor.value
  ctx.lineWidth = currentLineWidth.value
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.lineTo(x, y)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x, y)

  emit('drawing-updated')
}

const stopDrawing = () => {
  isDrawing.value = false
}

const undo = () => {
  if (!drawingCanvas.value || drawHistory.length === 0) return

  const canvas = drawingCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Restaurar último estado guardado
  const lastState = drawHistory.pop()
  if (lastState) {
    ctx.putImageData(lastState, 0, 0)
  }

  emit('drawing-updated')
}

const clearCanvas = () => {
  if (!drawingCanvas.value) return

  const canvas = drawingCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Guardar estado antes de borrar
  drawHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height))

  // Limpiar canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Cargar imagen de fondo
  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }
  img.src = props.backgroundImage

  emit('drawing-updated')
}

onMounted(() => {
  if (!drawingCanvas.value) return

  const canvas = drawingCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Cargar imagen de fondo
  const img = new Image()
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }
  img.src = props.backgroundImage
})
</script>

<style scoped>
.diagram-drawing-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.drawing-tools {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.color-picker button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin: 0 5px;
  border: 2px solid transparent;
}

.color-picker button.active {
  border-color: black;
}

.line-width-picker button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: 2px solid transparent;
}

.line-width-picker button.active {
  border-color: black;
}

.action-buttons button {
  margin: 0 5px;
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
}

canvas {
  border: 1px solid #ccc;
  cursor: crosshair;
}
</style>
