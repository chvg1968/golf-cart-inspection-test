<template>
  <div class="cart-diagram-annotations-container">
    <!-- Convención de colores -->
    <div class="color-convention">
      <h3 class="text-subtitle1">Color Reference:</h3>
      <div class="convention-item">
        <span class="color-dot" style="background-color: red;"></span>
        <span class="text-caption">Scratches</span>
      </div>
      <div class="convention-item">
        <span class="color-dot" style="background-color: #00FF7F;"></span>
        <span class="text-caption">Missing parts</span>
      </div>
      <div class="convention-item">
        <span class="color-dot" style="background-color: #BF40BF;"></span>
        <span class="text-caption">Damage/Bumps</span>
      </div>
    </div>

    <div 
      class="diagram-container" 
      ref="cartDiagramContainer"
      @mousedown="handleContainerMouseDown"
      @mousemove="handleContainerMouseMove"
      @mouseup="handleContainerMouseUp"
      @mouseout="handleContainerMouseOut"
    >
      <!-- Herramientas de dibujo -->
      <div class="drawing-tools">
        <!-- Selector de color -->
        <div class="color-picker">
          <button 
            v-for="option in colorOptions" 
            :key="option.color"
            :style="{ backgroundColor: option.color }"
            @click="selectColor(option.color)"
            :class="{ active: currentColor === option.color }"
          ></button>
        </div>
        
        <!-- Botones de acción -->
        <div class="action-buttons">
          <button @click="undo" title="Deshacer último trazo">↩️</button>
          <button @click="clearCanvas" title="Borrar todo">🗑️</button>
        </div>
      </div>

      <!-- Imagen del diagrama -->
      <img 
        ref="cartImage"
        :src="currentDiagramPath" 
        :alt="cartTypeLabel || 'Golf Cart Diagram'" 
        class="cart-diagram"
        draggable="false"
        @load="onImageLoad"
      />

      <!-- Canvas de dibujo superpuesto -->
      <canvas 
        ref="drawingCanvas"
        class="drawing-canvas"
        :width="canvasWidth"
        :height="canvasHeight"
      ></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { fourSeaterImage, sixSeaterImage } from '@/assets/images'

// Definir props con valores por defecto
const props = withDefaults(defineProps<{
  cartType?: string
  diagramPath?: string
  diagramType?: string
}>(), {
  diagramPath: fourSeaterImage,
  diagramType: '4seater'
})

// Emitir eventos
const emit = defineEmits<{
  (e: 'diagram-annotated', image: string): void
}>()

// Referencia al contenedor del diagrama
const cartDiagramContainer = ref<HTMLDivElement | null>(null)
const cartImage = ref<HTMLImageElement | null>(null)
const drawingCanvas = ref<HTMLCanvasElement | null>(null)
const drawingContext = ref<CanvasRenderingContext2D | null>(null)

// Ruta del diagrama actual
const currentDiagramPath = ref(props.diagramPath)

// Observar cambios en el tipo de carrito y la ruta del diagrama
watch([() => props.cartType, () => props.diagramType], ([newCartType, newDiagramType]) => {
  console.log('Actualizando diagrama:', { newCartType, newDiagramType })
  
  // Priorizar diagramType si está presente
  if (newDiagramType?.includes('6seater') || newCartType?.includes('6')) {
    currentDiagramPath.value = sixSeaterImage
  } else {
    currentDiagramPath.value = fourSeaterImage
  }
  
  console.log('Diagrama seleccionado:', currentDiagramPath.value)
}, { immediate: true })

// Colores predefinidos
const colorOptions = [
  { color: 'red' },
  { color: '#00FF7F' },  // Spring Green
  { color: '#BF40BF' }   // Bright Magenta
]

// Estado de dibujo
const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const currentColor = ref(colorOptions[0].color)
const currentLineWidth = ref(8)

// Dimensiones del canvas
const canvasWidth = ref(0)
const canvasHeight = ref(0)

// Obtener label del tipo de carrito
const cartTypeLabel = computed(() => {
  return props.cartType?.includes('6') ? '6 Seater' : '4 Seater'
})

// Método para configurar canvas
const setupDrawingCanvas = () => {
  console.log('Configurando canvas de dibujo')
  
  if (!drawingCanvas.value || !cartImage.value) {
    console.error('Canvas o imagen no inicializados')
    return
  }

  // Ajustar dimensiones del canvas
  canvasWidth.value = cartImage.value.offsetWidth
  canvasHeight.value = cartImage.value.offsetHeight

  drawingCanvas.value.width = canvasWidth.value
  drawingCanvas.value.height = canvasHeight.value

  drawingContext.value = drawingCanvas.value.getContext('2d')
  if (!drawingContext.value) {
    console.error('No se pudo obtener el contexto del canvas')
    return
  }

  // Configurar contexto de dibujo
  drawingContext.value.lineCap = 'round'
  drawingContext.value.lineJoin = 'round'
  drawingContext.value.lineWidth = currentLineWidth.value
  drawingContext.value.strokeStyle = currentColor.value

  console.log('Canvas configurado correctamente')
}

// Manejadores de eventos de dibujo
const drawPoint = (x: number, y: number) => {
  if (!drawingContext.value) return

  drawingContext.value.beginPath()
  drawingContext.value.arc(x, y, currentLineWidth.value / 2, 0, Math.PI * 2)
  drawingContext.value.fillStyle = currentColor.value
  drawingContext.value.fill()
}

const drawLine = (fromX: number, fromY: number, toX: number, toY: number) => {
  if (!drawingContext.value) return

  drawingContext.value.beginPath()
  drawingContext.value.moveTo(fromX, fromY)
  drawingContext.value.lineTo(toX, toY)
  drawingContext.value.stroke()
}

// Manejadores de eventos del contenedor
const handleContainerMouseDown = (event: MouseEvent) => {
  if (!drawingCanvas.value) return

  const rect = drawingCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  isDrawing.value = true
  lastX.value = x
  lastY.value = y

  drawPoint(x, y)
}

const handleContainerMouseMove = (event: MouseEvent) => {
  if (!isDrawing.value || !drawingCanvas.value) return

  const rect = drawingCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  drawLine(lastX.value, lastY.value, x, y)

  lastX.value = x
  lastY.value = y
}

const handleContainerMouseUp = () => {
  if (isDrawing.value) {
    isDrawing.value = false
    if (drawingCanvas.value) {
      emit('diagram-annotated', drawingCanvas.value.toDataURL('image/png'))
    }
  }
}

const handleContainerMouseOut = () => {
  if (isDrawing.value) {
    isDrawing.value = false
    if (drawingCanvas.value) {
      emit('diagram-annotated', drawingCanvas.value.toDataURL('image/png'))
    }
  }
}

// Selección de color
const selectColor = (color: string) => {
  currentColor.value = color
  if (drawingContext.value) {
    drawingContext.value.strokeStyle = color
  }
}

// Deshacer último trazo
const undo = () => {
  if (!drawingContext.value || !drawingCanvas.value) return
  drawingContext.value.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
}

// Borrar canvas
const clearCanvas = () => {
  if (!drawingContext.value || !drawingCanvas.value) return
  drawingContext.value.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
  emit('diagram-annotated', drawingCanvas.value.toDataURL('image/png'))
}

// Método para cargar imagen
const onImageLoad = () => {
  console.log('Imagen cargada')
  nextTick(setupDrawingCanvas)
}

// Inicialización
onMounted(() => {
  console.log('Componente montado')
  if (cartImage.value && cartImage.value.complete) {
    setupDrawingCanvas()
  }
})

// Exponer métodos
defineExpose({
  undo,
  clearCanvas
})
</script>

<style scoped>
.cart-diagram-annotations-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.color-convention {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}

.color-convention h3 {
  margin-right: 15px;
  font-size: 14px;
  font-weight: bold;
}

.convention-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-dot {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: inline-block;
}

.convention-item .text-caption {
  font-size: 12px;
  white-space: nowrap;
}

.diagram-container {
  position: relative;
  width: 100%;
}

.cart-diagram {
  width: 100%;
  height: auto;
  z-index: 1;
  position: relative;
}

.drawing-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: auto;
  z-index: 10;
}

.drawing-tools {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 20;
}

.color-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.color-picker button {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}

.color-picker button.active {
  border-color: black;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-buttons button {
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
}

.damage-marker {
  position: absolute;
  cursor: move;
  transform: translate(-50%, -50%);
  z-index: 15;
}

.marker-icon {
  font-size: 20px;
}

.marker-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px;
  border-radius: 3px;
  font-size: 12px;
  white-space: nowrap;
}

.color-reference {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>