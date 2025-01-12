import { PointerEventHandler, WheelEventHandler, useEffect, useRef } from "react"
import { prepareRender, entitiesFromSolids, drawCommands, cameras, controls } from "@jscad/regl-renderer"
import { union } from "@jscad/modeling/src/operations/booleans"
import { translate } from "@jscad/modeling/src/operations/transforms"

import { Params, useParams } from "../lib/params"

import { Entity } from "@jscad/regl-renderer/types/geometry-utils-V2/entity"
import { Geom3 } from "@jscad/modeling/src/geometries/types"
import { Vec3 } from "@jscad/modeling/src/maths/types"

import { base } from "../lib/enclosure/base"
import { lid } from "../lib/enclosure/lid"
import { waterProofSeal } from "../lib/enclosure/waterproofseal"
import { pcbMounts } from "../lib/enclosure/pcbmount"

const SPACING = 20

const perspectiveCamera = cameras.perspective
const camera = Object.assign({}, perspectiveCamera.defaults)

const orbitControls = controls.orbit
let control = orbitControls.defaults

let lastX = 0
let lastY = 0

let rotateDelta = [0, 0]
let panDelta = [0, 0]
let zoomDelta = 0
let pointerDown = false
let zoomToFit = true
let updateView = true

const rotateSpeed = 0.002
const panSpeed = 1
const zoomSpeed = 0.08

type Render = (options: any) => void;

type RenderOptions = {
  camera: typeof camera,
  drawCommands: typeof drawCommands,
  entities: Entity[],
}

export const Renderer = () => {

  const params = useParams()

  const { length, width, height, wall, floor, roof, cornerRadius, cableGlands, 
    screws, waterProof, wallMounts, pcbMountXY, cableGlandSpecs, pcbMountScrewDiameter, 
    screwDiameter, insertThickness, sealThickness, insertHeight, wallMountScrewDiameter } = params

  const container = useRef<HTMLDivElement | null>(null);
  const _lid = useRef<Geom3 | null>(null)
  const _base = useRef<Geom3 | null>(null)
  const _waterProofSeal = useRef<Geom3 | null>(null)
  const _pcbMounts = useRef<Geom3 | null>(null)
  const model = useRef<Geom3 | null>(null)
  const renderOptions = useRef<RenderOptions | null>(null)
  const renderer = useRef<Render | null>(null)
  const animationFrame = useRef<number | null>(null)
  const unload = useRef<boolean>(false)

  const moveHandler: PointerEventHandler = (ev) => {
    if(!pointerDown) return
    const dx = lastX - ev.pageX 
    const dy = ev.pageY - lastY 

    const shiftKey = (ev.shiftKey === true)
    if (shiftKey) {
      panDelta[0] += dx
      panDelta[1] += dy
    } else {
      rotateDelta[0] -= dx
      rotateDelta[1] -= dy
    }

    lastX = ev.pageX
    lastY = ev.pageY

    ev.preventDefault()
  }

  const downHandler: PointerEventHandler = (ev) => {
    pointerDown = true
    lastX = ev.pageX
    lastY = ev.pageY
    container.current?.setPointerCapture(ev.pointerId)
  }

  const upHandler: PointerEventHandler = (ev) => {
    pointerDown = false
    container.current?.releasePointerCapture(ev.pointerId)
  }

  const wheelHandler: WheelEventHandler = (ev) => {
    zoomDelta += ev.deltaY
  }

  const doRotatePanZoom = () => {
    if (rotateDelta[0] || rotateDelta[1]) {
      const updated = orbitControls.rotate({ controls: control, camera: camera, speed: rotateSpeed }, rotateDelta)
      control = { ...control, ...updated.controls }
      updateView = true
      rotateDelta = [0, 0]
    }

    if (panDelta[0] || panDelta[1]) {
      const updated = orbitControls.pan({ controls:control, camera:camera, speed: panSpeed }, panDelta)
      control = { ...control, ...updated.controls }
      panDelta = [0, 0]
      camera.position = updated.camera.position
      camera.target = updated.camera.target
      updateView = true
    }

    if (zoomDelta) {
      const updated = orbitControls.zoom({ controls:control, camera:camera, speed: zoomSpeed }, zoomDelta)
      control = { ...control, ...updated.controls }
      zoomDelta = 0
      updateView = true
    }

    if (zoomToFit) {
      if (!renderOptions.current?.entities) return
      control.zoomToFit.tightness = 1
      const updated = orbitControls.zoomToFit({ controls: control, camera: camera, entities: renderOptions.current?.entities })
      control = { ...control, ...updated.controls }
      zoomToFit = false
      updateView = true
    }
  }

  const updateAndRender = (timestamp?: Number) => {
    doRotatePanZoom()

    if (updateView) {
      const updates = orbitControls.update({ controls: control, camera: camera })
      control = { ...control, ...updates.controls }
      updateView = control.changed // for elasticity in rotate / zoom

      camera.position = updates.camera.position
      perspectiveCamera.update(camera)

      renderer.current && renderer.current(renderOptions.current)
    }

    if (!unload.current)
      animationFrame.current = requestAnimationFrame(updateAndRender)
  }

  const setCamera = () => {
    perspectiveCamera.setProjection(camera, camera, { 
      width: window.innerWidth, 
      height: window.innerHeight
    })
  }

  // Lid
  useEffect(() => {
    let pos: Vec3
    if (waterProof.value) {
      pos = [(width.value/2)+SPACING, -length.value/2, (-height.value/2)+(roof.value/2)]
    } else {
      pos = [SPACING/2, -length.value/2, (-height.value/2)+(roof.value/2)]
    }
    _lid.current = translate(pos, lid(params.get() as Params))
  }, [length, width, roof, wall, cornerRadius, screws, waterProof, screwDiameter, 
    insertThickness, insertHeight])

  // Base
  useEffect(() => {
    let pos: Vec3
    if (waterProof.value) {
      pos = [-width.value/2, -length.value/2, 0]
    } else {
      pos = [-(width.value+(SPACING/2)), -length.value/2, 0]
    }
    _base.current = translate(pos, base(params.get() as Params))
  }, [length, width, height, wall, floor, cornerRadius, cableGlands, cableGlandSpecs, wallMounts, 
    screws, waterProof, screwDiameter, insertThickness, insertHeight, sealThickness, wallMountScrewDiameter])

  // Waterproof seal
  useEffect(() => {
    if (params.waterProof) {
      const pos = [-width.value-(width.value/2)-SPACING, -length.value/2, -(height.value/2)+(sealThickness.value/2)] as Vec3
      _waterProofSeal.current = translate(pos, waterProofSeal(params.get() as Params))
    }
  }, [length, width, wall, cornerRadius, waterProof, sealThickness])

  // PCB mounts
  useEffect(() => {
    if (params.pcbMounts.value > 0) {
      let pos: Vec3
      if (waterProof.value) {
        pos = [-width.value/2, -length.value/2, 0]
      } else {
        pos = [-(width.value+(SPACING/2)), -length.value/2, 0]
      }
      _pcbMounts.current = translate(pos, pcbMounts(params.get() as Params))
    }
  }, [pcbMounts, pcbMountXY, waterProof, wall, floor, height, pcbMountScrewDiameter])

  // Combine solids
  useEffect(() => {
    let result: Geom3[] = []

    if (_lid.current) result.push(_lid.current)
    if (_base.current) result.push(_base.current)
    if (_waterProofSeal.current && waterProof.value) result.push(_waterProofSeal.current)
    if (_pcbMounts.current && params.pcbMounts.value > 0) result.push(_pcbMounts.current)

    model.current = union(result)
  }, [_lid.current, _base.current, _waterProofSeal.current, _pcbMounts.current]) 
  
  // Convert solids to entities
  useEffect(() => {
    if (!model.current) return

    renderOptions.current = {
      camera: camera,
      drawCommands: drawCommands,
      entities: entitiesFromSolids({}, model.current)
    }
  }, [model.current])

  // Initial render
  useEffect(() => {
    if (!container.current || renderer.current) return
    if (container.current && !renderer.current) {
      renderer.current = prepareRender({
        glOptions: { container: container.current },
      })
    }
    setCamera()
    updateAndRender()
  }, [model, renderOptions, renderer, container]);

  // Re-render on param change
  useEffect(() => {
    if (!model.current || !renderOptions.current || !renderer.current || !container.current) return
    renderOptions.current.entities = entitiesFromSolids({}, model.current)
    updateView = true
  }, [model.current])

  return <div 
    id="jscad" 
    ref={container}
    onPointerMove={moveHandler}
    onPointerDown={downHandler}
    onPointerUp={upHandler}
    onWheel={wheelHandler} 
  />;
};