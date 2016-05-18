import Immy from 'immy'

import Immo, {setupImmo} from '../Immo.js'
import {abstractClass} from '../abstract-interface.js'

import Frame from './Frame.js'
import {ConstraintUpdate, CollisionUpdate} from './StateUpdate.js'

// @setupImmo
// @abstractClass('makeGrid', 'preIterate', 'postIterate')
export default class LineEngine extends Immo {
  __props__ () {
    return {
      iterations: 1
    }
  }
  __state__ () {
    return {
      linesList: new Immy.List(),
      initialStateMap: new Map(),
      constraints: []
    }
  }
  __computed__ () {
    return {
      linesMap: new Map(),
      frames: [new Frame()],
      collidables: [],
      grid: this.makeGrid()
    }
  }
  __update__ () {
    return {
      linesList (targetLinesList, currentLinesList) {
        let diff = currentLinesList.compareTo(targetLinesList)
        diff.forEachPrimitive((primOp) => {
          let line = primOp.value
          if (primOp instanceof Immy.ListPatches.Add) {
            this._addLine(line)
          } else {
            this._removeLine(line)
          }
        })
      },
      initialStateMap (targetInitState) {
        this.setInitialStates(Array.from(targetInitState.values()), true)
      },
      constraints (targetConstraints) {
        this.setConstraints(targetConstraints)
      }
    }
  }
  makeGrid () {}
  preIterate (stateMap) {}
  postIterate (stateMap) {}

  getLastFrameIndex () {
    this.updateComputed()
    return this._getLastFrameIndex()
  }

  getLastFrame () {
    this.updateComputed()
    return this._getLastFrame()
  }

  getStateMapAtFrame (index) {
    this.updateComputed()
    this._computeFrame(index)
    return this.frames[index].stateMap
  }

  getUpdatesAtFrame (index) {
    this.updateComputed()
    this._computeFrame(index)
    return this.frames[index].updates
  }

  getLineByID (id) {
    this.updateComputed()
    return this.linesMap.get(id)
  }

  addLine (line) {
    this.updateComputed()
    let nextLinesList = this._modifyLinesList(line, (lines, line) => {
      this._addLine(line)
      let index = lines.findInsertionIndexWithBinarySearch((existing) => existing.id - line.id)
      return lines.withValueAdded(index, line)
    })
    return this.updateState({linesList: nextLinesList})
  }

  removeLine (line) {
    this.updateComputed()
    let nextLinesList = this._modifyLinesList(line, (lines, line) => {
      this._removeLine(line)
      let index = lines.findIndexWithBinarySearch((existing) => existing.id - line.id)
      return lines.withValueRemoved(index, line)
    })
    return this.updateState({linesList: nextLinesList})
  }

  // state: array of {id, collidable, ...}
  setInitialStates (stateArray) {
    this.updateComputed()
    this._setFramesLength(1)
    let initialStateMap = new Map(stateArray.map((substate) => [substate.id, substate]))
    this.collidables = stateArray.filter(({collidable}) => collidable).map(({id}) => id)
    this.frames[0] = new Frame(initialStateMap)
    return this.updateState({initialStateMap})
  }

  setConstraints (constraints) {
    this.updateComputed()
    this._setFramesLength(1)
    return this.updateState({constraints: constraints.slice()})
  }

  _addLine (line) {
    this.linesMap.set(line.id, line)
    let cells = this.grid.add(line)
    for (let cell of cells) {
      let index = this._getLastFrame().getIndexOfCollisionInCell(cell, line)
      if (index != null) {
        this._setFramesLength(index)
      }
    }
  }

  _removeLine (line) {
    this.linesMap.delete(line.id)
    this.grid.remove(line)
    let index = this._getLastFrame().getIndexOfCollisionWithLine(line)
    if (index != null) {
      this._setFramesLength(index)
    }
  }

  _modifyLinesList (line, modify) {
    if (line instanceof Array) {
      return line.reduce((lines, line) => modify(lines, line), this.linesList)
    } else {
      return modify(this.linesList, line)
    }
  }

  _setFramesLength (length) {
    this.frames.length = length
  }

  _getLastFrameIndex () {
    return this.frames.length - 1
  }

  _getLastFrame () {
    return this.frames[this._getLastFrameIndex()]
  }
  _computeFrame (index) {
    while (this.frames.length <= index) {
      let nextFrame = this._getNextFrame(this._getLastFrame(), this._getLastFrameIndex() + 1)
      this.frames.push(nextFrame)
    }
  }

  _getNextFrame (frame, index) {
    frame = frame.clone()
    frame.updateStateMap(this.preIterate(frame.stateMap))
    for (let i = 0; i < this.iterations; i++) {
      for (let constraint of this.constraints) {
        frame.updateStateMap(new ConstraintUpdate(constraint.resolve(frame.stateMap), constraint.id))
      }
      for (let id of this.collidables) {
        let entity = frame.stateMap.get(id)
        frame.addToGrid(this.grid, entity, index)

        let lines = this.grid.getLinesNearEntity(entity)
        for (let line of lines) {
          let nextEntity = line.collide(entity)
          if (nextEntity) {
            frame.updateStateMap(new CollisionUpdate(nextEntity, line.id))
            entity = nextEntity

            frame.addToGrid(this.grid, entity, index)
            frame.addToCollisions(line, index)
          }
        }
      }
    }
    frame.updateStateMap(this.postIterate(frame.stateMap))
    return frame
  }
}
setupImmo(LineEngine)
abstractClass('makeGrid', 'preIterate', 'postIterate')(LineEngine)
