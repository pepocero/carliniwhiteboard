import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

// Helper function to get API URL
const getApiUrl = () => {
  return import.meta.env.DEV ? 'http://127.0.0.1:8787' : 'https://carlini-whiteboard-api.pepocero.workers.dev'
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

const useWhiteboardStore = create((set, get) => ({
  // Current whiteboard state
  currentWhiteboard: null,
  whiteboards: [],
  
  // Canvas state
  elements: [],
  selectedElement: null,
  selectedElements: [],
  
  // Tool state
  currentTool: 'select',
  currentColor: '#000000',
  strokeWidth: 3,
  fontSize: 16,
  
  // Canvas view state
  scale: 1,
  position: { x: 0, y: 0 },
  canvasBackgroundColor: '#ffffff',
  
  // Connection state
  tempConnection: null, // { fromElement, fromAnchor, currentPos }
  
  // UI state
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  
  // Auto-save state
  hasUnsavedChanges: false,
  autoSaveTimeout: null,
  
  // Actions
  setCurrentWhiteboard: (whiteboard) => set({ 
    currentWhiteboard: whiteboard,
    elements: whiteboard?.data ? JSON.parse(whiteboard.data) : []
  }),
  
  setWhiteboards: (whiteboards) => set({ whiteboards }),
  
  addElement: (element) => set((state) => {
    const newElement = {
      id: uuidv4(),
      ...element,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    
    const newElements = [...state.elements, newElement]
    
    // Trigger auto-save
    get().scheduleAutoSave()
    
    return {
      elements: newElements,
      hasUnsavedChanges: true
    }
  }),
  
  updateElement: (id, updates) => set((state) => {
    console.log('📝 STORE updateElement called:', { id, updates })
    
    const newElements = state.elements.map(element => 
      element.id === id 
        ? { ...element, ...updates, updatedAt: new Date().toISOString() }
        : element
    )
    
    const updatedElement = newElements.find(el => el.id === id)
    console.log('📝 STORE element after update:', updatedElement)
    
    // Trigger auto-save
    get().scheduleAutoSave()
    
    return {
      elements: newElements,
      hasUnsavedChanges: true
    }
  }),
  
  removeElement: (id) => set((state) => {
    const newElements = state.elements.filter(element => element.id !== id)
    
    // Trigger auto-save
    get().scheduleAutoSave()
    
    return {
      elements: newElements,
      selectedElement: state.selectedElement?.id === id ? null : state.selectedElement,
      selectedElements: state.selectedElements.filter(el => el.id !== id),
      hasUnsavedChanges: true
    }
  }),
  
  removeElements: (ids) => set((state) => {
    const newElements = state.elements.filter(element => !ids.includes(element.id))
    
    // Trigger auto-save
    get().scheduleAutoSave()
    
    return {
      elements: newElements,
      selectedElement: null,
      selectedElements: [],
      hasUnsavedChanges: true
    }
  }),
  
  setSelectedElement: (element) => set((state) => {
    // If selecting an element, bring it to front
    if (element) {
      const newElements = [...state.elements]
      const elementIndex = newElements.findIndex(el => el.id === element.id)
      
      if (elementIndex !== -1) {
        // Remove element from current position
        const [movedElement] = newElements.splice(elementIndex, 1)
        // Add it to the end (top layer)
        newElements.push(movedElement)
        
        return {
          selectedElement: element,
          selectedElements: [element],
          elements: newElements,
          hasUnsavedChanges: true
        }
      }
    }
    
    return {
      selectedElement: element,
      selectedElements: element ? [element] : []
    }
  }),
  
  setSelectedElements: (elements) => set({ 
    selectedElements: elements,
    selectedElement: elements.length === 1 ? elements[0] : null
  }),

  bringToFront: (elementId) => set((state) => {
    const newElements = [...state.elements]
    const elementIndex = newElements.findIndex(el => el.id === elementId)
    
    if (elementIndex !== -1) {
      // Remove element from current position
      const [movedElement] = newElements.splice(elementIndex, 1)
      // Add it to the end (top layer)
      newElements.push(movedElement)
      
      return {
        elements: newElements,
        hasUnsavedChanges: true
      }
    }
    
    return state
  }),
  
  addToSelection: (element) => set((state) => {
    if (state.selectedElements.find(el => el.id === element.id)) {
      return state
    }
    
    return {
      selectedElements: [...state.selectedElements, element]
    }
  }),
  
  removeFromSelection: (elementId) => set((state) => ({
    selectedElements: state.selectedElements.filter(el => el.id !== elementId),
    selectedElement: state.selectedElement?.id === elementId ? null : state.selectedElement
  })),
  
  clearSelection: () => set({ 
    selectedElement: null, 
    selectedElements: [] 
  }),
  
  setCurrentTool: (tool) => set({ 
    currentTool: tool,
    selectedElement: null,
    selectedElements: []
  }),
  
  setCurrentColor: (color) => set({ currentColor: color }),
  
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  
  setFontSize: (size) => set({ fontSize: size }),
  
  setScale: (scale) => set({ scale }),
  
  setPosition: (position) => set({ position }),

  setCanvasBackgroundColor: (color) => set({ canvasBackgroundColor: color }),
  
  setTempConnection: (tempConnection) => set({ tempConnection }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setSaving: (saving) => set({ isSaving: saving }),
  
  setLastSaved: (timestamp) => set({ lastSaved: timestamp }),
  
  setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  
  // Auto-save functionality
  scheduleAutoSave: () => {
    const state = get()
    
    // Clear existing timeout
    if (state.autoSaveTimeout) {
      clearTimeout(state.autoSaveTimeout)
    }
    
    // Schedule new auto-save
    const timeout = setTimeout(() => {
      get().autoSave()
    }, 2000) // 2 seconds debounce
    
    set({ autoSaveTimeout: timeout })
  },
  
  autoSave: async () => {
    const state = get()
    
    if (!state.currentWhiteboard || !state.hasUnsavedChanges) {
      return
    }
    
    set({ isSaving: true })
    
    try {
      const response = await fetch(`${getApiUrl()}/api/whiteboards/${state.currentWhiteboard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          name: state.currentWhiteboard.name,
          data: JSON.stringify(state.elements)
        })
      })
      
      if (response.ok) {
        set({ 
          hasUnsavedChanges: false,
          lastSaved: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      set({ isSaving: false })
    }
  },
  
  // Manual save
  save: async () => {
    const state = get()
    
    if (!state.currentWhiteboard) {
      return
    }
    
    set({ isSaving: true })
    
    try {
      const response = await fetch(`${getApiUrl()}/api/whiteboards/${state.currentWhiteboard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          name: state.currentWhiteboard.name,
          data: JSON.stringify(state.elements)
        })
      })
      
      if (response.ok) {
        set({ 
          hasUnsavedChanges: false,
          lastSaved: new Date().toISOString()
        })
        return true
      }
    } catch (error) {
      console.error('Save failed:', error)
      return false
    } finally {
      set({ isSaving: false })
    }
  },
  
  // Load whiteboard
  loadWhiteboard: async (id) => {
    set({ isLoading: true })
    
    try {
      const response = await fetch(`${getApiUrl()}/api/whiteboards/${id}`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const whiteboard = await response.json()
        get().setCurrentWhiteboard(whiteboard)
        return whiteboard
      }
    } catch (error) {
      console.error('Load failed:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Create new whiteboard
  createWhiteboard: async (name = 'Nuevo Tablero') => {
    set({ isLoading: true })
    
    try {
      const response = await fetch(`${getApiUrl()}/api/whiteboards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          name,
          data: JSON.stringify([])
        })
      })
      
      if (response.ok) {
        const whiteboard = await response.json()
        get().setCurrentWhiteboard(whiteboard)
        get().setWhiteboards([...get().whiteboards, whiteboard])
        return whiteboard
      }
    } catch (error) {
      console.error('Create failed:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Update whiteboard name
  updateWhiteboard: async (id, updates) => {
    const whiteboards = get().whiteboards
    const whiteboard = whiteboards.find(wb => wb.id === id)
    
    if (!whiteboard) return

    const updatedWhiteboard = { ...whiteboard, ...updates }
    
    // Update in store
    const newWhiteboards = whiteboards.map(wb => 
      wb.id === id ? updatedWhiteboard : wb
    )
    set({ whiteboards: newWhiteboards })
    
    // Update current whiteboard if it's the one being edited
    if (get().currentWhiteboard?.id === id) {
      set({ currentWhiteboard: updatedWhiteboard })
    }

    // Save to API
    try {
      await fetch(`${getApiUrl()}/api/whiteboards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          name: updatedWhiteboard.name,
          data: updatedWhiteboard.data
        })
      })
    } catch (error) {
      console.error('Update whiteboard failed:', error)
    }
  },

  // Delete whiteboard
  deleteWhiteboard: async (id) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/whiteboards/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const newWhiteboards = get().whiteboards.filter(wb => wb.id !== id)
        set({ whiteboards: newWhiteboards })
        
        // If deleting current whiteboard, clear it
        if (get().currentWhiteboard?.id === id) {
          set({ 
            currentWhiteboard: null,
            elements: [],
            selectedElement: null,
            selectedElements: []
          })
        }
        
        return true
      }
    } catch (error) {
      console.error('Delete failed:', error)
      return false
    }
  },
  
  // Load all whiteboards
  loadWhiteboards: async () => {
    set({ isLoading: true })
    
    try {
      const response = await fetch(`${getApiUrl()}/api/whiteboards`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const whiteboards = await response.json()
        set({ whiteboards })
        return whiteboards
      }
    } catch (error) {
      console.error('Load whiteboards failed:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  // Group elements
  groupElements: (elementIds) => {
    const state = get()
    const elementsToGroup = state.elements.filter(el => elementIds.includes(el.id))
    
    if (elementsToGroup.length < 2) return
    
    // Calculate group bounds
    const bounds = elementsToGroup.reduce((acc, el) => {
      const elBounds = getElementBounds(el)
      return {
        minX: Math.min(acc.minX, elBounds.x),
        minY: Math.min(acc.minY, elBounds.y),
        maxX: Math.max(acc.maxX, elBounds.x + elBounds.width),
        maxY: Math.max(acc.maxY, elBounds.y + elBounds.height)
      }
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
    
    // Create group element
    const groupElement = {
      type: 'group',
      x: bounds.minX,
      y: bounds.minY,
      width: bounds.maxX - bounds.minX,
      height: bounds.maxY - bounds.minY,
      children: elementsToGroup.map(el => ({
        ...el,
        x: el.x - bounds.minX,
        y: el.y - bounds.minY
      }))
    }
    
    // Remove original elements and add group
    const newElements = [
      ...state.elements.filter(el => !elementIds.includes(el.id)),
      groupElement
    ]
    
    get().scheduleAutoSave()
    
    set({
      elements: newElements,
      selectedElement: groupElement,
      selectedElements: [groupElement],
      hasUnsavedChanges: true
    })
  },
  
  // Ungroup element
  ungroupElement: (groupId) => {
    const state = get()
    const groupElement = state.elements.find(el => el.id === groupId && el.type === 'group')
    
    if (!groupElement) return
    
    // Restore children to their original positions
    const ungroupedElements = groupElement.children.map(child => ({
      ...child,
      x: child.x + groupElement.x,
      y: child.y + groupElement.y
    }))
    
    // Remove group and add ungrouped elements
    const newElements = [
      ...state.elements.filter(el => el.id !== groupId),
      ...ungroupedElements
    ]
    
    get().scheduleAutoSave()
    
    set({
      elements: newElements,
      selectedElement: null,
      selectedElements: [],
      hasUnsavedChanges: true
    })
  }
}))

// Helper function to get element bounds
function getElementBounds(element) {
  switch (element.type) {
    case 'rect':
      return {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      }
    case 'circle':
      return {
        x: element.x - element.radius,
        y: element.y - element.radius,
        width: element.radius * 2,
        height: element.radius * 2
      }
    case 'line':
      return {
        x: Math.min(element.x1, element.x2),
        y: Math.min(element.y1, element.y2),
        width: Math.abs(element.x2 - element.x1),
        height: Math.abs(element.y2 - element.y1)
      }
    case 'text':
      // Approximate text bounds
      return {
        x: element.x,
        y: element.y - element.fontSize,
        width: element.text.length * element.fontSize * 0.6,
        height: element.fontSize
      }
    case 'sticky':
      return {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      }
    default:
      return { x: 0, y: 0, width: 0, height: 0 }
  }
}

export default useWhiteboardStore
