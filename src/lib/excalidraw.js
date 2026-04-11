let excalidrawModulePromise = null

function loadExcalidrawModule() {
  if (!excalidrawModulePromise) {
    excalidrawModulePromise = Promise.all([
      import('@excalidraw/excalidraw'),
      import('@excalidraw/excalidraw/index.css').catch(() => null),
    ]).then(([mod]) => mod)
  }
  return excalidrawModulePromise
}

export async function renderExcalidrawToBlob(scene) {
  if (!scene || !Array.isArray(scene.elements)) {
    throw new Error('invalid_scene')
  }
  const mod = await loadExcalidrawModule()
  const exportToBlob = mod.exportToBlob || mod.default?.exportToBlob
  if (typeof exportToBlob !== 'function') {
    throw new Error('excalidraw_export_missing')
  }

  const cleanAppState = {
    viewBackgroundColor: '#ffffff',
    exportBackground: true,
    exportWithDarkMode: false,
    exportScale: 2,
    exportPadding: 32,
    exportEmbedScene: false,
  }

  const blob = await exportToBlob({
    elements: scene.elements,
    appState: cleanAppState,
    files: scene.files || {},
    mimeType: 'image/png',
    quality: 1,
  })
  return blob
}
