'use strict'

import Rect from './math/Rect'
import Point from './math/Point'
import { XdgPositioner } from './protocol/xdg-shell-browser-protocol'

/**
 * @type {{'0': (function(Rect): Point), '1': (function(Rect): Point), '2': (function(Rect): Point), '3': (function(Rect): Point), '4': (function(Rect): Point), '5': (function(Rect): Point), '6': (function(Rect): Point), '7': (function(Rect): Point), '8': (function(Rect): Point)}}
 */
const anchorCalculation = {
  /**
   * none
   * @param {Rect}anchorRect
   * @return {Point}
   */
  0: (anchorRect) => {
    // calculate center
    const x = Math.round((anchorRect.x0 + anchorRect.width) / 2)
    const y = Math.round((anchorRect.y0 + anchorRect.height) / 2)
    return Point.create(x, y)
  },
  /**
   * top
   * @param {Rect}anchorRect
   * @return {Point}
   */
  1: (anchorRect) => {
    const x = Math.round((anchorRect.x0 + anchorRect.width) / 2)
    const y = anchorRect.y0
    return Point.create(x, y)
  },
  /**
   * bottom
   * @param {Rect}anchorRect
   * @return {Point}
   */
  2: (anchorRect) => {
    const x = Math.round((anchorRect.x0 + anchorRect.width) / 2)
    const y = anchorRect.y1
    return Point.create(x, y)
  },
  /**
   * left
   * @param {Rect}anchorRect
   * @return {Point}
   */
  3: (anchorRect) => {
    const x = anchorRect.x0
    const y = Math.round((anchorRect.y0 + anchorRect.height) / 2)
    return Point.create(x, y)
  },
  /**
   * right
   * @param {Rect}anchorRect
   * @return {Point}
   */
  4: (anchorRect) => {
    const x = anchorRect.x1
    const y = Math.round((anchorRect.y0 + anchorRect.height) / 2)
    return Point.create(x, y)
  },
  /**
   * topLeft
   * @param {Rect}anchorRect
   * @return {Point}
   */
  5: (anchorRect) => {
    const x = anchorRect.x0
    const y = anchorRect.y0
    return Point.create(x, y)
  },
  /**
   * bottomLeft
   * @param {Rect}anchorRect
   * @return {Point}
   */
  6: (anchorRect) => {
    const x = anchorRect.x0
    const y = anchorRect.y1
    return Point.create(x, y)
  },
  /**
   * topRight
   * @param {Rect}anchorRect
   * @return {Point}
   */
  7: (anchorRect) => {
    const x = anchorRect.x1
    const y = anchorRect.y0
    return Point.create(x, y)
  },
  /**
   * bottomRight
   * @param {Rect}anchorRect
   * @return {Point}
   */
  8: (anchorRect) => {
    const x = anchorRect.x1
    const y = anchorRect.y1
    return Point.create(x, y)
  }
}

const offsetCalculation = {
  /**
   * none
   * @param {Point}anchor
   * @param {Point}offset
   * @param {Rect}windowGeometry
   * @return {Point}
   */
  0: (anchor, offset, windowGeometry) => {
    const x = Math.round(windowGeometry.x0 + (windowGeometry.width) / 2)
    const y = Math.round(windowGeometry.y0 + (windowGeometry.height) / 2)
    return anchor.minus(Point.create(x, y))
  },
  /**
   * top
   * @param {Point}anchor
   * @param {Point}offset
   * @param {Rect}windowGeometry
   * @return {Point}
   */
  1: (anchor, offset, windowGeometry) => {
    const x = Math.round(windowGeometry.x0 + (windowGeometry.width / 2))
    const y = windowGeometry.y1
    return anchor.minus(Point.create(x, y)).minus(Point.create(0, offset.y))
  },
  /**
   * bottom
   * @param {Point}anchor
   * @param {Point}offset
   * @param {Rect}windowGeometry
   * @return {Point}
   */
  2: (anchor, offset, windowGeometry) => {
    const x = Math.round(windowGeometry.x0 + (windowGeometry.width / 2))
    const y = windowGeometry.y0
    return anchor.minus(Point.create(x, y)).plus(Point.create(0, offset.y))
  },
  /**
   * left
   * @param {Point}anchor
   * @param {Point}offset
   * @param {Rect}windowGeometry
   * @return {Point}
   */
  3: (anchor, offset, windowGeometry) => {
    const x = windowGeometry.x1
    const y = Math.round(windowGeometry.y0 + (windowGeometry.height) / 2)
    return anchor.minus(Point.create(x, y)).minus(Point.create(offset.x, 0))
  },
  /**
   * right
   * @param {Point}anchor
   * @param {Point}offset
   * @param {Rect}windowGeometry
   * @return {Point}
   */
  4: (anchor, offset, windowGeometry) => {
    const x = windowGeometry.x0
    const y = Math.round(windowGeometry.y0 + (windowGeometry.height) / 2)
    return anchor.minus(Point.create(x, y)).plus(Point.create(offset.x, 0))
  },
  /**
   * topLeft
   * @param {Point}anchor
   * @param {Point}offset
   * @param {Rect}windowGeometry
   * @return {Point}
   */
  5: (anchor, offset, windowGeometry) => {
    const x = windowGeometry.x1
    const y = windowGeometry.y1
    return anchor.minus(Point.create(x, y)).minus(offset)
  },
  /**
   * bottomLeft
   * @param {Point}anchor
   * @param {Point}offset
   * @param {Rect}windowGeometry
   * @return {Point}
   */
  6: (anchor, offset, windowGeometry) => {
    const x = windowGeometry.x1
    const y = windowGeometry.y0
    return anchor.minus(Point.create(x, y)).plus(Point.create(-offset.x, offset.y))
  },
  /**
   * topRight
   * @param {Point}anchor
   * @param {Point}offset
   * @param {Rect}windowGeometry
   * @return {Point}
   */
  7: (anchor, offset, windowGeometry) => {
    const x = windowGeometry.x0
    const y = windowGeometry.y1
    return anchor.minus(Point.create(x, y)).plus(Point.create(offset.x, -offset.y))
  },
  /**
   * bottomRight
   * @param {Point}anchor
   * @param {Point}offset
   * @param {Rect}windowGeometry
   * @return {Point}
   */
  8: (anchor, offset, windowGeometry) => {
    const x = windowGeometry.x0
    const y = windowGeometry.y0
    return anchor.minus(Point.create(x, y)).plus(Point.create(offset.x, offset.y))
  }
}

/**
 *
 *      The xdg_positioner provides a collection of rules for the placement of a
 *      child surface relative to a parent surface. Rules can be defined to ensure
 *      the child surface remains within the visible area's borders, and to
 *      specify how the child surface changes its position, such as sliding along
 *      an axis, or flipping around a rectangle. These positioner-created rules are
 *      constrained by the requirement that a child surface must intersect with or
 *      be at least partially adjacent to its parent surface.
 *
 *      See the various requests for details about possible rules.
 *
 *      At the time of the request, the compositor makes a copy of the rules
 *      specified by the xdg_positioner. Thus, after the request is complete the
 *      xdg_positioner object can be destroyed or reused; further changes to the
 *      object will have no effect on previous usages.
 *
 *      For an xdg_positioner object to be considered complete, it must have a
 *      non-zero size set by set_size, and a non-zero anchor rectangle set by
 *      set_anchor_rect. Passing an incomplete xdg_positioner object when
 *      positioning a surface raises an error.
 *
 */
export default class BrowserXdgPositioner {
  /**
   * @param {XdgPositioner}xdgPositionerResource
   * @return {BrowserXdgPositioner}
   */
  static create (xdgPositionerResource) {
    const browserXdgPositioner = new BrowserXdgPositioner()
    xdgPositionerResource.implementation = browserXdgPositioner
    return browserXdgPositioner
  }

  /**
   * Use BrowserXdgPositioner.create(...) instead.
   * @private
   */
  constructor () {
    /**
     * @type {Rect|null}
     */
    this.size = null
    /**
     * @type {Rect|null}
     */
    this.anchorRect = null
    /**
     * @type {number}
     */
    this.anchor = 0
    /**
     * @type {number}
     */
    this.gravity = 0
    /**
     * @type {number}
     */
    this.constraintAdjustment = 0
    /**
     * @type {Point}
     */
    this.offset = Point.create(0, 0)
  }

  /**
   *
   *  Notify the compositor that the xdg_positioner will no longer be used.
   *
   *
   * @param {XdgPositioner} resource
   *
   * @since 1
   *
   */
  destroy (resource) {
    resource.destroy()
  }

  /**
   *
   *  Set the size of the surface that is to be positioned with the positioner
   *  object. The size is in surface-local coordinates and corresponds to the
   *  window geometry. See xdg_surface.set_window_geometry.
   *
   *  If a zero or negative size is set the invalid_input error is raised.
   *
   *
   * @param {XdgPositioner} resource
   * @param {Number} width width of positioned rectangle
   * @param {Number} height height of positioned rectangle
   *
   * @since 1
   *
   */
  setSize (resource, width, height) {
    if (width <= 0 || height <= 0) {
      resource.postError(XdgPositioner.Error.invalidInput, 'size width or height of positioner can not be negative.')
      return
    }
    this.size = Rect.create(0, 0, width, height)
  }

  /**
   *
   *  Specify the anchor rectangle within the parent surface that the child
   *  surface will be placed relative to. The rectangle is relative to the
   *  window geometry as defined by xdg_surface.set_window_geometry of the
   *  parent surface.
   *
   *  When the xdg_positioner object is used to position a child surface, the
   *  anchor rectangle may not extend outside the window geometry of the
   *  positioned child's parent surface.
   *
   *  If a negative size is set the invalid_input error is raised.
   *
   *
   * @param {XdgPositioner} resource
   * @param {Number} x x position of anchor rectangle
   * @param {Number} y y position of anchor rectangle
   * @param {Number} width width of anchor rectangle
   * @param {Number} height height of anchor rectangle
   *
   * @since 1
   *
   */
  setAnchorRect (resource, x, y, width, height) {
    if (width <= 0 || height <= 0) {
      resource.postError(XdgPositioner.Error.invalidInput, 'anchor rect width or height of positioner can not be negative.')
      return
    }
    this.anchorRect = Rect.create(x, y, x + width, y + height)
  }

  /**
   *
   *  Defines the anchor point for the anchor rectangle. The specified anchor
   *  is used derive an anchor point that the child surface will be
   *  positioned relative to. If a corner anchor is set (e.g. 'top_left' or
   *  'bottom_right'), the anchor point will be at the specified corner;
   *  otherwise, the derived anchor point will be centered on the specified
   *  edge, or in the center of the anchor rectangle if no edge is specified.
   *
   *
   * @param {XdgPositioner} resource
   * @param {Number} anchor anchor
   *
   * @since 1
   *
   */
  setAnchor (resource, anchor) {
    this.anchor = anchor
  }

  /**
   *
   *  Defines in what direction a surface should be positioned, relative to
   *  the anchor point of the parent surface. If a corner gravity is
   *  specified (e.g. 'bottom_right' or 'top_left'), then the child surface
   *  will be placed towards the specified gravity; otherwise, the child
   *  surface will be centered over the anchor point on any axis that had no
   *  gravity specified.
   *
   *
   * @param {XdgPositioner} resource
   * @param {Number} gravity gravity direction
   *
   * @since 1
   *
   */
  setGravity (resource, gravity) {
    this.gravity = gravity
  }

  /**
   *
   *  Specify how the window should be positioned if the originally intended
   *  position caused the surface to be constrained, meaning at least
   *  partially outside positioning boundaries set by the compositor. The
   *  adjustment is set by constructing a bitmask describing the adjustment to
   *  be made when the surface is constrained on that axis.
   *
   *  If no bit for one axis is set, the compositor will assume that the child
   *  surface should not change its position on that axis when constrained.
   *
   *  If more than one bit for one axis is set, the order of how adjustments
   *  are applied is specified in the corresponding adjustment descriptions.
   *
   *  The default adjustment is none.
   *
   *
   * @param {XdgPositioner} resource
   * @param {Number} constraintAdjustment bit mask of constraint adjustments
   *
   * @since 1
   *
   */
  setConstraintAdjustment (resource, constraintAdjustment) {
    this.constraintAdjustment = constraintAdjustment
  }

  /**
   *
   *  Specify the surface position offset relative to the position of the
   *  anchor on the anchor rectangle and the anchor on the surface. For
   *  example if the anchor of the anchor rectangle is at (x, y), the surface
   *  has the gravity bottom|right, and the offset is (ox, oy), the calculated
   *  surface position will be (x + ox, y + oy). The offset position of the
   *  surface is the one used for constraint testing. See
   *  set_constraint_adjustment.
   *
   *  An example use case is placing a popup menu on top of a user interface
   *  element, while aligning the user interface element of the parent surface
   *  with some user interface element placed somewhere in the popup surface.
   *
   *
   * @param {XdgPositioner} resource
   * @param {Number} x surface position x offset
   * @param {Number} y surface position y offset
   *
   * @since 1
   *
   */
  setOffset (resource, x, y) {
    this.offset = Point.create(x, y)
  }

  /**
   * @return {{size: Rect, anchorRect: Rect, anchor: number, gravity: number, constraintAdjustment: number, offset: Point, surfaceSpaceAnchorPoint: (function(BrowserXdgSurface): Point), checkScreenConstraints: (function(BrowserXdgSurface, BrowserSurfaceView): {topViolation: number, rightViolation: number, bottomViolation: number, leftViolation: number})}}
   */
  createStateCopy () {
    const selfSize = this.size
    const selfAnchorRect = this.anchorRect
    const selfAnchor = this.anchor
    const selfGravity = this.gravity
    const selfConstraintAdjustment = this.constraintAdjustment
    const selfOffset = this.offset
    return {
      size: selfSize,
      /**
       * @type {Rect|null}
       */
      anchorRect: selfAnchorRect,
      /**
       * @type {number}
       */
      anchor: selfAnchor,
      /**
       * @type {number}
       */
      gravity: selfGravity,
      /**
       * @type {number}
       */
      constraintAdjustment: selfConstraintAdjustment,
      /**
       * @type {Point}
       */
      offset: selfOffset,
      /**
       * @param {BrowserXdgSurface}parent
       * @return {Point}
       */
      surfaceSpaceAnchorPoint: function (parent) {
        const parentWindowGeometry = parent.windowGeometry
        const surfaceSpaceAnchorRectPosition = parentWindowGeometry.position.plus(this.anchorRect.position)
        const {x, y} = surfaceSpaceAnchorRectPosition
        const surfaceSpaceAnchorRect = Rect.create(x, y, x + this.anchorRect.width, y + this.anchorRect.height)
        const surfaceSpaceAnchorPoint = anchorCalculation[this.anchor](surfaceSpaceAnchorRect)
        return offsetCalculation[this.gravity](surfaceSpaceAnchorPoint, this.offset, this.size)
      },
      /**
       * @param {BrowserXdgSurface}parent
       * @param {BrowserSurfaceView}parentSurfaceView
       * @return {{topViolation: number, rightViolation: number, bottomViolation: number, leftViolation: number}}
       */
      checkScreenConstraints: function (parent, parentSurfaceView) {
        const surfaceSpaceAnchorPoint = this.surfaceSpaceAnchorPoint(parent)
        const surfaceSpaceWinGeoMin = surfaceSpaceAnchorPoint.plus(this.size.position)
        const surfaceSpaceWinGeoMax = surfaceSpaceAnchorPoint.plus(Point.create(this.size.x1, this.size.y1))

        const surfaceSpaceMinBound = parentSurfaceView.toSurfaceSpace(Point.create(0, 0))
        const surfaceSpaceMaxBound = parentSurfaceView.toSurfaceSpace(Point.create(window.document.body.clientWidth, window.document.body.clientHeight))

        let topViolation = 0
        let rightViolation = 0
        let bottomViolation = 0
        let leftViolation = 0

        if (surfaceSpaceWinGeoMin.x < surfaceSpaceMinBound.x) {
          leftViolation = Math.abs(surfaceSpaceMinBound.x - surfaceSpaceWinGeoMin.x)
        }
        if (surfaceSpaceWinGeoMin.y < surfaceSpaceMinBound.y) {
          topViolation = Math.abs(surfaceSpaceMinBound.y - surfaceSpaceWinGeoMin.y)
        }

        if (surfaceSpaceWinGeoMax.x > surfaceSpaceMaxBound.x) {
          rightViolation = surfaceSpaceWinGeoMax.x - surfaceSpaceMaxBound.x
        }

        if (surfaceSpaceWinGeoMax.y > surfaceSpaceMaxBound.y) {
          bottomViolation = surfaceSpaceWinGeoMax.y - surfaceSpaceMaxBound.y
        }

        return {
          topViolation: topViolation,
          rightViolation: rightViolation,
          bottomViolation: bottomViolation,
          leftViolation: leftViolation
        }
      }
    }
  }
}
