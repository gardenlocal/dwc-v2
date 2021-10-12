import * as PIXI from 'pixi.js'
import { DWC_META } from "../../../../shared-constants";

let img, spriteSample = null
let tileWidth = 0
let tileHeight = 0
let spriteScale = 0

const getSpriteSample = () => {
    img = PIXI.Loader.shared.resources[DWC_META.tiles.TILE_1].texture
    spriteSample = PIXI.Sprite.from(img)  
}

export default class UserBackground extends PIXI.Graphics {
    constructor(garden) {
        super()

        console.log('garden is: ', garden)
        
        if (!spriteSample) {
            getSpriteSample()
        }

        let horizontalTiles = 1
        let tileWidth = window.GARDEN_WIDTH / horizontalTiles
        let spriteScale = tileWidth / spriteSample.width
        let tileHeight = spriteSample.height * spriteScale            
        let verticalTiles = Math.ceil(window.GARDEN_HEIGHT / tileHeight)
      
        const allTiles = []
        Object.values(DWC_META.tiles).forEach(tileAsset => {
          const img = PIXI.Loader.shared.resources[tileAsset].texture
          allTiles.push(img)
        })
      
        for (let i = 0; i < horizontalTiles; i++) {
          for (let j = 0; j < verticalTiles; j++) {
            const x = i * tileWidth
            const y = j * tileHeight
      
            const currTexture = PIXI.Loader.shared.resources[garden.backgroundTile].texture //allTiles[Math.floor(Math.random() * allTiles.length)]
            const currSprite = PIXI.Sprite.from(currTexture)
      
            const sgnX = garden.tileScaleX || 1
            const sgnY = garden.tileScaleY || 1
      
            // Commented line forces square tiles
            //currSprite.scale.set(sgnX * spriteScale, sgnY * spriteScale * tileWidth / tileHeight)
            currSprite.scale.set(sgnX * spriteScale, sgnY * spriteScale)
            currSprite.x = x + (sgnX < 0 ? tileWidth : 0)
            currSprite.y = y + (sgnY < 0 ? tileHeight : 0)
      
            this.addChild(currSprite)
          }
        }
      
    }
}