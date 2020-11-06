import {
  createAxisEventFromWheelEvent,
  createPointerEventFromMouseEvent,
  createKeyEventFromKeyboardEvent
} from 'greenfield-compositor'
import CompositorWorker from 'worker-loader!./CompositorWorker'

const compositor: Worker = new CompositorWorker()


function initializeCanvas(canvas: HTMLCanvasElement, myId: string) {
  const offscreenCanvas = canvas.transferControlToOffscreen()
  compositor.postMessage({ type: 'initScene', data: { sceneId: myId, canvas: offscreenCanvas } }, [offscreenCanvas])

  // make sure the canvas has focus and receives input inputs
  canvas.onmouseover = () => canvas.focus()
  canvas.tabIndex = 1

  //wire up dom input events to compositor input events
  canvas.onpointermove = (event: PointerEvent) => {
    event.preventDefault()
    const data = createPointerEventFromMouseEvent(event, 'move', myId)
    compositor.postMessage({ type: 'PointerEvent', data })
  }
  canvas.onpointerdown = (event: PointerEvent) => {
    event.preventDefault()
    const data = createPointerEventFromMouseEvent(event, 'buttonPress', myId)
    compositor.postMessage({ type: 'PointerEvent', data })
  }
  canvas.onpointerup = (event: PointerEvent) => {
    event.preventDefault()
    const data = createPointerEventFromMouseEvent(event, 'buttonRelease', myId)
    canvas.releasePointerCapture(event.pointerId)
    compositor.postMessage({ type: 'PointerEvent', data })
  }
  canvas.onwheel = (event: WheelEvent) => {
    event.preventDefault()
    const data = createAxisEventFromWheelEvent(event, myId)
    compositor.postMessage({ type: 'AxisEvent', data })
  }
  canvas.onkeydown = (event: KeyboardEvent) => {
    const data = createKeyEventFromKeyboardEvent(event, true)
    if (data) {
      event.preventDefault()
      compositor.postMessage({ type: 'KeyEvent', data })
    }
  }
  canvas.onkeyup = (event: KeyboardEvent) => {
    const data = createKeyEventFromKeyboardEvent(event, false)
    if (data) {
      event.preventDefault()
      compositor.postMessage({ type: 'KeyEvent', data })
    }
  }
}

async function main() {
  // Get an HTML5 canvas for use as an output for the compositor. Multiple outputs can be used.
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 768
  canvas.style.width = `${canvas.width}`
  canvas.style.height = `${canvas.height}`

  // hook up the canvas to our compositor
  initializeCanvas(canvas, 'myOutputId')

  // Add some HTML buttons so the user can launch applications.
  const webShmAppURLButton: HTMLButtonElement = document.createElement('button')
  webShmAppURLButton.textContent = 'WebSHM URL'
  const webGLURLButton: HTMLButtonElement = document.createElement('button')
  webGLURLButton.textContent = 'WebGL URL'
  const reactCanvasKitURLButton: HTMLButtonElement = document.createElement('button')
  reactCanvasKitURLButton.textContent = 'React-CanvasKit URL'
  const remoteURLButton: HTMLButtonElement = document.createElement('button')
  remoteURLButton.textContent = 'Remote GTK3-Demo URL'
  const urlInput: HTMLInputElement = document.createElement('input')
  urlInput.type = 'text'
  urlInput.style.width = '445px'
  const launchButton: HTMLButtonElement = document.createElement('button')
  launchButton.textContent = 'Launch'

  const container: HTMLDivElement = document.createElement('div')
  container.appendChild(webShmAppURLButton)
  container.appendChild(webGLURLButton)
  container.appendChild(reactCanvasKitURLButton)
  container.appendChild(remoteURLButton)
  container.appendChild(urlInput)
  container.appendChild(launchButton)

  webShmAppURLButton.onclick = () => urlInput.value = `${window.location.href}apps/simple-web-shm/app.js`
  webGLURLButton.onclick = () => urlInput.value = `${window.location.href}apps/simple-web-gl/app.js`
  reactCanvasKitURLButton.onclick = () => urlInput.value = `${window.location.href}apps/react-canvaskit/app.js`
  remoteURLButton.onclick = () => urlInput.value = `ws://localhost:8081?launch=remote-gtk3-demo`

  launchButton.onclick = () => {
    const urlString = urlInput.value
    const url = new URL(urlString)
    if (url.protocol.startsWith('ws')) {
      compositor.postMessage({ type: 'launchRemote', data: url })
    } else if (url.protocol.startsWith('http')) {
      compositor.postMessage({ type: 'launchWeb', data: url })
    }
  }

  // show the html elements on the user's screen
  document.body.appendChild(canvas)
  document.body.appendChild(container)
}

window.onload = () => main()
