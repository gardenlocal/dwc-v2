import * as PIXI from 'pixi.js'

import Creature1 from '../../assets/creature-1.svg';
import Creature2 from '../../assets/creature-2.svg';
import Creature4 from '../../assets/creature-4.svg';
import Creature5 from '../../assets/creature-5.svg';
import Creature6 from '../../assets/creature-6.svg';
import Creature7 from '../../assets/creature-7.svg';
import { DWC_META } from '../../../shared-constants';

const loader = PIXI.Loader.shared

const addCreatures = () => {
    loader.add(DWC_META.creatures.CREATURE_1, Creature1)
    loader.add(DWC_META.creatures.CREATURE_2, Creature2)
    loader.add(DWC_META.creatures.CREATURE_4, Creature4)
    loader.add(DWC_META.creatures.CREATURE_5, Creature5)
    loader.add(DWC_META.creatures.CREATURE_6, Creature6)
    loader.add(DWC_META.creatures.CREATURE_7, Creature7)
}

export const loadAll = async (onProgress) => {
    addCreatures()

    return new Promise((res, rej) => {
        loader.load((loader, resources) => { res(resources) })
        loader.onProgress.add((t) => { onProgress(t) })
    })
}