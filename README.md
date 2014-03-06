ThreeJS-MouseEvents
===================

_This project is no longer maintained and part of my source code "attic". Feel free to use it though, works fine._

Get mouse events passed into your scene. Your scene should have only one camera, so we have a point from which we can do raycasting. The main script initialises:

    THREE.MouseEvents

Which you can then call like this:

    THREE.MouseEvents(yourScene, yourCamera)

From that point on all of `yourScene.children` will have their `dispatchEvent` method invoked on which they'll receive the mouse events. Note that double click events trigger on double clicking of the scene, this event is then passed to the mesh.
