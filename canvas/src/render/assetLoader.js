import * as PIXI from 'pixi.js'

import Creature1 from '../../assets/creature-1.svg';
import Creature2 from '../../assets/creature-2.svg';
import Creature4 from '../../assets/creature-4.svg';

const loader = PIXI.Loader.shared

export const DWC_META = {
    creatures: {
        CREATURE_1: "creature-1",
        CREATURE_2: "creature-2",
        CREATURE_3: "creature-3",
        CREATURE_4: "creature-4",
    }
}

const addCreatures = () => {
    loader.add(DWC_META.creatures.CREATURE_1, Creature1)
    loader.add(DWC_META.creatures.CREATURE_2, Creature2)
    loader.add(DWC_META.creatures.CREATURE_4, Creature4)
}

export const loadAll = async (onProgress) => {
    addCreatures()

    return new Promise((res, rej) => {
        loader.load((loader, resources) => { res(resources) })
        loader.onProgress.add((t) => { onProgress(t) })
    })
}