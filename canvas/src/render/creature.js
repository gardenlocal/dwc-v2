import * as PIXI from 'pixi.js'
import { distanceAndAngleBetweenTwoPoints, sleep, Vector } from './utils';
import { DWC_META } from '../../../shared-constants';
import PixiSVG from '../svg-lib'
import SVGShape from './Geometry/SVGCreatureShape';
import { randomElementFromArray, easeInOutBounce, easeInOutQuart, lerp } from './utils';
import { BlurFilter } from '@pixi/filter-blur';
import MossCluster from "./Creatures/MossCluster"
import MushroomCluster from "./Creatures/MushroomCluster"
import LichenCluster from "./Creatures/LichenCluster"
import TWEEN from '@tweenjs/tween.js'
import { sound } from '@pixi/sound';
import { ALTTEXT_KO } from "../../altText-constants";

export default class Creature extends PIXI.Container {
    constructor(state) {
        super()

        const { appearance, _id, animatedProperties } = state;        
        this.name = _id
        this.displayText = state.owner.creatureName || ""
        if (this.displayText == 'undefined') this.displayText = ""
        this.ownerId = state.owner._id
        this.animatedProperties = animatedProperties        
        this.appearance = appearance        

        this.alpha = 0

        const { fillColor, radius } = appearance;
        const hex = PIXI.utils.rgb2hex([fillColor.r, fillColor.g, fillColor.b])
    
        let fromX = this.animatedProperties.position.from.x
        let fromY = this.animatedProperties.position.from.y
        let toX = this.animatedProperties.position.to.x
        let toY = this.animatedProperties.position.to.y        

        // This should actually be somewhere between from and to, depending on the timestamp.
        this.x = fromX
        this.y = fromY
        this.vx = 0
        this.vy = 0
        this.target = { x: toX, y: toY }
        this.movementDuration = this.animatedProperties.position.duration
        this.movementAlpha = 0        
            
        this.interactive = (state.owner.uid == window.APP.user.id) || (window.APP.getIsAdmin())
        this.on('mousedown', this.onMouseDown)
        this.on('touchstart', this.onMouseDown)

        switch (appearance.creatureType) {
            case 'moss':
                this.creature = new MossCluster(appearance, this.displayText)
                break
            case 'lichen':
                this.creature = new LichenCluster(appearance, this.displayText)
                break
            case 'mushroom':
                this.creature = new MushroomCluster(appearance, this.displayText)
                break
        }

        this.addChild(this.creature)
        this.creature.scale.set(appearance.scale * 2)
        this.frame = 0

        this.firstTargetPositionUpdateComplete = false
        this.updateTargetPosition(state.animatedProperties.position)
        const label = new PIXI.Text(this.displayText, new PIXI.TextStyle({ fontSize: 10 }))        
        // this.creature.addChild(label)
        // label.cacheAsBitmap = true

        if(window.ASSIST_MODE && !window.IS_ADMIN){
            this.createEvolveButton()
        }
    }

    // ACCESSIBILITY
    createEvolveButton() {
        if(!document.getElementById('evolve')) {
            const button = document.createElement("button");
            button.id = "evolve"
            button.innerText = "변화"
            button.onclick = this.onEvolveButtonClick
    
            const buttonAltText = ALTTEXT_KO[window.GARDEN].evolveButton;
            button.ariaLabel = buttonAltText

            const accessDiv = document.querySelector('.accessibility');
            accessDiv.appendChild(button)
        }
    }

    onEvolveButtonClick = async () => {
        if (this.isAnimating) return

        window.APP.sendEvolveCreature(this.name)
        window.SCREENREADER.textContent = ALTTEXT_KO[window.GARDEN].evolve
        // if(!window.IS_ADMIN) this.playSoundtrack()    
    }

    onMouseDown = async (e) => {     
        // if(!window.IS_ADMIN) this.playSoundtrack()
        if (this.isAnimating) return
        window.APP.sendEvolveCreature(this.name)
    }


    async evolve() {
        if (!this.isEvolving) {
            this.isEvolving = true
            this.isAnimating = true
            /*
            const tween = new TWEEN.Tween(this.scale)
            .to({x: 1.4, y: 1.4 }, 800)
            .easing(TWEEN.Easing.Quartic.InOut)
            .start()
            await sleep(800)
            */
                
            if (this.creature.evolve) await this.creature.evolve(1000)            

            /*
            const tween2 = new TWEEN.Tween(this.scale)
            .to({x: 1, y: 1 }, 800)
            .easing(TWEEN.Easing.Quartic.Out)
            .start()    

            await sleep(1200)
            */

            // const bbox = this.creature.getBounds()
            // this.creature.pivot.set(bbox.width / 2, bbox.height / 2)    
            this.isAnimating = false
            this.isEvolving = false
        }
    }

    updateState(newState) {
        for (const [key, prop] of Object.entries(newState)) {
            this.animatedProperties[key] = prop

            switch (key) {
                case (DWC_META.creaturePropertyTypes.position):
                    this.updateTargetPosition(prop)
                    break

                default:
                    break
            }
        }
    }

    async updateTargetPosition(prop) {
        this.isAnimating = true

        this.target.x = prop.to.x
        this.target.y = prop.to.y
        this.movementAlpha = 0
        this.movementDuration = this.animatedProperties.position.duration  

        if (this.motionTween) {
            TWEEN.remove(this.motionTween)
            this.motionTween = null
        }

        const alphaTween = new TWEEN.Tween(this)
        .to({ alpha: 0.001 }, 1000)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start()
        await sleep(1000)

        let durationOffset = 0

        if (!this.firstTargetPositionUpdateComplete) {
            const startTime = prop.startTime
            const now = new Date().getTime()
            const previousTime = (now - startTime) / 1000
            const alpha = previousTime / prop.duration
            const x = lerp(prop.teleport.x, prop.to.x, alpha)
            const y = lerp(prop.teleport.y, prop.to.y, alpha)
            this.position.set(x, y)

            durationOffset = previousTime
            this.firstTargetPositionUpdateComplete = true
        } else {
            this.position.set(prop.teleport.x, prop.teleport.y)
        }
        
        
        this.creature.rotation = 0

        this.creature.startAnimatingGrowth(1500)
        // this.x = prop.teleport.x
        // this.y = prop.teleport.y

        const alphaInTween = new TWEEN.Tween(this)
        .to({ alpha: 1 }, 1000)
        .easing(TWEEN.Easing.Quartic.InOut)
        .start()
        await sleep(500)

        this.motionTween = new TWEEN.Tween(this)
        .to({ x: this.target.x, y: this.target.y }, (this.movementDuration - durationOffset) * 1000)
        .easing(TWEEN.Easing.Linear.None)
        .start()

        await sleep(5000)
        this.isAnimating = false
    
        // tween.onComplete( () => console.log("appear done") )
    
        await sleep(this.movementDuration * 1000)        
    }

    // playSoundtrack() {
    //     console.log("CREATURE SOUND:", window.AUDIO._sounds)
    //     if(!window.AUDIO._sounds?.creatureTapSound?.isPlaying){ // if not playing
    //         window.AUDIO.play('creatureTapSound')
    //     }
    // }

    tick(d) {
        const delta = PIXI.Ticker.shared.elapsedMS
        this.frame++

        // Per-frame update for the creature SVG Shape outlines
        this.creature.tick()
        this.creature.rotation += 0.001 * (delta / 16)

        //spriteMask.scale.set(0.95)
        // this.creatureSprite

        // container.addChild(spriteMask)
        // container.mask = spriteMask        
    }
}
