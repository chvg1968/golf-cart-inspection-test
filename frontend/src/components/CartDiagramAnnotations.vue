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
      @mousedown.prevent="handleContainerMouseDown"
      @mousemove.prevent="handleContainerMouseMove"
      @mouseup.prevent="handleContainerMouseUp"
      @mouseout.prevent="handleContainerMouseOut"
    >
      <!-- Herramientas de dibujo -->
      <div class="drawing-tools">
        <!-- Selector de color -->
        <div class="color-picker">
          <button 
            v-for="option in colorOptions" 
            :key="option.color"
            :style="{ backgroundColor: option.color }"
            @click.prevent="selectColor(option.color)"
            :class="{ active: currentColor === option.color }"
          ></button>
        </div>
        
        <!-- Botones de acción -->
        <div class="action-buttons">
          <button @click.prevent="undo" title="Deshacer último trazo">↩️</button>
          <button @click.prevent="clearCanvas" title="Borrar todo">🗑️</button>
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
  cartType: string
  diagramPath?: string
  diagramType?: string
}>(), {
  diagramPath: fourSeaterImage,
  diagramType: '4seater'
})

// Emitir eventos
const emit = defineEmits<{
  (e: 'drawing-created', drawingData: { drawing: string, cartType: string }): void
}>()

// Referencia al contenedor del diagrama
const cartDiagramContainer = ref<HTMLDivElement | null>(null)
const cartImage = ref<HTMLImageElement | null>(null)

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
})

watch(() => props.diagramPath, (newDiagramPath) => {
  // Actualizar ruta de diagrama si se pasa explícitamente
  if (newDiagramPath) {
    currentDiagramPath.value = newDiagramPath
  }
})

// Colores predefinidos
const colorOptions = [
  { color: 'red' },
  { color: '#00FF7F' },  // Spring Green
  { color: '#BF40BF' }   // Bright Magenta
]

// Grosores de línea
const lineWidths = [8]
const currentLineWidth = ref(lineWidths[0])
const currentColor = ref(colorOptions[0].color)

// Estado de dibujo
const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)

// Dimensiones del canvas
const canvasWidth = ref(0)
const canvasHeight = ref(0)

// Estado para almacenar historial de dibujo
const drawingHistory = ref<string[]>([])

// Obtener label del tipo de carrito
const cartTypeLabel = computed(() => {
  return props.cartType.includes('6') ? '6 Seater' : '4 Seater'
})

// Selección de color
const selectColor = (color: string) => {
  currentColor.value = color
  if (drawingContext.value) {
    drawingContext.value.strokeStyle = color
  }
}

// Referencias de elementos
const drawingCanvas = ref<HTMLCanvasElement | null>(null)
const drawingContext = ref<CanvasRenderingContext2D | null>(null)

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
  console.log('Mouse down en contenedor')
  
  if (!drawingCanvas.value) {
    console.error('Canvas no disponible')
    return
  }

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
    saveCanvasState()
  }
}

const handleContainerMouseOut = () => {
  if (isDrawing.value) {
    isDrawing.value = false
    saveCanvasState()
  }
}

// Método para guardar estado del canvas
const saveCanvasState = () => {
  if (!drawingCanvas.value) return

  const currentDrawing = drawingCanvas.value.toDataURL('image/png')
  
  // Evitar guardar estados duplicados
  if (
    drawingHistory.value.length === 0 || 
    currentDrawing !== drawingHistory.value[drawingHistory.value.length - 1]
  ) {
    drawingHistory.value.push(currentDrawing)
    console.log('Estado guardado, longitud del historial:', drawingHistory.value.length)
  }
}

// Método para cargar imagen
const onImageLoad = () => {
  console.log('Imagen cargada')
  nextTick(setupDrawingCanvas)
}

// Método para guardar dibujo
const saveDrawing = () => {
  if (!drawingCanvas.value) return null

  const canvas = drawingCanvas.value
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return null

  // Usar HTMLCanvasElement específicamente
  const imageData = (canvas as HTMLCanvasElement).toDataURL('image/png')
  
  emit('drawing-created', { 
    drawing: imageData, 
    cartType: props.cartType 
  })

  return imageData
}

// Deshacer último trazo
const undo = () => {
  console.log('Undo llamado, longitud actual del historial:', drawingHistory.value.length)
  
  if (drawingHistory.value.length <= 1) {
    // Si solo hay un estado o ninguno, limpiar el canvas
    clearCanvas()
    return
  }

  // Eliminar el estado actual
  drawingHistory.value.pop()

  // Cargar el estado anterior
  const previousDrawing = drawingHistory.value[drawingHistory.value.length - 1]
  
  if (!drawingCanvas.value || !drawingContext.value) return

  const img = new Image()
  img.onload = () => {
    // Limpiar el canvas
    drawingContext.value?.clearRect(0, 0, drawingCanvas.value!.width, drawingCanvas.value!.height)
    
    // Dibujar la imagen del estado anterior
    drawingContext.value?.drawImage(img, 0, 0)
    
    console.log('Undo completado, nueva longitud del historial:', drawingHistory.value.length)
  }
  img.src = previousDrawing
}

// Borrar canvas
const clearCanvas = () => {
  if (!drawingContext.value || !drawingCanvas.value) return

  drawingContext.value.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
  
  // Reiniciar historial de dibujo
  drawingHistory.value = []

  // Guardar estado inicial vacío
  const initialState = drawingCanvas.value.toDataURL('image/png')
  drawingHistory.value.push(initialState)
}

// Inicialización
onMounted(() => {
  console.log('Componente montado')
  
  // Configurar canvas cuando la imagen esté lista
  if (cartImage.value && cartImage.value.complete) {
    setupDrawingCanvas()
  }

  // Guardar estado inicial del canvas vacío
  if (drawingCanvas.value) {
    const initialState = drawingCanvas.value.toDataURL('image/png')
    drawingHistory.value.push(initialState)
  }
})

// Exponer métodos
defineExpose({
  saveDrawing,
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
  left: -70px;  /* Mover a la izquierda */
  display: flex;
  flex-direction: column;  /* Cambiar a vertical */
  gap: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 5px;
  z-index: 20;
}

.color-picker {
  display: flex;
  flex-direction: column;  /* Cambiar a vertical */
  gap: 10px;
}

.color-picker button {
  width: 50px;
  height: 30px;
  border-radius: 5px;
  border: 2px solid transparent;
  cursor: pointer;
}

.color-picker button.active {
  border-color: black;
}

.action-buttons {
  display: flex;
  flex-direction: column;  /* Cambiar a vertical */
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