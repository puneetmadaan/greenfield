import {
  CompositorSession,
  CompositorSurface,
  createCompositorRemoteAppLauncher,
  createCompositorRemoteSocket,
  createCompositorSession,
  createCompositorWebAppLauncher,
  createCompositorWebAppSocket,
  initWasm
} from 'greenfield-compositor'

let compositorPointerGrab: CompositorSurface | undefined


function linkUserShellEvents(session: CompositorSession) {
  const userShell = session.userShell

  userShell.events.notify = (variant, message) => console.log(message)
  userShell.events.createUserSurface = (compositorSurface, compositorSurfaceState) => {
    // create view on our scene for the newly created surface
    userShell.actions.createView(compositorSurface, 'myOutputId')
    // request the client to make this surface active
    userShell.actions.requestActive(compositorSurface)
  }
  userShell.events.updateUserSeat = ({ keyboardFocus, pointerGrab }) => {
    // raise the surface when a user clicks on it
    if (pointerGrab !== compositorPointerGrab && pointerGrab) {
      userShell.actions.raise(pointerGrab, 'myOutputId')
      userShell.actions.setKeyboardFocus(pointerGrab)
    }
  }
}

async function main() {
  // load web assembly libraries
  await initWasm()

  // create new compositor context
  const session = createCompositorSession()
  // create application launchers for web & remote applications
  const webAppSocket = createCompositorWebAppSocket(session)
  const webAppLauncher = createCompositorWebAppLauncher(webAppSocket)

  const remoteSocket = createCompositorRemoteSocket(session)
  const remoteAppLauncher = createCompositorRemoteAppLauncher(session, remoteSocket)

  self.onmessage = (message: MessageEvent) => {
    switch (message.data.type) {
      case 'initScene': {
        const data: { sceneId: string, canvas: OffscreenCanvas } = message.data.data
        session.userShell.actions.initScene(data.sceneId, data.canvas)
        break
      }
      case 'PointerEvent': {
        session.userShell.actions.input.pointer(message.data.data)
        break
      }
      case 'WheelEvent': {
        session.userShell.actions.input.axis(message.data.data)
        break
      }
      case 'KeyboardEvent': {
        session.userShell.actions.input.key(message.data.data)
        break
      }
      case 'launchRemove': {
        remoteAppLauncher.launchURL(message.data.data)
        break
      }
      case 'launchWeb': {
        webAppLauncher.launch(message.data.data)
        break
      }
    }
  }

  // hook up the canvas to our compositor
  linkUserShellEvents(session)


  // TODO listen for app launch events

  // make compositor global protocol objects available to client
  session.globals.register()
}

main()

export default null as any
