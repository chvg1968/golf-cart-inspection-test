<template>
  <div class="signature-section">

    <p>
      I hereby certify that the golf cart described above was granted to me on the date mentioned, and I acknowledge the stated damages. Any additional damages not listed are new and are considered my responsibility.
    </p>

    <div class="signature-container">
      <canvas
        ref="signaturePad"
        class="signature-canvas"
      ></canvas>
    </div>

    <div class="row justify-center q-mt-md pdf-buttons">
      <slot name="clear-signature-button">
        <q-btn 
          color="negative" 
          icon="clear" 
          label="Clear Signature" 
          @click="clearSignature"
          class="q-mr-sm"
        />
      </slot>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import SignaturePad from 'signature_pad'

export default {
  name: 'SignatureCanvas',
  
  props: {
    termsAccepted: {
      type: Boolean,
      default: false
    }
  },
  
  emits: [
    'update:termsAccepted', 
    'signature-change'
  ],
  
  setup(props, { emit }) {
    const signaturePad = ref(null)
    const signaturePadInstance = ref(null)
    
    onMounted(() => {
      const canvas = signaturePad.value
      // Ajustar el tamaño del canvas
      canvas.width = canvas.offsetWidth
      canvas.height = 150 // Altura más pequeña
      
      signaturePadInstance.value = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      })
      
      // Emitir evento cuando cambie la firma
      signaturePadInstance.value.addEventListener('endStroke', () => {
        emit('signature-change', signaturePadInstance.value.toDataURL())
      })

      // Manejar el redimensionamiento de la ventana
      window.addEventListener('resize', resizeCanvas)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', resizeCanvas)
    })

    const resizeCanvas = () => {
      const canvas = signaturePad.value
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      canvas.getContext("2d").scale(ratio, ratio)
      signaturePadInstance.value.clear()
      
      // Emitir evento de cambio de firma (vacía)
      emit('signature-change', null)
    }

    const clearSignature = () => {
      signaturePadInstance.value.clear()
      emit('signature-change', null)
    }

    return {
      signaturePad,
      clearSignature
    }
  }
}
</script>

<style scoped>
.signature-section {
  max-width: 500px;
  margin: 0 auto;
}

.signature-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
}

.signature-canvas {
  width: 100%;
  height: 150px;
  border-radius: 4px;
}

.pdf-buttons {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}
</style>
