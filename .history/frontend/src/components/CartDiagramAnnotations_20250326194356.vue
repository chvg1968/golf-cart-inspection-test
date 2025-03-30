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

    <div class="diagram-container" ref="cartDiagramContainer">
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
      />

      <!-- Canvas de dibujo superpuesto -->
      <canvas 
        ref="drawingCanvas"
        class="drawing-canvas"
        :width="canvasWidth"
        :height="canvasHeight"
      ></canvas>

      <!-- Marcadores de daños existentes -->
      <div 
        v-for="(damage, index) in damages" 
        :key="`damage-${index}`"
        class="damage-marker draggable"
        :data-index="index"
        :style="{ 
          left: `${damage.x}%`, 
          top: `${damage.y}%`
        }"
      >
        <span class="marker-icon">❌</span>
        <div class="marker-tooltip marker-tooltip-permanent">
          <span class="marker-part-name">{{ damage.part }}</span>
          <span class="marker-damage-type">({{ damage.type }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import golfCart4Seater from '../assets/images/4seater.jpg'
import golfCart6Seater from '../assets/images/6seater.png'

// Definir interfaz para daños
interface Damage {
  x: number
  y: number
  part: string
  type: string
  quantity?: number
}

// Definir interfaz para CartTypeOption
interface CartTypeOption {
  label: string
  value: string
  diagramPath: string
}

// Colores predefinidos sin etiquetas
const colorOptions = [
  { color: 'red' },
  { color: '#00FF7F' },  // Spring Green
  { color: '#BF40BF' }   // Bright Magenta
]

// Grosores de línea
const lineWidths = [8]
const currentLineWidth = ref(lineWidths[0])

const currentColor = ref(colorOptions[0].color)

const props = defineProps({
  cartType: { 
    type: [Object as () => CartTypeOption, String], 
    required: true
  },
  damages: { 
    type: Array as () => Damage[], 
    default: () => [] 
  },
  diagramPath: {
    type: String,
    default: '../assets/images/4seater.png'
  },
  previousDrawing: {
    type: String,
    default: null
  }
})

const emit = defineEmits([
  'update-damage-position', 
  'drawing-created'
])

const cartDiagramContainer = ref<HTMLDivElement | null>(null)
const cartImage = ref<HTMLImageElement | null>(null)
const drawingCanvas = ref<HTMLCanvasElement | null>(null)
const drawingContext = ref<CanvasRenderingContext2D | null>(null)

// Dimensiones del canvas
const canvasWidth = ref(0)
const canvasHeight = ref(0)

// Estado para almacenar historial de dibujo
const drawingHistory = ref<ImageData[]>([])

// Calcular la ruta del diagrama actual
const currentDiagramPath = computed(() => {
  if (typeof props.cartType === 'string') {
    return props.cartType.includes('4') ? golfCart4Seater : golfCart6Seater
  }
  return props.cartType?.diagramPath || golfCart4Seater
})

// Obtener label del tipo de carrito
const cartTypeLabel = computed(() => {
  if (typeof props.cartType === 'string') {
    return props.cartType.includes('4') ? '4 Seater' : '6 Seater'
  }
  return props.cartType?.label || '4 Seater'
})

// Selección de color
const selectColor = (color: string) => {
  currentColor.value = color
  if (drawingContext.value) {
    drawingContext.value.strokeStyle = color
  }
}

// Método para sobrescribir imagen base con marcas
const overwriteBaseImageWithMarks = async (baseImagePath: string, newMarking: string) => {
  return new Promise<string>((resolve, reject) => {
    // Crear canvas para combinar imágenes
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('No se pudo crear el contexto del canvas'))
      return
    }

    // Crear imágenes base y nueva marca
    const baseImage = new Image()
    const newMarkImage = new Image()

    baseImage.onload = () => {
      // Establecer dimensiones del canvas
      canvas.width = baseImage.width
      canvas.height = baseImage.height

      // Dibujar imagen base
      ctx.drawImage(baseImage, 0, 0)

      // Dibujar nueva marca
      newMarkImage.onload = () => {
        // Dibujar nueva marca con transparencia
        ctx.globalAlpha = 0.7  // Transparencia de la marca
        ctx.drawImage(newMarkImage, 0, 0, canvas.width, canvas.height)
        
        // Convertir canvas a imagen base64
        const combinedImage = canvas.toDataURL('image/png')

        // Guardar imagen sobrescrita
        try {
          // Usar API de sistema de archivos para sobrescribir
          const fs = require('fs')
          const path = require('path')

          // Convertir base64 a buffer
          const base64Data = combinedImage.replace(/^data:image\/png;base64,/, '')
          
          // Guardar archivo
          fs.writeFile(baseImagePath, base64Data, 'base64', (err) => {
            if (err) {
              console.error('Error al guardar imagen:', err)
              resolve(combinedImage)
            } else {
              console.log('Imagen sobrescrita:', baseImagePath)
              resolve(combinedImage)
            }
          })
        } catch (error) {
          console.error('Error al sobrescribir imagen:', error)
          resolve(combinedImage)
        }
      }

      newMarkImage.onerror = () => {
        // Si no hay nueva marca, devolver imagen base
        resolve(baseImagePath)
      }

      newMarkImage.src = newMarking
    }

    baseImage.onerror = () => {
      reject(new Error('No se pudo cargar la imagen base'))
    }

    baseImage.src = baseImagePath
  })
}

// Método para guardar dibujo como base64
const saveDrawing = async () => {
  if (!drawingCanvas.value || !cartImage.value) return null

  try {
    // Convertir dibujo actual a base64
    const currentDrawing = drawingCanvas.value.toDataURL('image/png')

    // Sobrescribir marcas en imagen base
    const combinedImage = await overwriteBaseImageWithMarks(
      cartImage.value.src, 
      currentDrawing
    )

    // Emitir evento con marcas combinadas
    emit('drawing-created', {
      drawing: combinedImage,
      cartType: props.cartType
    })

    return combinedImage
  } catch (error) {
    console.error('Error al guardar dibujo:', error)
    return null
  }
}

// Método para guardar estado del canvas
const saveCanvasState = () => {
  if (!drawingCanvas.value || !drawingContext.value) return

  const imageData = drawingContext.value.getImageData(
    0, 
    0, 
    drawingCanvas.value.width, 
    drawingCanvas.value.height
  )
  drawingHistory.value.push(imageData)
}

// Deshacer último trazo
const undo = () => {
  if (!drawingCanvas.value || !drawingContext.value) return

  // Eliminar último estado
  if (drawingHistory.value.length > 0) {
    drawingHistory.value.pop()

    // Restaurar último estado guardado
    if (drawingHistory.value.length > 0) {
      const lastState = drawingHistory.value[drawingHistory.value.length - 1]
      drawingContext.value.putImageData(lastState, 0, 0)
    } else {
      // Si no hay estados, limpiar canvas
      drawingContext.value.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
    }

    // Guardar nuevo estado
    saveDrawing()
  }
}

// Borrar todo el canvas
const clearCanvas = () => {
  if (!drawingCanvas.value || !drawingContext.value) return

  drawingContext.value.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
  saveDrawing()
}

// Configurar canvas de dibujo
const setupDrawingCanvas = () => {
  if (!drawingCanvas.value || !cartImage.value) return

  // Ajustar dimensiones del canvas al tamaño de la imagen
  canvasWidth.value = cartImage.value.offsetWidth
  canvasHeight.value = cartImage.value.offsetHeight

  drawingContext.value = drawingCanvas.value.getContext('2d')
  if (!drawingContext.value) return

  drawingContext.value.lineCap = 'round'
  drawingContext.value.lineJoin = 'round'
  drawingContext.value.lineWidth = currentLineWidth.value
  drawingContext.value.strokeStyle = currentColor.value

  let isDrawing = false
  let lastX = 0
  let lastY = 0

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

  drawingCanvas.value.addEventListener('mousedown', (event) => {
    // Prevenir propagación para evitar efectos no deseados
    event.stopPropagation()
    
    isDrawing = true
    const rect = drawingCanvas.value?.getBoundingClientRect()
    if (!rect) return

    lastX = event.clientX - rect.left
    lastY = event.clientY - rect.top

    // Dibujar punto inicial
    drawPoint(lastX, lastY)
    saveCanvasState()
    saveDrawing()
  })

  drawingCanvas.value.addEventListener('mousemove', (event) => {
    if (!isDrawing) return

    const rect = drawingCanvas.value?.getBoundingClientRect()
    if (!rect) return

    const currentX = event.clientX - rect.left
    const currentY = event.clientY - rect.top

    // Dibujar línea
    drawLine(lastX, lastY, currentX, currentY)

    lastX = currentX
    lastY = currentY
  })

  drawingCanvas.value.addEventListener('mouseup', () => {
    isDrawing = false
    saveDrawing()
  })

  drawingCanvas.value.addEventListener('mouseout', () => {
    isDrawing = false
    saveDrawing()
  })
}

// Método para cargar dibujo previo
const loadPreviousDrawing = () => {
  // Validar referencias antes de usar
  if (
    props.previousDrawing && 
    drawingContext.value !== null && 
    drawingCanvas.value !== null
  ) {
    const img = new Image()
    img.onload = () => {
      // Verificar referencias nuevamente antes de dibujar
      if (
        drawingContext.value !== null && 
        drawingCanvas.value !== null
      ) {
        // Limpiar canvas actual
        drawingContext.value.clearRect(
          0, 
          0, 
          drawingCanvas.value.width, 
          drawingCanvas.value.height
        )
        
        // Dibujar imagen previa
        drawingContext.value.drawImage(
          img, 
          0, 
          0, 
          drawingCanvas.value.width, 
          drawingCanvas.value.height
        )

        console.log('Marcas previas cargadas para:', props.cartType)
      }
    }
    img.src = props.previousDrawing
  }
}

// Configurar dimensiones y canvas al montar
onMounted(() => {
  // Usar nextTick para asegurar renderizado
  nextTick(() => {
    if (cartImage.value) {
      // Asegurar que la imagen esté completamente cargada
      if (cartImage.value.complete) {
        setupDrawingCanvas()
        loadPreviousDrawing()
      } else {
        cartImage.value.onload = () => {
          setupDrawingCanvas()
          loadPreviousDrawing()
        }
      }
    }
  })
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