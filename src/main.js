import sketch from 'sketch'
// documentation: https://developer.sketchapp.com/reference/api/

export function migrate(context) {
  sketch.UI.message("Start migration...")

  const prismArtboard = findPrismArtboard(context)

  if (!prismArtboard) {
    sketch.UI.message("There is no Prism artboard.")
    return
  }

  const colorInformations = colorInfomations(context, prismArtboard)
  if (colorInfomations.length == 0) {
    sketch.UI.message("There is no Prism color informations.")
    return
  }

  // const swatches = sketch.getSelectedDocument().swatches
  // for (const s of swatches) {
  //   log(`🍣: Swatch color is => '${s.color}`)
  // }

  colorInformations.forEach(colorInfo => {
    let swatch = matchingSwatchForColor(formatedColor(colorInfo))
    // log(`🍣: ${colorInfo}`)
    // log(`🍣 Swatch: ${swatch}`)
    swatch.name = colorInfo.name
  });

  sketch.UI.message("Migration completed 🎉")
}

function findPrismArtboard(context) {
  const ARTBOARD_TAG = "artboard"
  const command = context.command
  const pluginID = "com.ment.sketch.prism"
  const doc = sketch.getSelectedDocument()

  for (const page of doc.pages) {
    const artbords = page.layers.filter(layer => layer.type === "Artboard")
    for (const layer of artbords) {
      const value = command.valueForKey_onLayer_forPluginIdentifier(ARTBOARD_TAG, layer.sketchObject, pluginID)
      if (value) {
        return layer
      }
    }
  }

  return null
}

function colorInfomations(context, artboard) {
  const command = context.command
  const pluginID = "com.ment.sketch.prism"
  const CELL_LAYER_TAG = "cell-layer"
  return artboard.layers.map(layer => command.valueForKey_onLayer_forPluginIdentifier(CELL_LAYER_TAG, layer.sketchObject, pluginID))
}

function formatedColor(colorInfo) {
  let color = "#" + colorInfo.hex + toHex(colorInfo.alpha)
  return color.toLowerCase()
}

// code from https://github.com/sketch-hq/color-variables-migrator
function matchingSwatchForColor(color, name) {
  // We need to match color *and* name, if we want this to work
  const swatches = sketch.getSelectedDocument().swatches
  const matchingSwatches = swatches.filter(swatch => swatch.color === color)
  if (matchingSwatches.length == 0) {
    return null
  }
  if (matchingSwatches.length == 1) {
    return matchingSwatches[0]
  }
  // This means there are multiple swatches matching the color. We'll see if we can find one that also matches the name. If we don't find one, or there is no name provided, return the first match.
  if (name) {
    const swatchesMatchingName = matchingSwatches.filter(
      swatch => swatch.name === name
    )
    if (swatchesMatchingName.length) {
      return swatchesMatchingName[0]
    } else {
      return matchingSwatches[0]
    }
  } else {
    return matchingSwatches[0]
  }
}

function toHex(v) {
  // eslint-disable-next-line
  return (Math.round(v * 255) | (1 << 8)).toString(16).slice(1)
}